import 'server-only';
import { randomInt,randomUUID } from 'node:crypto';
import roster from '@/data/transfer-players.json';
import { advanceJourney,createJourneyDeck,createJourneyState,journeyQuestionPool,potentialPoints,type JourneyAction,type JourneyState } from '@/lib/journeyman';
import { matrixPlayers,getMatrixRound } from '@/lib/matrix/data';
import { combinationKey,emptyState,setAnswer,submitGrid,viewState } from '@/lib/matrix/engine';
import type { MatrixDifficulty,MatrixSession } from '@/lib/matrix/types';
import { chooseComparisonPlayer,comparisonValue,playersFromSnapshot,resolveComparisonPick,type Comparison,type ComparisonPlayer } from '@/lib/higher-lower';
import { getHigherLowerSnapshot } from '@/lib/higher-lower/snapshot-store';
import bundled from '@/data/higher-lower-snapshot.json';
import { adminSupabase } from '@/lib/supabase/server';
import type { HigherLowerSnapshot } from '@/lib/higher-lower/types';
import type { HigherLowerRun,RewardEvent } from './types';

export type CloudMode='matrix'|'journeyman'|'higher-lower';
interface HigherLowerState extends HigherLowerRun { queuedPlayer?:ComparisonPlayer }
type State=MatrixSession|JourneyState|HigherLowerState;
const random=()=>randomInt(0,2**32)/2**32;
const journeyPlayers=journeyQuestionPool(roster);
/** Only media URLs for the queued card leave the server; its stats stay private. */
export function publicCloudState(mode:CloudMode,state:State):State {
  if(mode!=='higher-lower')return state;
  const {queuedPlayer,...view}=state as HigherLowerState;
  const badges=queuedPlayer?.selectedTransfer
    ?[queuedPlayer.selectedTransfer.from.crest,queuedPlayer.selectedTransfer.to.crest]
    :[queuedPlayer?.isRetired?'/img/icons/retired.png':queuedPlayer?.clubBadge,queuedPlayer?.nationalityFlag];
  return {...view,upcomingImages:queuedPlayer&&!view.gameOver?[queuedPlayer.portrait,...badges.filter((src):src is string=>!!src)]:[]};
}
export function gameVariant(mode:string,value:unknown):string {
  if(mode==='matrix')return ['easy','medium','hard'].includes(String(value))?String(value):'medium';
  if(mode==='higher-lower')return ['marketValue','goals','assists','transfer'].includes(String(value))?String(value):'marketValue';
  if(mode==='journeyman')return 'default';
  throw new Error('Unknown game mode.');
}
async function snapshot(version?:string):Promise<HigherLowerSnapshot> {
  const current=await getHigherLowerSnapshot();if(!version||current.version===version)return current;
  if(bundled.version===version)return bundled as HigherLowerSnapshot;
  const {data,error}=await adminSupabase().from('higher_lower_snapshots').select('payload').eq('version',version).single();
  if(error||!data)throw new Error('This dataset is no longer available. Start a new streak.');return data.payload as HigherLowerSnapshot;
}
export async function initialCloudState(mode:CloudMode,variant:string,previous?:State):Promise<State> {
  if(mode==='matrix'){
    const before=previous as MatrixSession|undefined,history=before?.history||[];
    let puzzle;
    try{puzzle=getMatrixRound(randomUUID(),variant as MatrixDifficulty,(before?.puzzle.number||0)+1,history);}catch{puzzle=getMatrixRound(randomUUID(),variant as MatrixDifficulty,(before?.puzzle.number||0)+1,history.slice(-1));}
    return {puzzle,state:emptyState(puzzle),history:[...history,combinationKey(puzzle)].slice(-200)};
  }
  if(mode==='journeyman')return createJourneyState(createJourneyDeck(journeyPlayers,random,(previous as JourneyState|undefined)?.deck));
  const dataset=await snapshot(),players=playersFromSnapshot(dataset),category=variant as Comparison;
  const left=chooseComparisonPlayer(category,players,[],random),right=chooseComparisonPlayer(category,players,[left.id],random);
  const queuedPlayer=chooseComparisonPlayer(category,players,[left.id,right.id],random);
  return {version:dataset.version,createdAt:dataset.createdAt,category,left,right,queuedPlayer,score:0,best:(previous as HigherLowerRun|undefined)?.best||0,roundsPlayed:{left:0,right:0},currentSide:null,gameOver:false};
}
export async function transitionCloudState(mode:CloudMode,state:State,runId:string,action:string,input:Record<string,unknown>):Promise<{state:State;events:RewardEvent[]}> {
  const events:RewardEvent[]=[];
  if(mode==='matrix'){
    if(action!=='save')throw new Error('Invalid Matrix action.');
    const before=state as MatrixSession;
    if(before.state.submitted)return {state,events};
    if(input.puzzleId!==before.puzzle.id||!Array.isArray(input.answers)||input.answers.length!==9)throw new Error('The grid changed in another tab. Reload it before continuing.');
    let draft=emptyState(before.puzzle);
    for(let index=0;index<9;index++){
      const answer=input.answers[index];if(answer!==null&&(typeof answer!=='string'||!matrixPlayers.some(player=>player.id===answer)))throw new Error('Unknown grid player.');
      draft=setAnswer(draft,matrixPlayers,index,answer);
      if(draft.answers[index]!==answer)throw new Error('Use each footballer once.');
    }
    draft={...draft,revision:before.state.revision+1};
    if(input.submitted===true){draft=submitGrid(draft);const view=viewState(draft,before.puzzle,matrixPlayers);events.push({source:runId,score:view.correct||0,xp:view.xp,won:view.won});}
    return {state:{...before,state:draft},events};
  }
  if(mode==='journeyman'){
    if(action!=='play'||!input.move||typeof input.move!=='object')throw new Error('Invalid journey action.');
    const move=input.move as JourneyAction;
    if(!['guess','reveal','skip','next'].includes(move.type)||(move.type==='guess'&&(typeof move.name!=='string'||move.name.length>150))||(move.type==='reveal'&&!['next','random'].includes(move.method)))throw new Error('Invalid journey action.');
    const before=state as JourneyState,next=advanceJourney(before,move,journeyPlayers,random);
    if(before.outcome==='playing'&&next.outcome!=='playing'){
      const won=next.outcome==='correct',points=won?potentialPoints(journeyPlayers[before.deck[before.question]].clubs.length,before.reveals):0;
      events.push({source:`${runId}:${before.question}`,score:points,xp:won?80:0,won});
    }
    return {state:next,events};
  }
  if(action!=='pick'||!['left','right'].includes(String(input.side)))throw new Error('Choose a player card.');
  const before=state as HigherLowerState;if(before.gameOver)return {state,events};
  const left=comparisonValue(before.left,before.category),right=comparisonValue(before.right,before.category);
  if(left===null||right===null)throw new Error('This comparison is unavailable.');
  const result=resolveComparisonPick(left,right,input.side as 'left'|'right',before.roundsPlayed);
  if(!result.correct){events.push({source:`${runId}:finished`,score:before.score,xp:0,won:before.score>=3});return {state:{...before,gameOver:true,lastPick:input.side as 'left'|'right'},events};}
  const score=before.score+1;events.push({source:`${runId}:pick:${score}`,score,xp:15,won:true,countsGame:false});
  const dataset=await snapshot(before.version),players=playersFromSnapshot(dataset);
  // Older saved streaks have no reservation; prepare their first replacement here.
  const replacement=before.queuedPlayer||chooseComparisonPlayer(before.category,players,[before.left.id,before.right.id],random);
  const leftPlayer=result.replace==='left'?replacement:before.left,rightPlayer=result.replace==='right'?replacement:before.right;
  const queuedPlayer=chooseComparisonPlayer(before.category,players,[leftPlayer.id,rightPlayer.id],random);
  return {state:{...before,left:leftPlayer,right:rightPlayer,queuedPlayer,score,best:Math.max(before.best,score),roundsPlayed:result.roundsPlayed,currentSide:result.survivor},events};
}

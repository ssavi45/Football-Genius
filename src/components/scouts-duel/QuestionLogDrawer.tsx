import { Check,X,Clock3 } from 'lucide-react';
import ScoutDialog from './ScoutDialog';
import type { ScoutView } from '@/lib/scouts-duel/types';
export function ScoutLogList({match}:{match:ScoutView}){
  return match.logs.length?<ol className="scout-log">{[...match.logs].reverse().map(log=><li key={log.id} className={log.seat===match.seat?'is-mine':'is-opponent'}><div><small>{log.seat===match.seat?'YOU':match.opponentName}</small><p>{log.text}</p></div><span className={log.answer===null?'is-neutral':log.answer?'is-yes':'is-no'}>{log.answer===null?<Clock3 size={14}/>:log.answer?<Check size={15}/>:<X size={15}/>} {log.answer===null?'TIME':log.kind==='shoot'?(log.answer?'HIT':'MISS'):log.answer?'YES':'NO'}</span></li>)}</ol>:<p className="scout-empty">Your clues will appear here.</p>;
}
export default function QuestionLogDrawer({match,onClose}:{match:ScoutView;onClose:()=>void}){return <ScoutDialog title="Question history" onClose={onClose}><ScoutLogList match={match}/></ScoutDialog>;}

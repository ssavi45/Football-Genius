import type { Comparison, ComparisonPlayer } from '@/lib/higher-lower/types';
export interface CloudRun<T> { runId:string; revision:number; state:T }
export interface HigherLowerRun {
  version:string; createdAt:string; category:Comparison; left:ComparisonPlayer; right:ComparisonPlayer;
  score:number; best:number; roundsPlayed:Record<'left'|'right',number>;
  currentSide:'left'|'right'|null; gameOver:boolean;
  lastPick?:'left'|'right';
  upcomingImages?:string[];
}
export interface RewardEvent { source:string; score:number; xp:number; won:boolean; countsGame?:boolean }

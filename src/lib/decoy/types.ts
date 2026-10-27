import type { Vec } from './math';
export type Phase = 'ready' | 'countdown' | 'playing' | 'paused' | 'goal' | 'failure' | 'complete';
export interface Footballer extends Vec {
  id: number; role: 'decoy' | 'carrier' | 'striker' | 'defender' | 'keeper'; number: number;
  vx: number; vy: number; previous: Vec; home: Vec; target: Vec; facing: number; gait: number;
  state: string; commitment: number; stun: number;
}
export interface Controls { x: number; y: number; sprint: boolean; feint: boolean }
export interface Ball extends Vec { previous: Vec; vx: number; vy: number; owner: number | null; flight: 'held' | 'pass' | 'shot'; age: number; rotation: number }
export interface GameEvent { id: number; at: number; type: 'drawn' | 'lane' | 'feint' | 'assist' | 'goal' | 'pass' | 'shot' | 'failure' | 'whistle'; text: string; points: number }
export interface Snapshot { phase: Phase; level: number; remaining: number; score: number; stars: number; stamina: number; cooldown: number; countdown: number; reason: string; feedback: string; tutorial: number; awards: { label: string; points: number }[]; seed: number; practice: boolean }

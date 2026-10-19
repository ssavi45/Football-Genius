import type { GameModeId } from '@/lib/types/games';

export const ACCOUNT_MODES = [
  { id: 'scoreline', title: 'Scoreline Hero', color: '#0865ff', wash: '#edf5ff', legacy: 'scoreline', comingSoon: false },
  { id: 'matrix', title: 'Football Matrix', color: '#e79100', wash: '#fff7e5', legacy: 'grid', comingSoon: false },
  { id: 'scouts-duel', title: "Scout's Duel", color: '#ec406b', wash: '#fff0f5', legacy: 'guess', comingSoon: false },
  { id: 'journeyman', title: 'The Journeyman', color: '#00a875', wash: '#eafbf4', legacy: 'transfer', comingSoon: false },
  { id: 'higher-lower', title: 'Higher or Lower', color: '#8d45e8', wash: '#f5efff', legacy: 'higherlower', comingSoon: false },
  { id: 'tunnel-talk', title: 'Tunnel Talk', color: '#3576e9', wash: '#edf4ff', legacy: 'whosaidit', comingSoon: true },
  { id: 'scramble', title: 'Bootroom Scramble', color: '#e98b15', wash: '#fff5e9', legacy: 'unscramble', comingSoon: true },
  { id: 'pixel-pitch', title: 'Pixel Pitch', color: '#0097bb', wash: '#e9faff', legacy: 'pixel-pitch', comingSoon: true },
] satisfies { id: GameModeId; title: string; color: string; wash: string; legacy: string; comingSoon: boolean }[];

export function accountMode(id: string) {
  return ACCOUNT_MODES.find(mode => mode.id === id || mode.legacy === id);
}

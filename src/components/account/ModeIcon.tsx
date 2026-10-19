import { Trophy, Grid2X2, Swords, Crown, ChartNoAxesColumnIncreasing, MessageSquareQuote, Shuffle, Gamepad2 } from 'lucide-react';
import type { GameModeId } from '@/lib/types/games';

const ICONS = { scoreline: Trophy, matrix: Grid2X2, 'scouts-duel': Swords, journeyman: Crown, 'higher-lower': ChartNoAxesColumnIncreasing, 'tunnel-talk': MessageSquareQuote, scramble: Shuffle, 'pixel-pitch': Gamepad2 };

export default function ModeIcon({ mode, size = 20 }: { mode: GameModeId; size?: number }) {
  const Icon = ICONS[mode];
  return <Icon size={size} aria-hidden="true" />;
}

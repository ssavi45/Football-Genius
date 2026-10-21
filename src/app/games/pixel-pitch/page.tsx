import { pageMetadata } from '@/lib/seo/metadata';
import GameModeComingSoon from '@/components/games/GameModeComingSoon';

export const metadata = pageMetadata('/games/pixel-pitch');

export default function PixelPitchPage() {
  return <GameModeComingSoon mode="pixel-pitch" />;
}

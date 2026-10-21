import { pageMetadata } from '@/lib/seo/metadata';
import GameModeComingSoon from '@/components/games/GameModeComingSoon';

export const metadata = pageMetadata('/games/scramble');

export default function BootroomScramblePage() {
  return <GameModeComingSoon mode="scramble" />;
}

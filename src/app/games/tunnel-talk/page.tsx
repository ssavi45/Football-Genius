import { pageMetadata } from '@/lib/seo/metadata';
import GameModeComingSoon from '@/components/games/GameModeComingSoon';

export const metadata = pageMetadata('/games/tunnel-talk');

export default function TunnelTalkPage() {
  return <GameModeComingSoon mode="tunnel-talk" />;
}

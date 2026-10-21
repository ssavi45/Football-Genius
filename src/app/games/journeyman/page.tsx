import { pageMetadata } from '@/lib/seo/metadata';
﻿import JourneymanGame from '@/components/dashboard/JourneymanGame';
import { randomInt } from 'node:crypto';
import roster from '@/data/transfer-players.json';
import profiles from '@/data/journeyman-profiles.json';
import { createJourneyDeck, journeyQuestionPool, type JourneyProfile } from '@/lib/journeyman';
import './journeyman.css';

export const metadata = pageMetadata('/games/journeyman');

export const dynamic = 'force-dynamic';

export default function JourneymanPage() {
  const playerProfiles: Record<string, JourneyProfile> = profiles;
  const players = journeyQuestionPool(roster).map(player => ({ ...player, ...playerProfiles[player.id!] }));
  const initialDeck = createJourneyDeck(players, () => randomInt(0, 2 ** 32) / 2 ** 32);
  return <JourneymanGame players={players} initialDeck={initialDeck} />;
}

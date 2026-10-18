import JourneymanGame from '@/components/dashboard/JourneymanGame';
import { randomInt } from 'node:crypto';
import roster from '@/data/transfer-players.json';
import { createJourneyDeck, journeyQuestionPool } from '@/lib/journeyman';
import './journeyman.css';

export const dynamic = 'force-dynamic';

export default function JourneymanPage() {
  const players = journeyQuestionPool(roster);
  const initialDeck = createJourneyDeck(players, () => randomInt(0, 2 ** 32) / 2 ** 32);
  return <JourneymanGame players={players} initialDeck={initialDeck} />;
}

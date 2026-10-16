import FootballMatrixGame from '@/components/dashboard/FootballMatrixGame';
import { randomUUID } from 'node:crypto';
import { getMatrixRound, matrixDatasetVersion, matrixPlayers } from '@/lib/matrix/data';
import { criteriaCatalog } from '@/lib/matrix/criteria';
import type { MatrixDifficulty } from '@/lib/matrix/types';
import './matrix.css';

export const dynamic = 'force-dynamic';

export default async function FootballMatrixPage({ searchParams }: { searchParams: Promise<{ difficulty?: string }> }) {
  const { difficulty: requested } = await searchParams;
  const difficulty: MatrixDifficulty = requested === 'easy' || requested === 'hard' ? requested : 'medium';
  const puzzle = getMatrixRound(randomUUID(), difficulty);
  return <FootballMatrixGame puzzle={puzzle} players={matrixPlayers} catalog={criteriaCatalog} datasetVersion={matrixDatasetVersion} />;
}

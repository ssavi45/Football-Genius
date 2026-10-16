import dataset from '@/data/matrix-players.json';
import portraits from '../../../public/img/higher-lower/asset-sources.json';
import type { MatrixDifficulty, MatrixPlayer, MatrixPuzzle } from './types';
import { criteriaCatalog } from './criteria';
import { createPuzzleGenerator } from './generator';
import { satisfies } from './engine';

const aliases: Record<string, string> = { van_dijk: 'vandijk', silva: 'bernardo', joao_neves: 'joaoneves' };
const headshots = new Map(portraits.portraits.map(p => [p.name, p]));
export const matrixPlayers: MatrixPlayer[] = dataset.players.map(player => {
  const key = aliases[player.id] || player.id;
  const image = headshots.get(key);
  if (!image || !image.alpha) throw new Error(`Matrix player needs a verified portrait: ${player.id}`);
  return { ...player, photoUrl: `/img/higher-lower/players/${key}.png?v=${image.sha256.slice(0, 12)}` };
});
export const matrixDatasetVersion = dataset.version;
export const matrixCriteriaAvailability = criteriaCatalog.map(criterion => ({
  criterion,
  eligiblePlayers: matrixPlayers.filter(player => satisfies(player, criterion)).length,
}));
const generatePuzzle = createPuzzleGenerator(matrixPlayers, criteriaCatalog, matrixDatasetVersion);
export function getMatrixRound(seed: string, difficulty: MatrixDifficulty = 'medium', number = 1, history: string[] = []): MatrixPuzzle {
  return generatePuzzle(seed, difficulty, number, history);
}

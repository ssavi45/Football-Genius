'use server';

import { randomUUID } from 'node:crypto';
import { getMatrixRound } from '@/lib/matrix/data';
import type { MatrixDifficulty, MatrixPuzzle } from '@/lib/matrix/types';

export async function newMatrixRound(difficulty: MatrixDifficulty, number: number, recentCombinations: string[]): Promise<MatrixPuzzle> {
  if (!['easy', 'medium', 'hard'].includes(difficulty) || !Number.isSafeInteger(number) || number < 1
    || !Array.isArray(recentCombinations) || recentCombinations.some(key => typeof key !== 'string' || key.length > 500)) {
    throw new Error('Invalid Matrix round request.');
  }
  const seed = randomUUID();
  const history = recentCombinations.slice(-200);
  try { return getMatrixRound(seed, difficulty, number, history); }
  catch (error) {
    // A finite catalog eventually repeats. Restart its rotation if exhausted,
    // while always excluding the immediately preceding combination.
    if (history.length <= 1) throw error;
    return getMatrixRound(seed, difficulty, number, history.slice(-1));
  }
}

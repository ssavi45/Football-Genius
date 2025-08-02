// This file contains utility functions for calculating scores based on user input and hint usage.

export function calculateScore(isCorrect: boolean, hintsUsed: number): number {
    if (!isCorrect) {
        return 0;
    }

    switch (hintsUsed) {
        case 0:
            return 5;
        case 1:
            return 3;
        case 2:
            return 2;
        case 3:
            return 1;
        default:
            return 0;
    }
}

export function resetScore(): number {
    return 0;
}
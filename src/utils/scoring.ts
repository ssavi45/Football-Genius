export function getPoints(hintsUsed: number): number {
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
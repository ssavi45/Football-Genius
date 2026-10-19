// Game pages use the same header and highlight the shared Play Game entry.
const SHARED_GAME_ROUTES = new Set([
  '/games/scoreline',
  '/games/higher-lower',
  '/games/matrix',
  '/games/journeyman',
  '/games/scouts-duel',
  '/games/tunnel-talk',
  '/games/pixel-pitch',
  '/games/scramble',
]);

export const isSharedGameRoute = (pathname: string) => SHARED_GAME_ROUTES.has(pathname);

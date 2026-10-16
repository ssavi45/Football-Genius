import portraits from '../../public/img/higher-lower/asset-sources.json';
import badgeAssets from '../../public/img/higher-lower/club-badges.json';
import type { Comparison, ComparisonPlayer, HigherLowerSnapshot } from './higher-lower/types';

export type { Comparison, ComparisonPlayer, HigherLowerSnapshot } from './higher-lower/types';

const availablePortraits = new Map(portraits.portraits.filter(p => p.alpha === true && !('error' in p)).map(p => [p.name, p]));
const portraitAliases: Record<string, string> = { van_dijk: 'vandijk', silva: 'bernardo', joao_neves: 'joaoneves' };
const localBadges = badgeAssets as Record<string, string>;

export function playersFromSnapshot(snapshot: HigherLowerSnapshot): ComparisonPlayer[] {
  return snapshot.players.flatMap((player): ComparisonPlayer[] => {
    const portraitId = portraitAliases[player.id] || player.id;
    // New roster identities need a reviewed headshot; never substitute a match photo.
    const portrait = availablePortraits.get(portraitId);
    if (!portrait) return [];
    return [{ ...player, clubBadge: (player.clubId && localBadges[player.clubId]) || player.clubBadge,
      transfers: player.transfers.map(move => ({ ...move,
        from: { ...move.from, crest: localBadges[move.from.id] || move.from.crest },
        to: { ...move.to, crest: localBadges[move.to.id] || move.to.crest },
      })),
      cutout: true, portrait: `/img/higher-lower/players/${portraitId}.png?v=${portrait.sha256.slice(0, 12)}` }];
  });
}

export const comparisonLabels: Record<Comparison, { label: string; question: string; description: string }> = {
  marketValue: { label: 'Current Market Value', question: 'current market value', description: 'Latest available Transfermarkt valuation, in euros. Only active players with a current valuation are included.' },
  goals: { label: 'Career Goals', question: 'career goal total', description: 'Senior club and full-A international goals, including senior international friendlies. Excludes youth, reserves and Olympic teams. Historical coverage varies.' },
  assists: { label: 'Career Assists', question: 'career assist total', description: 'Senior club and full-A international assists, including senior international friendlies. Excludes youth, reserves and Olympic teams. Players with missing assist values are excluded.' },
  transfer: { label: 'Transfer Fee', question: 'fee for the shown transfer', description: 'Compare the fees of the specific club-to-club moves shown on the cards. Completed permanent senior club transfers only; unknown fees and loans are excluded.' },
};

export function comparisonValue(player: ComparisonPlayer, mode: Comparison): number | null {
  return mode === 'transfer' ? player.selectedTransfer?.fee ?? null : player.stats[mode];
}

export function displayLeague(league: string | null) {
  const labels: Record<string, string> = {
    'Major League Soccer': 'MLS',
    'Campeonato Brasileiro Série A': 'Brasileirão',
    'UAE First Division League': 'UAE First Division',
    'Serie C - Girone B': 'Serie C',
  };
  return league ? labels[league] || league : '—';
}
export function comparisonPool(mode: Comparison, players: ComparisonPlayer[]) {
  return players.filter(player => mode === 'transfer' ? player.transfers.length > 0
    : mode === 'marketValue' ? !player.isRetired && player.stats.marketValue !== null && player.stats.marketValue > 0
    : player.stats[mode] !== null);
}

/** Pick the player first, then one move. Keep that move unchanged for the life of the card. */
export function chooseComparisonPlayer(mode: Comparison, players: ComparisonPlayer[], exclude: string[] = [], random = Math.random): ComparisonPlayer {
  const candidates = comparisonPool(mode, players).filter(player => !exclude.includes(player.id));
  if (!candidates.length) throw new Error('Not enough eligible players in this snapshot.');
  const player = candidates[Math.floor(random() * candidates.length)];
  return mode === 'transfer' ? { ...player, selectedTransfer: player.transfers[Math.floor(random() * player.transfers.length)] } : player;
}
export function formatComparison(value: number | null, mode: Comparison) {
  if (value === null) return 'Unavailable';
  if (mode === 'goals' || mode === 'assists') return value.toLocaleString('en-US');
  const amount = value >= 1_000_000 ? value / 1_000_000 : value >= 1_000 ? value / 1_000 : value;
  const suffix = value >= 1_000_000 ? 'M' : value >= 1_000 ? 'K' : '';
  return `€${amount.toLocaleString('en-US', { maximumFractionDigits: 2 })}${suffix}`;
}
export function isCorrectComparison(current: number, next: number, guess: 'higher' | 'lower') {
  return guess === 'higher' ? next >= current : next <= current;
}

/** Score the higher pick independently of rotation. A card can play at most two matchups. */
export function resolveComparisonPick(left: number, right: number, picked: 'left' | 'right',
  roundsPlayed: Record<'left' | 'right', number> = { left: 0, right: 0 }) {
  const winner = left === right ? picked : left > right ? 'left' : 'right';
  const survivor = roundsPlayed[winner] >= 1 ? winner === 'left' ? 'right' : 'left' : winner;
  return {
    correct: picked === winner,
    winner,
    survivor,
    replace: survivor === 'left' ? 'right' as const : 'left' as const,
    roundsPlayed: {
      left: survivor === 'left' ? roundsPlayed.left + 1 : 0,
      right: survivor === 'right' ? roundsPlayed.right + 1 : 0,
    },
  };
}

import type { HigherLowerSnapshot } from './types';

/** Reject an invalid/partial publication before it can replace the playable snapshot. */
export function isHigherLowerSnapshot(value: unknown): value is HigherLowerSnapshot {
  if (!value || typeof value !== 'object') return false;
  const data = value as HigherLowerSnapshot;
  if (data.schemaVersion !== 3 || data.playerCount !== 500 || typeof data.version !== 'string'
    || !Number.isFinite(Date.parse(data.createdAt)) || !Array.isArray(data.players)
    || data.players.length !== 500 || !data.source?.name || !data.scope) return false;
  const categories = ['goals', 'assists', 'marketValue'] as const;
  const ids = new Set<string>();
  const providerIds = new Set<string>();
  for (const player of data.players) {
    if (!player || typeof player.id !== 'string' || !/^\d+$/.test(player.transfermarktId)
      || ids.has(player.id) || providerIds.has(player.transfermarktId)
      || typeof player.name !== 'string' || !player.name.trim() || typeof player.isRetired !== 'boolean'
      || typeof player.image !== 'string' || !player.image.startsWith('/img/')
      || !Number.isFinite(Date.parse(player.fetchedAt)) || !player.stats || !player.coverage
      || player.coverage.scope !== 'recorded-senior-career-matches'
      || !Number.isSafeInteger(player.coverage.appearances) || player.coverage.appearances < 1) return false;
    for (const key of categories) {
      const stat = player.stats[key];
      if (stat !== null && (!Number.isSafeInteger(stat) || stat < 0)) return false;
    }
    const coverage = player.coverage;
    const parts = [coverage.club, coverage.international];
    for (const part of parts) {
      if (!part || !Number.isSafeInteger(part.appearances) || part.appearances < 0) return false;
      for (const [key, missing] of [['goals', 'missingGoals'], ['assists', 'missingAssists']] as const) {
        if (!Number.isSafeInteger(part[missing]) || part[missing] < 0 || part[missing] > part.appearances
          || (part[missing] > 0 ? part[key] !== null : !Number.isSafeInteger(part[key]) || part[key]! < 0)
          || (part.appearances === 0 && part[key] !== 0)) return false;
      }
    }
    if (coverage.appearances !== coverage.club.appearances + coverage.international.appearances) return false;
    for (const [key, missing] of [['goals', 'missingGoals'], ['assists', 'missingAssists']] as const) {
      const unknown = coverage.club[missing] + coverage.international[missing];
      const total = unknown ? null : coverage.club[key]! + coverage.international[key]!;
      if (coverage[missing] !== unknown || player.stats[key] !== total) return false;
    }
    if ((player.isRetired && player.stats.marketValue !== null) || player.stats.marketValue === 0
      || !Array.isArray(player.transfers)) return false;
    const moves = new Set<string>();
    for (const move of player.transfers) {
      if (!move || typeof move.id !== 'string' || !move.id || moves.has(move.id)
        || !Number.isSafeInteger(move.fee) || move.fee < 0
        || !/^\d{4}-\d{2}-\d{2}$/.test(move.date) || !Number.isFinite(Date.parse(move.date))
        || Date.parse(move.date) > Date.parse(player.fetchedAt)
        || (move.season !== null && typeof move.season !== 'string')
        || !move.from || !move.to || move.from.id === move.to.id) return false;
      for (const club of [move.from, move.to]) {
        if (typeof club.id !== 'string' || !/^\d+$/.test(club.id)
          || typeof club.name !== 'string' || !club.name.trim()
          || typeof club.crest !== 'string' || !/^https:\/\//.test(club.crest)) return false;
      }
      moves.add(move.id);
    }
    ids.add(player.id);
    providerIds.add(player.transfermarktId);
  }
  return categories.every(key => typeof data.scope[key] === 'string'
    && data.players.filter(player => player.stats[key] !== null).length >= 20)
    && typeof data.scope.transfer === 'string' && data.players.filter(player => player.transfers.length > 0).length >= 20
    && data.players.some(player => player.isRetired) && data.players.some(player => !player.isRetired);
}

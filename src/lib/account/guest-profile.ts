import { FOOTBALLER_AVATARS, findAvatarByUrl } from '@/data/avatar-catalog';
import type { UserProfile } from '@/lib/types/games';

export const GUEST_KEY = 'footygen_guest_profile_v2';
// A deterministic initial value keeps server and first client renders identical.
export const EMPTY_GUEST: UserProfile = { id: 'guest_default', username: 'ScoutGuest', total_xp: 0, level: 1, current_streak: 0, best_streak: 0, coins: 0, is_guest: true, games_played: 0, games_won: 0, created_at: '2026-10-19T00:00:00Z' };

export function readGuest(): UserProfile {
  let guest: UserProfile | undefined;
  try {
    const raw = localStorage.getItem(GUEST_KEY);
    const saved = raw ? JSON.parse(raw) : null;
    if (saved?.is_guest === true && typeof saved.id === 'string' && typeof saved.username === 'string') {
      guest = { ...EMPTY_GUEST, ...saved };
    }
  } catch { /* Guest play remains available without browser storage. */ }

  if (!guest) {
    const id = `guest_${crypto.randomUUID()}`;
    guest = { ...EMPTY_GUEST, id, username: `Scout_${id.slice(-4).toUpperCase()}`, created_at: new Date().toISOString() };
  }
  if (typeof guest.avatar_url !== 'string' || !findAvatarByUrl(guest.avatar_url)) {
    guest.avatar_url = FOOTBALLER_AVATARS[Math.floor(Math.random() * FOOTBALLER_AVATARS.length)].avatarUrl;
  }
  // Also migrates existing guest profiles without changing their progress or name.
  try { localStorage.setItem(GUEST_KEY, JSON.stringify(guest)); } catch { /* Keep this visit's portrait usable. */ }
  return guest;
}

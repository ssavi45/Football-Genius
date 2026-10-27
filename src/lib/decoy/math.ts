export interface Vec { x: number; y: number }
export const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
export const distance = (a: Vec, b: Vec) => Math.hypot(a.x - b.x, a.y - b.y);
export function unit(x: number, y: number): Vec { const n = Math.hypot(x, y); return n > .001 ? { x: x / n, y: y / n } : { x: 0, y: 0 }; }
export function segmentDistance(p: Vec, a: Vec, b: Vec) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const t = clamp(((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy || 1), 0, 1);
  return distance(p, { x: a.x + t * dx, y: a.y + t * dy });
}
export function seeded(seed: number) {
  let state = seed >>> 0;
  return () => { state = (Math.imul(1664525, state) + 1013904223) >>> 0; return state / 4294967296; };
}

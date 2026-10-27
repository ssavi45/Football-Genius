import { FIELD } from './config';
import { seeded } from './math';
import type { DecoySimulation } from './simulation';
import type { Footballer } from './types';

const rounded = (c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => { c.beginPath(); c.roundRect(x, y, w, h, r); };
function line(c: CanvasRenderingContext2D, x: number, y: number, x2: number, y2: number) { c.beginPath(); c.moveTo(x, y); c.lineTo(x2, y2); c.stroke(); }

/** Cached original stadium artwork: grass, seating, floodlight spill and markings. */
export function makePitch() {
  const canvas = document.createElement('canvas'); canvas.width = FIELD.width * 2; canvas.height = FIELD.height * 2;
  const c = canvas.getContext('2d')!; c.scale(2, 2);
  c.fillStyle = '#061a2b'; c.fillRect(0, 0, 1000, 620);
  const random = seeded(873);
  for (let row = 0; row < 4; row++) for (let col = 0; col < 170; col++) {
    c.fillStyle = ['#13405d', '#175b80', '#2c7f9c', '#a2d0dc'][Math.floor(random() * 4)]; c.globalAlpha = .25 + random() * .3;
    c.fillRect(col * 6, row * 7 + 4, 3, 3); c.fillRect(col * 6, 590 + row * 7, 3, 3);
  }
  c.globalAlpha = 1;
  const turf = c.createLinearGradient(0, 65, 1000, 555); turf.addColorStop(0, '#1c7959'); turf.addColorStop(.5, '#12674c'); turf.addColorStop(1, '#0b493f');
  c.fillStyle = turf; rounded(c, 40, 53, 914, 514, 7); c.fill();
  for (let i = 0; i < 13; i++) { c.fillStyle = i % 2 ? '#ffffff05' : '#0000000a'; c.fillRect(55 + i * 68, 65, 68, 490); }
  for (let i = 0; i < 13000; i++) { c.fillStyle = random() > .5 ? '#b3ffbd0b' : '#002b2614'; c.fillRect(55 + random() * 885, 65 + random() * 490, 1, 2); }
  c.strokeStyle = '#d7fff18a'; c.lineWidth = 1.8;
  c.strokeRect(55, 65, 885, 490); line(c, 290, 65, 290, 555);
  c.beginPath(); c.arc(290, 310, 86, 0, Math.PI * 2); c.stroke();
  c.fillStyle = '#dcfff2b0'; c.beginPath(); c.arc(290, 310, 3, 0, Math.PI * 2); c.fill();
  c.strokeRect(756, 166, 184, 288); c.strokeRect(871, 236, 69, 148);
  c.beginPath(); c.arc(823, 310, 75, Math.PI * .7, Math.PI * 1.3); c.stroke();
  c.beginPath(); c.arc(823, 310, 3, 0, Math.PI * 2); c.fill();
  for (const y of [65, 555]) { c.beginPath(); c.arc(940, y, 13, y === 65 ? Math.PI / 2 : Math.PI, y === 65 ? Math.PI : Math.PI * 1.5); c.stroke(); }
  // Net recedes outside the goal line; posts remain above the players in the final pass.
  c.fillStyle = '#bde9ff15'; c.fillRect(941, 245, 36, 130); c.strokeStyle = '#c5eeff40'; c.lineWidth = .7;
  for (let x = 944; x <= 978; x += 7) line(c, x, 245, x, 375);
  for (let y = 245; y <= 375; y += 8) line(c, 941, y, 978, y);
  const glow = c.createRadialGradient(610, 100, 0, 610, 100, 550); glow.addColorStop(0, '#a0ffe711'); glow.addColorStop(1, '#00152222'); c.fillStyle = glow; c.fillRect(40, 53, 914, 514);
  c.font = '700 10px Arial'; c.textAlign = 'left'; c.fillStyle = '#93d4e7'; c.fillText('FOOTYGEN   /   THE DECOY', 58, 41);
  c.textAlign = 'right'; c.fillStyle = '#73b0be'; c.fillText('ATTACK  →', 939, 41);
  for (let i = 0; i < 5; i++) { c.fillStyle = i % 2 ? '#1c5cff' : '#163e63'; rounded(c, 180 + i * 135, 575, 125, 15, 3); c.fill(); c.fillStyle = '#cde8ff'; c.font = 'bold 8px Arial'; c.textAlign = 'center'; c.fillText(i % 2 ? 'KNOW FOOTBALL. PROVE IT.' : 'F O O T Y G E N', 242 + i * 135, 585); }
  return canvas;
}

function footballer(c: CanvasRenderingContext2D, a: Footballer, alpha: number, sim: DecoySimulation, reduced: boolean) {
  const x = a.previous.x + (a.x - a.previous.x) * alpha, y = a.previous.y + (a.y - a.previous.y) * alpha;
  const selected = a.role === 'decoy', enemy = a.role === 'defender', keeper = a.role === 'keeper';
  const moving = Math.hypot(a.vx, a.vy) > 15, gait = moving && !reduced ? Math.sin(a.gait) * 4 : 0;
  c.save(); c.translate(x, y);
  c.fillStyle = '#00172466'; c.beginPath(); c.ellipse(4, 8, 16, 9, 0, 0, Math.PI * 2); c.fill();
  if (selected) {
    c.strokeStyle = '#79efff'; c.lineWidth = 2; c.beginPath(); c.ellipse(0, 4, 24, 21, 0, 0, Math.PI * 2); c.stroke();
    c.fillStyle = '#38dfff13'; c.fill();
    c.fillStyle = '#8ef7ff'; c.beginPath(); c.moveTo(-5, -34); c.lineTo(5, -34); c.lineTo(0, -28); c.fill();
    if (sim.feintTime > 0 && !reduced) for (let i = 1; i <= 3; i++) { c.globalAlpha = .18 / i; c.fillStyle = '#8cffff'; rounded(c, -11 - sim.feintVector.x * i * 12, -14 - sim.feintVector.y * i * 12, 22, 26, 6); c.fill(); } c.globalAlpha = 1;
  }
  // Rotating kit, articulated boots/arms, shaded head and shoulders; numbers stay readable.
  c.save(); c.rotate(a.facing + Math.PI / 2);
  c.fillStyle = '#07142d'; rounded(c, -9, 7 + gait, 7, 12, 3); c.fill(); rounded(c, 2, 7 - gait, 7, 12, 3); c.fill();
  c.fillStyle = '#ddf5fa'; c.fillRect(-9, 9 + gait, 7, 4); c.fillRect(2, 9 - gait, 7, 4);
  const kit = c.createLinearGradient(-14, -13, 14, 14); kit.addColorStop(0, enemy ? '#ffaf8b' : keeper ? '#ffe7a1' : '#55b7ff'); kit.addColorStop(1, enemy ? '#df3e57' : keeper ? '#ec9b28' : '#1555e5'); c.fillStyle = kit;
  rounded(c, -12, -13, 24, 24, 6); c.fill();
  c.strokeStyle = enemy ? '#ffc0a0' : '#d5edff'; c.lineWidth = 3; line(c, -9, -9, 9, -9);
  c.fillStyle = '#b88768'; rounded(c, -18, -8 - gait, 6, 15, 3); c.fill(); rounded(c, 12, -8 + gait, 6, 15, 3); c.fill();
  if (keeper) { c.fillStyle = '#e8ffdf'; c.fillRect(-20, -12 - gait, 9, 7); c.fillRect(11, -12 + gait, 9, 7); }
  c.fillStyle = '#d0a080'; c.beginPath(); c.ellipse(0, -15, 7, 8, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = a.number % 2 ? '#271f2a' : '#503529'; c.beginPath(); c.ellipse(0, -18, 7, 5, 0, Math.PI, Math.PI * 2); c.fill(); c.restore();
  c.font = '900 11px Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#fff'; c.shadowColor = '#001c52'; c.shadowBlur = 3; c.fillText(String(a.number), 0, 1); c.shadowBlur = 0;
  if (a.stun > 0) { c.strokeStyle = '#ffe28e'; c.lineWidth = 2; c.beginPath(); c.arc(0, -3, 22, -.8, 1.9); c.stroke(); }
  if (selected || a.role === 'striker' || a.role === 'carrier') { c.fillStyle = selected ? '#9af3ff' : '#c2e0ed'; c.font = 'bold 8px Arial'; c.fillText(selected ? 'YOU · DECOY' : a.role === 'striker' ? 'FINISHER' : 'PLAYMAKER', 0, 32); }
  c.restore();
}

export function render(c: CanvasRenderingContext2D, pitch: HTMLCanvasElement, sim: DecoySimulation, alpha: number, reduced = false) {
  const width = c.canvas.width, height = c.canvas.height;
  c.setTransform(width / 1000, 0, 0, height / 620, 0, 0); c.clearRect(0, 0, 1000, 620); c.drawImage(pitch, 0, 0, 1000, 620);
  if (sim.laneOpen && sim.ball.owner === 8 && sim.phase === 'playing') {
    c.strokeStyle = '#a0ffcb88'; c.lineWidth = 18; line(c, sim.carrier.x, sim.carrier.y, sim.striker.x, sim.striker.y);
    c.strokeStyle = '#c7ffe6'; c.lineWidth = 1.5; c.setLineDash([7, 9]); line(c, sim.carrier.x, sim.carrier.y, sim.striker.x, sim.striker.y); c.setLineDash([]);
  }
  for (const a of [...sim.actors].sort((a, b) => a.y - b.y)) footballer(c, a, alpha, sim, reduced);
  const b = sim.ball, x = b.previous.x + (b.x - b.previous.x) * alpha, y = b.previous.y + (b.y - b.previous.y) * alpha;
  if (b.owner === null && !reduced) { c.strokeStyle = b.flight === 'shot' ? '#fff3c75c' : '#ffffff35'; c.lineWidth = 5; line(c, x, y, x - b.vx * .04, y - b.vy * .04); }
  c.fillStyle = '#001c3355'; c.beginPath(); c.ellipse(x + 3, y + 5, 7, 4, 0, 0, Math.PI * 2); c.fill();
  c.save(); c.translate(x, y); c.rotate(b.rotation); c.fillStyle = '#fff'; c.beginPath(); c.arc(0, 0, 6.5, 0, Math.PI * 2); c.fill(); c.fillStyle = '#153047';
  for (let i = 0; i < 5; i++) { c.save(); c.rotate(i * Math.PI * .4); c.fillRect(-1.5, -6, 3, 2.5); c.restore(); } c.beginPath(); c.arc(0, 0, 2.6, 0, Math.PI * 2); c.fill(); c.restore();
  c.strokeStyle = '#ecfaff'; c.lineWidth = 4; line(c, 941, 244, 977, 244); line(c, 977, 244, 977, 376); line(c, 941, 376, 977, 376);
  if ((sim.phase === 'goal' || sim.phase === 'complete') && !reduced) {
    const random = seeded(sim.seed); for (let i = 0; i < 45; i++) { c.fillStyle = i % 2 ? '#69e4ff' : '#ffd86c'; c.fillRect(120 + random() * 760, 70 + random() * 460, 3, 7); }
  }
}

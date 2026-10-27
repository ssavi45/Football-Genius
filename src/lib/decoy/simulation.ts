import { FIELD, LEVELS, POINTS, TUNE } from './config';
import { clamp, distance, seeded, segmentDistance, unit, type Vec } from './math';
import { decide } from './ai';
import type { Ball, Controls, Footballer, GameEvent, Phase, Snapshot } from './types';

export class DecoySimulation {
  phase: Phase = 'ready'; resumePhase: Phase = 'playing'; elapsed = 0; countdown = 3;
  stamina = 100; cooldown = 0; feintTime = 0; feintVector: Vec = { x: 0, y: -1 };
  exhausted = false;
  score = 0; stars = 0; reason = ''; laneOpen = false; openTime = 0; hasDrawn = false;
  moved = 0; tutorial = 0; decision = 0; events: GameEvent[] = []; awarded = new Set<string>();
  awards: { label: string; points: number }[] = []; random: () => number;
  player: Footballer; carrier: Footballer; striker: Footballer; keeper: Footballer;
  defenders: Footballer[]; actors: Footballer[]; ball: Ball; private sequence = 0;
  readonly config: typeof LEVELS[number];
  constructor(public level = 0, public seed = 42, public practice = false) {
    this.level = clamp(Math.floor(level), 0, 2); this.config = LEVELS[this.level]; this.random = seeded(seed);
    const jitter = () => (this.random() - .5) * 18;
    const actor = (id: number, role: Footballer['role'], number: number, x: number, y: number): Footballer => ({ id, role, number, x, y, vx: 0, vy: 0, previous: { x, y }, home: { x, y }, target: { x, y }, facing: 0, gait: 0, state: 'hold shape', commitment: 0, stun: 0 });
    this.player = actor(10, 'decoy', 10, 560, 240 + jitter());
    this.carrier = actor(8, 'carrier', 8, 420, 310);
    this.striker = actor(9, 'striker', 9, 780, 335 + jitter());
    this.keeper = actor(1, 'keeper', 1, 914, 310);
    this.defenders = [actor(4, 'defender', 4, 650, 245 + jitter()), actor(5, 'defender', 5, 690, 332 + jitter())];
    if (this.config.defenders === 3) this.defenders.push(actor(6, 'defender', 6, 850, 425 + jitter()));
    this.actors = [this.player, this.carrier, this.striker, ...this.defenders, this.keeper];
    this.ball = { x: 438, y: 310, previous: { x: 438, y: 310 }, vx: 0, vy: 0, owner: 8, flight: 'held', age: 0, rotation: 0 };
  }
  start() { if (this.phase === 'ready') this.phase = 'countdown'; }
  pause() { if (this.phase === 'playing' || this.phase === 'countdown') { this.resumePhase = this.phase; this.phase = 'paused'; } }
  resume() { if (this.phase === 'paused') this.phase = this.resumePhase; }
  complete() { if (this.phase === 'goal' && this.level === 2 && !this.practice) this.phase = 'complete'; }
  emit(type: GameEvent['type'], text: string, points = 0) {
    this.events.push({ id: ++this.sequence, at: this.elapsed, type, text, points });
    if (this.events.length > 32) this.events.shift();
  }
  award(type: keyof typeof POINTS, label: string, key: string) {
    if (this.awarded.has(key)) return;
    this.awarded.add(key); this.score += POINTS[type]; this.awards.push({ label, points: POINTS[type] }); this.emit(type, label, POINTS[type]);
  }
  finish(reason: string, goal = false) {
    if (this.phase !== 'playing') return;
    this.reason = reason; this.phase = goal ? 'goal' : 'failure';
    if (goal) {
      this.award('goal', 'Team goal', 'goal');
      const bonus = Math.max(0, Math.round((this.config.seconds - this.elapsed) * 4));
      this.score += bonus; this.awards.push({ label: 'Time bonus', points: bonus });
      const createdChance = this.hasDrawn && this.awarded.has('lane');
      this.stars = 1 + Number(createdChance) + Number(this.elapsed <= this.config.par && createdChance);
    } else this.emit('failure', reason);
  }
  kick(target: Vec, flight: 'pass' | 'shot') {
    const dir = unit(target.x - this.ball.x, target.y - this.ball.y);
    const speed = flight === 'pass' ? TUNE.passSpeed : TUNE.shotSpeed;
    Object.assign(this.ball, { owner: null, vx: dir.x * speed, vy: dir.y * speed, flight, age: 0 });
    this.emit(flight, flight === 'pass' ? 'No. 8 finds the runner' : 'No. 9 takes the shot');
  }
  private steer(a: Footballer, target: Vec, speed: number, dt: number) {
    const gap = distance(a, target), dir = unit(target.x - a.x, target.y - a.y);
    const desired = Math.min(speed, gap * 5), blend = Math.min(1, 8 * dt);
    a.vx += (dir.x * desired - a.vx) * blend; a.vy += (dir.y * desired - a.vy) * blend;
  }
  step(input: Controls, dt = TUNE.step) {
    if (this.phase === 'countdown') {
      this.countdown = Math.max(0, this.countdown - dt);
      if (this.countdown === 0) { this.phase = 'playing'; this.emit('whistle', 'Play'); }
      return;
    }
    if (this.phase !== 'playing') return;
    this.elapsed += dt;
    if (this.elapsed >= this.config.seconds) { this.finish('Time expired. Draw the screen defender away from No. 9.'); return; }
    this.cooldown = Math.max(0, this.cooldown - dt); this.feintTime = Math.max(0, this.feintTime - dt);
    for (const a of this.actors) { a.previous = { x: a.x, y: a.y }; a.stun = Math.max(0, a.stun - dt); a.commitment = Math.max(0, a.commitment - dt); }
    this.ball.previous = { x: this.ball.x, y: this.ball.y };
    const dir = unit(input.x, input.y), moving = Math.hypot(input.x, input.y) > .08;
    if (input.feint && this.cooldown === 0 && this.stamina >= 16) {
      this.cooldown = TUNE.feintCooldown; this.feintTime = TUNE.feintDuration; this.stamina -= 16;
      this.feintVector = moving ? dir : unit(-this.player.vy || 0, this.player.vx || -1);
      let caught = false;
      for (const d of this.defenders) if (distance(d, this.player) < TUNE.feintRadius && d.state === 'track decoy') {
        d.stun = .85 - this.config.discipline * .35; d.target = { x: this.player.x + this.player.vx * .45, y: this.player.y + this.player.vy * .45 }; caught = true;
      }
      if (caught) this.award('feint', 'Perfect decoy', 'feint');
    }
    if (this.stamina < 1) this.exhausted = true;
    if (this.stamina >= 25) this.exhausted = false;
    const sprinting = input.sprint && moving && !this.exhausted && this.stamina > 1;
    this.stamina = clamp(this.stamina + (sprinting ? -TUNE.staminaDrain : TUNE.staminaRecovery) * dt, 0, 100);
    const speed = this.feintTime > 0 ? TUNE.feintSpeed : sprinting ? TUNE.sprint : TUNE.walk;
    const vector = this.feintTime > 0 ? this.feintVector : moving ? dir : { x: 0, y: 0 };
    const approach = (v: number, goal: number) => v + clamp(goal - v, -TUNE.acceleration * dt, TUNE.acceleration * dt);
    this.player.vx = approach(this.player.vx, vector.x * speed); this.player.vy = approach(this.player.vy, vector.y * speed);
    this.decision -= dt;
    if (this.decision <= 0) { decide(this); this.decision += TUNE.decisionInterval; }
    for (const a of this.actors) {
      if (a !== this.player) this.steer(a, a.target, a.role === 'keeper' ? this.config.keeperSpeed : a.role === 'defender' ? this.config.speed * (a.stun > 0 ? .25 : 1) : 74, dt);
      a.x = clamp(a.x + a.vx * dt, FIELD.left + 15, a.role === 'keeper' ? 926 : FIELD.right - 34);
      a.y = clamp(a.y + a.vy * dt, FIELD.top + 18, FIELD.bottom - 18);
      const velocity = Math.hypot(a.vx, a.vy); a.gait += velocity * dt * .13;
      if (velocity > 8) a.facing = Math.atan2(a.vy, a.vx);
    }
    // Soft disc separation prevents body overlap without unstable velocity impulses.
    for (let i = 0; i < this.actors.length; i++) for (let j = i + 1; j < this.actors.length; j++) {
      const a = this.actors[i], b = this.actors[j], gap = distance(a, b), min = TUNE.radius * 2;
      if (gap < min) {
        const n = gap < .001 ? { x: 0, y: 1 } : unit(a.x - b.x, a.y - b.y), push = (min - gap) * .5;
        a.x += n.x * push; a.y += n.y * push; b.x -= n.x * push; b.y -= n.y * push;
      }
    }
    for (const a of this.actors) { a.x = clamp(a.x, FIELD.left + 15, FIELD.right - 14); a.y = clamp(a.y, FIELD.top + 18, FIELD.bottom - 18); }
    this.moved += distance(this.player, this.player.previous);
    for (const d of this.defenders) if (d.state === 'track decoy' && distance(d, d.home) > 65 && distance(this.player, this.player.home) > 55) { this.hasDrawn = true; this.award('drawn', 'Defender drawn', 'drawn'); }
    this.tutorial = this.awarded.has('lane') ? 3 : this.hasDrawn ? 2 : this.moved > 90 ? 1 : 0;
    this.updateBall(dt);
  }
  private updateBall(dt: number) {
    const b = this.ball; b.age += dt;
    if (b.owner !== null) {
      const owner = this.actors.find(a => a.id === b.owner)!;
      b.x = owner.x + 18; b.y = owner.y + 4; b.rotation += Math.hypot(owner.vx, owner.vy) * dt * .08;
      if (b.age > TUNE.possessionGrace && this.defenders.some(d => distance(d, b) < 23)) this.finish('Tackled. The defence closed the receiver down.');
      return;
    }
    const from = { x: b.x, y: b.y }; b.x += b.vx * dt; b.y += b.vy * dt; b.rotation += Math.hypot(b.vx, b.vy) * dt * .08;
    if (this.defenders.some(d => segmentDistance(d, from, b) < 18)) { this.finish('Intercepted. Draw the defender farther from the passing lane.'); return; }
    if (b.flight === 'shot' && segmentDistance(this.keeper, from, b) < (this.keeper.state === 'dive' ? 24 : 19)) { this.finish('Saved! The keeper read the shot. Create an opening earlier.'); return; }
    if (b.flight === 'pass' && segmentDistance(this.striker, from, b) < 22) {
      b.owner = this.striker.id; b.flight = 'held'; b.age = 0; b.vx = 0; b.vy = 0;
      if (this.hasDrawn && this.awarded.has('lane')) this.award('assist', 'Space created → chance', 'assist');
      return;
    }
    if (b.x >= FIELD.right) {
      const t = (FIELD.right - from.x) / (b.x - from.x || 1), crossingY = from.y + (b.y - from.y) * t;
      this.finish(crossingY > FIELD.goalTop + 5 && crossingY < FIELD.goalBottom - 5 ? 'Your movement made the difference.' : 'Just wide. The forward could not find the corner.', crossingY > FIELD.goalTop + 5 && crossingY < FIELD.goalBottom - 5); return;
    }
    if (b.x < FIELD.left || b.y < FIELD.top || b.y > FIELD.bottom || b.age > 3) this.finish('Ball out of play. Reset the attack and try a different run.');
  }
  snapshot(): Snapshot {
    const recent = [...this.events].reverse().find(e => this.elapsed - e.at < 2.5 && e.text);
    return { phase: this.phase, level: this.level, remaining: Math.max(0, this.config.seconds - this.elapsed), score: this.score, stars: this.stars, stamina: this.stamina, cooldown: this.cooldown, countdown: this.countdown, reason: this.reason, feedback: recent?.text || '', tutorial: this.tutorial, awards: [...this.awards], seed: this.seed, practice: this.practice };
  }
}

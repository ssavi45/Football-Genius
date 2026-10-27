import { FIELD, TUNE } from './config';
import { clamp, distance, seeded, segmentDistance, type Vec } from './math';
import type { Footballer } from './types';
import type { DecoySimulation } from './simulation';

export function laneClearance(from: Vec, to: Vec, defenders: Footballer[]) {
  return Math.min(...defenders.filter(d => d.x > from.x - 16 && d.x < to.x + 25).map(d => segmentDistance(d, from, to)), 999);
}

/** Utility decisions with commitment/hysteresis; steering runs every fixed tick. */
export function decide(sim: DecoySimulation) {
  const { player, carrier, striker, defenders, keeper, ball, level } = sim;
  const cfg = sim.config;
  // The forward offers a small diagonal run, never teleports to a scripted shooting spot.
  const supportY = clamp(330 + (310 - player.y) * .15, 270, 390);
  striker.target = ball.owner === striker.id ? { x: 840, y: striker.y } : { x: 790, y: supportY };
  carrier.target = { x: 420 + Math.sin(sim.elapsed * .65) * 26, y: clamp(310 + (310 - player.y) * .12, 260, 360) };
  defenders.forEach((d, i) => {
    if (d.stun > 0) return;
    if (ball.owner === striker.id || ball.flight === 'shot') {
      d.state = 'close down'; d.target = { x: striker.x + 5, y: striker.y }; return;
    }
    if (ball.flight === 'pass') {
      d.state = 'intercept';
      d.target = { x: ball.x + ball.vx * .16, y: ball.y + ball.vy * .16 }; return;
    }
    const proximity = clamp(1 - distance(d, player) / 260, 0, 1);
    const penetration = clamp((player.x - 500) / 240, 0, 1);
    const running = Math.hypot(player.vx, player.vy) > 90 ? .18 : 0;
    const threat = proximity * .48 + penetration * .64 + running;
    // One specialist tracks No.10; the screen may hand over its mark to cover a dangerous run.
    const threshold = i === 0 ? .35 : i === 1 ? .68 + cfg.discipline * .18 : 1.3;
    if ((threat > threshold && player.x > 520) || d.commitment > 0) {
      if (d.state !== 'track decoy') d.commitment = .7 + (1 - cfg.discipline) * .9;
      d.state = 'track decoy';
      d.target = { x: clamp(player.x + 22, 510, 855), y: clamp(player.y + player.vy * .2, 100, 520) };
    } else {
      d.state = i === 1 ? 'screen lane' : i === 2 ? 'cover' : 'hold shape';
      d.target = i === 1
        ? { x: striker.x - 88, y: carrier.y + (striker.y - carrier.y) * .76 }
        : i === 2 ? { x: 850, y: clamp(striker.y + 92 - level * 9, 280, 470) } : { ...d.home };
    }
  });
  if (ball.flight === 'shot' && ball.age > cfg.keeperReaction) {
    const arrival = (keeper.x - ball.x) / Math.max(1, ball.vx);
    keeper.target = { x: 912, y: clamp(ball.y + ball.vy * Math.max(0, arrival), FIELD.goalTop + 6, FIELD.goalBottom - 6) };
    keeper.state = 'dive';
  } else if (ball.flight !== 'shot') {
    keeper.state = 'set'; keeper.target = { x: 914, y: clamp(310 + (ball.y - 310) * .48, 265, 355) };
  }
  const clearance = laneClearance(carrier, striker, defenders);
  sim.laneOpen = clearance > cfg.clearance && defenders.every(d => distance(d, striker) > 42);
  if (sim.laneOpen && sim.hasDrawn) sim.award('lane', 'Passing lane open', 'lane');
  if (ball.owner === carrier.id && ball.age > 1 && sim.laneOpen) {
    sim.openTime += TUNE.decisionInterval;
    if (sim.openTime > .28) sim.kick(striker, 'pass');
  } else sim.openTime = 0;
  if (ball.owner === striker.id && ball.age > .48) {
    const pressure = Math.min(...defenders.map(d => distance(d, striker)));
    if (striker.x > 785 || ball.age > 1.6) {
      const corner = keeper.y >= 310 ? FIELD.goalTop + 24 : FIELD.goalBottom - 24;
      // Repeatable shot scatter, influenced by when/where the chance is created.
      const shotNoise = seeded(sim.seed ^ Math.imul(Math.round(sim.elapsed * 60), 2654435761) ^ Math.round(striker.y * 100))();
      const error = (shotNoise - .5) * (20 + clamp((65 - pressure) / 45, 0, 1) * 65);
      sim.kick({ x: FIELD.right + 12, y: corner + error }, 'shot');
    }
  }
}

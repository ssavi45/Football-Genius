/** World units are independent of CSS pixels. All simulation tuning lives here. */
export const FIELD = { width: 1000, height: 620, left: 55, right: 940, top: 65, bottom: 555, goalTop: 245, goalBottom: 375 };
export const TUNE = {
  step: 1 / 60, radius: 14, acceleration: 650, walk: 142, sprint: 208,
  feintSpeed: 270, feintDuration: .24, feintCooldown: 3.2, feintRadius: 132,
  staminaDrain: 30, staminaRecovery: 19, passSpeed: 430, shotSpeed: 570,
  decisionInterval: .14, possessionGrace: .65,
};
export const LEVELS = [
  { name: 'Learn the Decoy', brief: 'Run beyond the marker, then pull wide. Give No. 9 a clear route to goal.', seconds: 38, defenders: 2, speed: 91, discipline: .28, clearance: 35, keeperSpeed: 134, keeperReaction: .32, par: 18 },
  { name: 'Break the Mark', brief: 'Sell a central run, then feint out wide. This defence recovers quickly.', seconds: 32, defenders: 3, speed: 105, discipline: .48, clearance: 39, keeperSpeed: 151, keeperReaction: .28, par: 16 },
  { name: 'The Final Run', brief: 'Draw the screen defender away and change direction before the cover arrives.', seconds: 27, defenders: 3, speed: 115, discipline: .62, clearance: 42, keeperSpeed: 165, keeperReaction: .24, par: 14 },
] as const;
export const POINTS = { drawn: 80, lane: 120, feint: 80, assist: 180, goal: 300 };

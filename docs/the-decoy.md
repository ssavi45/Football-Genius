# The Decoy

Playable at `/games/the-decoy` after `npm run dev`. A dependency-free Canvas 2D engine uses a deterministic 60 Hz simulation, interpolated rendering, cached stadium artwork, and a 10 Hz React HUD. Original procedural kits, turf, nets and synthesized sound require no external assets. Game UI uses the shared FootyGen shell.

## Play

You are blue No.10. Run into a threatening position near the central screen, then pull wide. No.8 waits for an open lane to No.9; the forward shoots and the goalkeeper reacts. WASD/arrows move, Shift sprints, direction + Space feints, P/Escape pauses, R retries. Click the pitch to focus keyboard controls. The pointer joystick and separate Sprint/Feint controls support multi-touch. Fullscreen is available where the browser supports it. Focus loss pauses and clears inputs.

Three selectable levels and randomized practice setups are available. Retry preserves the seed; a new practice setup changes it. Results save best score/stars on this device only. No arbitrary account XP, Supabase writes or leaderboard entries are generated.

## Architecture

- `src/lib/decoy/config.ts`: levels and tuning.
- `simulation.ts`, `math.ts`, `types.ts`: fixed-step movement, stamina, feint, possession, swept ball collisions, state transitions, seeded scenarios, one-time scoring.
- `ai.ts`: utility-based threat assessment, commitment/hysteresis, marking and cover, pass clearance, interception, goalkeeper prediction and pressure-sensitive shot placement.
- `render.ts`: cached pitch, animated vector footballers, interpolation, tactical lanes and effects.
- `runtime.ts`: RAF/accumulator, keyboard input, resizing, focus/visibility lifecycle.
- `audio.ts`: gesture-unlocked synthesized effects respecting the site mute preference.
- `progress.ts`: bounded device-local best scores, separate from authoritative progression.
- `src/components/decoy/DecoyGame.tsx`, `decoy.css`: HUD, overlays, joystick, tutorial, challenge selector and responsive layout.
- `scripts/decoy/art.cjs`: regenerates original SVG/WebP discovery art.

Defenders have distinct responsibilities: No.4 tracks threats, No.5 screens the pass and switches to a threatening decoy using a difficulty-dependent threshold, No.6 provides cover. A commitment timer prevents twitchy switching. Feints disrupt nearby defenders already tracking the player, not all defenders. All actors steer and separate physically. AI passes require sustained clearance; the ball can subsequently be intercepted. Shots use seeded, pressure-dependent scatter at the time/location of the chance. A successful run never directly awards a goal.

Tactical points: drawn defender 80, clear lane 120, effective feint 80, completed chance after a decoy 180, goal 300, time bonus 4/second. Each event scores once per attempt. Stars require a goal; higher ratings also require a real decoy/lane and a par-time finish.

## Verification

`npm run test:decoy` exercises all three campaign wins and idle losses, natural saves/misses/interceptions, determinism across frame schedules, stamina/cooldowns, paused state, collision tunneling, boundary/tackle outcomes, repeated-award protection, complete/reset and 60 practice runs. `node scripts/decoy/tune.cjs` samples additional routes/seeds for tuning.

This is a short attacking-scenario arcade game, not a full football match. A turnover, save or missed shot ends the attack. No online opponents, global ranking, licensed audio or player likenesses are used. Device-local scores are intentionally untrusted. Canvas gameplay is visual; the surrounding HUD and controls are labelled, but screen-reader-only gameplay is not supported.

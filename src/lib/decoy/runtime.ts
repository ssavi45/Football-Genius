import { TUNE } from './config';
import { DecoySimulation } from './simulation';
import { makePitch, render } from './render';
import { DecoyAudio } from './audio';
import type { Controls, Snapshot } from './types';

/** One owner of the RAF, fixed clock, listeners and audio lifecycle. */
export class DecoyRuntime {
  sim = new DecoySimulation(); audio = new DecoyAudio();
  touch: Controls = { x: 0, y: 0, sprint: false, feint: false };
  private keys = new Set<string>(); private frame = 0; private last = 0; private accumulator = 0; private hudClock = 0; private eventId = 0;
  private pitch: HTMLCanvasElement; private ctx: CanvasRenderingContext2D; private resize: ResizeObserver;
  private dirty = true; private renderedPhase = '';
  private reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  constructor(private canvas: HTMLCanvasElement, private update: (s: Snapshot) => void) {
    const ctx = canvas.getContext('2d', { alpha: false }); if (!ctx) throw new Error('This browser does not support Canvas 2D.'); this.ctx = ctx;
    this.pitch = makePitch();
    this.resize = new ResizeObserver(() => this.fit()); this.resize.observe(canvas); this.fit();
    canvas.addEventListener('keydown', this.down); canvas.addEventListener('keyup', this.up);
    canvas.addEventListener('blur', this.canvasBlur); window.addEventListener('blur', this.blur); document.addEventListener('visibilitychange', this.visibility);
    this.update(this.sim.snapshot()); this.frame = requestAnimationFrame(this.tick);
  }
  private fit() { const rect = this.canvas.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2); this.canvas.width = Math.round(rect.width * dpr); this.canvas.height = Math.round(rect.width * .62 * dpr); this.dirty = true; }
  private down = (e: KeyboardEvent) => {
    if (!['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ShiftLeft', 'ShiftRight', 'Space', 'KeyP', 'Escape', 'KeyR'].includes(e.code)) return;
    e.preventDefault(); this.audio.unlock();
    if (e.repeat) return;
    if (e.code === 'KeyP' || e.code === 'Escape') { this.togglePause(); return; }
    if (e.code === 'KeyR') { this.restart(); return; }
    this.keys.add(e.code); if (e.code === 'Space') this.touch.feint = true;
  };
  private up = (e: KeyboardEvent) => { this.keys.delete(e.code); };
  clear() { this.keys.clear(); this.touch = { x: 0, y: 0, sprint: false, feint: false }; }
  private canvasBlur = (event: FocusEvent) => {
    this.clear();
    // Toolbar interactions stay in the game; leaving the arena pauses it.
    if (event.relatedTarget && event.relatedTarget instanceof Node && this.canvas.parentElement?.parentElement?.contains(event.relatedTarget)) return;
    this.blur();
  };
  private blur = () => { this.clear(); this.sim.pause(); this.update(this.sim.snapshot()); };
  private visibility = () => { if (document.hidden) this.blur(); };
  focus() { this.canvas.focus({ preventScroll: true }); }
  start() { this.audio.unlock(); this.sim.start(); this.focus(); this.update(this.sim.snapshot()); }
  togglePause() { this.clear(); if (this.sim.phase === 'paused') { this.sim.resume(); this.focus(); } else this.sim.pause(); this.update(this.sim.snapshot()); }
  restart(level = this.sim.level, seed = this.sim.seed, practice = this.sim.practice) {
    this.clear(); this.sim = new DecoySimulation(level, seed, practice); this.eventId = 0; this.accumulator = 0; this.dirty = true; this.start();
  }
  choose(level: number, practice: boolean) { this.clear(); this.sim = new DecoySimulation(level, practice ? (Date.now() >>> 0) : 42, practice); this.eventId = 0; this.dirty = true; this.update(this.sim.snapshot()); }
  private tick = (now: number) => {
    const dt = this.last ? Math.min((now - this.last) / 1000, .1) : 0; this.last = now; this.accumulator += dt;
    const key = (...keys: string[]) => keys.some(k => this.keys.has(k)) ? 1 : 0;
    while (this.accumulator >= TUNE.step) {
      this.sim.step({ x: this.touch.x || key('KeyD', 'ArrowRight') - key('KeyA', 'ArrowLeft'), y: this.touch.y || key('KeyS', 'ArrowDown') - key('KeyW', 'ArrowUp'), sprint: this.touch.sprint || !!key('ShiftLeft', 'ShiftRight'), feint: this.touch.feint });
      this.touch.feint = false; this.accumulator -= TUNE.step;
    }
    for (const event of this.sim.events) if (event.id > this.eventId) { this.audio.play(event.type); this.eventId = event.id; }
    const changed = this.renderedPhase !== this.sim.phase;
    if (this.dirty || changed || this.sim.phase === 'playing') {
      render(this.ctx, this.pitch, this.sim, this.sim.phase === 'playing' ? this.accumulator / TUNE.step : 1, this.reduced);
      this.dirty = false; this.renderedPhase = this.sim.phase;
    }
    this.hudClock += dt;
    if (changed || (this.hudClock >= .1 && (this.sim.phase === 'playing' || this.sim.phase === 'countdown'))) { this.update(this.sim.snapshot()); this.hudClock = 0; }
    this.frame = requestAnimationFrame(this.tick);
  };
  dispose() {
    cancelAnimationFrame(this.frame); this.resize.disconnect(); this.audio.dispose(); this.clear();
    this.canvas.removeEventListener('keydown', this.down); this.canvas.removeEventListener('keyup', this.up); this.canvas.removeEventListener('blur', this.canvasBlur);
    window.removeEventListener('blur', this.blur); document.removeEventListener('visibilitychange', this.visibility);
  }
}

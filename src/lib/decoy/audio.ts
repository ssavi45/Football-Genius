import type { GameEvent } from './types';

/** Original synthesized effects. Never starts an AudioContext before a gesture. */
export class DecoyAudio {
  private context: AudioContext | null = null;
  enabled = true;
  unlock() {
    try {
      if (!this.context) this.context = new AudioContext();
      if (this.context.state === 'suspended') void this.context.resume().catch(() => {});
    } catch { /* Silent gameplay remains available. */ }
  }
  play(type: GameEvent['type']) {
    if (!this.enabled || !this.context || this.context.state !== 'running') return;
    try { if (localStorage.getItem('footygen_sound_enabled') === 'false') return; } catch { /* Private browsing. */ }
    const ctx = this.context;
    const notes = type === 'goal' ? [523, 659, 784, 1046] : type === 'failure' ? [220, 165] : type === 'whistle' ? [1800, 2100] : type === 'shot' ? [130] : type === 'pass' ? [210] : [640, 800];
    notes.forEach((frequency, i) => {
      const osc = ctx.createOscillator(), gain = ctx.createGain(), start = ctx.currentTime + i * .09;
      osc.type = type === 'pass' || type === 'shot' ? 'triangle' : 'sine'; osc.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(.0001, start); gain.gain.exponentialRampToValueAtTime(.045, start + .012); gain.gain.exponentialRampToValueAtTime(.0001, start + .18);
      osc.connect(gain); gain.connect(ctx.destination); osc.start(start); osc.stop(start + .2);
      osc.onended = () => { osc.disconnect(); gain.disconnect(); };
    });
  }
  dispose() { if (this.context) void this.context.close().catch(() => {}); this.context = null; }
}

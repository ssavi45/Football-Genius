'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ArrowRight, Bot, Globe, LockKeyhole, Users, Copy, Check, LoaderCircle, Settings, Info } from 'lucide-react';
import type { ScoutOptions, ScoutRoom, ScoutView } from '@/lib/scouts-duel/types';

const MODES = [
  { mode: 'ai' as const, Icon: Bot, image: 'ai', title: 'Duel the AI', copy: 'An instant match against a tactical scout.', action: 'Play vs AI' },
  { mode: 'online' as const, Icon: Globe, image: 'online', title: 'Online match', copy: 'Find another scout and test your deduction.', action: 'Find a match' },
  { mode: 'custom' as const, Icon: Users, image: 'friend', title: 'Challenge a friend', copy: 'Create a private room with a shareable code.', action: 'Create room' },
];

interface LobbyProps {
  busy: boolean;
  available: boolean;
  onStart: (mode: ScoutRoom['mode'], options: ScoutOptions) => void;
  onJoin: (code: string) => void;
  waiting: ScoutView | null;
  onCancel: () => void;
}

export default function ScoutsDuelLobby({ busy, available, onStart, onJoin, waiting, onCancel }: LobbyProps) {
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState<ScoutOptions>({ difficulty: 'tactician', assistance: false, hardcore: false, turnSeconds: 45 });

  if (waiting) return (
    <section className="scout-panel scout-waiting">
      <span className="scout-lobby-emblem"><Users size={35} /></span>
      <h2>{waiting.mode === 'online' ? 'Finding your opponent' : 'Your room is ready'}</h2>
      <p>{waiting.mode === 'online' ? 'Keep this page open while another scout joins.' : 'Send this six-character code to your friend.'}</p>
      {waiting.mode === 'custom' && <button className="scout-room-code" onClick={async () => {
        try { await navigator.clipboard.writeText(waiting.code); setCopied(true); }
        catch { setCopied(false); }
      }}>{waiting.code}{copied ? <Check size={20} /> : <Copy size={20} />}</button>}
      <p className="scout-waiting-note"><LoaderCircle className="scout-spinner" size={17} />Waiting for another scout…</p>
      <button className="scout-secondary" onClick={onCancel} disabled={busy}>Cancel search</button>
    </section>
  );

  return (
    <div className="scout-lobby">
      <div className="scout-mode-grid">
        {MODES.map(({ mode, Icon, image, title, copy, action }) => (
          <section className={`scout-panel scout-mode scout-mode-${mode}`} key={mode}>
            <div className="scout-mode-art" aria-hidden="true">
              <Image src={`/img/scouts-duel/${image}.webp`} alt="" fill sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw" />
              <span className="scout-mode-icon"><Icon size={34} strokeWidth={2.2} /></span>
            </div>
            <div className="scout-mode-copy">
              <h2>{title}</h2>
              <p>{copy}</p>
              <button className="scout-primary" disabled={busy || !available} onClick={() => onStart(mode, options)}>
                {busy ? 'Please wait…' : action}<ArrowRight size={20} />
              </button>
            </div>
          </section>
        ))}
      </div>

      <div className="scout-lobby-bottom">
        <section className="scout-panel scout-match-settings">
          <div className="scout-lobby-section-heading">
            <span className="scout-settings-icon"><Settings size={26} /></span>
            <div><h2>Match settings</h2><p>Customize your Scout’s Duel experience.</p></div>
          </div>
          <div className="scout-settings-row">
            <label>AI difficulty
              <select value={options.difficulty} onChange={e => setOptions({ ...options, difficulty: e.target.value as ScoutOptions['difficulty'] })}>
                <option value="rookie">Rookie</option><option value="tactician">Tactician</option><option value="world-class">World Class</option>
              </select>
            </label>
            <label>Private room timer
              <select value={options.turnSeconds} onChange={e => setOptions({ ...options, turnSeconds: Number(e.target.value) as 45 | 60 })}>
                <option value={45}>45 seconds</option><option value={60}>60 seconds</option>
              </select>
            </label>
          </div>
          <div className="scout-rule-settings">
            <label className="scout-checkbox"><input type="checkbox" checked={options.assistance} onChange={e => setOptions({ ...options, assistance: e.target.checked })} />Auto-assist: rule out cards after each answer <Info size={15} aria-hidden="true" /></label>

          </div>
        </section>

        <section className="scout-panel scout-join">
          <div className="scout-lobby-section-heading">
            <span className="scout-settings-icon"><LockKeyhole size={26} /></span>
            <div><h2>Have a room code?</h2><p>Join a friend’s Scout’s Duel match.</p></div>
          </div>
          <form onSubmit={e => { e.preventDefault(); onJoin(code); }}>
            <label className="sr-only" htmlFor="scout-room-code">Six-character room code</label>
            <input id="scout-room-code" value={code} onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z2-9]/g, '').slice(0, 6))} placeholder="ABC234" maxLength={6} autoComplete="off" spellCheck={false} />
            <button className="scout-primary" disabled={busy || !available || code.length !== 6}>Join room<ArrowRight size={20} /></button>
          </form>
        </section>
      </div>
    </div>
  );
}

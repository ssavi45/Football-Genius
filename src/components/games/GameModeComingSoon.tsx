import type { CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Clock3, Gamepad2, MessageSquareQuote, Shuffle } from 'lucide-react';
import './GameModeComingSoon.css';

const MODES = {
  'tunnel-talk': { title: 'Tunnel Talk', art: '/img/game-modes/tunnel-talk.webp', icon: MessageSquareQuote, color: '#075bff', wash: '#eaf3ff' },
  'pixel-pitch': { title: 'Pixel Pitch', art: '/img/game-modes/pixel-pitch.webp', icon: Gamepad2, color: '#008bc7', wash: '#e5f8ff' },
  scramble: { title: 'Bootroom Scramble', art: '/img/game-modes/scramble.webp', icon: Shuffle, color: '#e98a00', wash: '#fff3df' },
};

export default function GameModeComingSoon({ mode }: { mode: keyof typeof MODES }) {
  const { title, art, icon: Icon, color, wash } = MODES[mode];

  return (
    <section className="mode-coming-soon" aria-labelledby="coming-soon-title" style={{ '--coming-accent': color, '--coming-wash': wash } as CSSProperties}>
      <div className="coming-soon-art" aria-hidden="true">
        <Image src={art} alt="" fill priority sizes="(max-width: 700px) 100vw, 65vw" />
      </div>
      <div className="coming-soon-content">
        <div className="coming-soon-emblem" aria-hidden="true">
          <Icon strokeWidth={1.7} />
          <span><Clock3 size={20} /></span>
        </div>
        <p className="coming-soon-mode">{title}</p>
        <h1 id="coming-soon-title">Coming <span>soon.</span></h1>
        <p className="coming-soon-description">Your next football challenge is on its way.</p>
        <Link href="/game-modes" className="coming-soon-back"><ArrowLeft size={18} />Explore game modes</Link>
      </div>
    </section>
  );
}

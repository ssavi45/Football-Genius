'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Grid2X2, Users, ChartNoAxesColumnIncreasing, Trophy, Check } from 'lucide-react';
import { sound } from '@/lib/utils/sound';

export default function LandingHero() {
  const [selected, setSelected] = useState('B');
  const options = ['AC Milan', 'Manchester United', 'Real Madrid', 'Inter Milan'];
  return (
    <section className="landing-hero" aria-labelledby="hero-title">
      <div className="hero-stadium" aria-hidden="true" />
      <div className="hero-art" aria-hidden="true">
        <Image src="/img/hero/football_trio_hero.jpg" alt="" fill priority sizes="(max-width: 700px) 100vw, 65vw" />
      </div>
      <div className="landing-container hero-content">
        <div className="hero-kicker"><Trophy size={15} /><span>TEST YOUR FOOTBALL IQ</span></div>
        <h1 id="hero-title">Think You Know<br />Football? <span>Prove It.</span></h1>
        <p className="hero-description">From iconic moments to obscure trivia, challenge yourself<br className="desktop-break" /> across multiple game modes and climb the global leaderboard.</p>
        <div className="hero-actions">
          <Link href="/games/scoreline" className="hero-primary" onClick={() => sound.playClick()} onMouseEnter={() => sound.playHover()}>Start Playing <ArrowRight size={19} /></Link>
          <Link href="/game-modes" className="hero-secondary" onClick={() => sound.playClick()}><Grid2X2 size={23} />Explore Game Modes<ArrowRight size={18} /></Link>
        </div>
        <div className="hero-stats">
          <div><span className="stat-icon blue"><Users /></span><span><strong>50K+</strong><small>Players Worldwide</small></span></div>
          <div><span className="stat-icon green"><ChartNoAxesColumnIncreasing /></span><span><strong>1000+</strong><small>Trivia Questions</small></span></div>
          <div><span className="stat-icon gold"><Trophy /></span><span><strong>Global</strong><small>Leaderboard</small></span></div>
        </div>
      </div>
      <svg className="hero-crown" viewBox="0 0 90 85" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 68 16 15 31 48 52 8 48 51 77 27 60 72 Q37 63 12 68"/><circle cx="16" cy="15" r="2.5"/><circle cx="52" cy="8" r="2.5"/><circle cx="77" cy="27" r="2.5"/></svg>
      <svg className="hero-tactics" viewBox="0 0 80 100" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true"><path d="m47 10 15 16m0-16L47 26M18 34l14 16m0-16L18 50m34 4 10 2-2 12-11-2z"/><circle cx="24" cy="80" r="8"/></svg>
      <div className="trivia-preview" aria-label="Try a football trivia question">
        <span className="trivia-badge">TRIVIA</span>
        <div className="trivia-question"><Image src="/img/players/ronaldo.jpg" width={70} height={70} alt="Cristiano Ronaldo" /><p>Which club did this player join in 2003?</p></div>
        <div className="trivia-options">{options.map((label, index) => {
          const id = String.fromCharCode(65 + index);
          return <button key={id} aria-pressed={selected === id} className={selected === id ? (id === 'B' ? 'correct' : 'incorrect') : ''} onClick={() => { setSelected(id); sound.playClick(); }}><span className="option-letter">{id}</span>{label}{selected === id && id === 'B' && <span className="answer-check"><Check size={16} /></span>}</button>;
        })}</div>
        <div className="trivia-progress"><span><i /></span><small>2/5</small></div>
        <span className="sr-only" aria-live="polite">{selected === 'B' ? 'Correct! Cristiano Ronaldo joined Manchester United in 2003.' : 'Not quite. Try another club.'}</span>
      </div>
      <div className="hero-note" aria-hidden="true"><svg viewBox="0 0 50 60" fill="none" stroke="currentColor" strokeWidth="2"><path d="M42 48Q12 40 13 9m-7 10 7-10 7 9" /></svg><span>More<br />than just<br />a game.</span></div>
      <svg className="hero-wave" viewBox="0 0 1536 130" preserveAspectRatio="none" aria-hidden="true"><path d="M0 43C350 55 660 123 1000 120S1270 52 1536 10V130H0Z" fill="#f9fcff" /></svg>
    </section>
  );
}

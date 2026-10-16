'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, BookOpen, ChevronRight, Crown, Flame, Gift, Target } from 'lucide-react';
import { isLeaderboardEntries, type LeaderboardEntry } from '@/lib/higher-lower/leaderboard';

interface Props { score: number; best: number; gameOver: boolean; }
const PREVIEW: LeaderboardEntry[] = [
  { name: 'CruyffTactician', avatar: '/img/players/cruyff.jpg', xp: 3840 },
  { name: 'BernabeuKing', avatar: '/img/players/zidane.jpg', xp: 3420 },
  { name: 'CampNouMaestro', avatar: '/img/players/messi.jpg', xp: 3180 },
  { name: 'KloppHeavyMetal', avatar: '/img/players/salah.jpg', xp: 2890 },
  { name: 'CalcioStrategist', avatar: '/img/players/maldini.jpg', xp: 2640 },
];

export default function HigherLowerWidgets({ score, best, gameOver }: Props) {
  const [entries, setEntries] = useState(PREVIEW);
  const [preview, setPreview] = useState(true);
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    void (async () => {
      const response = await fetch('/api/higher-lower/leaderboard', { signal: controller.signal, cache: 'no-store' });
      if (!response.ok) return;
      const payload: unknown = await response.json();
      const data = payload && typeof payload === 'object' && 'entries' in payload ? payload.entries : null;
      if (active && isLeaderboardEntries(data) && data.length > 0) {
        setEntries(data);
        setPreview(false);
      }
    })().catch(() => { /* Keep the explicitly labelled community preview available offline. */ });
    return () => { active = false; controller.abort(); };
  }, []);
  const milestone = Math.floor(score / 5) * 5 + 5;
  const accuracy = score || gameOver ? `${Math.round(score / (score + (gameOver ? 1 : 0)) * 100)}%` : '—';
  return <aside className="hl-widgets" aria-label="Game information">
    <section className="hl-progress hl-widget">
      <div className="hl-widget-title"><h2>Game Progress</h2><strong className="hl-round-count">{score + 1} / <span className="hl-infinity">∞</span></strong></div>
      <div className="hl-progress-dots" aria-label={`Round ${score + 1}`}>{Array.from({ length: 10 }, (_, i) => <span key={i} className={i <= score % 10 ? 'filled' : ''} />)}</div>
      <div className="hl-stats-grid">
        <div className="hl-stat hl-stat-green"><span className="hl-stat-icon"><Flame /></span><div><p>Current Streak</p><strong>{score}</strong></div></div>
        <div className="hl-stat hl-stat-gold"><span className="hl-stat-icon"><Crown /></span><div><p>Personal Best</p><strong>{best}</strong></div></div>
        <div className="hl-stat hl-stat-purple"><span className="hl-xp-gem">XP</span><div><p>XP Earned This Run</p><strong>+{score * 15} XP</strong></div></div>
        <div className="hl-stat hl-stat-blue"><span className="hl-stat-icon"><Gift /></span><div><p>Next Milestone</p><strong className="hl-milestone-count">{milestone} picks</strong><div className="hl-milestone"><span><i style={{ width: `${score % 5 / 5 * 100}%` }} /></span><small>{score % 5} / 5</small></div></div></div>
        <div className="hl-stat hl-stat-wide"><div><span className="hl-stat-icon hl-target"><Target /></span><div><p>Total Correct Picks</p><strong>{score}</strong></div></div><div><span className="hl-stat-icon"><Target /></span><div><p>Accuracy</p><strong>{accuracy}</strong></div></div></div>
      </div>
    </section>
    <section className="hl-leaderboard hl-widget">
      <div className="hl-widget-title"><h2>Leaderboard {preview && <small>Preview</small>}</h2><Link href="/leaderboard">View All<ArrowRight size={15} /></Link></div>
      <ol>{entries.map((entry, i) => <li key={entry.name}><span className={`hl-rank hl-rank-${i + 1}`}>{i + 1}</span><Image src={entry.avatar} alt="" width={28} height={28} /><span>{entry.name}</span><strong>{entry.xp.toLocaleString('en-US')} XP</strong></li>)}</ol>
    </section>
    <section className="hl-howto hl-widget">
      <div className="hl-widget-title"><h2><span><BookOpen size={23} /></span>How to Play</h2><ChevronRight size={23} /></div>
      <ol>{['Pick the higher value. Both start hidden.', 'Each card stays for a maximum of two rounds.', 'Build your streak with correct picks. Ties count!', 'Earn 15 XP per pick and beat your personal best.'].map((item, i) => <li key={item}><span>{i + 1}</span><p>{item}</p></li>)}</ol>
    </section>
  </aside>;
}

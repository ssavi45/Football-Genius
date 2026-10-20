'use client';

import Link from 'next/link';
import { AlertCircle, ArrowRight, BookOpen, ChevronRight, Crown, Flame, Gift, RefreshCw, Target, Trophy } from 'lucide-react';
import AccountAvatar from '@/components/account/AccountAvatar';
import { useModeLeaderboard } from '@/lib/account/useModeLeaderboard';

interface Props { score: number; best: number; gameOver: boolean; }

export default function HigherLowerWidgets({ score, best, gameOver }: Props) {
  const { entries, loading, error, retry } = useModeLeaderboard('higher-lower', 5);
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
    <section className="hl-leaderboard hl-widget" aria-labelledby="hl-leaderboard-heading">
      <div className="hl-widget-title"><h2 id="hl-leaderboard-heading">Global Leaderboard <small>Standings</small></h2><Link href="/leaderboard">View All<ArrowRight size={15} /></Link></div>
      {loading ? (
        <div className="hl-leaderboard-loading" aria-label="Loading standings" aria-busy="true">
          {[1, 2, 3, 4, 5].map(rank => (
            <div key={rank} className="hl-leaderboard-skeleton">
              <span className={`hl-rank hl-rank-${rank}`}>{rank}</span>
              <span className="hl-skeleton-avatar" />
              <span className="hl-skeleton-name" />
              <span className="hl-skeleton-score" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="hl-leaderboard-error" role="alert">
          <span className="hl-leaderboard-error-icon"><AlertCircle size={20} /></span>
          <p>Rankings unavailable</p>
          <button type="button" onClick={retry} className="hl-retry-button">
            <RefreshCw size={13} /> Try again
          </button>
        </div>
      ) : entries.length === 0 ? (
        <div className="hl-leaderboard-empty" role="status">
          <span className="hl-leaderboard-empty-icon"><Trophy size={22} /></span>
          <h3>No rankings yet</h3>
          <p>Build your streak to claim the #1 spot.</p>
        </div>
      ) : (
        <ol>
          {entries.map(entry => (
            <li key={entry.userId || entry.rank}>
              <span className={`hl-rank hl-rank-${entry.rank}`}>{entry.rank}</span>
              <AccountAvatar name={entry.name} image={entry.avatar} className="hl-player-avatar" />
              <span>{entry.name}</span>
              <strong>{entry.score} pts</strong>
            </li>
          ))}
        </ol>
      )}
    </section>
    <section className="hl-howto hl-widget">
      <div className="hl-widget-title"><h2><span><BookOpen size={23} /></span>How to Play</h2><ChevronRight size={23} /></div>
      <ol>{['Pick the higher value. Both start hidden.', 'Each card stays for a maximum of two rounds.', 'Build your streak with correct picks. Ties count!', 'Earn 15 XP per pick and beat your personal best.'].map((item, i) => <li key={item}><span>{i + 1}</span><p>{item}</p></li>)}</ol>
    </section>
  </aside>;
}
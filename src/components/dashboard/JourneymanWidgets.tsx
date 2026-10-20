'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AlertCircle, ArrowRight, BarChart3, BookOpen, ChevronRight, Eye, GitBranch, RefreshCw, Star, Target, Trophy, UserRound } from 'lucide-react';
import AccountAvatar from '@/components/account/AccountAvatar';
import { useModeLeaderboard } from '@/lib/account/useModeLeaderboard';
import { formatJourneyPoints, journeyRevealLimit, journeySkipsLeft, potentialPoints, type JourneyPlayer, type JourneyState } from '@/lib/journeyman';

function JourneymanLeaderboardSection() {
  const { entries, loading, error, retry } = useModeLeaderboard('journeyman', 5);

  return (
    <section className="journey-widget journey-leaderboard" aria-labelledby="journey-leaderboard-heading">
      <div className="journey-widget-heading">
        <h2 id="journey-leaderboard-heading"><Trophy /><span>Global Leaderboard<small>Standings</small></span></h2>
        <Link href="/leaderboard">View All<ArrowRight size={16} /></Link>
      </div>

      {loading ? (
        <div className="journey-leaderboard-loading" aria-label="Loading standings" aria-busy="true">
          {[1, 2, 3, 4, 5].map(rank => (
            <div key={rank} className="journey-leaderboard-skeleton">
              <span className={`journey-rank journey-rank-${rank}`}>{rank}</span>
              <span className="journey-skeleton-avatar" />
              <span className="journey-skeleton-name" />
              <span className="journey-skeleton-score" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="journey-leaderboard-error" role="alert">
          <span className="journey-leaderboard-error-icon"><AlertCircle size={20} /></span>
          <p>Rankings unavailable</p>
          <button type="button" onClick={retry} className="journey-retry-button">
            <RefreshCw size={13} /> Try again
          </button>
        </div>
      ) : entries.length === 0 ? (
        <div className="journey-leaderboard-empty" role="status">
          <span className="journey-leaderboard-empty-icon"><Trophy size={22} /></span>
          <h3>No rankings yet</h3>
          <p>Complete today&apos;s journey to claim the #1 spot.</p>
        </div>
      ) : (
        <ol>
          {entries.map(entry => (
            <li key={entry.userId || entry.rank}>
              <span className={`journey-rank journey-rank-${entry.rank}`}>{entry.rank}</span>
              <AccountAvatar name={entry.name} image={entry.avatar} className="journey-player-avatar" />
              <span>{entry.name}</span>
              <strong>{entry.score} pts</strong>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
const instructions = [
  'Follow the clubs. You have two guesses.',
  'Reveal clubs for clues; each reveal costs points.',
  '3 skips swap players. No skips after a reveal.',
  'Correct answers earn up to 10 pts + 80 XP.',
];

export default function JourneymanWidgets({ game, player, score, correct }: { game: JourneyState; player: JourneyPlayer; score: number; correct: number }) {
  const [howToOpen, setHowToOpen] = useState(true);
  const ended = game.outcome !== 'playing' || game.complete;
  const revealLimit = journeyRevealLimit(player.clubs.length);
  const uncovered = ended ? player.clubs.length : Math.min(player.clubs.length, game.reveals.length + 2);
  const revealsUsed = game.complete ? game.results.reduce((total, result) => total + result.reveals, 0) : game.reveals.length;
  const stats = [
    { label: 'Question', value: `${game.question + 1}/10`, icon: Target }, { label: 'Round Score', value: `${formatJourneyPoints(score)} pts`, icon: Star },
    { label: 'Potential', value: `${ended ? 0 : formatJourneyPoints(potentialPoints(player.clubs.length, game.reveals))} pts`, icon: Trophy }, { label: 'Guesses Left', value: ended ? 0 : 2 - game.attempts, icon: Eye },
  ];
  return <aside className="journey-widgets" aria-label="Game information">
    <section className="journey-widget journey-progress"><div className="journey-widget-heading"><h2><BarChart3 />Game Progress</h2><strong>{game.complete ? 'Round complete' : `Round ${game.question + 1} of 10`}</strong></div>
      <div className="journey-progress-track" aria-label={`${game.complete ? 10 : game.question + 1} of 10 questions`}>{Array.from({ length: 10 }, (_, i) => <span key={i} className={i < game.results.length ? game.results[i].outcome : i === game.question ? 'is-active' : ''} />)}</div>
      <div className="journey-progress-stats">{stats.map(({ label, value, icon: Icon }) => <div key={label}><Icon /><p>{label}</p><strong>{value}</strong></div>)}</div>
    </section>
    <section className="journey-widget journey-round"><div className="journey-widget-heading"><h2><UserRound fill="currentColor" />Your Round</h2><small>{journeySkipsLeft(game)}/3 skips left</small></div><dl>
      <div><dt><Target />Correct guesses</dt><dd>{correct}</dd></div><div><dt><Eye />Reveals used</dt><dd>{revealsUsed}{!game.complete && `/${revealLimit}`}</dd></div><div><dt><GitBranch />{game.complete ? 'Journeys completed' : 'Clubs uncovered'}</dt><dd>{game.complete ? '10/10' : `${uncovered}/${player.clubs.length}`}</dd></div><div><dt><Star />Round score</dt><dd>{formatJourneyPoints(score)} pts</dd></div>
    </dl></section>
    <JourneymanLeaderboardSection />
    <section className="journey-widget journey-howto"><button type="button" className="journey-widget-heading" onClick={() => setHowToOpen(open => !open)} aria-expanded={howToOpen} aria-controls="journey-instructions"><h2><span className="journey-howto-icon"><BookOpen size={23} /></span>How to Play</h2><ChevronRight className={howToOpen ? 'is-open' : ''} size={21} /></button>{howToOpen && <ol id="journey-instructions">{instructions.map((text, i) => <li key={text}><span>{i + 1}</span><p>{text}</p></li>)}</ol>}</section>
  </aside>;
}

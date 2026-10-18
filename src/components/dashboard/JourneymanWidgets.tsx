'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BarChart3, BookOpen, ChevronRight, Eye, GitBranch, Star, Target, Trophy, UserRound } from 'lucide-react';
import { formatJourneyPoints, journeyRevealLimit, journeySkipsLeft, potentialPoints, type JourneyPlayer, type JourneyState } from '@/lib/journeyman';

const community = [
  { name: 'FootyKing', avatar: 'messi', points: 96 }, { name: 'TacticalPro', avatar: 'zidane', points: 92 },
  { name: 'GoalAtlas', avatar: 'salah', points: 88 }, { name: 'MidfieldMind', avatar: 'bellingham', points: 84 }, { name: 'JerseyHunter', avatar: 'cruyff', points: 82 },
];
const instructions = [
  ['Read the career timeline', 'First and last clubs are visible. The rest are hidden.'],
  ['Guess the player', 'Type a footballer’s name and submit your guess.'],
  ['Clues and skips', '9 reveals max. 3 skips per round; no skipping after a reveal.'],
  ['Score points', 'Half-point clue costs. Full reveal: 2 pts. Correct: +80 XP.'],
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
    <section className="journey-widget journey-leaderboard"><div className="journey-widget-heading"><h2><Trophy /><span>Global Leaderboard<small>Preview</small></span></h2><Link href="/leaderboard">View All<ArrowRight size={16} /></Link></div><ol>{community.map((entry, i) => <li key={entry.name}><span className={`journey-rank journey-rank-${i + 1}`}>{i + 1}</span><Image src={`/img/players/${entry.avatar}.jpg`} width={28} height={28} alt="" /><span>{entry.name}</span><strong>{entry.points} pts</strong></li>)}</ol></section>
    <section className="journey-widget journey-howto"><button className="journey-widget-heading" onClick={() => setHowToOpen(open => !open)} aria-expanded={howToOpen} aria-controls="journey-instructions"><h2><BookOpen fill="currentColor" />How to Play</h2><ChevronRight className={howToOpen ? 'is-open' : ''} size={21} /></button>{howToOpen && <ol id="journey-instructions">{instructions.map(([title, text], i) => <li key={title}><span>{i + 1}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol>}</section>
  </aside>;
}

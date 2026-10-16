'use client';

import React from 'react';
import Link from 'next/link';
import {
  FileText,
  Star,
  Trophy,
  Target,
  ArrowRight,
  BookOpen,
  ChevronRight,
} from 'lucide-react';

interface RightPanelWidgetsProps {
  currentQuestion?: number;
  totalQuestions?: number;
  roundScore?: number;
  potentialPoints?: number;
  skipsLeft?: number;
  progress?: ('pending' | 'correct' | 'incorrect' | 'skipped')[];
  complete?: boolean;
}

export default function RightPanelWidgets({
  currentQuestion = 1,
  totalQuestions = 10,
  roundScore = 0,
  potentialPoints = 10,
  skipsLeft = 3,
  progress = [],
  complete = false,
}: RightPanelWidgetsProps) {
  const stats = [
    { label: 'Question', value: `${currentQuestion} / ${totalQuestions}`, icon: FileText, tone: 'blue' },
    { label: 'Round Score', value: `${roundScore} pts`, icon: Star, tone: 'gold' },
    { label: 'Potential', value: `${potentialPoints} pts`, icon: Trophy, tone: 'gold' },
    { label: 'Skips Left', value: skipsLeft, icon: Target, tone: 'rose' },
  ];
  const instructions = ['Ten matches. An exact score earns 10 points.', 'Hints cost 1, 2 and 4 points, added together.', 'Three skips per round. Skipped matches earn 0.', 'Include extra time, but not penalty shoot-outs.'];
  return <aside className="scoreline-widgets" aria-label="Game information">
    <section className="scoreline-progress"><div className="widget-heading"><h2>Game Progress</h2><strong>{currentQuestion} / {totalQuestions}</strong></div><div className="progress-steps" aria-label={`Question ${currentQuestion} of ${totalQuestions}`}>{Array.from({length: totalQuestions}, (_, index) => <span key={index} className={progress[index] && progress[index] !== "pending" ? progress[index] : !complete && index === currentQuestion - 1 ? "filled" : ""} />)}</div><div className="progress-stat-grid">{stats.map(({label,value,icon: Icon,tone}) => <div className={`progress-stat stat-${tone}`} key={label}><span><Icon /></span><div><p>{label}</p><strong>{value}</strong></div></div>)}</div></section>
    <section className="scoreline-round-stats"><div className="widget-heading"><h2>Your Round</h2><span>{progress.filter(p=>p!=='pending').length} / 10 played</span></div><dl><div><dt>Exact predictions</dt><dd>{progress.filter(p=>p==='correct').length}</dd></div><div><dt>Incorrect predictions</dt><dd>{progress.filter(p=>p==='incorrect').length}</dd></div><div><dt>Matches skipped</dt><dd>{progress.filter(p=>p==='skipped').length}</dd></div><div><dt>Round score</dt><dd>{roundScore} / 100</dd></div></dl><Link href="/leaderboard">Global Leaderboard<ArrowRight size={17} /></Link></section>
    <section className="scoreline-instructions" id="how-to-play"><div className="widget-heading"><h2><span><BookOpen size={23} /></span>How to Play</h2><ChevronRight size={25} /></div><ol>{instructions.map((instruction,index) => <li key={instruction}><span>{index + 1}</span>{instruction}</li>)}</ol></section>
  </aside>;
}

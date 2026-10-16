import Link from 'next/link';
import { ArrowRight, ArrowUpRight, RotateCcw, Trophy } from 'lucide-react';
import type { RoundView } from '@/lib/scoreline/types';

interface Props {
  round: RoundView;
  busy: boolean;
  onRestart: () => void;
}

export default function ScorelineRoundSummary({ round, busy, onRestart }: Props) {
  const correct = round.review.filter(answer => answer.points > 0).length;
  const skipped = round.review.filter(answer => answer.skipped).length;

  return <section className="scoreline-summary" aria-labelledby="round-complete-title">
    <div className="round-summary-hero">
      <div className="round-summary-heading">
        <span className="summary-trophy"><Trophy size={30} /></span>
        <div><p>FULL TIME · ROUND COMPLETE</p><h1 id="round-complete-title">{round.score === 100 ? 'A perfect ten.' : 'That’s the final whistle.'}</h1></div>
        <div className="summary-score"><strong>{round.score}</strong><span>/ 100 points</span></div>
      </div>
      <p className="summary-recap">{correct} exact predictions · {skipped} {skipped === 1 ? 'skip' : 'skips'} used · {round.score} XP earned</p>
      <div className="summary-actions">
        <button className="prediction-submit" onClick={onRestart} disabled={busy}><RotateCcw size={18} />Play a New Round</button>
        <Link href="/game-modes">Explore Game Modes<ArrowRight size={16} /></Link>
      </div>
    </div>
    <div className="round-review-heading"><h2>Your match review</h2><span>{round.review.length} matches</span></div>
    <ol className="round-review-list">
      {round.review.map((answer, index) => {
        const result = answer.skipped ? 'skipped' : answer.points > 0 ? 'correct' : 'incorrect';
        return <li className={`round-review-pill review-${result}`} key={answer.matchId}>
          <div className="review-pill-header">
            <span className={`review-result ${result}`} aria-label={`Match ${index + 1}, ${result}`}>{index + 1}</span>
            <div className="review-outcome"><strong>{answer.points}<span>pts</span></strong><a href={answer.sources[0]} target="_blank" rel="noreferrer" aria-label={`Match record for ${answer.homeTeam.name} versus ${answer.awayTeam.name}`}><ArrowUpRight size={16} /></a></div>
          </div>
          <div className="review-copy">
            <h3><span>{answer.homeTeam.name}</span> <strong>{answer.score.home}–{answer.score.away}</strong> <span>{answer.awayTeam.name}</span></h3>
            <p><span>{answer.competition} · {answer.date.slice(0, 4)}</span><span>{answer.skipped ? 'Skipped' : `Pick: ${answer.home}–${answer.away}`} · {answer.hints.length} {answer.hints.length === 1 ? 'hint' : 'hints'}</span></p>
          </div>
        </li>;
      })}
    </ol>
  </section>;
}

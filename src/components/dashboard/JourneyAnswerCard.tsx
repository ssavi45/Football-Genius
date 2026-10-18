import Image from 'next/image';
import { ArrowRight, Check, Star, X, Zap } from 'lucide-react';
import { formatJourneyPoints, type JourneyPlayer } from '@/lib/journeyman';

export default function JourneyAnswerCard({ player, correct, points, lastQuestion, onNext }: {
  player: JourneyPlayer; correct: boolean; points: number; lastQuestion: boolean; onNext: () => void;
}) {
  return <div className={`journey-answer ${correct ? 'is-correct' : 'is-incorrect'}`} role="status">
    <div className={`journey-answer-portrait ${player.cutout ? 'is-cutout' : ''}`}>
      {player.portrait && <Image src={player.portrait} alt={player.name} fill sizes="(max-width: 640px) 84px, 112px" />}
    </div>
    <div className="journey-answer-details">
      <span className="journey-answer-status">{correct ? <Check size={14} strokeWidth={3} /> : <X size={14} strokeWidth={3} />}{correct ? 'Correct' : 'Incorrect guess'}</span>
      <h3>{!correct && <span className="journey-answer-caption">The player was</span>}{player.name}</h3>
      <div className="journey-answer-nation">{player.nationalityFlag && <Image src={player.nationalityFlag} width={27} height={18} alt={`${player.nationality} flag`} />}<span>{player.nationality}</span></div>
      {correct && <div className="journey-answer-rewards"><span><Star size={14} />+{formatJourneyPoints(points)} points</span><span><Zap size={14} />+80 XP</span></div>}
    </div>
    <button className="journey-primary" onClick={onNext}>{lastQuestion ? 'View Results' : 'Next Player'}<ArrowRight size={18} /></button>
  </div>;
}

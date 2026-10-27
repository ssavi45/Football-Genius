'use client';

import Link from 'next/link';
import { Trophy, Grid2X2, Swords, Crown, ArrowRight, Globe2, UserRound, Goal, Footprints } from 'lucide-react';
import { sound } from '@/lib/utils/sound';

const modes = [
  { id: 'the-decoy', title: 'The Decoy', description: 'Win without touching the ball. Draw defenders away and create the opening for your teammates.', xp: 'Play Now', icon: Footprints, art: Goal, color: 'green' },
  { id: 'scoreline', title: 'Scoreline Hero', description: 'Relive iconic matches and predict the full-time score using tactical clues and match stats.', xp: '+150 XP', icon: Trophy, art: Goal, color: 'blue' },
  { id: 'matrix', title: 'Football Matrix', description: 'Fill the 9-cell grid with players who meet both row and column criteria. Test your encyclopedic knowledge.', xp: '+100 XP', icon: Grid2X2, art: Grid2X2, color: 'gold' },
  { id: 'scouts-duel', title: "Scout’s Duel", description: 'Challenge a friend or the AI in a custom lobby. Guess the mystery player before your opponent.', xp: '+200 XP', icon: Swords, art: UserRound, color: 'rose' },
  { id: 'journeyman', title: 'The Journeyman', description: 'Identify the globe-trotting star from their transfer history and badges. A true test for football historians.', xp: '+80 XP', icon: Crown, art: Globe2, color: 'green' },
];

export default function GameModesShowcase() {
  return <section id="game-modes" className="landing-modes landing-container" aria-labelledby="modes-title">
    <div className="modes-heading"><div><p className="section-eyebrow">GAME MODES</p><h2 id="modes-title">Play Your Way</h2><p className="modes-description">Different challenges. One goal. Know Football. Prove It.</p></div><Link className="all-modes-link" href="/game-modes">View All Modes<ArrowRight size={16} /></Link></div>
    <div className="mode-cards">{modes.map(({ id, title, description, xp, icon: Icon, art: Art, color }) => <Link key={id} href={`/games/${id}`} className={`mode-card ${color}`} onClick={() => sound.playClick()} onMouseEnter={() => sound.playHover()}><Icon className="mode-icon" strokeWidth={2.8} /><div className="mode-copy"><h3>{title}</h3><p>{description}</p></div><Art className="mode-watermark" aria-hidden="true" /><span className="mode-xp">{xp}</span><span className="mode-arrow"><ArrowRight size={22} /></span></Link>)}</div>
  </section>;
}

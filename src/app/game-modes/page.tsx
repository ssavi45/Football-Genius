'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Gamepad2,
  UserRound,
  UsersRound,
  Puzzle,
  Zap,
  ImageIcon,
  Trophy,
  Grid2X2,
  Swords,
  Crown,
  BarChart3,
  Quote,
  ArrowRight,
} from 'lucide-react';
import { sound } from '@/lib/utils/sound';
import '../landing.css';
import './modes.css';

interface FilterOption {
  name: string;
  icon: React.ElementType;
}

const FILTERS: FilterOption[] = [
  { name: 'All Modes', icon: Grid2X2 },
  { name: 'Solo', icon: UserRound },
  { name: 'Versus', icon: UsersRound },
  { name: 'Puzzle', icon: Puzzle },
  { name: 'Fast Play', icon: Zap },
  { name: 'Visual', icon: ImageIcon },
];

const GAME_MODES = [
  {
    id: 'scoreline',
    title: 'Scoreline Hero',
    description: 'Relive iconic matches and predict the full-time score using tactical clues and match stats.',
    xp: '+150 XP',
    tags: ['Solo'],
    route: '/games/scoreline',
    art: '/img/game-modes/scoreline.webp',
    icon: Trophy,
    color: '#0B63FF',
    washGradient: 'from-[#F2F8FF] via-white to-white',
    borderColor: 'border-blue-100',
    xpColor: 'text-[#0B63FF]',
    arrowColor: 'text-[#0B63FF]',
  },
  {
    id: 'matrix',
    title: 'Football Matrix',
    description: 'Fill the 9-cell grid with players who meet both row and column criteria. Test your encyclopedic knowledge.',
    xp: '+100 XP',
    tags: ['Solo', 'Puzzle'],
    route: '/games/matrix',
    art: '/img/game-modes/matrix.webp',
    icon: Grid2X2,
    color: '#FF9700',
    washGradient: 'from-[#FFFBEF] via-white to-white',
    borderColor: 'border-amber-100',
    xpColor: 'text-[#D97706]',
    arrowColor: 'text-[#D97706]',
  },
  {
    id: 'scouts-duel',
    title: "Scout's Duel",
    description: 'Challenge a friend or the AI in a custom lobby. Guess the mystery player before your opponent.',
    xp: '+200 XP',
    tags: ['Versus'],
    route: '/games/scouts-duel',
    art: '/img/game-modes/duel.webp',
    icon: Swords,
    color: '#FF2449',
    washGradient: 'from-[#FFF1F5] via-white to-white',
    borderColor: 'border-rose-100',
    xpColor: 'text-[#E11D48]',
    arrowColor: 'text-[#E11D48]',
  },
  {
    id: 'journeyman',
    title: 'The Journeyman',
    description: 'Identify the globe-trotting star from their transfer history and badges. A true test for football historians.',
    xp: '+80 XP',
    tags: ['Solo', 'Puzzle'],
    route: '/games/journeyman',
    art: '/img/game-modes/journeyman.webp',
    icon: Crown,
    color: '#00BD68',
    washGradient: 'from-[#EFFCF7] via-white to-white',
    borderColor: 'border-emerald-100',
    xpColor: 'text-[#059669]',
    arrowColor: 'text-[#059669]',
  },
  {
    id: 'higher-lower',
    title: 'Higher or Lower',
    description: "Guess if the next player's market value is higher or lower. Test your transfer market knowledge.",
    xp: '+120 XP',
    tags: ['Solo', 'Fast Play'],
    route: '/games/higher-lower',
    art: '/img/game-modes/higher-lower.webp',
    icon: BarChart3,
    color: '#8B20FF',
    washGradient: 'from-[#F7F2FF] via-white to-white',
    borderColor: 'border-purple-100',
    xpColor: 'text-[#7C3AED]',
    arrowColor: 'text-[#7C3AED]',
  },
  {
    id: 'tunnel-talk',
    title: 'Tunnel Talk',
    description: 'Can you identify the player, manager or moment from the iconic quote? Famous lines, bigger stories.',
    xp: '+100 XP',
    tags: ['Solo'],
    route: '/games/tunnel-talk',
    art: '/img/game-modes/tunnel-talk.webp',
    icon: Quote,
    color: '#0B63FF',
    washGradient: 'from-[#F0F5FF] via-white to-white',
    borderColor: 'border-blue-100',
    xpColor: 'text-[#0B63FF]',
    arrowColor: 'text-[#0B63FF]',
  },
  {
    id: 'scramble',
    title: 'Bootroom Scramble',
    description: 'Unscramble the letters to reveal players, clubs, stadiums and more. A fast-paced test of your knowledge.',
    xp: '+90 XP',
    tags: ['Fast Play', 'Solo', 'Puzzle'],
    route: '/games/scramble',
    art: '/img/game-modes/scramble.webp',
    iconLetter: 'A',
    color: '#FF8C15',
    washGradient: 'from-[#FFF7ED] via-white to-white',
    borderColor: 'border-orange-100',
    xpColor: 'text-[#EA580C]',
    arrowColor: 'text-[#EA580C]',
  },
  {
    id: 'pixel-pitch',
    title: 'Pixel Pitch',
    description: 'A retro-style trivia challenge. Identify players, clubs and moments from pixelated images.',
    xp: '+110 XP',
    tags: ['Solo', 'Visual'],
    route: '/games/pixel-pitch',
    art: '/img/game-modes/pixel-pitch.webp',
    icon: Gamepad2,
    color: '#0060FF',
    washGradient: 'from-[#EFFBFF] via-white to-white',
    borderColor: 'border-sky-100',
    xpColor: 'text-[#0284C7]',
    arrowColor: 'text-[#0284C7]',
  },
];

export default function GameModesPage() {
  const [selectedFilter, setSelectedFilter] = useState('All Modes');
  const [query, setQuery] = useState('');
  const filteredModes = GAME_MODES.filter(mode =>
    (selectedFilter === 'All Modes' || mode.tags.includes(selectedFilter)) &&
    `${mode.title} ${mode.description}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="game-modes-page">
      <div className="modes-page-art" aria-hidden="true">
        <Image src="/img/game-modes/hero.webp" alt="" fill priority sizes="(max-width: 700px) 100vw, 55vw" />
      </div>
      <svg className="modes-crown" viewBox="0 0 90 85" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 68 16 15 31 48 52 8 48 51 77 27 60 72 Q37 63 12 68"/><circle cx="16" cy="15" r="2"/><circle cx="52" cy="8" r="2"/><circle cx="77" cy="27" r="2"/></svg>
      <div className="modes-page-container">
        <section className="modes-intro" aria-labelledby="game-modes-title">
          <span className="modes-kicker"><Gamepad2 size={19} />8 UNIQUE WAYS TO PLAY</span>
          <h1 id="game-modes-title">Choose Your <span>Game Mode</span></h1>
          <p>Different challenges. Different skills. The same beautiful game.</p>
        </section>
        <div className="modes-filter-row">
          <div className="modes-filters" role="group" aria-label="Filter game modes">
            {FILTERS.map(({ name, icon: Icon }) => <button key={name} type="button" aria-pressed={selectedFilter === name} className={selectedFilter === name ? 'is-selected' : ''} onClick={() => { sound.playClick(); setSelectedFilter(name); }}><Icon size={21} /><span>{name}</span></button>)}
          </div>
          <span className="modes-result-count" aria-live="polite">{filteredModes.length} game {filteredModes.length === 1 ? 'mode' : 'modes'}</span>
        </div>
        <div id="mode-search" className="modes-search"><label htmlFor="game-mode-search">Find your game<input id="game-mode-search" type="search" placeholder="Search game modes" value={query} onChange={event => setQuery(event.target.value)} /></label></div>
        <section className="game-mode-grid" aria-label="Game modes">
          {filteredModes.map(mode => {
            const Icon = mode.icon;
            return <Link key={mode.id} href={mode.route} className={`game-mode-card mode-${mode.id}`} style={{ '--mode-color': mode.color } as React.CSSProperties} onMouseEnter={() => sound.playHover()} onClick={() => sound.playClick()}>
              <div className="game-mode-art"><Image src={mode.art} alt="" fill sizes="(max-width: 600px) 100vw, (max-width: 1100px) 50vw, 25vw" /></div>
              <span className="game-mode-icon" aria-hidden="true">{Icon ? <Icon size={34} strokeWidth={2.8} /> : <span>A</span>}</span>
              <div className="game-mode-copy"><h2>{mode.title}</h2><p>{mode.description}</p></div>
              <span className="game-mode-reward">{mode.xp}</span>
              <span className="game-mode-arrow" aria-hidden="true"><ArrowRight size={24} /></span>
            </Link>;
          })}
        </section>
        {filteredModes.length === 0 && <div className="modes-empty"><p>No game modes found.</p><button onClick={() => { setQuery(''); setSelectedFilter('All Modes'); }}>Show all modes</button></div>}
      </div>
    </div>
  );
}

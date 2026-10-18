'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { ArrowRight, ChevronRight, Eye, FastForward, GitBranch, Info, ListOrdered, RotateCcw, Search, Send, Shield, Shuffle, Target, Trophy, UserRound } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import searchDirectory from '@/data/journeyman-search-players.json';
import { advanceJourney, createJourneyDeck, createJourneyState, formatJourneyPoints, journeyCanSkip, journeyHiddenClubs, journeyLastClubLabel, journeyRevealCost, journeyRevealLimit, journeySearchOptions, journeySkipsLeft, potentialPoints, roundJourneyPoints, visibleClub, type JourneyAction, type JourneyPlayer } from '@/lib/journeyman';
import JourneymanWidgets from './JourneymanWidgets';
import JourneyAnswerCard from './JourneyAnswerCard';

export default function JourneymanGame({ players, initialDeck }: { players: JourneyPlayer[]; initialDeck: number[] }) {
  const { addXP, recordGameResult } = useAuth();
  const [game, setGame] = useState(() => createJourneyState(initialDeck));
  const [input, setInput] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [roundId, setRoundId] = useState(0);
  const [notice, setNotice] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const boardRef = useRef<HTMLElement>(null);
  const processed = useRef(new Set<string>());
  const player = players[game.deck[game.question]];
  const ended = game.outcome !== 'playing';
  const revealsLeft = journeyRevealLimit(player.clubs.length) - game.reveals.length;
  const hiddenLeft = journeyHiddenClubs(player.clubs.length, game.reveals).length;
  const potential = potentialPoints(player.clubs.length, game.reveals);
  const randomCost = journeyRevealCost(player.clubs.length, game.reveals, 'random');
  const nextCost = journeyRevealCost(player.clubs.length, game.reveals, 'next');
  const skipsLeft = journeySkipsLeft(game);
  const canSkip = journeyCanSkip(game);
  const skipReason = game.reveals.length > 0 ? 'You revealed a club. Guess this player before continuing.' : skipsLeft === 0 ? 'All three skips have been used this round.' : `Replace this question. ${skipsLeft} of 3 skips left this round`;
  const score = roundJourneyPoints(game.results.reduce((sum, r) => sum + r.points, 0) + (!game.complete && game.outcome === 'correct' ? roundJourneyPoints(potential) : 0));
  const correct = game.results.filter(r => r.outcome === 'correct').length + (!game.complete && game.outcome === 'correct' ? 1 : 0);
  const suggestions = useMemo(() => journeySearchOptions(input, searchDirectory.players), [input]);

  useEffect(() => {
    if (game.complete || player.clubs.length <= 5 || !window.matchMedia('(min-width: 1101px)').matches) return;
    const frame = requestAnimationFrame(() => {
      const board = boardRef.current;
      if (!board) return;
      const headerHeight = document.querySelector('header')?.getBoundingClientRect().height ?? 0;
      const top = window.scrollY + board.getBoundingClientRect().top - headerHeight - 8;
      window.scrollTo({ top: Math.max(0, top), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    });
    return () => cancelAnimationFrame(frame);
  }, [game.question, game.complete, roundId, player]);

  useEffect(() => {
    if (!ended || game.complete) return;
    const key = `${roundId}:${game.question}`;
    if (processed.current.has(key)) return;
    processed.current.add(key);
    const won = game.outcome === 'correct';
    if (won) {
      void addXP(80, 'The Journeyman Transfer Trail').catch(() => {});
      confetti({ particleCount: 65, spread: 65, origin: { y: .6 }, colors: ['#00b980', '#0966ff', '#ffd05a'], disableForReducedMotion: true });
    }
    void recordGameResult('journeyman', won, won ? 80 : 0).catch(() => {});
  }, [ended, game.complete, game.question, game.outcome, roundId, addXP, recordGameResult]);

  function act(action: JourneyAction) {
    if (action.type === 'guess') {
      const next = advanceJourney(game, action, players);
      if (next === game) return;
      setGame(next); setInput(''); setSearchOpen(false); setActiveSuggestion(-1);
      setNotice(next.outcome === 'playing' ? 'Incorrect guess. You have one attempt left.' : '');
      return;
    }
    if (action.type === 'reveal') {
      const next = advanceJourney(game, action, players);
      if (next === game) return;
      const reveal = next.reveals[next.reveals.length - 1];
      const label = reveal.method === 'final' ? 'Final hidden club revealed' : reveal.method === 'random' ? `Random club revealed at stop ${reveal.index + 1}` : 'Next club revealed';
      setGame(next); setNotice(`${label}. Potential score is now ${formatJourneyPoints(potentialPoints(player.clubs.length, next.reveals))} points.`);
    } else {
      const next = advanceJourney(game, action, players);
      if (next === game) return;
      setGame(next); setInput(''); setSearchOpen(false); setActiveSuggestion(-1);
      setNotice(action.type === 'skip' ? `Question replaced. ${journeySkipsLeft(next)} ${journeySkipsLeft(next) === 1 ? 'skip' : 'skips'} left this round.` : '');
    }
  }
  function restart() {
    setGame(createJourneyState(createJourneyDeck(players, Math.random, [...game.deck, ...game.skippedPlayers]))); setRoundId(id => id + 1); setInput(''); setSearchOpen(false); setActiveSuggestion(-1);
    setNotice('');
  }

  return <div className={`journey-dashboard ${!game.complete && player.clubs.length <= 5 ? 'journey-single-row' : ''}`}>
    <div className="journey-main">
      <section className="journey-hero">
        <Image className="journey-hero-art" src="/img/journeyman/travel-hero.webp" fill sizes="(max-width: 1100px) 100vw, 70vw" alt="" priority />
        <h1>The <span>Journeyman</span></h1>
        <p>Guess the footballer from their club history.</p>
        <div className="journey-hero-pills">
          <span><Target />Round {game.question + 1} of 10</span><span><Shield />{player.clubs.length} clubs</span>
          <span><Eye />{game.complete ? 0 : revealsLeft} reveals left</span><span><GitBranch />Career Timeline</span>
        </div>
      </section>

      <section ref={boardRef} className={`journey-board ${game.complete ? 'is-complete' : ''}`} aria-label="Career timeline game">
        {game.complete ? <div className="journey-complete">
          <span className="journey-complete-trophy"><Trophy size={40} /></span><p className="journey-kicker">FULL TIME · JOURNEY COMPLETE</p>
          <h2>You know your way around football.</h2><div className="journey-final-score">{formatJourneyPoints(score)}<span>/ 100 points</span></div>
          <p>{correct} correct {correct === 1 ? 'guess' : 'guesses'} · {correct * 80} XP earned</p>
          <button className="journey-primary" onClick={restart}><RotateCcw size={19} />Play a New Round</button>
          <div className="journey-review">{game.results.map((r, i) => <div key={i} className={`journey-review-${r.outcome}`}><span>{i + 1}</span><strong>{r.name}</strong><small>{r.outcome === 'correct' ? 'Correct' : 'Incorrect'}</small><b>{formatJourneyPoints(r.points)} pts</b></div>)}</div>
          <Link href="/game-modes">Explore Game Modes <ArrowRight size={16} /></Link>
        </div> : <>
          <div className="journey-board-heading"><div><p className="journey-kicker">CAREER TIMELINE</p><h2>First and last clubs are visible. The rest is up to you.</h2></div><span className="journey-handwritten">Different<br />clubs. Same legend?</span></div>
          <div className={`journey-timeline ${player.clubs.length > 5 ? 'journey-timeline-long' : ''} ${player.clubs.length === 6 ? 'journey-timeline-six' : ''}`} style={{ '--club-count': player.clubs.length === 6 ? 3 : Math.min(player.clubs.length, 5) } as CSSProperties}>
            {player.clubs.map((club, i) => {
              const visible = visibleClub(i, player.clubs.length, game.reveals, game.outcome);
              const bookend = i === 0 || i === player.clubs.length - 1;
              return <div key={`${club.label}-${i}`} className={`journey-club ${bookend ? 'is-bookend' : ''} ${visible ? 'is-visible' : 'is-hidden'}`}>
                <span className="journey-club-number">{i + 1}</span>
                <div className="journey-club-emblem">{visible ? club.logo ? <Image src={`/${club.logo}`} width={100} height={100} alt={`${club.label} crest`} /> : <span className="journey-club-wordmark" aria-label={`${club.label}; crest unavailable`}>{club.label}</span> : <span className="journey-hidden-shield"><Shield fill="currentColor" strokeWidth={1} /><b>?</b></span>}</div>
                <h3>{visible ? club.label : 'Hidden Club'}</h3>
                <span className={`journey-club-tag ${bookend ? 'is-green' : visible ? 'is-blue' : ''}`}>{i === 0 ? 'FIRST CLUB' : i === player.clubs.length - 1 ? journeyLastClubLabel(player) : visible ? 'REVEALED' : 'LOCKED'}</span>
                {i < player.clubs.length - 1 && <ArrowRight className="journey-club-arrow" aria-hidden="true" />}
              </div>;
            })}
          </div>

          <div className="journey-search-card">
            <svg className="journey-search-watermark" viewBox="0 0 160 160" fill="none" aria-hidden="true"><circle cx="80" cy="80" r="70" /><path d="m80 48 30 22-11 35H61L50 70Zm0 0V10m30 60 37-12m-48 47 23 32m-61-32-23 32M50 70 13 58M80 10l42 24 25 24-1 44-24 35-42 13-42-13-24-35-1-44 25-24Z" /></svg>
            {!ended && <label className="journey-search-label" htmlFor="journey-player-search"><span className="journey-search-icon"><Search /></span><span><strong className="journey-search-prompt">GUESS THE FOOTBALLER</strong></span></label>}
            {ended ? <JourneyAnswerCard player={player} correct={game.outcome === 'correct'} points={potential} lastQuestion={game.question === 9} onNext={() => act({ type: 'next' })} /> : <form onSubmit={e => { e.preventDefault(); act({ type: 'guess', name: activeSuggestion >= 0 && suggestions[activeSuggestion] ? suggestions[activeSuggestion].name : input }); }}>
              <div className="journey-guess-row"><div className="journey-search-wrap"><Search size={20} /><input ref={searchRef} id="journey-player-search" placeholder="Type a footballer’s name..." autoComplete="off" value={input} role="combobox" aria-autocomplete="list" aria-expanded={searchOpen && suggestions.length > 0} aria-controls="journey-suggestions" aria-activedescendant={activeSuggestion >= 0 ? `journey-suggestion-${activeSuggestion}` : undefined} onChange={e => { setInput(e.target.value); setSearchOpen(true); setActiveSuggestion(-1); }} onFocus={() => setSearchOpen(true)} onBlur={() => setSearchOpen(false)} onKeyDown={e => { if (e.key === 'Escape') setSearchOpen(false); if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); setSearchOpen(true); setActiveSuggestion(i => e.key === 'ArrowDown' ? Math.min(i + 1, suggestions.length - 1) : Math.max(i - 1, 0)); } }} />
                {searchOpen && suggestions.length > 0 && <ul className="journey-suggestions" id="journey-suggestions" role="listbox">{suggestions.map((p, i) => <li key={p.id} id={`journey-suggestion-${i}`} role="option" aria-selected={activeSuggestion === i} onMouseDown={e => { e.preventDefault(); setInput(p.name); setSearchOpen(false); setActiveSuggestion(-1); }}>
                  {p.nationalityFlag ? <Image className="journey-suggestion-flag" src={p.nationalityFlag} width={30} height={20} alt={`${p.nationality} flag`} /> : <UserRound className="journey-suggestion-person" size={18} />}
                  <span>{p.typed ? `Use “${p.name}”` : p.name}</span><ChevronRight size={15} />
                </li>)}</ul>}
              </div><button className="journey-primary" type="submit" disabled={!input.trim()}><Send size={23} fill="currentColor" />Submit Guess</button></div>
            </form>}
            {!ended && <div className={`journey-secondary-actions ${hiddenLeft <= 1 ? 'is-final' : ''}`}>
              {hiddenLeft <= 1 ? <button className="journey-secondary journey-reveal journey-reveal-final" disabled={!revealsLeft} onClick={() => act({ type: 'reveal', method: 'next' })}><Eye size={23} /><span>{revealsLeft ? `Reveal final club (-${formatJourneyPoints(nextCost)} ${nextCost === 1 ? 'point' : 'points'})` : hiddenLeft === 0 ? 'All clubs revealed' : 'Reveal limit reached'}</span></button> : <>
                <button className="journey-secondary journey-reveal journey-reveal-random" disabled={!revealsLeft} title="Reveal any random hidden stop" onClick={() => act({ type: 'reveal', method: 'random' })}><Shuffle size={23} /><span>{revealsLeft ? `Reveal random club (-${formatJourneyPoints(randomCost)} ${randomCost === 1 ? 'point' : 'points'})` : 'Reveal limit reached'}</span></button>
                <button className="journey-secondary journey-reveal journey-reveal-next" disabled={!revealsLeft} title="Reveal the earliest hidden stop in career order" onClick={() => act({ type: 'reveal', method: 'next' })}><ListOrdered size={23} /><span>{revealsLeft ? `Reveal next club (-${formatJourneyPoints(nextCost)} ${nextCost === 1 ? 'point' : 'points'})` : 'Reveal limit reached'}</span></button>
              </>}
              <button className="journey-secondary journey-skip" disabled={!canSkip} title={skipReason} aria-label={`Skip question (${skipsLeft} ${skipsLeft === 1 ? 'skip' : 'skips'} left). ${skipReason}`} onClick={() => act({ type: 'skip' })}><FastForward size={20} /><span>Skip ({skipsLeft})</span></button>
            </div>}
            {!ended && <div className={`journey-notice ${game.attempts > 0 ? 'is-warning' : ''}`} aria-live="polite"><span className="journey-notice-icon"><Info /></span><p>{notice || 'Follow the badges. Find the player.'}</p></div>}
          </div>
        </>}
      </section>
    </div>
    <JourneymanWidgets game={game} player={player} score={score} correct={correct} />
  </div>;
}

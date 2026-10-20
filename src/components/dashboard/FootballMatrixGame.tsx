'use client';

import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AlertCircle, ArrowRight, BarChart3, BookOpen, Check, ChevronRight, CircleCheck, FileText, Grid2X2, Info, Plus, Puzzle, RefreshCw, RotateCcw, Search, Share2, Sparkles, Star, Target, Trophy, X } from 'lucide-react';
import AccountAvatar from '@/components/account/AccountAvatar';
import { useModeLeaderboard } from '@/lib/account/useModeLeaderboard';
import { cellReview, searchPlayers, shareText } from '@/lib/matrix/engine';
import { useMatrixRound } from './useMatrixRound';
import type { Criterion, MatrixDifficulty, MatrixPlayer, MatrixPuzzle } from '@/lib/matrix/types';

const DIFFICULTIES: { id: MatrixDifficulty; label: string; description: string }[] = [
  { id: 'easy', label: 'Easy', description: 'Clubs × Nations' },
  { id: 'medium', label: 'Medium', description: 'Clubs × Stats & Trophies' },
  { id: 'hard', label: 'Hard', description: 'Stats & Trophies × Stats & Trophies' },
];

function Dialog({ children, titleId, onClose, className = '' }: { children: ReactNode; titleId: string; onClose: () => void; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const close = useRef(onClose); close.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    ref.current?.querySelector<HTMLElement>('[data-autofocus], input, button')?.focus();
    const keydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); close.current(); }
      if (e.key !== 'Tab') return;
      const elements = Array.from(ref.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input, a[href], [tabindex="0"]') || []);
      const first = elements[0], last = elements.at(-1);
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', keydown);
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', keydown);
      if (previous && !previous.matches(':disabled')) previous.focus();
      else document.querySelector<HTMLElement>('.matrix-cell:not(:disabled), .matrix-primary')?.focus(); };
  }, []);
  return <div className="matrix-dialog-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={titleId} className={`matrix-dialog ${className}`}>
      {children}<button type="button" onClick={onClose} className="matrix-dialog-close" aria-label="Close dialog"><X size={20} /></button>
    </div>
  </div>;
}

function CriterionBadge({ criterion }: { criterion: Criterion }) {
  if ((criterion.type !== 'club' && criterion.type !== 'nation') || !criterion.badgeUrl) return null;
  return <Image className={`matrix-criterion-badge${criterion.type === 'nation' ? ' is-national' : ''}`} src={criterion.badgeUrl} alt="" width={74} height={74} />;
}

function MatrixGridSkeleton() {
  return <>
    <div className="matrix-corner" aria-hidden="true" />
    {[0, 1, 2].map(col => <div key={col} className="matrix-column-header" aria-hidden="true"><span className="matrix-loading-label" /></div>)}
    {[0, 1, 2].map(row => <Fragment key={row}>
      <div className="matrix-row-header" aria-hidden="true"><span className="matrix-loading-label" /></div>
      {[0, 1, 2].map(col => <div key={col} className="matrix-cell matrix-loading-cell" aria-hidden="true" />)}
    </Fragment>)}
  </>;
}

function MatrixLeaderboardWidget() {
  const { entries, loading, error, retry } = useModeLeaderboard('matrix', 5);

  return (
    <section className="matrix-widget matrix-leaderboard" aria-labelledby="matrix-leaderboard-heading">
      <div className="matrix-widget-title">
        <h2 id="matrix-leaderboard-heading">Global Leaderboard <small>Standings</small></h2>
        <Link href="/leaderboard">View All <ArrowRight size={15} /></Link>
      </div>

      {loading ? (
        <div className="matrix-leaderboard-loading" aria-label="Loading standings" aria-busy="true">
          {[1, 2, 3, 4, 5].map(rank => (
            <div key={rank} className="matrix-leaderboard-skeleton">
              <span className={`matrix-rank matrix-rank-${rank}`}>{rank}</span>
              <span className="matrix-skeleton-avatar" />
              <span className="matrix-skeleton-name" />
              <span className="matrix-skeleton-score" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="matrix-leaderboard-error" role="alert">
          <span className="matrix-leaderboard-error-icon"><AlertCircle size={20} /></span>
          <p>Rankings unavailable</p>
          <button type="button" onClick={retry} className="matrix-retry-button">
            <RefreshCw size={13} /> Try again
          </button>
        </div>
      ) : entries.length === 0 ? (
        <div className="matrix-leaderboard-empty" role="status">
          <span className="matrix-leaderboard-empty-icon"><Trophy size={22} /></span>
          <h3>No rankings yet</h3>
          <p>Complete a matrix round to claim the #1 spot.</p>
        </div>
      ) : (
        <ol>
          {entries.map(entry => (
            <li key={entry.userId || entry.rank}>
              <span className={`matrix-rank matrix-rank-${entry.rank}`}>{entry.rank}</span>
              <AccountAvatar name={entry.name} image={entry.avatar} className="matrix-player-avatar" />
              <span>{entry.name}</span>
              <strong>{entry.score} XP</strong>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export default function FootballMatrixGame({ puzzle: initialPuzzle, players, catalog, datasetVersion }: { puzzle: MatrixPuzzle; players: MatrixPlayer[]; catalog: Criterion[]; datasetVersion: string }) {
  const { puzzle, state, view, ready, storageWarning, pendingRound, notice, edit, clear, submit, nextRound } = useMatrixRound(initialPuzzle, players, catalog, datasetVersion);
  const [selected, setSelected] = useState<number | null>(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [howOpen, setHowOpen] = useState(false);
  const [reviewCell, setReviewCell] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [shareFallback, setShareFallback] = useState('');
  const byId = useMemo(() => new Map(players.map(p => [p.id, p])), [players]);
  const results = useMemo(() => searchPlayers(players, debounced), [players, debounced]);
  const review = useMemo(() => reviewCell === null ? null : cellReview(state, puzzle, players, reviewCell), [state, puzzle, players, reviewCell]);
  useEffect(() => {
    setSearchOpen(false); setSummaryOpen(false); setReviewCell(null);
    setSelected(0); setQuery(''); setDebounced(''); setCopied(false); setShareFallback('');
  }, [puzzle.id]);
  useEffect(() => { if (state.submitted) setSearchOpen(false); }, [state.submitted]);
  useEffect(() => { const timer = setTimeout(() => setDebounced(query), 180); return () => clearTimeout(timer); }, [query]);
  function openCell(cell: number) {
    if (!ready || pendingRound) return;
    if (view.finished) { setReviewCell(cell); return; }
    setSelected(cell); setQuery(''); setDebounced(''); setSearchOpen(true);
  }
  function pick(player: MatrixPlayer) {
    if (selected !== null && edit(selected, player.id)) { setSearchOpen(false); setSelected(null); }
  }
  async function share() {
    if (!view.finished) return;
    const text = shareText(puzzle, view);
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2200); }
    catch { setShareFallback(text); }
  }
  const activeCriteria = selected === null ? null : [puzzle.rowCriteria[Math.floor(selected / 3)], puzzle.colCriteria[selected % 3]];
  const difficulty = ready ? puzzle.difficulty : initialPuzzle.difficulty;
  return <div className="matrix-dashboard" aria-busy={!ready || pendingRound}>
    <div className="matrix-main">
      <header className="matrix-hero">
        <Image className="matrix-hero-art" src="/img/matrix/puzzle-hero.webp" alt="" fill priority sizes="(max-width: 1100px) 100vw, 70vw" />
        <h1 className="matrix-title"><span className="sr-only">Football Matrix</span><Image src="/img/matrix/football-matrix-logo.webp" alt="" width={2070} height={760} sizes="(max-width:700px) 85vw,(max-width:1100px) 65vw,620px" priority /></h1>
        <p>Fill the grid with players who satisfy both row and column conditions.</p>
        <div className="matrix-hero-meta"><span><Puzzle />{ready ? `Round #${puzzle.number}` : 'Loading round…'}</span><i /><span className="matrix-grid-label"><Grid2X2 />3 × 3 Matrix</span><i />
          <div className="matrix-difficulty-control"><BarChart3 aria-hidden="true" /><nav className="matrix-difficulty-tabs" role="tablist" aria-label="Puzzle difficulty">
            {DIFFICULTIES.map(({ id, label, description }) => <Link key={id} href={`/games/matrix?difficulty=${id}`} scroll={false} role="tab" aria-selected={difficulty === id} aria-controls="matrix-board" id={`matrix-tab-${id}`} tabIndex={difficulty === id ? 0 : -1} title={description}
              onKeyDown={event => {
                const offset = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
                if (!offset && event.key !== 'Home' && event.key !== 'End') return;
                event.preventDefault();
                const index = DIFFICULTIES.findIndex(d => d.id === id);
                const next = event.key === 'Home' ? 0 : event.key === 'End' ? 2 : (index + offset + 3) % 3;
                const tab = document.getElementById(`matrix-tab-${DIFFICULTIES[next].id}`);
                tab?.focus(); tab?.click();
              }}>{label}</Link>)}
          </nav></div>
        </div>
      </header>

      <section className={`matrix-board matrix-board-${difficulty}`} id="matrix-board" role="tabpanel" aria-labelledby={`matrix-tab-${difficulty}`}>
        <div className="matrix-grid" role="group" aria-label={ready ? 'Three rows by three columns' : 'Loading your saved Matrix round'} aria-busy={!ready}>
          {ready ? <>
          <div className="matrix-corner" aria-hidden="true"><svg viewBox="0 0 160 105"><g fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 78C34 48 49 15 125 17m-12-9 12 9-13 7M89 96c-3-47 34-34 51-77" strokeDasharray="6 4" /><circle cx="28" cy="21" r="6" /><circle cx="73" cy="65" r="6" /><circle cx="146" cy="12" r="6" /><path d="m46 37 8 9m-9-1 10-7M5 97l37-30m-10 1 10-1-1 10" /></g></svg></div>
          {puzzle.colCriteria.map(criterion => <div className={`matrix-column-header matrix-criterion-${criterion.type}`} key={criterion.id}><CriterionBadge criterion={criterion} /><span>{criterion.label}</span></div>)}
          {puzzle.rowCriteria.map((criterion, row) => <Fragment key={criterion.id}>
            <div className={`matrix-row-header matrix-criterion-${criterion.type}`}><CriterionBadge criterion={criterion} /><span>{criterion.label}</span></div>
            {[0, 1, 2].map(col => {
              const cell = row * 3 + col;
              const player = view.cells[cell] ? byId.get(view.cells[cell]!) : null;
              const result = view.results[cell];
              return <button key={cell} type="button" className={`matrix-cell ${selected === cell && !view.finished ? 'is-selected' : ''} ${player ? 'is-filled' : ''} ${result ? `is-${result}` : ''}`}
                disabled={!ready || pendingRound}
                aria-label={`${criterion.label} × ${puzzle.colCriteria[col].label}: ${player ? player.name : 'Empty'}${view.finished ? `, ${result}, review criteria` : ', edit player'}`}
                onClick={() => openCell(cell)}>
                {player ? <><Image className="matrix-cell-photo" src={player.photoUrl} alt="" width={130} height={130} /><span className="matrix-cell-name">{player.name}</span>{result && <span className="matrix-cell-check">{result === 'correct' ? <Check size={13} /> : <X size={13} />}</span>}</> : view.finished ? <span className="matrix-cell-blank">No answer</span> : <span className="matrix-cell-plus"><Plus strokeWidth={1.8} /></span>}
              </button>;
            })}
          </Fragment>)}
          </> : <MatrixGridSkeleton />}
        </div>
        <div className="matrix-feedback" role="status" aria-live="polite"><Info size={15} /><span>{notice || (!ready ? 'Restoring your saved round…' : view.finished ? `${view.correct} correct · ${view.incorrect} incorrect · ${view.blank} blank. Click a cell to review its criteria.` : `${view.filled}/9 selected. You can edit answers or leave blanks. Results reveal on submission.`)}</span>{!ready&&notice&&<button type="button" onClick={()=>window.location.reload()}>Retry</button>}</div>
        <div className="matrix-board-actions">
          <button type="button" className="matrix-primary" disabled={!ready || pendingRound} onClick={() => view.finished ? void nextRound() : submit()}>{!ready || pendingRound ? 'Loading Round…' : view.finished ? 'Play Another Round' : 'Submit Grid'}<ArrowRight size={20} /></button>
          <button type="button" className="matrix-secondary" disabled={!ready || pendingRound} onClick={() => view.finished ? setSummaryOpen(true) : clear()}>{view.finished ? <FileText size={20} /> : <RotateCcw size={20} />}{view.finished ? 'View Results' : 'Clear Grid'}</button>
        </div>
        {storageWarning && <div className="matrix-notice" role="status">Your browser could not save progress. Keep this page open to preserve this round.</div>}
      </section>
    </div>

    <aside className="matrix-widgets" aria-label="Puzzle progress and information">
      <section className="matrix-widget matrix-progress"><div className="matrix-widget-title"><h2>Game Progress</h2><strong>{ready ? `${view.filled} / 9` : '— / 9'}</strong></div>
        <div className="matrix-progress-track" aria-label={!ready ? 'Loading saved progress' : view.finished ? 'Submitted grid results' : `${view.filled} of 9 cells selected. Results hidden.`}>{view.cells.map((id, index) => <span key={index} className={!ready ? '' : view.finished ? view.results[index] === 'correct' ? 'is-correct' : view.results[index] === 'incorrect' ? 'is-wrong' : '' : id ? 'is-current' : ''} />)}</div>
        <div className="matrix-progress-cards">
          <div className="matrix-stat blue"><span className="matrix-stat-icon"><FileText /></span><div><p>Round</p><strong>{ready ? `#${puzzle.number.toString().padStart(3, '0')}` : '—'}</strong></div></div>
          <div className="matrix-stat blue"><span className="matrix-stat-icon"><Grid2X2 /></span><div><p>Filled Cells</p><strong>{ready ? `${view.filled} / 9` : '— / 9'}</strong></div></div>
          <div className="matrix-stat gold"><span className="matrix-stat-icon"><Star /></span><div><p>XP Earned</p><strong>{ready ? `${view.xp} XP` : '— XP'}</strong></div></div>
          <div className="matrix-stat pink"><span className="matrix-stat-icon"><Target /></span><div><p>Grid Status</p><strong className="matrix-status-label">{!ready ? 'Loading' : view.finished ? 'Reviewed' : 'Draft'}</strong></div></div>
        </div>
      </section>
      <section className="matrix-widget matrix-puzzle-stats"><div className="matrix-widget-title"><h2>Your Round Stats</h2></div>
        <dl><div><dt>Correct answers</dt><dd>{view.finished ? `${view.correct} / 9` : '—'}</dd></div><div><dt>Incorrect answers</dt><dd>{view.incorrect ?? '—'}</dd></div><div><dt>Cell XP</dt><dd>{view.finished ? `${(view.correct ?? 0) * 25} / 225` : 'Revealed on submit'}</dd></div><div><dt>Perfect grid bonus</dt><dd className="matrix-bonus">+100 XP</dd></div></dl>
      </section>
      <MatrixLeaderboardWidget />
      <section className="matrix-widget matrix-howto"><button type="button" className="matrix-howto-heading" onClick={() => setHowOpen(true)}><span><i><BookOpen size={23} /></i>How to Play</span><ChevronRight size={22} /></button>
        <ol>{['Match both criteria. Use each player once.', 'Edit freely or leave unknown cells blank.', 'Submit the grid to reveal and review results.', 'Play unlimited rounds. Earn up to 325 XP.'].map((text, i) => <li key={text}><span>{i + 1}</span><p>{text}</p></li>)}</ol>
      </section>
    </aside>

    {ready && searchOpen && activeCriteria && <Dialog titleId="matrix-search-title" onClose={() => setSearchOpen(false)} className="matrix-search-dialog">
      <div className="matrix-dialog-eyebrow"><Search size={15} />FIND THE CONNECTION</div><h2 id="matrix-search-title">Who fits this square?</h2>
      <div className="matrix-search-criteria">{activeCriteria.map(c => <span key={c.id}><CriterionBadge criterion={c} />{c.label}</span>)}</div>
      <label htmlFor="matrix-player-search" className="sr-only">Player name</label><div className="matrix-search-field"><Search size={21} /><input id="matrix-player-search" type="search" data-autofocus autoComplete="off" placeholder="Search a player’s name…" value={query} onChange={e => setQuery(e.target.value)} /><kbd>ESC</kbd></div>
      <div className="matrix-search-meta"><span>{players.length} verified player identities</span><strong>Results hidden until submission</strong></div>
      <div className="matrix-search-results" aria-label="Player search results" aria-busy={query !== debounced}>
        {debounced.trim().length < 2 ? <div className="matrix-search-empty"><Search size={30} /><p>Find your football connection</p><span>Type at least two letters to search by name.</span></div> : results.length ? results.map(player => {
          const used = view.cells.some((id, cell) => cell !== selected && id === player.id);
          const current = selected !== null && view.cells[selected] === player.id;
          return <button type="button" key={player.id} className="matrix-search-result" disabled={used || current} onClick={() => pick(player)}><span className="matrix-search-avatar"><Image src={player.photoUrl} alt="" width={58} height={58} /></span><span><strong>{player.name}</strong><small>{player.nationality} <b>·</b> {player.club || 'Free agent'}</small></span><em>{used ? 'Used in another cell' : current ? 'Selected' : 'Select'}{!used && !current && <ArrowRight size={17} />}</em></button>;
        }) : <div className="matrix-search-empty"><Search size={28} /><p>No players found</p><span>Try a surname or a different spelling.</span></div>}
      </div><p className="matrix-search-note"><Info size={14} />Selections are editable. Submit the whole grid when you’re ready.</p>
      {selected !== null && view.cells[selected] && <button type="button" className="matrix-remove-answer" onClick={() => { if (edit(selected, null)) setSearchOpen(false); }}><X size={15} />Remove player from this cell</button>}
    </Dialog>}
    {ready && summaryOpen && <Dialog titleId="matrix-summary-title" onClose={() => setSummaryOpen(false)} className="matrix-summary-dialog">
      <span className={`matrix-summary-trophy ${view.won ? 'is-perfect' : ''}`}><Trophy size={36} /></span><div className="matrix-dialog-eyebrow">{puzzle.difficulty.toUpperCase()} · ROUND {puzzle.number} COMPLETE</div><h2 id="matrix-summary-title">{view.won ? 'A perfect connection.' : 'Your matrix, revealed.'}</h2><p>{view.won ? 'Nine squares. Nine brilliant answers.' : 'Review your connections, then try a fresh round.'}</p>
      <div className="matrix-summary-score">{view.correct}<span>/ 9</span></div><div className="matrix-share-board" aria-hidden="true">{view.results.map((result, i) => <span key={i} className={result === 'correct' ? 'filled' : result === 'incorrect' ? 'wrong' : ''}>{result === 'correct' ? <Check size={20} /> : result === 'incorrect' ? <X size={20} /> : null}</span>)}</div>
      <div className="matrix-summary-xp"><Sparkles size={20} /><strong>+{view.xp} XP</strong><span>{view.won ? 'Includes your 100 XP perfect grid bonus' : `${view.incorrect} incorrect · ${view.blank} blank`}</span></div>
      <button type="button" onClick={share} className="matrix-primary">{copied ? <Check size={19} /> : <Share2 size={19} />}{copied ? 'Copied to clipboard!' : 'Share Your Grid'}</button>
      {shareFallback && <label className="matrix-share-fallback">Copy your result<textarea readOnly value={shareFallback} onFocus={e => e.target.select()} /></label>}
      <button type="button" className="matrix-summary-board-link" disabled={pendingRound} onClick={() => void nextRound()}>{pendingRound ? 'Loading Round…' : 'Play Another Round'} <ArrowRight size={16} /></button><button type="button" className="matrix-summary-modes" onClick={() => setSummaryOpen(false)}>Review your board</button>
    </Dialog>}
    {ready && review && <Dialog titleId="matrix-review-title" onClose={() => setReviewCell(null)} className="matrix-review-dialog">
      <div className="matrix-dialog-eyebrow"><Info size={15} />ANSWER REVIEW</div><h2 id="matrix-review-title">{review.player ? review.player.name : 'No answer selected'}</h2>
      <p className="matrix-review-intro">{review.player ? review.criteria.every(c => c.matches) ? 'This player satisfies both conditions.' : review.criteria.every(c => !c.matches) ? 'This player does not satisfy either condition.' : 'This player satisfies only one of the two conditions.' : 'This square was left blank and earns no XP.'}</p>
      <div className="matrix-review-criteria">{review.criteria.map(({ criterion, axis, matches }) => <div key={criterion.id} className={matches === null ? 'blank' : matches ? 'passed' : 'failed'}>
        <span className="matrix-review-icon">{matches === null ? <Info size={21} /> : matches ? <CircleCheck size={21} /> : <X size={21} />}</span><div><small>{axis} criterion</small><strong>{criterion.label}</strong><span>{matches === null ? 'No answer' : matches ? 'Meets this criterion' : 'Does not meet this criterion'}</span></div>
      </div>)}</div>{review.explanation && <p className="matrix-review-explanation">{review.explanation}</p>}<button type="button" className="matrix-primary" onClick={() => setReviewCell(null)}>Back to Grid <ArrowRight size={18} /></button>
    </Dialog>}
    {howOpen && <Dialog titleId="matrix-how-title" onClose={() => setHowOpen(false)} className="matrix-rules-dialog"><span className="matrix-rules-icon"><BookOpen size={29} /></span><h2 id="matrix-how-title">Make all nine connections.</h2><p>Choose a square, then find a player who meets both its row and column conditions.</p><ol><li>Fill up to nine cells. Leave a square blank if you don’t know an answer.</li><li>Use each player once per round. You can replace or remove selections before submitting.</li><li>Submit Grid locks all answers and reveals the results together. Green means correct; red means incorrect.</li><li>Click any revealed cell to see whether the row, column, or both criteria were met.</li><li>Only senior competitive club appearances count, including loans. National teams require senior international appearances.</li><li>Earn 25 XP per correct cell and 100 extra XP for a perfect 9/9. Rewards are awarded on submission.</li></ol><p className="matrix-rules-refresh">Play as many rounds as you like. Each new grid has fresh, solvable combinations, and your current round is saved.</p><button type="button" className="matrix-primary" onClick={() => setHowOpen(false)}>Let’s Play <ArrowRight size={18} /></button></Dialog>}
  </div>;
}

'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { ArrowRight, Crown, Globe2, Layers3, Medal, RefreshCw, Search, ShieldCheck, Trophy, Users } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { ACCOUNT_MODES } from '@/lib/account/modes';
import type { RankingEntry } from '@/lib/account/leaderboard';
import type { GameModeId } from '@/lib/types/games';
import AccountAvatar from './AccountAvatar';
import ModeIcon from './ModeIcon';
import './account.css';

export default function LeaderboardPage() {
  const { profile, openAuthModal } = useAuth();
  const [section, setSection] = useState<'combined' | 'individual'>('combined');
  const [modeId, setModeId] = useState<GameModeId>('scoreline');
  const [entries, setEntries] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [refresh, setRefresh] = useState(0);
  const mode = ACCOUNT_MODES.find(item => item.id === modeId)!;
  const combined = section === 'combined';
  const rankingTitle = combined ? 'Combined ranking' : mode.title;
  const unit = combined ? 'XP' : 'pts';

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(''); setEntries([]); setQuery('');
    void (async () => {
      try {
        const response = await fetch(`/api/leaderboard?mode=${combined ? 'combined' : modeId}`, { signal: controller.signal, cache: 'no-store' });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Could not load rankings.');
        if (!controller.signal.aborted) setEntries(result.entries);
      } catch (cause) {
        if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Could not load rankings.');
      } finally { if (!controller.signal.aborted) setLoading(false); }
    })();
    return () => controller.abort();
  }, [combined, modeId, refresh]);

  const myEntry = profile.is_guest ? undefined : entries.find(entry => entry.userId === profile.id);
  const filtered = entries.filter(entry => entry.name.toLocaleLowerCase().includes(query.toLocaleLowerCase().trim()));

  return <div className="account-page leaderboard-page">
    <header className="account-hero leaderboard-hero">
      <div><span className="account-eyebrow"><Globe2 size={15} />THE GLOBAL STAGE</span><h1>Know the game.<br /><span>Climb the ranks.</span></h1><p>One football community. A place for every kind of genius.</p></div>
      <div className="leaderboard-trophy" aria-hidden="true"><i /><span><Trophy strokeWidth={1.3} /></span><b className="trophy-spark spark-one">+</b><b className="trophy-spark spark-two">+</b><div className="trophy-caption"><Crown size={15} />Football Genius</div></div>
    </header>

    <div className="account-section-switch" role="group" aria-label="Leaderboard section">
      <button type="button" aria-pressed={combined} onClick={() => setSection('combined')}><Layers3 size={18} /><span>Combined leaderboard</span></button>
      <button type="button" aria-pressed={!combined} onClick={() => setSection('individual')}><GameModeSymbol /><span>Individual game modes</span></button>
      <span className="account-all-time">All time</span>
    </div>

    {!combined && <div className="ranking-mode-picker" role="group" aria-label="Choose a game mode">{ACCOUNT_MODES.map(item => <button type="button" key={item.id} aria-pressed={modeId === item.id} style={{ '--mode-accent': item.color, '--mode-wash': item.wash } as CSSProperties} onClick={() => setModeId(item.id)}><ModeIcon mode={item.id} size={17} />{item.title}{item.comingSoon && <span>Soon</span>}</button>)}</div>}

    <div className="leaderboard-layout">
      <section className="account-panel ranking-panel" aria-labelledby="ranking-heading" aria-busy={loading}>
        <div className="account-panel-heading"><div><h2 id="ranking-heading"><Trophy size={21} />{rankingTitle}</h2><p>{combined ? 'Total XP earned across every game mode.' : 'Your best recorded score in this game mode.'}</p></div><button type="button" className="account-icon-button" aria-label="Refresh leaderboard" disabled={loading} onClick={() => setRefresh(value => value + 1)}><RefreshCw size={17} className={loading ? 'account-spinning' : ''} /></button></div>

        {!loading && !error && entries.length >= 3 && <div className="ranking-podium" aria-label="Top three players">{[entries[1], entries[0], entries[2]].map(entry => <article key={entry.userId} className={`podium-place podium-${entry.rank}`}><span className="podium-medal">{entry.rank === 1 ? <Crown size={19} /> : <Medal size={18} />}</span><AccountAvatar name={entry.name} image={entry.avatar} /><strong>{entry.name}</strong><span>{entry.score.toLocaleString()} <small>{unit}</small></span><b>#{entry.rank}</b></article>)}</div>}

        {!loading && !error && entries.length > 0 && <label className="ranking-search"><Search size={18} /><input type="search" aria-label="Search these rankings" placeholder="Find a player in these rankings..." value={query} onChange={event => setQuery(event.target.value)} /><span>Top {entries.length}</span></label>}
        <div aria-live="polite">
          {loading ? <div className="account-empty"><RefreshCw className="account-spinning" size={30} /><h3>Loading the standings</h3><p>Finding the latest rankings.</p></div> : error ? <div className="account-empty"><Globe2 size={34} /><h3>We couldn&apos;t load the rankings</h3><p>{error}</p><button type="button" className="account-secondary-button" onClick={() => setRefresh(value => value + 1)}>Try again</button></div> : entries.length === 0 ? <div className="account-empty"><span className="account-empty-medal"><Trophy size={38} /></span><h3>{!combined && mode.comingSoon ? 'This leaderboard is coming soon' : 'A new leaderboard starts here'}</h3><p>{!combined && mode.comingSoon ? `${mode.title} is warming up. Explore another mode while you wait.` : 'Rankings will appear when players have recorded results.'}</p><Link className="account-primary-button" href="/game-modes">Explore game modes<ArrowRight size={17} /></Link></div> : <div className="ranking-table-wrap"><table className="ranking-table"><thead><tr><th scope="col">Rank</th><th scope="col">Player</th><th scope="col">{combined ? 'Level' : 'Games'}</th><th scope="col">{combined ? 'Total XP' : 'Best score'}</th></tr></thead><tbody>{filtered.map(entry => <tr key={entry.userId} className={entry.userId === profile.id ? 'is-you' : ''}><td><span className={`ranking-number rank-${entry.rank}`}>{entry.rank}</span></td><td><div className="ranking-player"><AccountAvatar name={entry.name} image={entry.avatar} /><span>{entry.name}</span>{entry.userId === profile.id && <small>You</small>}</div></td><td>{combined ? `Level ${entry.level}` : entry.games}</td><td><strong>{entry.score.toLocaleString()}</strong><small>{unit}</small></td></tr>)}</tbody></table>{filtered.length === 0 && <div className="account-empty compact"><Search size={25} /><p>No players match &ldquo;{query}&rdquo;.</p></div>}</div>}
        </div>
      </section>

      <aside className="ranking-aside">
        <section className="account-panel your-standing"><span className="account-eyebrow"><ShieldCheck size={15} />YOUR STANDING</span><AccountAvatar name={profile.username} image={profile.avatar_url} /><h2>{profile.username}</h2><span className="account-level-pill">Level {profile.level}</span><div className="standing-numbers"><div><span>Rank</span><strong>{myEntry ? `#${myEntry.rank}` : '\u2014'}</strong></div><div><span>{combined ? 'Total XP' : 'Best score'}</span><strong>{combined ? profile.total_xp.toLocaleString() : myEntry?.score.toLocaleString() ?? '\u2014'}</strong></div></div><p>{profile.is_guest ? 'Sign in to take your place on the global leaderboard.' : myEntry ? 'Every challenge is a chance to climb.' : loading ? 'Finding your place in the rankings...' : error ? 'Your rank will return when the standings are available.' : 'You are outside these rankings. Keep playing to earn your place.'}</p>{profile.is_guest ? <button type="button" className="account-primary-button" onClick={openAuthModal}>Sign in to compete<ArrowRight size={17} /></button> : <Link className="account-primary-button" href="/profile#stats">View my stats<ArrowRight size={17} /></Link>}</section>
        <section className="account-panel ranking-explainer"><span className="account-card-icon"><Users size={22} /></span><h2>Every mode counts.</h2><p>The combined board ranks total XP. Individual boards rank the best recorded score for each game.</p><Link href="/game-modes">Find your next challenge<ArrowRight size={16} /></Link></section>
      </aside>
    </div>
  </div>;
}

function GameModeSymbol() { return <Medal size={18} aria-hidden="true" />; }

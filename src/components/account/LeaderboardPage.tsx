'use client';

import { useEffect, useId, useState, type CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, CalendarDays, Crown, Ellipsis, Gamepad2, Globe2, RefreshCw, Trophy, Users } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { ACCOUNT_MODES, accountMode } from '@/lib/account/modes';
import { rankingUnit, type RankingEntry } from '@/lib/account/leaderboard';
import { useModeLeaderboard } from '@/lib/account/useModeLeaderboard';
import type { GameModeId } from '@/lib/types/games';
import AccountAvatar from './AccountAvatar';
import ModeIcon from './ModeIcon';
import './account.css';
import './leaderboard.css';

function LaurelWreath() {
  const id = useId();
  return <svg className="lb-laurel" viewBox="0 0 200 130" fill="currentColor" aria-hidden="true">
    <g id={id}><path d="M67 119C28 105 17 71 32 31" fill="none" stroke="currentColor" strokeWidth="1.5" />{[0, 1, 2, 3, 4, 5, 6].map(index => <g key={index} transform={`translate(${29 + index * index * 0.7},${36 + index * 12}) rotate(${-28 + index * 11})`}><ellipse cx="-4" cy="-4" rx="3.5" ry="9" transform="rotate(-28)" /><ellipse cx="6" cy="1" rx="3.5" ry="8" transform="rotate(40)" /></g>)}</g>
    <use href={`#${id}`} transform="translate(200 0) scale(-1 1)" />
  </svg>;
}

function PodiumCrown() {
  return <svg className="lb-podium-crown" viewBox="0 0 48 40" aria-hidden="true"><defs><linearGradient id="lb-crown-gold" x2=".2" y2="1"><stop stopColor="#fff2ad" /><stop offset=".4" stopColor="#ffc72e" /><stop offset="1" stopColor="#b26b03" /></linearGradient></defs><path d="M6 11 15 23 24 5 33 23 42 11 36 33H12Z" fill="url(#lb-crown-gold)" stroke="#d79513" strokeWidth="1.2" /><path d="M12 32H36V37H12Z" fill="#d38a0e" stroke="#ffe591" /><g fill="#ffdb64" stroke="#d29414"><circle cx="6" cy="10" r="3" /><circle cx="24" cy="5" r="3" /><circle cx="42" cy="10" r="3" /></g></svg>;
}

function Podium({ entries, combined, unit }: { entries: RankingEntry[]; combined: boolean; unit: string }) {
  const top = entries.slice(0, 3);
  const display = [top[1], top[0], top[2]].filter((entry): entry is RankingEntry => Boolean(entry));
  return <div className="lb-podium" aria-label="Top players">
    {display.map(entry => <article key={entry.userId} className={`lb-podium-place lb-place-${entry.rank}`} aria-label={`Rank ${entry.rank}: ${entry.name}, ${entry.score} ${unit}`}>
      <div className="lb-podium-stadium" aria-hidden="true"><Image src="/img/leaderboard/standing.webp" alt="" fill sizes="(max-width: 600px) 33vw, 320px" /></div>
      {entry.rank === 1 ? <PodiumCrown /> : <span className="lb-podium-medal" aria-hidden="true">{entry.rank}</span>}
      <LaurelWreath />
      <AccountAvatar name={entry.name} image={entry.avatar} />
      <strong className="lb-podium-name" title={entry.name}>{entry.name}</strong>
      <span className="lb-level-pill">{combined ? `Level ${entry.level ?? Math.floor(entry.score / 200) + 1}` : entry.games === undefined ? 'Recorded score' : `${entry.games} played`}</span>
      <div className="lb-podium-score"><strong>{entry.score.toLocaleString()}</strong><small>{unit}</small></div>
      {entry.rank === 1 && <span className="lb-gold-platform" aria-hidden="true" />}
      <b className="lb-podium-rank">#{entry.rank}</b>
    </article>)}
  </div>;
}

export default function LeaderboardPage() {
  const { profile, openAuthModal } = useAuth();
  const requestedMode = accountMode(useSearchParams().get('mode') || '');
  const [section, setSection] = useState<'combined' | 'individual'>(requestedMode ? 'individual' : 'combined');
  const [modeId, setModeId] = useState<GameModeId>(requestedMode?.id || 'scoreline');
  const mode = ACCOUNT_MODES.find(item => item.id === modeId)!;
  const combined = section === 'combined';
  const unit = rankingUnit(combined ? 'combined' : modeId);
  const { entries, loading, error, retry } = useModeLeaderboard(combined ? 'combined' : modeId, 50);
  const myEntry = profile.is_guest ? undefined : entries.find(entry => entry.userId === profile.id);

  useEffect(() => {
    setSection(requestedMode ? 'individual' : 'combined');
    if (requestedMode) setModeId(requestedMode.id);
  }, [requestedMode]);

  return <div className="account-page lb-page">
    <header className="lb-banner">
      <Image className="lb-banner-image" src="/img/leaderboard/hero.webp" alt="" fill priority sizes="(max-width: 1023px) 100vw, 85vw" />
      <div className="lb-banner-copy"><span>FOOTBALL GENIUS</span><h1>Global Leaderboard</h1><p>Compete with football fans worldwide. Predict, Play, Climb.</p></div>
      <div className="lb-banner-motto" aria-hidden="true"><Crown strokeWidth={1.5} /><span>Same Game.<br />Bigger Minds.</span></div>
    </header>

    <div className="lb-switchbar">
      <div className="lb-section-tabs" role="group" aria-label="Leaderboard section">
        <button type="button" aria-pressed={combined} onClick={() => setSection('combined')}><Trophy size={20} /><span>Combined leaderboard</span></button>
        <button type="button" aria-pressed={!combined} onClick={() => setSection('individual')}><Gamepad2 size={22} /><span>Individual game modes</span></button>
      </div>
      <span className="lb-period"><CalendarDays size={17} />All time</span>
    </div>

    {!combined && <div className="lb-mode-picker" role="group" aria-label="Choose a game mode">{ACCOUNT_MODES.map(item => <button type="button" key={item.id} aria-pressed={modeId === item.id} style={{ '--mode-accent': item.color, '--mode-wash': item.wash } as CSSProperties} onClick={() => setModeId(item.id)}><ModeIcon mode={item.id} size={17} />{item.title}{item.comingSoon && <small>Soon</small>}</button>)}</div>}

    <div className="lb-layout">
      <section className="lb-rankings" aria-labelledby="ranking-heading" aria-busy={loading}>
        <div className="lb-rankings-heading"><Trophy className="lb-heading-trophy" size={30} /><div><h2 id="ranking-heading">{combined ? 'Combined ranking' : mode.title}</h2><p>{combined ? 'Total XP earned across every game mode.' : 'Your best recorded score in this game mode.'}</p></div><button type="button" className="lb-refresh" aria-label="Refresh leaderboard" disabled={loading} onClick={retry}><RefreshCw size={18} className={loading ? 'account-spinning' : ''} /></button></div>

        <div className="lb-ranking-content" aria-live="polite">
          {loading ? <div className="lb-data-state" role="status"><RefreshCw className="account-spinning" size={30} /><h3>Loading the standings</h3><p>Finding the latest rankings.</p></div> : error ? <div className="lb-data-state"><Globe2 size={34} /><h3>We couldn’t load the rankings</h3><p>{error}</p><button type="button" className="account-secondary-button" onClick={retry}>Try again</button></div> : entries.length === 0 ? <div className="lb-data-state"><Trophy size={40} /><h3>{!combined && mode.comingSoon ? 'This leaderboard is coming soon' : 'A new leaderboard starts here'}</h3><p>{!combined && mode.comingSoon ? `${mode.title} is warming up. Explore another mode while you wait.` : 'Rankings will appear when players have recorded results.'}</p><Link className="account-primary-button" href="/game-modes">Explore game modes<ArrowRight size={17} /></Link></div> : <>
            <Podium entries={entries} combined={combined} unit={unit} />
            <div className="lb-table-wrap"><table className="lb-table"><thead><tr><th scope="col">Rank</th><th scope="col">Player</th><th scope="col">{combined ? 'Level' : 'Games'}</th><th scope="col">{combined ? 'Total XP' : 'Best score'}</th></tr></thead><tbody>{entries.map(entry => <tr key={entry.userId} className={entry.userId === profile.id ? 'lb-is-you' : undefined}><td><span className={`lb-table-rank lb-table-rank-${entry.rank}`}>{entry.rank}</span></td><td><div className="lb-table-player"><AccountAvatar name={entry.name} image={entry.avatar} /><span title={entry.name}>{entry.name}</span>{entry.userId === profile.id && <small>You</small>}</div></td><td><span className="lb-table-level">{combined ? `Level ${entry.level ?? Math.floor(entry.score / 200) + 1}` : entry.games ?? '—'}</span></td><td><strong>{entry.score.toLocaleString()}</strong><small>{unit}</small></td></tr>)}</tbody></table></div>
          </>}
        </div>
      </section>

      <aside className="lb-aside" aria-label="Your standing and next challenge">
        <section className="lb-standing">
          <div className="lb-standing-cover"><Image src="/img/leaderboard/standing.webp" alt="" fill sizes="(max-width: 800px) 50vw, 350px" /><div className="lb-standing-heading"><Crown size={25} fill="#ffce48" stroke="#f2b42b" /><span>YOUR STANDING</span><Link href="/profile#settings" aria-label="Open profile settings"><Ellipsis size={23} /></Link></div><AccountAvatar name={profile.username} image={profile.avatar_url} /><h2>{profile.username}</h2><span className="lb-level-pill">Level {profile.level}</span></div>
          <div className="lb-standing-body"><div className="lb-standing-numbers"><div><span>Rank</span><strong>{myEntry ? `#${myEntry.rank}` : '—'}</strong></div><div><span>{combined ? 'Total XP' : 'Best score'}</span><strong>{combined ? profile.total_xp.toLocaleString() : myEntry?.score.toLocaleString() ?? '—'}<small>{unit}</small></strong></div></div>
            {profile.is_guest ? <button type="button" className="account-primary-button" onClick={openAuthModal}>Sign in to compete<ArrowRight size={18} /></button> : <Link className="account-primary-button" href="/profile#stats">View my stats<ArrowRight size={18} /></Link>}
            <p>{profile.is_guest ? 'Join the global leaderboard and test your football knowledge against fans worldwide.' : loading ? 'Finding your place in the rankings…' : error ? 'Your rank will return when the standings are available.' : myEntry ? 'Every challenge is a chance to climb. Keep your football story going.' : 'You are outside these rankings. Keep playing to earn your place.'}</p>
          </div>
        </section>
        <section className="lb-challenge"><Image src="/img/leaderboard/trophy.webp" alt="" fill sizes="(max-width: 800px) 50vw, 350px" /><div className="lb-challenge-copy"><span className="lb-challenge-icon"><Users size={24} /></span><h2>Every mode counts.</h2><p>The combined board ranks total XP. Individual boards rank the best recorded score for each game.</p><Link href="/game-modes">Find your next challenge<ArrowRight size={17} /></Link></div></section>
      </aside>
    </div>
  </div>;
}

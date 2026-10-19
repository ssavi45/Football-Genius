'use client';

import { useEffect, useState, type CSSProperties, type FormEvent } from 'react';
import Link from 'next/link';
import { ArrowRight, Award, BarChart3, CalendarDays, Check, ChevronRight, Coins, Crown, Flame, Gamepad2, LockKeyhole, LogIn, LogOut, Medal, RefreshCw, Settings2, ShieldCheck, Target, Trophy, UserRound, Volume2, VolumeX, Zap } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { ACCOUNT_MODES } from '@/lib/account/modes';
import { careerAchievements } from '@/lib/account/history';
import AccountAvatar from './AccountAvatar';
import ModeIcon from './ModeIcon';
import { useAccountHistory } from './useAccountHistory';
import './account.css';

const BADGE_ICONS = { game: Gamepad2, target: Target, trophy: Trophy, flame: Flame, zap: Zap, calendar: CalendarDays, medal: Medal, shield: ShieldCheck, crown: Crown };
const number = (value: number) => value.toLocaleString();
const sectionForHash = () => typeof window === 'undefined' ? 'stats' : window.location.hash === '#badges' ? 'badges' : window.location.hash === '#settings' ? 'settings' : 'stats';

export default function ProfilePage() {
  const { profile, isLoading, updateUsername, soundEnabled, toggleSound, openAuthModal, signOut } = useAuth();
  const { history, loading: historyLoading, error: historyError, retry } = useAccountHistory(profile.id, profile.is_guest, isLoading);
  const [section, setSection] = useState('stats');
  const [badgeFilter, setBadgeFilter] = useState<'all' | 'earned' | 'locked'>('all');
  const [nameInput, setNameInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveNotice, setSaveNotice] = useState('');
  const [saveError, setSaveError] = useState('');
  const [signingOut, setSigningOut] = useState(false);
  const badges = careerAchievements(profile);
  const earned = badges.filter(badge => badge.current >= badge.target);
  const visibleBadges = badges.filter(badge => badgeFilter === 'all' || (badgeFilter === 'earned' ? badge.current >= badge.target : badge.current < badge.target));
  const level = Math.floor(Math.max(0, profile.total_xp) / 200) + 1;
  const levelProgress = Math.max(0, profile.total_xp) % 200;
  const winRate = profile.games_played ? Math.round(profile.games_won / profile.games_played * 100) : 0;

  useEffect(() => { setNameInput(profile.username); }, [profile.username]);
  useEffect(() => {
    const update = () => setSection(sectionForHash()); update();
    window.addEventListener('hashchange', update); window.addEventListener('popstate', update);
    return () => { window.removeEventListener('hashchange', update); window.removeEventListener('popstate', update); };
  }, []);

  async function saveName(event: FormEvent) {
    event.preventDefault(); setSaveNotice(''); setSaveError(''); setSaving(true);
    try { await updateUsername(nameInput); setSaveNotice('Display name updated.'); }
    catch (cause) { setSaveError(cause instanceof Error ? cause.message : 'Could not save changes.'); }
    finally { setSaving(false); }
  }
  async function leaveAccount() {
    setSigningOut(true);
    try { await signOut(); } finally { setSigningOut(false); }
  }

  return <div className="account-page profile-page">
    <header className="account-hero profile-hero"><div className="profile-identity"><AccountAvatar name={profile.username} image={profile.avatar_url} /><div><span className="account-eyebrow">YOUR FOOTBALL STORY</span><h1>{profile.username}</h1><p>{profile.is_guest ? 'Guest scout' : 'Football Genius member'}<span className="profile-member-since">Since {new Date(profile.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' })}</span></p><div className="profile-identity-pills"><span><Flame size={15} />{profile.current_streak} streak</span><span><Coins size={15} />{number(profile.coins)} coins</span><span><Award size={15} />{earned.length} badges</span></div></div></div><div className="profile-level-card"><span className="profile-level-medal"><ShieldCheck size={30} /></span><div><span>CAREER LEVEL</span><strong>{level}<small>Scout</small></strong></div><div className="profile-xp-track"><div><span>{levelProgress} / 200 XP</span><span>Level {level + 1}</span></div><progress value={levelProgress} max={200} aria-label="Progress to next level" /></div></div></header>

    <nav className="account-section-switch profile-section-switch" aria-label="Profile sections">{[{ id: 'stats', label: 'My Stats', icon: BarChart3 }, { id: 'badges', label: 'Achievements', icon: Award }, { id: 'settings', label: 'Settings', icon: Settings2 }].map(item => <a key={item.id} href={`#${item.id}`} aria-current={section === item.id ? 'location' : undefined} onClick={() => setSection(item.id)}><item.icon size={18} />{item.label}{item.id === 'badges' && <small>{earned.length}</small>}</a>)}</nav>

    <section id="stats" className="profile-section" aria-labelledby="stats-title">
      <div className="account-section-heading"><div><span className="account-eyebrow">THE NUMBERS BEHIND YOUR GAME</span><h2 id="stats-title">My Stats</h2></div><Link href="/leaderboard">View leaderboard<ArrowRight size={17} /></Link></div>
      <div className="profile-stat-grid">{[{ label: 'Career XP', value: number(profile.total_xp), note: `${200 - levelProgress} XP to level ${level + 1}`, icon: Zap, tone: 'blue' }, { label: 'Games played', value: number(profile.games_played), note: 'Across all game modes', icon: Gamepad2, tone: 'purple' }, { label: 'Victories', value: number(profile.games_won), note: `${winRate}% win rate`, icon: Trophy, tone: 'green' }, { label: 'Best streak', value: number(profile.best_streak), note: 'Your personal best', icon: Flame, tone: 'orange' }].map(stat => <article key={stat.label} className={`profile-stat tone-${stat.tone}`}><span className="account-card-icon"><stat.icon size={23} /></span><span>{stat.label}</span><strong>{stat.value}</strong><small>{stat.note}</small></article>)}</div>

      <div className="profile-detail-grid"><section className="account-panel mode-performance"><div className="account-panel-heading"><div><h3><BarChart3 size={20} />Game breakdown</h3><p>{history.length ? `Based on your latest ${history.length} recorded games.` : 'Your recorded games, mode by mode.'}</p></div></div>{historyError ? <div className="account-inline-notice"><p>Game history is unavailable right now.</p><button type="button" onClick={retry}>Try again</button></div> : historyLoading ? <div className="account-empty compact"><RefreshCw className="account-spinning" size={24} /><p>Loading your game history...</p></div> : <><div className="mode-performance-labels"><span>Game mode</span><span>Played</span><span>Won</span></div>{ACCOUNT_MODES.map(mode => {
        const results = history.filter(item => item.mode === mode.id);
        const knownResults = results.filter(item => item.won !== null);
        return <Link key={mode.id} href={`/games/${mode.id}`} className="mode-performance-row" style={{ '--mode-accent': mode.color, '--mode-wash': mode.wash } as CSSProperties}><span className="mode-performance-name"><span className="mode-mini-icon"><ModeIcon mode={mode.id} size={19} /></span><span>{mode.title}{mode.comingSoon && <small>Coming soon</small>}</span></span><span>{mode.comingSoon ? '\u2014' : results.length}</span><span>{mode.comingSoon || (results.length > 0 && knownResults.length === 0) ? '\u2014' : knownResults.filter(item => item.won).length}</span></Link>;
      })}</>}{!historyLoading && !historyError && !history.length && <p className="account-data-note">Your game breakdown starts with your next recorded result. Earlier career totals are shown above.</p>}</section>
      <section className="account-panel recent-games"><div className="account-panel-heading"><div><h3><CalendarDays size={20} />Recent activity</h3><p>Your latest moments on the pitch.</p></div></div>{historyLoading ? <div className="account-empty compact"><RefreshCw className="account-spinning" size={24} /><p>Loading activity...</p></div> : historyError ? <div className="account-empty compact"><CalendarDays size={30} /><p>Activity is unavailable right now.</p><button type="button" className="account-secondary-button" onClick={retry}>Try again</button></div> : history.length ? <ol className="recent-game-list">{history.slice(0, 5).map(result => {
        const mode = ACCOUNT_MODES.find(item => item.id === result.mode)!;
        return <li key={result.id} style={{ '--mode-accent': mode.color, '--mode-wash': mode.wash } as CSSProperties}><span className="mode-mini-icon"><ModeIcon mode={mode.id} size={19} /></span><div><strong>{mode.title}</strong><time dateTime={result.createdAt}>{new Date(result.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</time></div><span className={result.won === true ? 'result-won' : 'result-played'}>{result.won === true ? 'Won' : result.won === false ? 'Played' : 'Recorded'}<small>{result.score} score</small></span></li>;
      })}</ol> : <div className="account-empty"><span className="account-empty-medal"><Gamepad2 size={34} /></span><h3>Your next match is waiting</h3><p>Complete a game to see your latest results here.</p><Link className="account-primary-button" href="/game-modes">Find a game<ArrowRight size={17} /></Link></div>}</section></div>
    </section>

    <section id="badges" className="profile-section" aria-labelledby="badges-title"><div className="account-section-heading"><div><span className="account-eyebrow">MILESTONES WORTH KEEPING</span><h2 id="badges-title">Achievements<span className="heading-count">{earned.length} / {badges.length}</span></h2></div><div className="account-small-switch" role="group" aria-label="Filter achievements">{(['all', 'earned', 'locked'] as const).map(filter => <button key={filter} type="button" aria-pressed={badgeFilter === filter} onClick={() => setBadgeFilter(filter)}>{filter === 'all' ? 'All badges' : filter === 'earned' ? 'Earned' : 'Locked'}</button>)}</div></div><div className="achievement-grid">{visibleBadges.map(badge => {
      const unlocked = badge.current >= badge.target;
      const Icon = BADGE_ICONS[badge.icon as keyof typeof BADGE_ICONS];
      return <article key={badge.id} className={`achievement-card tone-${badge.color} ${unlocked ? 'is-earned' : 'is-locked'}`}><div className="achievement-medal"><span><Icon size={32} strokeWidth={1.8} /></span><i /><i /><b>{unlocked ? <Check size={13} /> : <LockKeyhole size={12} />}</b></div><div className="achievement-copy"><span className="achievement-state">{unlocked ? 'Earned' : 'In progress'}</span><h3>{badge.title}</h3><p>{badge.description}</p><div className="achievement-progress"><progress value={Math.min(badge.current, badge.target)} max={badge.target} aria-label={`${badge.title} progress`} /><span>{number(Math.min(badge.current, badge.target))} / {number(badge.target)}</span></div></div></article>;
    })}</div>{visibleBadges.length === 0 && <div className="account-panel account-empty"><Award size={32} /><h3>{badgeFilter === 'earned' ? 'Your first badge is waiting' : 'You have earned every badge'}</h3><p>{badgeFilter === 'earned' ? 'Complete challenges to start your collection.' : 'Keep playing and build your football story.'}</p></div>}</section>

    <section id="settings" className="profile-section" aria-labelledby="settings-title"><div className="account-section-heading"><div><span className="account-eyebrow">MAKE YOURSELF AT HOME</span><h2 id="settings-title">Settings</h2></div></div><div className="profile-settings-grid">
      <section className="account-panel"><div className="account-panel-heading"><div><h3><UserRound size={20} />Your profile</h3><p>The name other football fans will see.</p></div></div><form className="profile-settings-form" onSubmit={saveName}><label htmlFor="profile-display-name">Display name</label><input id="profile-display-name" type="text" required minLength={1} maxLength={32} value={nameInput} onChange={event => { setNameInput(event.target.value); setSaveNotice(''); setSaveError(''); }} autoComplete="nickname" /><span className="account-field-help">Between 1 and 32 characters.</span><div aria-live="polite">{saveNotice && <p className="account-save-success"><Check size={16} />{saveNotice}</p>}{saveError && <p className="account-save-error" role="alert">{saveError}</p>}</div><button type="submit" className="account-primary-button" disabled={saving || !nameInput.trim() || nameInput.trim() === profile.username}>{saving ? 'Saving...' : 'Save changes'}{!saving && <Check size={16} />}</button></form></section>
      <div className="profile-settings-stack"><section className="account-panel"><div className="account-panel-heading"><div><h3><Volume2 size={20} />Game preferences</h3></div></div><div className="account-setting-row"><span className="account-card-icon">{soundEnabled ? <Volume2 size={22} /> : <VolumeX size={22} />}</span><div><h4 id="sound-setting-label">Sound effects</h4><p id="sound-setting-description">Clicks, clues, and match celebrations.</p></div><button type="button" role="switch" className="account-switch" aria-checked={soundEnabled} aria-labelledby="sound-setting-label" aria-describedby="sound-setting-description" onClick={toggleSound}><span /></button></div></section>
      <section className="account-panel"><div className="account-panel-heading"><div><h3><ShieldCheck size={20} />Account</h3></div><span className={`account-status-pill ${profile.is_guest ? '' : 'is-connected'}`}>{profile.is_guest ? 'Guest account' : 'Connected'}</span></div><div className="account-connection"><p>{profile.is_guest ? 'Your guest progress is saved on this device. Sign in to keep playing across devices.' : profile.email || 'Your account is connected.'}</p>{profile.is_guest ? <button type="button" className="account-secondary-button" onClick={openAuthModal}><LogIn size={17} />Sign in with Google<ChevronRight size={16} /></button> : <button type="button" className="account-sign-out" onClick={leaveAccount} disabled={signingOut}><LogOut size={17} />{signingOut ? 'Signing out...' : 'Sign out'}</button>}</div></section></div>
    </div></section>
  </div>;
}

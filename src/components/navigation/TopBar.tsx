'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { sound } from '@/lib/utils/sound';
import { isSharedGameRoute } from '@/lib/navigation';
import './TopBar.css';
import AccountAvatar from '@/components/account/AccountAvatar';
import {
  Search,
  ArrowRight,
  Menu,
  X,
  Volume2,
  VolumeX,
  User,
  LogOut,
  ChevronDown,
  Gamepad2,
  Trophy,
  Info,
  BookOpen,
} from 'lucide-react';

interface TopBarProps {
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

export default function TopBar({ onToggleMobileMenu, isMobileMenuOpen }: TopBarProps) {
  const { profile, isLoading, openAuthModal, soundEnabled, toggleSound, signOut } = useAuth();
  const [profileDropdown, setProfileDropdown] = useState(false);
  const pathname = usePathname();
  const useSharedNav = pathname === '/' || pathname === '/game-modes' || isSharedGameRoute(pathname);
  const isGameModesActive = pathname === '/game-modes' || isSharedGameRoute(pathname);

  const profileMenuRef = useRef<HTMLDivElement>(null);
  useEffect(() => { setProfileDropdown(false); }, [pathname, profile.id]);
  useEffect(() => {
    if (!profileDropdown) return;
    const pointerdown = (event: PointerEvent) => {
      if (event.target instanceof Node && !profileMenuRef.current?.contains(event.target)) setProfileDropdown(false);
    };
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setProfileDropdown(false);
        profileMenuRef.current?.querySelector('button')?.focus();
      }
    };
    document.addEventListener('pointerdown', pointerdown);
    document.addEventListener('keydown', keydown);
    return () => { document.removeEventListener('pointerdown', pointerdown); document.removeEventListener('keydown', keydown); };
  }, [profileDropdown]);

  return (
    <header
      className="topbar"
      suppressHydrationWarning
    >
      <div className="topbar-inner">

        <div className="topbar-mobile-heading">
          <button type="button" onClick={onToggleMobileMenu} className="menu-toggle" aria-label="Toggle navigation menu" aria-expanded={isMobileMenuOpen} aria-controls="mobile-sidebar">
            {isMobileMenuOpen?<X size={21}/>:<Menu size={21}/>}
          </button>
          <span>{pathname==='/'?'Home':pathname==='/game-modes'?'Game Modes':pathname==='/leaderboard'?'Leaderboard':pathname==='/profile'?'My Profile':isGameModesActive?'Game Modes':'Football Genius'}</span>
        </div>

        {/* Center: In-Game vs Standard Nav */}
        {pathname.startsWith('/games') && !useSharedNav ? (
          <nav className="topbar-nav" aria-label="Top navigation">
            {/* Play (Active Blue Pill) */}
            <Link
              href="/games/scoreline"
              onMouseEnter={() => sound.playHover()}
              onClick={() => sound.playClick()}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-50 text-[#1D68FE] font-bold border border-blue-200/60 shadow-2xs"
            >
              <Gamepad2 className="h-3.5 w-3.5 text-[#1D68FE]" />
              <span>Play</span>
            </Link>

            {/* Leaderboard */}
            <Link
              href="/leaderboard"
              onMouseEnter={() => sound.playHover()}
              onClick={() => sound.playClick()}
              className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 transition"
            >
              <Trophy className="h-3.5 w-3.5 text-slate-500" />
              <span>Leaderboard</span>
            </Link>

            {/* About */}
            <Link
              href="/#about"
              onMouseEnter={() => sound.playHover()}
              onClick={() => sound.playClick()}
              className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 transition"
            >
              <Info className="h-3.5 w-3.5 text-slate-500" />
              <span>About</span>
            </Link>

            {/* How to Play */}
            <Link
              href="/#how-to-play"
              onMouseEnter={() => sound.playHover()}
              onClick={() => sound.playClick()}
              className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 transition"
            >
              <BookOpen className="h-3.5 w-3.5 text-slate-500" />
              <span>How to Play</span>
            </Link>
          </nav>
        ) : (
          <nav className="topbar-nav" aria-label="Top navigation">
            {/* Home (active with blue bottom underline) */}
            <Link
              href="/"
              aria-current={pathname === "/" ? "page" : undefined}
              onMouseEnter={() => sound.playHover()}
              onClick={() => sound.playClick()}
              className={`transition pb-1 ${
                pathname === '/'
                  ? 'font-bold text-slate-900 border-b-2 border-[#1D68FE]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Home
            </Link>

            {/* Game Modes */}
            <Link
              href="/game-modes"
              aria-current={isGameModesActive ? "page" : undefined}
              onMouseEnter={() => sound.playHover()}
              onClick={() => sound.playClick()}
              className={`transition pb-1 ${
                isGameModesActive
                  ? 'font-bold text-slate-900 border-b-2 border-[#1D68FE]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Game Modes
            </Link>

            {/* Global Leaderboard */}
            <Link
              href="/leaderboard"
              aria-current={pathname === '/leaderboard' ? 'page' : undefined}
              onMouseEnter={() => sound.playHover()}
              onClick={() => sound.playClick()}
              className="text-slate-600 hover:text-slate-900 transition"
            >
              Global Leaderboard
            </Link>

            {/* About */}
            <Link
              href="/#about"
              onMouseEnter={() => sound.playHover()}
              onClick={() => sound.playClick()}
              className="text-slate-600 hover:text-slate-900 transition"
            >
              About
            </Link>
          </nav>
        )}

        <div className="header-actions">
          <button type="button" onMouseEnter={() => sound.playHover()} onClick={() => { sound.playClick(); window.location.href = '/game-modes#mode-search'; }} className="search-button flex items-center justify-center rounded-full text-slate-600" aria-label="Search">
            <Search size={16} />
          </button>
          <button type="button" onClick={toggleSound} className="sound-toggle rounded-full text-blue-600" title={soundEnabled ? 'Mute sound' : 'Enable sound'} aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}>
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          {isLoading ? <div className="topbar-account-loading" role="status" aria-label="Loading profile" /> : <>
            <div className="topbar-profile" ref={profileMenuRef}>
              <button type="button" onClick={() => setProfileDropdown(open => !open)} className="user-menu-btn" aria-label={`${profile.is_guest ? 'Guest' : 'User'} profile menu: ${profile.username}`} aria-expanded={profileDropdown} aria-controls="navbar-profile-panel">
                <AccountAvatar name={profile.username} image={profile.avatar_url} className="navbar-profile-avatar" />
                <span className="navbar-profile-name">{profile.username || 'Scout'}</span>
                <ChevronDown size={14} className="navbar-profile-chevron" />
              </button>
              {profileDropdown && <div id="navbar-profile-panel" className="navbar-profile-panel">
                <div className="navbar-profile-summary">
                  <AccountAvatar name={profile.username} image={profile.avatar_url} className="navbar-menu-avatar" />
                  <div><small>{profile.is_guest ? 'Guest profile' : 'Signed in as'}</small><strong>{profile.username}</strong></div>
                </div>
                <Link href="/profile" onClick={() => setProfileDropdown(false)}><User size={16} />My Profile</Link>
                {!profile.is_guest && <button type="button" onClick={() => { setProfileDropdown(false); void signOut().catch(() => openAuthModal()); }}><LogOut size={16} />Sign Out</button>}
              </div>}
            </div>
            {profile.is_guest && <button type="button" onClick={() => { sound.playClick(); setProfileDropdown(false); openAuthModal(); }} onMouseEnter={() => sound.playHover()} className="sign-in">
              <span>Sign In</span><ArrowRight size={16} />
            </button>}
          </>}
        </div>

      </div>
    </header>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { sound } from '@/lib/utils/sound';
import './TopBar.css';
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
  Flame,
  Star,
} from 'lucide-react';

interface TopBarProps {
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

export default function TopBar({ onToggleMobileMenu, isMobileMenuOpen }: TopBarProps) {
  const { profile, openAuthModal, soundEnabled, toggleSound, signOut } = useAuth();
  const [profileDropdown, setProfileDropdown] = useState(false);
  const pathname = usePathname();
  const useSharedNav = pathname === '/' || pathname === '/game-modes' || pathname === '/games/scoreline';

  return (
    <header
      className={`sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all ${useSharedNav ? "landing-header" : ""}`}
      suppressHydrationWarning
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-18 py-2.5 flex items-center justify-between gap-4">

        {/* Left: Hamburger (mobile) & Brand Logo */}
        <div className="brand-group flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="menu-toggle lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          <Link
            href="/"
            onMouseEnter={() => sound.playHover()}
            onClick={() => sound.playClick()}
            className="brand-link flex items-center gap-2.5 group"
          >
            {/* Dark Styled Soccer Crest Badge matching mockup */}
            <div className="brand-ball relative h-9 w-9 flex items-center justify-center rounded-full bg-slate-950 text-white shadow-sm group-hover:scale-105 transition-transform">
              <span className="text-xl leading-none select-none">⚽</span>
            </div>
            <div className="flex items-baseline">
              <span className="brand-name text-xl font-black font-outfit tracking-tight text-slate-900">
                Football
              </span>
              <span className="brand-name text-xl font-black font-outfit tracking-tight text-[#1D68FE] ml-1">
                Genius
              </span>
            </div>
          </Link>
        </div>

        {/* Center: In-Game vs Standard Nav */}
        {pathname.startsWith('/games') && !useSharedNav ? (
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold">
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
          <nav className="hidden lg:flex items-center gap-8 text-xs font-semibold">
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
              aria-current={pathname === "/game-modes" ? "page" : undefined}
              onMouseEnter={() => sound.playHover()}
              onClick={() => sound.playClick()}
              className={`transition pb-1 ${
                pathname === '/game-modes'
                  ? 'font-bold text-slate-900 border-b-2 border-[#1D68FE]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Game Modes
            </Link>

            {/* Global Leaderboard */}
            <Link
              href="/leaderboard"
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

        {/* Right Actions: In-game Status Bar vs Standard Header Actions */}
        {pathname.startsWith('/games') && !useSharedNav ? (
          <div className="header-actions flex items-center gap-2.5 sm:gap-3">
            {/* Search Button */}
            <button
              onMouseEnter={() => sound.playHover()}
              onClick={() => { sound.playClick(); }}
              className="search-button h-9 w-9 rounded-full bg-slate-100 hover:bg-slate-200/80 flex items-center justify-center text-slate-600 transition shadow-2xs cursor-pointer"
              title="Search"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>

            {/* Level 3 Badge with Progress Bar */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-2xs">
              <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
              <span className="text-xs font-bold text-slate-800">Level 3</span>
              <div className="w-10 h-1.5 rounded-full bg-slate-100 overflow-hidden border border-slate-200/60">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 w-2/5" />
              </div>
            </div>

            {/* 12 Day Streak Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-2xs">
              <Flame className="h-4 w-4 text-orange-500 fill-orange-500" />
              <div className="flex flex-col text-left leading-none">
                <span className="text-xs font-black text-slate-900">12</span>
                <span className="text-[8px] font-semibold text-slate-400">Day Streak</span>
              </div>
            </div>

            {/* User Avatar Circle */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdown(!profileDropdown)}
                className="flex items-center gap-1.5 p-0.5 rounded-full hover:bg-slate-100 transition cursor-pointer"
                aria-label="User profile menu"
              >
                <div className="h-9 w-9 rounded-full bg-[#1D68FE] text-white font-bold text-sm flex items-center justify-center shadow-xs">
                  {profile.username ? profile.username.charAt(0).toUpperCase() : 'U'}
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
              </button>

              {profileDropdown && (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white border border-slate-100 p-2 shadow-xl z-50 animate-fadeIn">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-[10px] font-semibold text-slate-400">Signed in as</p>
                    <p className="text-xs font-bold text-slate-900 truncate">{profile.username || 'Scout'}</p>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setProfileDropdown(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition"
                  >
                    <User className="h-4 w-4" /> My Profile
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setProfileDropdown(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="header-actions flex items-center gap-2.5 sm:gap-3">
            {/* Search Button */}
            <button
              onMouseEnter={() => sound.playHover()}
              onClick={() => { sound.playClick(); window.location.href = "/game-modes#mode-search"; }}
              className="search-button h-9 w-9 rounded-full bg-white hover:bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 transition shadow-2xs"
              title="Search"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>

            {/* Sound Toggle (Subtle) */}
            <button
              onClick={toggleSound}
              className="sound-toggle p-2 rounded-full text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition hidden sm:flex"
              title={soundEnabled ? 'Mute sound' : 'Enable sound'}
              aria-label="Toggle sound"
            >
              {soundEnabled ? <Volume2 className="h-4 w-4 text-blue-600" /> : <VolumeX className="h-4 w-4 text-slate-300" />}
            </button>

            {/* Sign In Button / User Menu */}
            {profile.is_guest ? (
              <button
                onClick={() => {
                  sound.playClick();
                  openAuthModal();
                }}
                onMouseEnter={() => sound.playHover()}
                className="sign-in px-5 py-2 rounded-full border border-slate-200 text-xs font-bold text-slate-800 hover:bg-slate-50 transition active:scale-95 shadow-2xs"
              >
                Sign In
              </button>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdown(!profileDropdown)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 transition text-xs font-bold text-slate-800"
                >
                  <div className="h-6 w-6 rounded-full bg-[#1D68FE] text-white font-bold text-[11px] flex items-center justify-center">
                    {profile.username ? profile.username.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="hidden sm:inline max-w-[90px] truncate">{profile.username}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>

                {profileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white border border-slate-100 p-2 shadow-xl z-50 animate-fadeIn">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <p className="text-[10px] font-semibold text-slate-400">Signed in as</p>
                      <p className="text-xs font-bold text-slate-900 truncate">{profile.username}</p>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setProfileDropdown(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition"
                    >
                      <User className="h-4 w-4" /> My Profile
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        setProfileDropdown(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition"
                    >
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Primary CTA: Play Now → */}
            <Link
              href="/games/scoreline"
              onMouseEnter={() => sound.playHover()}
              onClick={() => sound.playClick()}
              className="play-now inline-flex items-center gap-1.5 px-5 sm:px-6 py-2.5 rounded-full bg-[#1D68FE] hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all active:scale-95"
            >
              <span>Play Now</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}

      </div>
    </header>
  );
}

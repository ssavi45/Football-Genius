'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { sound } from '@/lib/utils/sound';
import {
  Trophy,
  Info,
  BookOpen,
  Search,
  Flame,
  ChevronDown,
  Menu,
  X,
  Volume2,
  VolumeX,
  Gamepad2,
  User,
  LogOut,
  Sparkles,
} from 'lucide-react';

interface TopBarProps {
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

export default function TopBar({ onToggleMobileMenu, isMobileMenuOpen }: TopBarProps) {
  const { profile, openAuthModal, soundEnabled, toggleSound, signOut } = useAuth();
  const [profileDropdown, setProfileDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-blue-100/70 shadow-[0_2px_12px_rgba(0,102,255,0.03)] transition-all">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-18 py-2 flex items-center justify-between gap-4">
        {/* Left: Hamburger & Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          <Link
            href="/"
            onMouseEnter={() => sound.playHover()}
            onClick={() => sound.playClick()}
            className="flex items-center gap-2.5 group"
          >
            {/* Crisp 3D / Vector Soccer Ball Icon */}
            <div className="relative h-9 w-9 flex items-center justify-center rounded-full bg-white shadow-sm border border-slate-200 group-hover:scale-105 transition-transform">
              <span className="text-2xl leading-none select-none">⚽</span>
            </div>
            <div className="flex items-baseline">
              <span className="text-xl font-black font-outfit tracking-tight text-slate-900">
                Football
              </span>
              <span className="text-xl font-black font-outfit tracking-tight text-blue-600 ml-1">
                Genius
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Clean Nav Pills (matching mockup) */}
        <nav className="hidden md:flex items-center gap-2">
          {/* Active Play Pill */}
          <Link
            href="/"
            onMouseEnter={() => sound.playHover()}
            onClick={() => sound.playClick()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200/80 shadow-xs transition"
          >
            <Gamepad2 className="h-4 w-4 text-blue-600" />
            <span>Play</span>
          </Link>

          {/* Leaderboard */}
          <Link
            href="/leaderboard"
            onMouseEnter={() => sound.playHover()}
            onClick={() => sound.playClick()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 transition"
          >
            <Trophy className="h-4 w-4 text-slate-400" />
            <span>Leaderboard</span>
          </Link>

          {/* About */}
          <Link
            href="/#about"
            onMouseEnter={() => sound.playHover()}
            onClick={() => sound.playClick()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 transition"
          >
            <Info className="h-4 w-4 text-slate-400" />
            <span>About</span>
          </Link>

          {/* How to Play */}
          <Link
            href="/#how-to-play"
            onMouseEnter={() => sound.playHover()}
            onClick={() => sound.playClick()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 transition"
          >
            <BookOpen className="h-4 w-4 text-slate-400" />
            <span>How to Play</span>
          </Link>
        </nav>

        {/* Right: Search, Level, Streak, Profile Avatar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search Button Pill */}
          <button
            onMouseEnter={() => sound.playHover()}
            onClick={() => sound.playClick()}
            className="h-9 w-9 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-500 hover:text-blue-600 transition"
            title="Search challenges"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Level 3 Pill with Mini Progress Bar */}
          <div
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-xs cursor-default"
            title={`Level ${profile.level} Scout • ${profile.total_xp} Total XP`}
          >
            <span className="text-amber-400 text-sm">⭐</span>
            <span className="text-xs font-bold text-slate-800">
              Level {profile.level || 3}
            </span>
            <div className="w-10 h-1.5 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                style={{ width: `${Math.min(100, ((profile.total_xp % 200) / 200) * 100) || 60}%` }}
              />
            </div>
          </div>

          {/* Streak Counter Pill */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-xs text-slate-800 cursor-default"
            title={`${profile.current_streak} Day Streak`}
          >
            <Flame className="h-4 w-4 fill-orange-500 text-orange-500 animate-pulse-slow" />
            <div className="flex flex-col text-left leading-none">
              <span className="text-xs font-black font-outfit text-slate-900">
                {profile.current_streak}
              </span>
              <span className="text-[9px] font-semibold text-slate-500 hidden sm:inline">
                Day Streak
              </span>
            </div>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-full text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition"
            title={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
            aria-label="Toggle sound"
          >
            {soundEnabled ? <Volume2 className="h-4 w-4 text-blue-600" /> : <VolumeX className="h-4 w-4 text-slate-300" />}
          </button>

          {/* User Avatar Circle (U in blue circle matching mockup) */}
          <div className="relative">
            <button
              onClick={() => {
                sound.playClick();
                if (profile.is_guest) {
                  openAuthModal();
                } else {
                  setProfileDropdown(!profileDropdown);
                }
              }}
              onMouseEnter={() => sound.playHover()}
              className="flex items-center gap-1 p-0.5 rounded-full hover:ring-2 hover:ring-blue-400/40 transition"
            >
              <div className="h-9 w-9 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center shadow-md shadow-blue-500/25">
                {profile.username ? profile.username.charAt(0).toUpperCase() : 'U'}
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
            </button>

            {/* Dropdown Menu */}
            {profileDropdown && !profile.is_guest && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white border border-blue-100 p-2 shadow-xl z-50 animate-fadeIn">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="text-[11px] font-semibold text-slate-400">Signed in as</p>
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
        </div>
      </div>
    </header>
  );
}

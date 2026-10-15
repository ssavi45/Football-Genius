'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/auth-context';
import { sound } from '@/lib/utils/sound';
import { Flame, Zap, Volume2, VolumeX, Menu, X, LogIn, User, Circle } from 'lucide-react';

interface TopBarProps {
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

export default function TopBar({ onToggleMobileMenu, isMobileMenuOpen }: TopBarProps) {
  const { profile, openAuthModal, soundEnabled, toggleSound } = useAuth();
  const [profileDropdown, setProfileDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-pitch-black/85 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Hamburger & Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl text-text-secondary hover:text-white hover:bg-white/5 transition"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative h-9 w-9 rounded-xl overflow-hidden shadow-neon transition-transform group-hover:scale-105">
              <Image
                src="/branding/footygen_logo.png"
                alt="FootyGen"
                fill
                sizes="36px"
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black font-outfit tracking-tight text-white group-hover:text-neon-green transition-colors">
                FOOTY<span className="text-neon-green">GEN</span>
              </span>
              <span className="text-[9px] font-semibold tracking-widest text-text-muted uppercase -mt-1 hidden sm:block">
                Arena IQ
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Desktop Nav Pills */}
        <nav className="hidden md:flex items-center gap-1.5 bg-pitch-card/60 p-1 rounded-full border border-white/5">
          <Link
            href="/"
            onMouseEnter={() => sound.playHover()}
            onClick={() => sound.playClick()}
            className="px-4 py-1.5 rounded-full text-xs font-bold text-white bg-white/10 hover:bg-white/15 transition shadow-sm"
          >
            Arena
          </Link>
          <Link
            href="/leaderboard"
            onMouseEnter={() => sound.playHover()}
            onClick={() => sound.playClick()}
            className="px-4 py-1.5 rounded-full text-xs font-bold text-text-secondary hover:text-white hover:bg-white/5 transition"
          >
            Leaderboard
          </Link>
          <Link
            href="/games/scoreline"
            onMouseEnter={() => sound.playHover()}
            onClick={() => sound.playClick()}
            className="px-4 py-1.5 rounded-full text-xs font-bold text-neon-green hover:bg-neon-green/10 transition flex items-center gap-1"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-green"></span>
            </span>
            Daily Hero
          </Link>
        </nav>

        {/* Right: Gamified Stats & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Streak Counter */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 cursor-default"
            title={`${profile.current_streak} Day Streak`}
          >
            <Flame className="h-4 w-4 fill-amber-400 text-amber-400 animate-pulse-slow" />
            <span className="text-xs font-black font-outfit">{profile.current_streak}</span>
          </div>

          {/* Level / XP Pill */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-neon-green/10 border border-neon-green/25 text-neon-green cursor-default"
            title={`Level ${profile.level} • ${profile.total_xp} Total XP`}
          >
            <Zap className="h-3.5 w-3.5 fill-neon-green text-neon-green" />
            <span className="text-xs font-extrabold font-outfit">
              LVL {profile.level} <span className="text-white/60 font-medium hidden sm:inline">• {profile.total_xp} XP</span>
            </span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-xl text-text-secondary hover:text-white hover:bg-white/5 transition"
            title={soundEnabled ? 'Mute audio' : 'Enable audio'}
            aria-label="Toggle audio effects"
          >
            {soundEnabled ? <Volume2 className="h-4 w-4 text-neon-green" /> : <VolumeX className="h-4 w-4 text-text-muted" />}
          </button>

          {/* User Profile or Guest Login Pill */}
          {profile.is_guest ? (
            <button
              onClick={openAuthModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neon-green hover:bg-neon-green/90 text-pitch-black font-black font-outfit text-xs transition shadow-neon active:scale-95"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          ) : (
            <div className="relative">
              <button
                onClick={() => setProfileDropdown(!profileDropdown)}
                className="flex items-center gap-2 p-1 pl-2 rounded-full bg-pitch-card border border-white/10 hover:border-neon-green/50 transition"
              >
                <span className="text-xs font-bold text-white max-w-[80px] truncate hidden sm:inline">
                  {profile.username}
                </span>
                <div className="relative h-7 w-7 rounded-full overflow-hidden border border-neon-green/40">
                  <Image
                    src={profile.avatar_url || '/img/players/messi.jpg'}
                    alt={profile.username}
                    fill
                    sizes="28px"
                    className="object-cover"
                  />
                </div>
              </button>

              {/* Profile dropdown */}
              {profileDropdown && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-pitch-dark border border-white/15 p-2 shadow-xl z-50 animate-fadeIn">
                  <div className="px-3 py-2 border-b border-white/10 mb-1">
                    <p className="text-xs font-semibold text-text-secondary">Signed in as</p>
                    <p className="text-sm font-bold text-white truncate">{profile.username}</p>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setProfileDropdown(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-text-secondary hover:text-white hover:bg-white/5 rounded-lg transition"
                  >
                    <User className="h-4 w-4" /> My Profile
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}


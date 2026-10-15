'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/auth-context';
import {
  ArrowLeft,
  Flame,
  Zap,
  Trophy,
  Check,
  Edit2,
  LogIn,
  LogOut,
  Shield,
  Award,
  Calendar,
} from 'lucide-react';

export default function ProfilePage() {
  const { profile, updateUsername, signOut, openAuthModal } = useAuth();
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(profile.username);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    await updateUsername(nameInput.trim());
    setEditing(false);
  };

  const badges = [
    { name: 'Elite Predictor', desc: 'Predict historic matches in Scoreline Hero', icon: '🎯', unlocked: true },
    { name: 'Tactical Duelist', desc: 'Outsmart AI in Scout\'s Duel', icon: '⚔️', unlocked: profile.games_played >= 1 },
    { name: 'Matrix Architect', desc: 'Fill the 9-cell tactical grid', icon: '🧩', unlocked: profile.level >= 2 },
    { name: 'Globe Trotter', desc: 'Trace transfer routes in Journeyman', icon: '✈️', unlocked: profile.level >= 3 },
    { name: 'Market Tycoon', desc: 'Reach 5-streak in Higher or Lower', icon: '📈', unlocked: profile.best_streak >= 5 },
    { name: 'Tunnel Legend', desc: 'Identify legendary post-match quotes', icon: '🎙️', unlocked: profile.games_won >= 5 },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fadeIn">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-white transition px-3 py-2 rounded-xl bg-pitch-card border border-white/5"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Arena
        </Link>
        <span className="text-xs font-semibold text-text-muted">
          Member since {new Date(profile.created_at).toLocaleDateString()}
        </span>
      </div>

      {/* Profile Header Card */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-pitch-card to-pitch-dark p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-2xl overflow-hidden border-2 border-neon-green/60 shadow-neon shrink-0">
            <Image
              src={profile.avatar_url || '/img/players/messi.jpg'}
              alt={profile.username}
              fill
              className="object-cover"
            />
          </div>

          {/* Details */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              {editing ? (
                <form onSubmit={handleSave} className="flex gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-pitch-black border border-neon-green text-white text-lg font-bold"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-xl bg-neon-green text-pitch-black font-bold text-xs"
                  >
                    Save
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black font-outfit text-white">
                    {profile.username}
                  </h1>
                  <button
                    onClick={() => setEditing(true)}
                    className="p-1.5 text-text-muted hover:text-white rounded-lg transition"
                    title="Edit username"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <p className="text-xs text-text-secondary font-medium">
              {profile.is_guest ? 'Guest Scout Account (Local Device)' : profile.email || 'Verified Scout Member'}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-neon-green/15 text-neon-green border border-neon-green/30">
                Level {profile.level} Scout
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                <Flame className="h-3.5 w-3.5 fill-amber-400" /> {profile.current_streak} Day Streak
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-trophy-gold/15 text-trophy-gold border border-trophy-gold/30">
                🪙 {profile.coins} Coins
              </span>
            </div>
          </div>

          {/* Auth Action */}
          <div className="shrink-0">
            {profile.is_guest ? (
              <button
                onClick={openAuthModal}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neon-green hover:bg-neon-green/90 text-pitch-black font-black text-xs shadow-neon transition active:scale-95"
              >
                <LogIn className="h-4 w-4" /> Link Google Account
              </button>
            ) : (
              <button
                onClick={signOut}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-rose-500/20 hover:text-rose-400 text-text-secondary font-bold text-xs transition"
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-pitch-card border border-white/5 text-center">
          <div className="text-[11px] font-bold text-text-muted uppercase">Total XP</div>
          <div className="text-2xl font-black font-orbitron text-neon-green mt-1">{profile.total_xp}</div>
        </div>
        <div className="p-4 rounded-2xl bg-pitch-card border border-white/5 text-center">
          <div className="text-[11px] font-bold text-text-muted uppercase">Matches Played</div>
          <div className="text-2xl font-black font-orbitron text-white mt-1">{profile.games_played}</div>
        </div>
        <div className="p-4 rounded-2xl bg-pitch-card border border-white/5 text-center">
          <div className="text-[11px] font-bold text-text-muted uppercase">Victories</div>
          <div className="text-2xl font-black font-orbitron text-sky-400 mt-1">{profile.games_won}</div>
        </div>
        <div className="p-4 rounded-2xl bg-pitch-card border border-white/5 text-center">
          <div className="text-[11px] font-bold text-text-muted uppercase">Best Streak</div>
          <div className="text-2xl font-black font-orbitron text-amber-400 mt-1">{profile.best_streak}</div>
        </div>
      </div>

      {/* Badges & Achievements */}
      <div className="space-y-3">
        <h2 className="text-lg font-black font-outfit text-white flex items-center gap-2">
          <Award className="h-5 w-5 text-trophy-gold" /> Career Badges ({badges.filter(b => b.unlocked).length} / {badges.length})
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {badges.map(b => (
            <div
              key={b.name}
              className={`p-4 rounded-2xl border transition ${
                b.unlocked
                  ? 'bg-pitch-card border-white/10 hover:border-trophy-gold/40'
                  : 'bg-white/[0.02] border-white/5 opacity-40'
              }`}
            >
              <div className="text-2xl mb-2">{b.icon}</div>
              <h3 className="text-sm font-bold text-white">{b.name}</h3>
              <p className="text-xs text-text-secondary mt-1">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


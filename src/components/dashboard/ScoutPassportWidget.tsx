'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { sound } from '@/lib/utils/sound';
import { Zap, ShieldCheck, Trophy, ChevronRight, Award } from 'lucide-react';

export default function ScoutPassportWidget() {
  const { profile, openAuthModal } = useAuth();

  const xpCurrent = profile.total_xp % 200;
  const xpPercent = Math.min(100, Math.floor((xpCurrent / 200) * 100));

  const getTier = (level: number) => {
    if (level >= 15) return { name: 'Master Tactician', color: '#FFC72C', border: 'border-trophy-gold/50' };
    if (level >= 10) return { name: 'Elite Scout', color: '#2EFD72', border: 'border-neon-green/50' };
    if (level >= 5) return { name: 'Pro Scout', color: '#00E5FF', border: 'border-cyan-400/50' };
    return { name: 'Junior Scout', color: '#8E9F92', border: 'border-white/20' };
  };

  const tier = getTier(profile.level);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-pitch-card via-pitch-dark to-pitch-black p-5 shadow-2xl flex flex-col justify-between group hover:border-white/20 transition-all duration-300">
      {/* Background ambient glow */}
      <div
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl pointer-events-none opacity-20"
        style={{ backgroundColor: tier.color }}
      />

      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar with level badge ring */}
          <div className="relative">
            <div className={`relative h-13 w-13 rounded-2xl overflow-hidden border-2 ${tier.border} p-0.5 shadow-md`}>
              <Image
                src={profile.avatar_url || '/img/players/messi.jpg'}
                alt={profile.username}
                width={52}
                height={52}
                className="object-cover rounded-xl"
              />
            </div>
            <span
              className="absolute -bottom-1.5 -right-1.5 text-[9px] font-black px-1.5 py-0.2 rounded-md text-pitch-black font-orbitron shadow-sm"
              style={{ backgroundColor: tier.color }}
            >
              L{profile.level}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-base font-extrabold text-white font-outfit tracking-tight leading-tight">
                {profile.username}
              </h3>
              {profile.is_guest && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-text-muted">
                  GUEST
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: tier.color }}>
              <Award className="h-3 w-3" />
              <span>{tier.name}</span>
            </div>
          </div>
        </div>

        <Link
          href="/profile"
          onMouseEnter={() => sound.playHover()}
          onClick={() => sound.playClick()}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-text-secondary hover:text-white transition"
          title="View full career profile"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* XP Level Progression Bar */}
      <div className="space-y-1.5 my-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-text-muted flex items-center gap-1">
            <Zap className="h-3 w-3 text-neon-green" /> Level {profile.level} Progress
          </span>
          <span className="font-mono text-[11px] font-bold text-white">
            {xpCurrent} <span className="text-text-muted font-normal">/ 200 XP</span>
          </span>
        </div>

        <div className="h-2 w-full rounded-full bg-pitch-black overflow-hidden border border-white/5 p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-neon-green to-emerald-400 transition-all duration-500 shadow-neon"
            style={{ width: `${xpPercent}%` }}
          />
        </div>
      </div>

      {/* Bottom Quick Stats */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/5 text-center mt-2">
        <div className="p-1.5 rounded-xl bg-white/[0.02]">
          <div className="text-[10px] uppercase font-bold text-text-muted">Total XP</div>
          <div className="text-xs font-black font-orbitron text-neon-green">{profile.total_xp}</div>
        </div>
        <div className="p-1.5 rounded-xl bg-white/[0.02]">
          <div className="text-[10px] uppercase font-bold text-text-muted">Win Rate</div>
          <div className="text-xs font-black font-orbitron text-sky-400">
            {profile.games_played > 0
              ? `${Math.round((profile.games_won / profile.games_played) * 100)}%`
              : '—'}
          </div>
        </div>
        <div className="p-1.5 rounded-xl bg-white/[0.02]">
          <div className="text-[10px] uppercase font-bold text-text-muted">Coins</div>
          <div className="text-xs font-black font-orbitron text-trophy-gold">🪙 {profile.coins}</div>
        </div>
      </div>
    </div>
  );
}


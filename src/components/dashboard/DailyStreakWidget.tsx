'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from '@/context/auth-context';
import { sound } from '@/lib/utils/sound';
import { Flame, Gift, Check, Sparkles } from 'lucide-react';

export default function DailyStreakWidget() {
  const { profile, addXP } = useAuth();
  const [claimed, setClaimed] = useState(false);

  const days = [1, 2, 3, 4, 5, 6, 7];
  const activeDay = ((profile.current_streak - 1) % 7) + 1;

  const handleClaim = async () => {
    if (claimed) return;
    sound.playSuccess();
    setClaimed(true);
    await addXP(50, 'Daily Streak Login Bonus');
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#FFC72C', '#F59E0B', '#2EFD72'],
    });
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-pitch-card via-pitch-dark to-pitch-black p-5 shadow-2xl flex flex-col justify-between group hover:border-amber-500/30 transition-all duration-300">
      {/* Glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-amber-500/15 blur-2xl pointer-events-none" />

      {/* Top Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
            <Flame className="h-5 w-5 fill-amber-400 animate-pulse-slow" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-black tracking-widest text-text-muted">
              Daily Streak
            </div>
            <div className="text-xl font-black font-outfit text-white leading-none">
              {profile.current_streak} <span className="text-xs font-bold text-amber-400">Day Fire</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleClaim}
          disabled={claimed}
          onMouseEnter={() => sound.playHover()}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all shadow-sm ${
            claimed
              ? 'bg-white/10 text-text-muted cursor-default'
              : 'bg-amber-400 hover:bg-amber-300 text-pitch-black shadow-gold active:scale-95'
          }`}
        >
          {claimed ? (
            <>
              <Check className="h-3.5 w-3.5 text-neon-green" /> Claimed
            </>
          ) : (
            <>
              <Gift className="h-3.5 w-3.5" /> Claim +50 XP
            </>
          )}
        </button>
      </div>

      {/* 7-day Progress Track */}
      <div className="space-y-1.5 my-2">
        <div className="flex items-center justify-between text-[11px] font-semibold text-text-muted">
          <span>Weekly Milestone</span>
          <span className="text-amber-400 font-bold">Day {activeDay} of 7</span>
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {days.map(d => {
            const isCompleted = d < activeDay;
            const isCurrent = d === activeDay;
            return (
              <div
                key={d}
                className={`flex flex-col items-center justify-center p-1.5 rounded-xl border text-[10px] font-bold transition-all ${
                  isCurrent
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-gold'
                    : isCompleted
                    ? 'bg-neon-green/15 border-neon-green/30 text-neon-green'
                    : 'bg-white/[0.02] border-white/5 text-text-muted'
                }`}
              >
                <span>D{d}</span>
                {isCompleted ? (
                  <Check className="h-3 w-3 text-neon-green mt-0.5" />
                ) : (
                  <span className="text-[8px] text-text-muted font-normal mt-0.5">
                    {d === 7 ? '🎁' : '+30'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-2 text-[11px] text-text-muted flex items-center gap-1.5">
        <Sparkles className="h-3 w-3 text-amber-400" />
        <span>Maintain your streak to earn the Master Scout trophy</span>
      </div>
    </div>
  );
}


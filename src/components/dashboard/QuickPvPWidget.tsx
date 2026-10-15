'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { sound } from '@/lib/utils/sound';
import { Swords, Bot, Users, ArrowRight } from 'lucide-react';

export default function QuickPvPWidget() {
  const router = useRouter();
  const [code, setCode] = useState('');

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    sound.playClick();
    router.push(`/games/scouts-duel?join=${encodeURIComponent(code.trim().toUpperCase())}`);
  };

  const handleQuickAI = () => {
    sound.playClick();
    router.push('/games/scouts-duel?mode=ai');
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-rose-500/25 bg-gradient-to-br from-rose-950/30 via-pitch-dark to-pitch-black p-5 shadow-2xl flex flex-col justify-between group hover:border-rose-500/40 transition-all duration-300">
      {/* Ambient Glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-rose-500/15 blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <Swords className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-black tracking-widest text-rose-400">
                Live 1v1 Duel
              </span>
              <span className="flex h-1.5 w-1.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span>
              </span>
            </div>
            <div className="text-xl font-black font-outfit text-white leading-none">
              Scout&apos;s Arena
            </div>
          </div>
        </div>

        <button
          onClick={handleQuickAI}
          onMouseEnter={() => sound.playHover()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-black text-xs transition shadow-lg shadow-rose-500/20 active:scale-95"
        >
          <Bot className="h-3.5 w-3.5" /> Quick AI
        </button>
      </div>

      <p className="text-xs text-text-secondary leading-relaxed mb-3">
        Challenge an online scout or test deductive skills against the AI Tactical Manager.
      </p>

      {/* Code Input Form */}
      <form onSubmit={handleJoin} className="flex gap-2">
        <input
          type="text"
          placeholder="Room code (e.g. 8K2X9L)"
          maxLength={8}
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          className="flex-1 px-3 py-2 rounded-xl bg-pitch-black border border-white/10 text-white text-xs font-mono font-bold tracking-wider uppercase focus:outline-none focus:border-rose-400"
        />
        <button
          type="submit"
          disabled={!code.trim()}
          onMouseEnter={() => sound.playHover()}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs disabled:opacity-30 transition flex items-center gap-1"
        >
          <span>Join</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
}


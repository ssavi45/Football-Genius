'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { GAME_MODES } from '@/lib/constants/game-modes';
import { GameCategory } from '@/lib/types/games';
import { sound } from '@/lib/utils/sound';
import {
  Sparkles,
  Grid3X3,
  Swords,
  PlaneTakeoff,
  TrendingUp,
  MessageSquareQuote,
  Shuffle,
  Eye,
  ArrowRight,
  Play,
  Flame,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  Sparkles,
  Grid3X3,
  Swords,
  PlaneTakeoff,
  TrendingUp,
  MessageSquareQuote,
  Shuffle,
  Eye,
};

export default function GameModesExplorer() {
  const [selectedCategory, setSelectedCategory] = useState<GameCategory>('all');

  const filteredModes = GAME_MODES.filter(mode => {
    if (selectedCategory === 'all') return true;
    return mode.category === selectedCategory;
  });

  return (
    <section id="game-modes" className="space-y-4 pt-4">
      {/* Header and Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black font-outfit text-slate-900 tracking-tight">
            Explore All Game Modes
          </h2>
          <p className="text-xs text-slate-500">
            Select any challenge to test your football IQ and climb the global ladder
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex items-center bg-white p-1 rounded-2xl border border-blue-100 shadow-xs text-xs font-bold">
          {(['all', 'daily', 'trivia', 'pvp'] as GameCategory[]).map(cat => (
            <button
              key={cat}
              onClick={() => {
                sound.playClick();
                setSelectedCategory(cat);
              }}
              onMouseEnter={() => sound.playHover()}
              className={`px-3.5 py-1.5 rounded-xl capitalize transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-600 hover:text-blue-600'
              }`}
            >
              {cat === 'all' ? 'All (8)' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredModes.map(mode => {
          const Icon = ICON_MAP[mode.iconName] || Sparkles;
          return (
            <Link
              key={mode.id}
              href={mode.route}
              onMouseEnter={() => sound.playHover()}
              onClick={() => sound.playClick()}
              className="card-white card-white-hover rounded-3xl overflow-hidden flex flex-col justify-between group"
            >
              {/* Card Image Banner */}
              <div className="relative w-full h-38 overflow-hidden bg-slate-100">
                <Image
                  src={mode.cardArt}
                  alt={mode.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute top-3 left-3">
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-md font-black tracking-wider ${
                      mode.badge === 'DAILY'
                        ? 'bg-emerald-500 text-white'
                        : mode.badge === 'PVP'
                        ? 'bg-rose-500 text-white'
                        : mode.badge === 'HOT'
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-white/90 text-slate-800'
                    }`}
                  >
                    {mode.badge}
                  </span>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-4 w-4 text-blue-600" />
                    <h3 className="text-base font-extrabold font-outfit text-slate-900 group-hover:text-blue-600 transition-colors">
                      {mode.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {mode.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-bold text-blue-600">{mode.dailyReward}</span>
                  <span className="text-slate-400 group-hover:text-blue-600 transition flex items-center gap-1 font-semibold text-[11px]">
                    Play <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}


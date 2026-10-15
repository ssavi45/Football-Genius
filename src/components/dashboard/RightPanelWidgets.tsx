'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { sound } from '@/lib/utils/sound';
import {
  FileText,
  Star,
  Trophy,
  Target,
  ArrowRight,
  BookOpen,
  ChevronRight,
} from 'lucide-react';

interface RightPanelWidgetsProps {
  currentQuestion?: number;
  totalQuestions?: number;
  roundScore?: number;
  potentialPoints?: number;
  guessesLeft?: number;
}

const TOP_SCOUTS = [
  { rank: 1, name: 'AlexR10', pts: 120, avatar: '/img/players/messi.jpg', badgeColor: 'bg-amber-400 text-slate-900' },
  { rank: 2, name: 'FootyFan', pts: 118, avatar: '/img/players/bellingham.jpg', badgeColor: 'bg-slate-300 text-slate-900' },
  { rank: 3, name: 'TikTaka88', pts: 115, avatar: '/img/players/xavi.jpg', badgeColor: 'bg-amber-600 text-white' },
  { rank: 4, name: 'RedDevil7', pts: 112, avatar: '/img/players/rooney.jpg', badgeColor: 'bg-slate-100 text-slate-600' },
  { rank: 5, name: 'MessiMagic', pts: 109, avatar: '/img/players/cruyff.jpg', badgeColor: 'bg-slate-100 text-slate-600' },
];

export default function RightPanelWidgets({
  currentQuestion = 1,
  totalQuestions = 10,
  roundScore = 0,
  potentialPoints = 10,
  guessesLeft = 2,
}: RightPanelWidgetsProps) {
  return (
    <div className="space-y-4 w-full">
      {/* 1. Game Progress Card */}
      <div className="card-white rounded-3xl p-5 border border-blue-100/80 shadow-sm space-y-4">
        {/* Title & Fraction */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black font-outfit text-slate-900">
            Game Progress
          </h3>
          <span className="text-xs font-black font-outfit text-slate-900">
            {currentQuestion} / {totalQuestions}
          </span>
        </div>

        {/* 10 Progress Step Dots */}
        <div className="flex items-center justify-between gap-1.5">
          {Array.from({ length: totalQuestions }).map((_, idx) => {
            const isFilled = idx + 1 <= currentQuestion;
            return (
              <div
                key={idx}
                className={`h-2.5 flex-1 rounded-full transition-all duration-300 ${
                  isFilled
                    ? 'bg-blue-600 shadow-sm shadow-blue-500/50'
                    : 'bg-slate-200'
                }`}
              />
            );
          })}
        </div>

        {/* 2x2 Grid of Stat Tiles */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          {/* Question Tile */}
          <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100/80 flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-500">Question</div>
              <div className="text-xs font-black font-outfit text-slate-900">
                {currentQuestion} / {totalQuestions}
              </div>
            </div>
          </div>

          {/* Round Score Tile */}
          <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-100/80 flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <Star className="h-4 w-4 fill-amber-400" />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-500">Round Score</div>
              <div className="text-xs font-black font-outfit text-slate-900">
                {roundScore} pts
              </div>
            </div>
          </div>

          {/* Potential Tile */}
          <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-100/80 flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <Trophy className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-500">Potential</div>
              <div className="text-xs font-black font-outfit text-slate-900">
                {potentialPoints} pts
              </div>
            </div>
          </div>

          {/* Guesses Left Tile */}
          <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-100/80 flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
              <Target className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-500">Guesses Left</div>
              <div className="text-xs font-black font-outfit text-slate-900">
                {guessesLeft}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Leaderboard (Top 5) Card */}
      <div className="card-white rounded-3xl p-5 border border-blue-100/80 shadow-sm space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black font-outfit text-slate-900">
            Leaderboard <span className="text-xs font-semibold text-slate-400">(Top 5)</span>
          </h3>
          <Link
            href="/leaderboard"
            onMouseEnter={() => sound.playHover()}
            onClick={() => sound.playClick()}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 transition"
          >
            <span>View All</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Column Subheaders */}
        <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 px-1 border-b border-slate-100 pb-1.5">
          <div className="flex items-center gap-3">
            <span className="w-4">#</span>
            <span>Player</span>
          </div>
          <span>Total Pts</span>
        </div>

        {/* Top 5 Rows */}
        <div className="space-y-2">
          {TOP_SCOUTS.map(scout => (
            <div
              key={scout.rank}
              className="flex items-center justify-between p-1.5 rounded-xl hover:bg-slate-50 transition"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${scout.badgeColor}`}
                >
                  {scout.rank}
                </span>
                <div className="relative h-6 w-6 rounded-full overflow-hidden border border-slate-200">
                  <Image
                    src={scout.avatar}
                    alt={scout.name}
                    fill
                    sizes="24px"
                    className="object-cover"
                  />
                </div>
                <span className="text-xs font-bold text-slate-800">
                  {scout.name}
                </span>
              </div>
              <span className="text-xs font-black font-outfit text-slate-900">
                {scout.pts}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. How to Play Card (Mint Green Card) */}
      <div className="rounded-3xl p-4.5 bg-emerald-50/70 border border-emerald-200/80 shadow-sm space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
              <BookOpen className="h-4 w-4" />
            </div>
            <h4 className="text-sm font-black font-outfit text-emerald-950">
              How to play
            </h4>
          </div>
          <ChevronRight className="h-4 w-4 text-emerald-600" />
        </div>

        {/* 4 Steps */}
        <ol className="space-y-2 text-xs text-slate-700">
          <li className="flex items-start gap-2">
            <span className="h-4 w-4 rounded-full bg-emerald-200/70 text-emerald-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
              1
            </span>
            <span>Predict the exact score for each match.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="h-4 w-4 rounded-full bg-emerald-200/70 text-emerald-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
              2
            </span>
            <span>Earn points based on correct predictions.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="h-4 w-4 rounded-full bg-emerald-200/70 text-emerald-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
              3
            </span>
            <span>Use hints if you need help.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="h-4 w-4 rounded-full bg-emerald-200/70 text-emerald-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
              4
            </span>
            <span>Complete all questions to climb the leaderboard!</span>
          </li>
        </ol>
      </div>
    </div>
  );
}


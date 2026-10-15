'use client';

import React from 'react';
import { sound } from '@/lib/utils/sound';
import { Minus, Plus } from 'lucide-react';

interface DigitalScoreboardProps {
  homeScore: number;
  awayScore: number;
  onHomeChange: (newScore: number) => void;
  onAwayChange: (newScore: number) => void;
}

export default function DigitalScoreboard({
  homeScore,
  awayScore,
  onHomeChange,
  onAwayChange,
}: DigitalScoreboardProps) {
  const handleDecHome = () => {
    sound.playClick();
    onHomeChange(Math.max(0, homeScore - 1));
  };

  const handleIncHome = () => {
    sound.playClick();
    onHomeChange(Math.min(9, homeScore + 1));
  };

  const handleDecAway = () => {
    sound.playClick();
    onAwayChange(Math.max(0, awayScore - 1));
  };

  const handleIncAway = () => {
    sound.playClick();
    onAwayChange(Math.min(9, awayScore + 1));
  };

  return (
    <div className="relative inline-flex items-center p-3 sm:p-4 rounded-3xl scoreboard-chassis border-4 border-slate-200/90 shadow-2xl select-none">
      {/* Corner Mounting Rivets / Screws */}
      <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-slate-400 border border-slate-500 shadow-inner" />
      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-slate-400 border border-slate-500 shadow-inner" />
      <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-slate-400 border border-slate-500 shadow-inner" />
      <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-slate-400 border border-slate-500 shadow-inner" />

      {/* Side Ventilation Slots */}
      <div className="absolute left-1.5 top-1/2 -translate-y-1/2 flex flex-col gap-1">
        <div className="w-1 h-3 rounded-full bg-slate-400 shadow-inner" />
        <div className="w-1 h-3 rounded-full bg-slate-400 shadow-inner" />
        <div className="w-1 h-3 rounded-full bg-slate-400 shadow-inner" />
      </div>
      <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex flex-col gap-1">
        <div className="w-1 h-3 rounded-full bg-slate-400 shadow-inner" />
        <div className="w-1 h-3 rounded-full bg-slate-400 shadow-inner" />
        <div className="w-1 h-3 rounded-full bg-slate-400 shadow-inner" />
      </div>

      <div className="flex items-center gap-3 sm:gap-4 px-2">
        {/* Left: Home Team Digital Display (RED LED) */}
        <div className="flex flex-col items-center gap-2.5">
          {/* Recessed Screen */}
          <div className="w-24 sm:w-28 h-20 sm:h-24 rounded-2xl scoreboard-display-bezel flex items-center justify-center p-2 relative overflow-hidden border border-slate-800">
            {/* LED Matrix Grid Background Pattern */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(#FF2A4B 1.5px, transparent 1.5px)',
                backgroundSize: '6px 6px',
              }}
            />
            {/* Glowing Digit */}
            <span className="text-4xl sm:text-5xl font-black font-orbitron digit-red-glow relative z-10 transition-transform active:scale-110">
              {homeScore}
            </span>
          </div>

          {/* Home Buttons: Minus and Plus with Red Accent */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDecHome}
              onMouseEnter={() => sound.playHover()}
              className="h-8 w-8 rounded-full bg-white hover:bg-red-50 border-2 border-red-300 text-red-600 flex items-center justify-center shadow-sm active:scale-90 transition-transform font-bold"
              aria-label="Decrease home score"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={handleIncHome}
              onMouseEnter={() => sound.playHover()}
              className="h-8 w-8 rounded-full bg-white hover:bg-red-50 border-2 border-red-300 text-red-600 flex items-center justify-center shadow-sm active:scale-90 transition-transform font-bold"
              aria-label="Increase home score"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Center Console: Status LEDs & Speaker Grilles */}
        <div className="flex flex-col items-center justify-center gap-2 px-1">
          {/* Top Grille */}
          <div className="grid grid-cols-3 gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          </div>

          {/* Two Green Status LEDs */}
          <div className="flex flex-col gap-2 my-1">
            <div className="w-2.5 h-2.5 rounded-full led-green-glow" />
            <div className="w-2.5 h-2.5 rounded-full led-green-glow" />
          </div>

          {/* Bottom Grille */}
          <div className="grid grid-cols-3 gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          </div>
        </div>

        {/* Right: Away Team Digital Display (BLUE LED) */}
        <div className="flex flex-col items-center gap-2.5">
          {/* Recessed Screen */}
          <div className="w-24 sm:w-28 h-20 sm:h-24 rounded-2xl scoreboard-display-bezel flex items-center justify-center p-2 relative overflow-hidden border border-slate-800">
            {/* LED Matrix Grid Background Pattern */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(#38BDF8 1.5px, transparent 1.5px)',
                backgroundSize: '6px 6px',
              }}
            />
            {/* Glowing Digit */}
            <span className="text-4xl sm:text-5xl font-black font-orbitron digit-blue-glow relative z-10 transition-transform active:scale-110">
              {awayScore}
            </span>
          </div>

          {/* Away Buttons: Minus and Plus with Blue Accent */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDecAway}
              onMouseEnter={() => sound.playHover()}
              className="h-8 w-8 rounded-full bg-white hover:bg-blue-50 border-2 border-blue-300 text-blue-600 flex items-center justify-center shadow-sm active:scale-90 transition-transform font-bold"
              aria-label="Decrease away score"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={handleIncAway}
              onMouseEnter={() => sound.playHover()}
              className="h-8 w-8 rounded-full bg-white hover:bg-blue-50 border-2 border-blue-300 text-blue-600 flex items-center justify-center shadow-sm active:scale-90 transition-transform font-bold"
              aria-label="Increase away score"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


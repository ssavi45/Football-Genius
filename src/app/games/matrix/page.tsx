'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { useAuth } from '@/context/auth-context';
import gridPlayersData from '@/data/grid-players.json';
import {
  ArrowLeft,
  Grid3X3,
  Search,
  X,
  Sparkles,
  Trophy,
  Share2,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface GridPlayerEntry {
  name: string;
  clubs: string[];
  nation: string;
  stats: string[];
}

interface Criterion {
  id: string;
  label: string;
  type: 'club' | 'nation' | 'stat';
  value: string;
}

export default function FootballMatrixPage() {
  const { addXP, recordGameResult } = useAuth();

  // Daily Puzzle Criteria
  const rowCriteria: Criterion[] = useMemo(
    () => [
      { id: 'r1', label: 'Real Madrid', type: 'club', value: 'Real Madrid' },
      { id: 'r2', label: 'Barcelona', type: 'club', value: 'Barcelona' },
      { id: 'r3', label: 'Man United', type: 'club', value: 'Man United' },
    ],
    []
  );

  const colCriteria: Criterion[] = useMemo(
    () => [
      { id: 'c1', label: 'World Cup Winner', type: 'stat', value: 'worldcup' },
      { id: 'c2', label: 'Ballon d\'Or', type: 'stat', value: 'ballondor' },
      { id: 'c3', label: 'France', type: 'nation', value: 'France' },
    ],
    []
  );

  // 9 cells state: null or player name
  const [grid, setGrid] = useState<(string | null)[]>(Array(9).fill(null));
  const [selectedCellIndex, setSelectedCellIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [guessesLeft, setGuessesLeft] = useState(9);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [copied, setCopied] = useState(false);

  // Filter players list for search modal
  const filteredPlayers = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase();
    const usedNames = grid.filter(Boolean);
    return (gridPlayersData as GridPlayerEntry[])
      .filter(p => p.name.toLowerCase().includes(q) && !usedNames.includes(p.name))
      .slice(0, 8);
  }, [searchQuery, grid]);

  // Check if player satisfies criterion
  const satisfies = (player: GridPlayerEntry, criterion: Criterion): boolean => {
    if (criterion.type === 'club') {
      return player.clubs.some(c => c.toLowerCase() === criterion.value.toLowerCase());
    }
    if (criterion.type === 'nation') {
      return player.nation.toLowerCase() === criterion.value.toLowerCase();
    }
    if (criterion.type === 'stat') {
      return player.stats.includes(criterion.value);
    }
    return false;
  };

  const handleSelectPlayer = async (player: GridPlayerEntry) => {
    if (selectedCellIndex === null) return;

    const rowIdx = Math.floor(selectedCellIndex / 3);
    const colIdx = selectedCellIndex % 3;

    const rowCrit = rowCriteria[rowIdx];
    const colCrit = colCriteria[colIdx];

    const matchRow = satisfies(player, rowCrit);
    const matchCol = satisfies(player, colCrit);

    if (matchRow && matchCol) {
      // Correct!
      const newGrid = [...grid];
      newGrid[selectedCellIndex] = player.name;
      setGrid(newGrid);
      setSelectedCellIndex(null);
      setSearchQuery('');
      setErrorMessage(null);
      await addXP(25, 'Football Matrix Cell');

      // Check if grid is full
      const filledCount = newGrid.filter(Boolean).length;
      if (filledCount === 9) {
        setIsCompleted(true);
        await addXP(100, 'Football Matrix 9/9 Perfect Grid');
        await recordGameResult('matrix', true, 325);
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.5 },
          colors: ['#FFC72C', '#2EFD72', '#00E5FF'],
        });
      }
    } else {
      // Incorrect
      const newGuesses = guessesLeft - 1;
      setGuessesLeft(newGuesses);
      setErrorMessage(
        `${player.name} does not meet both "${rowCrit.label}" and "${colCrit.label}".`
      );
      if (newGuesses <= 0) {
        setIsCompleted(true);
        await recordGameResult('matrix', false, 50);
      }
    }
  };

  const handleShare = () => {
    const emojis = grid
      .map((val, idx) => {
        const item = val ? '🟩' : '⬛';
        return (idx + 1) % 3 === 0 ? item + '\n' : item;
      })
      .join('');

    const text = `FootyGen Matrix ⚽\nGuesses: ${9 - guessesLeft}/9\n\n${emojis}\nPlay at footygen.online`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setGrid(Array(9).fill(null));
    setSelectedCellIndex(null);
    setSearchQuery('');
    setGuessesLeft(9);
    setErrorMessage(null);
    setIsCompleted(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fadeIn">
      {/* Header Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-white transition px-3 py-2 rounded-xl bg-pitch-card border border-white/5"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Arena
        </Link>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded-full text-xs font-black bg-trophy-gold/10 text-trophy-gold border border-trophy-gold/30">
            Guesses: {guessesLeft} / 9
          </div>
          <button
            onClick={handleReset}
            className="p-2 rounded-xl text-text-secondary hover:text-white hover:bg-white/10 transition"
            title="Reset Grid"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Game Title & Instructions */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black font-orbitron text-white">
          FOOTBALL <span className="text-trophy-gold">MATRIX</span>
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary max-w-xl mx-auto">
          Match players who satisfy both the row club/nation and column trophy/criteria. Fill all 9 cells to earn the Master Scout badge.
        </p>
      </div>

      {/* The 3x3 Grid Board */}
      <div className="relative max-w-2xl mx-auto bg-pitch-dark/95 p-3 sm:p-6 rounded-3xl border border-white/10 shadow-2xl">
        {/* Top Column Criteria Labels */}
        <div className="grid grid-cols-4 gap-2 mb-2 text-center items-center">
          <div className="text-[11px] font-black uppercase tracking-wider text-text-muted">
            Criteria
          </div>
          {colCriteria.map(col => (
            <div
              key={col.id}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-xs sm:text-sm font-extrabold text-neon-green flex flex-col items-center justify-center min-h-[48px]"
            >
              <span>{col.label}</span>
            </div>
          ))}
        </div>

        {/* 3 Rows */}
        {rowCriteria.map((row, rowIdx) => (
          <div key={row.id} className="grid grid-cols-4 gap-2 mb-2 items-center">
            {/* Row Label Header */}
            <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-xs sm:text-sm font-extrabold text-trophy-gold flex items-center justify-center text-center min-h-[72px] sm:min-h-[96px]">
              {row.label}
            </div>

            {/* 3 Cells in Row */}
            {[0, 1, 2].map(colIdx => {
              const cellIdx = rowIdx * 3 + colIdx;
              const val = grid[cellIdx];
              const isSelected = selectedCellIndex === cellIdx;

              return (
                <button
                  key={cellIdx}
                  disabled={Boolean(val) || isCompleted}
                  onClick={() => {
                    setSelectedCellIndex(cellIdx);
                    setSearchQuery('');
                    setErrorMessage(null);
                  }}
                  className={`relative flex flex-col items-center justify-center p-2 rounded-2xl border transition-all duration-200 min-h-[72px] sm:min-h-[96px] ${
                    val
                      ? 'bg-neon-green/15 border-neon-green/50 text-white shadow-neon'
                      : isSelected
                      ? 'bg-white/10 border-white text-white scale-[1.02]'
                      : 'bg-pitch-card hover:bg-pitch-cardHover border-white/5 text-text-secondary hover:border-white/20'
                  }`}
                >
                  {val ? (
                    <div className="flex flex-col items-center text-center">
                      <CheckCircle2 className="h-4 w-4 text-neon-green mb-1" />
                      <span className="text-xs sm:text-sm font-black font-outfit text-white leading-tight line-clamp-2">
                        {val}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-text-muted hover:text-white">
                      <span className="text-xs font-bold font-outfit">Select</span>
                      <span className="text-[10px] text-text-muted">Player</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Search Autocomplete Modal */}
      {selectedCellIndex !== null && !isCompleted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-2xl bg-pitch-dark border border-white/15 p-6 shadow-2xl">
            <button
              onClick={() => setSelectedCellIndex(null)}
              className="absolute top-4 right-4 p-2 text-text-secondary hover:text-white rounded-full hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-4">
              <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                Cell Criteria
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-3 py-1 rounded-lg bg-trophy-gold/15 text-trophy-gold text-xs font-black">
                  {rowCriteria[Math.floor(selectedCellIndex / 3)].label}
                </span>
                <span className="text-xs text-text-muted font-bold">+</span>
                <span className="px-3 py-1 rounded-lg bg-neon-green/15 text-neon-green text-xs font-black">
                  {colCriteria[selectedCellIndex % 3].label}
                </span>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative mb-4">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-text-muted" />
              <input
                type="text"
                autoFocus
                placeholder="Search player name (e.g. Zidane, Henry, Benzema)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-pitch-black border border-white/15 text-white text-sm focus:outline-none focus:border-neon-green transition"
              />
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Search Results */}
            <div className="space-y-1.5 max-h-60 overflow-y-auto scrollbar-thin">
              {filteredPlayers.length > 0 ? (
                filteredPlayers.map(p => (
                  <button
                    key={p.name}
                    onClick={() => handleSelectPlayer(p)}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-pitch-card hover:bg-white/10 text-left transition border border-white/5"
                  >
                    <div>
                      <div className="text-sm font-bold text-white">{p.name}</div>
                      <div className="text-xs text-text-muted">
                        {p.nation} • {p.clubs.slice(0, 3).join(', ')}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-neon-green">Select</span>
                  </button>
                ))
              ) : searchQuery.length >= 2 ? (
                <div className="text-center py-6 text-text-muted text-xs">
                  No matching players found in database
                </div>
              ) : (
                <div className="text-center py-6 text-text-muted text-xs">
                  Type at least 2 characters to search
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Completion Dialog */}
      {isCompleted && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-pitch-card to-pitch-dark border border-white/10 text-center space-y-4 max-w-xl mx-auto shadow-2xl">
          <Trophy className="h-10 w-10 text-trophy-gold mx-auto" />
          <h2 className="text-2xl font-black font-orbitron text-white">
            {grid.filter(Boolean).length === 9 ? 'PERFECT GRID! (9/9)' : 'PUZZLE FINISHED'}
          </h2>
          <p className="text-xs text-text-secondary">
            You completed {grid.filter(Boolean).length} / 9 cells with {guessesLeft} guesses left.
          </p>

          <div className="flex justify-center gap-3">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neon-green text-pitch-black font-black text-xs transition shadow-neon"
            >
              <Share2 className="h-4 w-4" />
              {copied ? 'Copied to Clipboard!' : 'Share Result'}
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 text-white font-bold text-xs hover:bg-white/20 transition"
            >
              <RotateCcw className="h-4 w-4" /> Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


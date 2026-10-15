'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/auth-context';
import { supabase } from '@/lib/supabase/client';
import { LeaderboardEntry } from '@/lib/types/games';
import {
  ArrowLeft,
  Trophy,
  Medal,
  Flame,
  Zap,
  Crown,
  Search,
  Filter,
} from 'lucide-react';

const FALLBACK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, user_id: 'u1', username: 'CruyffTactician', avatar_url: '/img/players/cruyff.jpg', score: 3840, level: 19 },
  { rank: 2, user_id: 'u2', username: 'BernabeuKing', avatar_url: '/img/players/zidane.jpg', score: 3420, level: 17 },
  { rank: 3, user_id: 'u3', username: 'CampNouMaestro', avatar_url: '/img/players/messi.jpg', score: 3180, level: 16 },
  { rank: 4, user_id: 'u4', username: 'KloppHeavyMetal', avatar_url: '/img/players/salah.jpg', score: 2890, level: 14 },
  { rank: 5, user_id: 'u5', username: 'CalcioStrategist', avatar_url: '/img/players/maldini.jpg', score: 2640, level: 13 },
  { rank: 6, user_id: 'u6', username: 'TikiTakaMaster', avatar_url: '/img/players/xavi.jpg', score: 2410, level: 12 },
  { rank: 7, user_id: 'u7', username: 'GoldenBootHunter', avatar_url: '/img/players/haaland.jpg', score: 2190, level: 11 },
  { rank: 8, user_id: 'u8', username: 'SambaMagic10', avatar_url: '/img/players/ronaldinho.jpg', score: 1980, level: 10 },
];

export default function LeaderboardPage() {
  const { profile } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>(FALLBACK_LEADERBOARD);
  const [filterTime, setFilterTime] = useState<'all' | 'weekly' | 'daily'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, total_xp, streak_days')
          .order('total_xp', { ascending: false })
          .limit(50);

        if (data && data.length > 0) {
          const mapped: LeaderboardEntry[] = data.map((item, idx) => ({
            rank: idx + 1,
            user_id: item.id,
            username: item.username || 'ScoutPro',
            avatar_url: item.avatar_url || '/img/players/bellingham.jpg',
            score: item.total_xp || 0,
            level: Math.floor((item.total_xp || 0) / 200) + 1,
            is_current_user: item.id === profile.id,
          }));

          // Ensure current user is included if not in top 50
          if (!mapped.some(m => m.user_id === profile.id)) {
            mapped.push({
              rank: 99,
              user_id: profile.id,
              username: profile.username,
              avatar_url: profile.avatar_url,
              score: profile.total_xp,
              level: profile.level,
              is_current_user: true,
            });
          }

          setEntries(mapped);
        } else {
          // Merge current user into fallback
          const merged = [...FALLBACK_LEADERBOARD];
          merged.push({
            rank: 9,
            user_id: profile.id,
            username: profile.username + ' (You)',
            avatar_url: profile.avatar_url,
            score: profile.total_xp,
            level: profile.level,
            is_current_user: true,
          });
          setEntries(merged.sort((a, b) => b.score - a.score).map((item, idx) => ({ ...item, rank: idx + 1 })));
        }
      } catch (err) {
        console.warn('Leaderboard fetch fallback:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLeaderboard();
  }, [profile]);

  const top3 = entries.slice(0, 3);
  const remaining = entries.slice(3);

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
        <span className="px-3 py-1 rounded-full text-xs font-black bg-trophy-gold/10 text-trophy-gold border border-trophy-gold/30 flex items-center gap-1">
          <Trophy className="h-3.5 w-3.5" /> Hall of Fame
        </span>
      </div>

      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black font-orbitron text-white">
          GLOBAL <span className="text-trophy-gold">LEADERBOARD</span>
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary max-w-xl mx-auto">
          The ultimate ranking of football encyclopedias and tactical scouts worldwide.
        </p>
      </div>

      {/* Timeframe Filter Pills */}
      <div className="flex justify-center">
        <div className="flex items-center bg-pitch-card p-1 rounded-2xl border border-white/10 text-xs font-bold">
          {(['all', 'weekly', 'daily'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilterTime(tab)}
              className={`px-4 py-2 rounded-xl capitalize transition ${
                filterTime === tab
                  ? 'bg-neon-green text-pitch-black font-black shadow-neon'
                  : 'text-text-secondary hover:text-white'
              }`}
            >
              {tab === 'all' ? 'All Time' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-6 max-w-2xl mx-auto items-end">
        {/* 2nd Place */}
        {top3[1] && (
          <div className="flex flex-col items-center p-4 rounded-2xl bg-pitch-card border border-white/10 text-center space-y-2">
            <div className="relative">
              <div className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-full overflow-hidden border-2 border-slate-300 shadow-lg">
                <Image
                  src={top3[1].avatar_url || '/img/players/zidane.jpg'}
                  alt={top3[1].username}
                  fill
                  className="object-cover"
                />
              </div>
              <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-slate-300 text-pitch-black font-black text-xs flex items-center justify-center">
                2
              </span>
            </div>
            <div className="text-xs sm:text-sm font-bold text-white truncate max-w-full">
              {top3[1].username}
            </div>
            <div className="text-xs font-black text-slate-300">
              {top3[1].score} XP
            </div>
          </div>
        )}

        {/* 1st Place (Crown) */}
        {top3[0] && (
          <div className="flex flex-col items-center p-5 rounded-3xl bg-gradient-to-b from-trophy-gold/20 via-pitch-card to-pitch-dark border-2 border-trophy-gold/50 text-center space-y-2 -translate-y-4 shadow-2xl shadow-trophy-gold/10">
            <Crown className="h-6 w-6 text-trophy-gold animate-bounce" />
            <div className="relative">
              <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-full overflow-hidden border-2 border-trophy-gold shadow-gold">
                <Image
                  src={top3[0].avatar_url || '/img/players/cruyff.jpg'}
                  alt={top3[0].username}
                  fill
                  className="object-cover"
                />
              </div>
              <span className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-trophy-gold text-pitch-black font-black text-xs flex items-center justify-center">
                1
              </span>
            </div>
            <div className="text-sm sm:text-base font-black text-white truncate max-w-full">
              {top3[0].username}
            </div>
            <div className="text-sm font-black text-trophy-gold">
              {top3[0].score} XP
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {top3[2] && (
          <div className="flex flex-col items-center p-4 rounded-2xl bg-pitch-card border border-white/10 text-center space-y-2">
            <div className="relative">
              <div className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-full overflow-hidden border-2 border-amber-700 shadow-lg">
                <Image
                  src={top3[2].avatar_url || '/img/players/messi.jpg'}
                  alt={top3[2].username}
                  fill
                  className="object-cover"
                />
              </div>
              <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-amber-700 text-white font-black text-xs flex items-center justify-center">
                3
              </span>
            </div>
            <div className="text-xs sm:text-sm font-bold text-white truncate max-w-full">
              {top3[2].username}
            </div>
            <div className="text-xs font-black text-amber-500">
              {top3[2].score} XP
            </div>
          </div>
        )}
      </div>

      {/* Leaderboard Table */}
      <div className="rounded-2xl border border-white/10 bg-pitch-card overflow-hidden shadow-2xl">
        <div className="divide-y divide-white/5">
          {remaining.map(entry => {
            const isUser = entry.user_id === profile.id || entry.is_current_user;
            return (
              <div
                key={entry.rank + entry.user_id}
                className={`flex items-center justify-between p-4 transition ${
                  isUser
                    ? 'bg-neon-green/10 border-l-4 border-neon-green font-bold'
                    : 'hover:bg-white/[0.02]'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="w-6 text-sm font-black text-text-muted text-center">
                    #{entry.rank}
                  </span>
                  <div className="relative h-10 w-10 rounded-full overflow-hidden border border-white/10">
                    <Image
                      src={entry.avatar_url || '/img/players/messi.jpg'}
                      alt={entry.username}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{entry.username}</span>
                      {isUser && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-neon-green text-pitch-black font-black">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-text-muted">
                      Level {entry.level || 1} Scout
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-black font-orbitron text-neon-green">
                    {entry.score} XP
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


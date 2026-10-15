'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import { useAuth } from '@/context/auth-context';
import duelPlayersData from '@/data/scouts-duel-players.json';
import {
  ArrowLeft,
  Swords,
  Bot,
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Trophy,
  RotateCcw,
  Zap,
  HelpCircle,
  Copy,
  Check,
} from 'lucide-react';

interface ScoutPlayer {
  id: string;
  name: string;
  image: string;
  nationality: string;
  club: string;
  league: string;
  position: string;
  isRetired: boolean;
  footedness: string;
  ballonDor: boolean;
  worldCupWinner: boolean;
  clWinner: boolean;
  premierLeague: boolean;
  laLiga: boolean;
}

type QuestionType =
  | 'is_forward'
  | 'is_midfielder'
  | 'is_defender'
  | 'is_gk'
  | 'is_epl'
  | 'is_laliga'
  | 'won_ucl'
  | 'won_worldcup'
  | 'won_ballondor'
  | 'is_right_footed'
  | 'is_retired';

interface QuestionLog {
  id: string;
  asker: 'player' | 'ai';
  text: string;
  answer: boolean;
}

export default function ScoutsDuelPage() {
  const { profile, addXP, recordGameResult } = useAuth();

  const [gameMode, setGameMode] = useState<'lobby' | 'ai' | 'online'>('lobby');
  const [roomCode, setRoomCode] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  // In-game state
  const [targetPlayer, setTargetPlayer] = useState<ScoutPlayer | null>(null);
  const [logs, setLogs] = useState<QuestionLog[]>([]);
  const [turn, setTurn] = useState<'player' | 'ai'>('player');
  const [directGuessQuery, setDirectGuessQuery] = useState('');
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState<'player' | 'ai' | null>(null);
  const [remainingCount, setRemainingCount] = useState<number>(duelPlayersData.length);

  const playersList = duelPlayersData as ScoutPlayer[];

  // Start game vs AI
  const startAIGame = () => {
    const randomPlayer = playersList[Math.floor(Math.random() * playersList.length)];
    setTargetPlayer(randomPlayer);
    setLogs([]);
    setTurn('player');
    setIsGameOver(false);
    setWinner(null);
    setRemainingCount(playersList.length);
    setGameMode('ai');
  };

  const handleAskQuestion = (qType: QuestionType, text: string) => {
    if (!targetPlayer || turn !== 'player' || isGameOver) return;

    let answer = false;
    switch (qType) {
      case 'is_forward':
        answer = targetPlayer.position.toUpperCase() === 'FWD' || targetPlayer.position.toUpperCase() === 'ST';
        break;
      case 'is_midfielder':
        answer = targetPlayer.position.toUpperCase() === 'MID';
        break;
      case 'is_defender':
        answer = targetPlayer.position.toUpperCase() === 'DEF';
        break;
      case 'is_gk':
        answer = targetPlayer.position.toUpperCase() === 'GK';
        break;
      case 'is_epl':
        answer = targetPlayer.league.toLowerCase().includes('premier');
        break;
      case 'is_laliga':
        answer = targetPlayer.league.toLowerCase().includes('laliga') || targetPlayer.league.toLowerCase().includes('la liga');
        break;
      case 'won_ucl':
        answer = Boolean(targetPlayer.clWinner);
        break;
      case 'won_worldcup':
        answer = Boolean(targetPlayer.worldCupWinner);
        break;
      case 'won_ballondor':
        answer = Boolean(targetPlayer.ballonDor);
        break;
      case 'is_right_footed':
        answer = targetPlayer.footedness.toLowerCase() === 'right';
        break;
      case 'is_retired':
        answer = Boolean(targetPlayer.isRetired);
        break;
    }

    const newLog: QuestionLog = {
      id: Math.random().toString(),
      asker: 'player',
      text,
      answer,
    };

    setLogs(prev => [newLog, ...prev]);

    // AI Turn simulation
    setTurn('ai');
    setTimeout(() => {
      runAITurn();
    }, 1200);
  };

  const runAITurn = () => {
    if (isGameOver || !targetPlayer) return;

    const aiQuestions: { text: string; answer: boolean }[] = [
      { text: 'Does the player play in Europe?', answer: true },
      { text: 'Has the player won major trophies?', answer: targetPlayer.clWinner || targetPlayer.worldCupWinner },
      { text: 'Is the player right-footed?', answer: targetPlayer.footedness.toLowerCase() === 'right' },
    ];

    const chosen = aiQuestions[Math.floor(Math.random() * aiQuestions.length)];
    const aiLog: QuestionLog = {
      id: Math.random().toString(),
      asker: 'ai',
      text: chosen.text,
      answer: chosen.answer,
    };

    setLogs(prev => [aiLog, ...prev]);
    setTurn('player');
  };

  const handleDirectGuess = async () => {
    if (!targetPlayer || isGameOver || !directGuessQuery.trim()) return;

    const guess = directGuessQuery.trim().toLowerCase();
    const isCorrect =
      targetPlayer.name.toLowerCase() === guess ||
      targetPlayer.name.toLowerCase().includes(guess);

    if (isCorrect) {
      setIsGameOver(true);
      setWinner('player');
      await addXP(200, "Scout's Duel Victory");
      await recordGameResult('scouts-duel', true, 200);
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#FF3366', '#2EFD72', '#FFC72C'],
      });
    } else {
      const wrongLog: QuestionLog = {
        id: Math.random().toString(),
        asker: 'player',
        text: `Is the player "${directGuessQuery}"?`,
        answer: false,
      };
      setLogs(prev => [wrongLog, ...prev]);
      setDirectGuessQuery('');
      setTurn('ai');
      setTimeout(runAITurn, 1200);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fadeIn">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-white transition px-3 py-2 rounded-xl bg-pitch-card border border-white/5"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Arena
        </Link>
        <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-500/15 text-rose-400 border border-rose-500/30">
          1v1 Scout Showdown
        </span>
      </div>

      {/* Lobby Selector */}
      {gameMode === 'lobby' ? (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl sm:text-4xl font-black font-orbitron text-white">
              SCOUT&apos;S <span className="text-rose-500">DUEL</span>
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary max-w-xl mx-auto">
              Test your deductive tactical knowledge against the AI Manager or invite a friend to an online lobby. Guess the secret player in fewer turns!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {/* AI Opponent Card */}
            <div className="rounded-2xl border border-white/10 bg-pitch-card p-6 flex flex-col justify-between space-y-6 hover:border-rose-500/40 transition">
              <div className="space-y-3">
                <div className="h-12 w-12 rounded-xl bg-neon-green/10 border border-neon-green/30 flex items-center justify-center text-neon-green">
                  <Bot className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold font-outfit text-white">
                  Duel AI Tactical Manager
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Instant play with 0 wait time. Our tactical bot responds with smart yes/no answers and tests your player database recall.
                </p>
              </div>

              <button
                onClick={startAIGame}
                className="w-full py-3.5 rounded-xl bg-neon-green hover:bg-neon-green/90 text-pitch-black font-black text-xs transition shadow-neon active:scale-95"
              >
                START AI MATCH NOW (+200 XP)
              </button>
            </div>

            {/* Online Friend Room */}
            <div className="rounded-2xl border border-white/10 bg-pitch-card p-6 flex flex-col justify-between space-y-6 hover:border-sky-500/40 transition">
              <div className="space-y-3">
                <div className="h-12 w-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold font-outfit text-white">
                  Custom PvP Room
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Challenge a friend in real time with a 6-digit room code.
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
                    setRoomCode(code);
                    startAIGame();
                  }}
                  className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition"
                >
                  Create New Room Code
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Active Game Board */
        <div className="space-y-6">
          {/* Match Scoreboard */}
          <div className="p-4 rounded-2xl bg-pitch-card border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 rounded-full overflow-hidden border border-neon-green">
                <Image
                  src={profile.avatar_url || '/img/players/messi.jpg'}
                  alt={profile.username}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <div className="text-sm font-bold text-white">{profile.username}</div>
                <div className="text-[10px] text-neon-green font-bold uppercase">Your Turn</div>
              </div>
            </div>

            <div className="px-4 py-1.5 rounded-full bg-pitch-black border border-white/15 text-xs font-black font-orbitron text-trophy-gold">
              VS
            </div>

            <div className="flex items-center gap-3 text-right">
              <div>
                <div className="text-sm font-bold text-white">AI Tactical Manager</div>
                <div className="text-[10px] text-text-muted font-bold uppercase">Difficulty: Elite</div>
              </div>
              <div className="h-10 w-10 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <Bot className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Turn Indicator Banner */}
          <div
            className={`p-3 rounded-xl text-center text-xs font-bold transition ${
              turn === 'player'
                ? 'bg-neon-green/10 border border-neon-green/30 text-neon-green'
                : 'bg-white/5 border border-white/10 text-text-muted'
            }`}
          >
            {turn === 'player'
              ? '🎯 Your Turn: Ask a tactical question or submit a direct player guess'
              : '⏳ AI Opponent is contemplating...' }
          </div>

          {/* Question Category Chips */}
          {!isGameOver && turn === 'player' && (
            <div className="p-4 rounded-2xl bg-pitch-dark border border-white/10 space-y-3">
              <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                Ask a Tactical Question:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleAskQuestion('is_forward', 'Is he a Forward / Striker?')}
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 transition"
                >
                  Forward / Striker?
                </button>
                <button
                  onClick={() => handleAskQuestion('is_midfielder', 'Is he a Midfielder?')}
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 transition"
                >
                  Midfielder?
                </button>
                <button
                  onClick={() => handleAskQuestion('is_defender', 'Is he a Defender?')}
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 transition"
                >
                  Defender?
                </button>
                <button
                  onClick={() => handleAskQuestion('is_epl', 'Does he play in the Premier League?')}
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 transition"
                >
                  Premier League?
                </button>
                <button
                  onClick={() => handleAskQuestion('is_laliga', 'Does he play in La Liga?')}
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 transition"
                >
                  La Liga?
                </button>
                <button
                  onClick={() => handleAskQuestion('won_ucl', 'Has he won the Champions League?')}
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 transition"
                >
                  Champions League Winner?
                </button>
                <button
                  onClick={() => handleAskQuestion('won_worldcup', 'Has he won the World Cup?')}
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 transition"
                >
                  World Cup Winner?
                </button>
                <button
                  onClick={() => handleAskQuestion('won_ballondor', 'Has he won the Ballon d\'Or?')}
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 transition"
                >
                  Ballon d&apos;Or Winner?
                </button>
                <button
                  onClick={() => handleAskQuestion('is_right_footed', 'Is he right-footed?')}
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 transition"
                >
                  Right-Footed?
                </button>
              </div>

              {/* Direct Guess Input */}
              <div className="pt-2 border-t border-white/10 flex gap-2">
                <input
                  type="text"
                  placeholder="Guess exact player name (e.g. Erling Haaland)..."
                  value={directGuessQuery}
                  onChange={e => setDirectGuessQuery(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-pitch-black border border-white/15 text-white text-xs focus:outline-none focus:border-neon-green"
                />
                <button
                  onClick={handleDirectGuess}
                  disabled={!directGuessQuery.trim()}
                  className="px-4 py-2 rounded-xl bg-neon-green text-pitch-black font-black text-xs disabled:opacity-40 transition shadow-neon"
                >
                  GUESS
                </button>
              </div>
            </div>
          )}

          {/* Game Over Screen */}
          {isGameOver && (
            <div className="p-6 rounded-2xl bg-gradient-to-r from-pitch-card to-pitch-dark border border-white/10 text-center space-y-4 shadow-2xl animate-fadeIn">
              <Trophy className="h-10 w-10 text-trophy-gold mx-auto" />
              <h2 className="text-2xl font-black font-orbitron text-white">
                {winner === 'player' ? 'VICTORY! YOU GUESSED IT!' : 'DUEL CONCLUDED'}
              </h2>
              {targetPlayer && (
                <div className="p-4 rounded-xl bg-pitch-black inline-flex items-center gap-3 border border-neon-green/40">
                  <div className="relative h-12 w-12 rounded-full overflow-hidden">
                    <Image
                      src={targetPlayer.image ? `/${targetPlayer.image}` : '/img/players/messi.jpg'}
                      alt={targetPlayer.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-extrabold text-white">{targetPlayer.name}</div>
                    <div className="text-xs text-text-muted">
                      {targetPlayer.nationality} • {targetPlayer.club}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <button
                  onClick={startAIGame}
                  className="px-6 py-3 rounded-xl bg-neon-green text-pitch-black font-black text-xs shadow-neon transition"
                >
                  PLAY ANOTHER DUEL (+200 XP)
                </button>
              </div>
            </div>
          )}

          {/* Question / Clues Log */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
              Match Log & Answers ({logs.length})
            </span>
            <div className="space-y-2">
              {logs.map(log => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-pitch-card border border-white/5 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-black px-1.5 py-0.5 rounded text-[10px] ${
                        log.asker === 'player'
                          ? 'bg-neon-green/20 text-neon-green'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {log.asker === 'player' ? 'YOU' : 'AI'}
                    </span>
                    <span className="text-white font-medium">{log.text}</span>
                  </div>

                  <span
                    className={`font-black flex items-center gap-1 ${
                      log.answer ? 'text-neon-green' : 'text-rose-400'
                    }`}
                  >
                    {log.answer ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" /> YES
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4" /> NO
                      </>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


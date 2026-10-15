'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import { useAuth } from '@/context/auth-context';
import {
  ArrowLeft,
  MessageSquareQuote,
  HelpCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Trophy,
  Sparkles,
} from 'lucide-react';

interface QuoteQuestion {
  quote: string;
  options: string[];
  answer: number;
  context: string;
  image: string;
}

const QUOTES: QuoteQuestion[] = [
  {
    quote: "If I speak, I am in big trouble. In big trouble, and I don't want to be in big trouble.",
    options: ["Sir Alex Ferguson", "José Mourinho", "Pep Guardiola"],
    answer: 1,
    context: "Iconic post-match press conference remark when asked about controversial officiating.",
    image: "/img/players/mourinho.jpg",
  },
  {
    quote: "Your love makes me strong, your hate makes me unstoppable.",
    options: ["Cristiano Ronaldo", "Lionel Messi", "Neymar Jr"],
    answer: 0,
    context: "Said in response to fans and critics during his Ballon d'Or dominance.",
    image: "/img/players/ronaldo.jpg",
  },
  {
    quote: "It's a disgrace, it's a disgrace!",
    options: ["Wayne Rooney", "Didier Drogba", "John Terry"],
    answer: 1,
    context: "Fiery outburst right in front of the TV camera following the 2009 UCL semi-final at Stamford Bridge.",
    image: "/img/players/drogba.jpg",
  },
  {
    quote: "Lions, they don't compare themselves with humans.",
    options: ["Zlatan Ibrahimović", "Eric Cantona", "Erling Haaland"],
    answer: 0,
    context: "Quoted in an interview when asked about comparing his striker output to other forwards.",
    image: "/img/players/zlatan.jpg",
  },
  {
    quote: "When the seagulls follow the trawler, it is because they think sardines will be thrown into the sea.",
    options: ["Thierry Henry", "Eric Cantona", "Arsène Wenger"],
    answer: 1,
    context: "The most enigmatic press conference statement in football history in 1995.",
    image: "/img/players/messi.jpg",
  },
];

export default function TunnelTalkPage() {
  const { addXP, recordGameResult } = useAuth();
  const [index, setIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const current = QUOTES[index];

  const handleSelect = async (optIdx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(optIdx);

    const isCorrect = optIdx === current.answer;
    if (isCorrect) {
      setScore(prev => prev + 1);
      await addXP(showHint ? 15 : 25, 'Tunnel Talk Quote');
    }

    setTimeout(() => {
      if (index + 1 < QUOTES.length) {
        setIndex(prev => prev + 1);
        setSelectedOption(null);
        setShowHint(false);
      } else {
        setIsFinished(true);
        recordGameResult('tunnel-talk', score + (isCorrect ? 1 : 0) >= 3, (score + (isCorrect ? 1 : 0)) * 25);
        if (score >= 3) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#FFB800', '#2EFD72'],
          });
        }
      }
    }, 1500);
  };

  const handleRestart = () => {
    setIndex(0);
    setSelectedOption(null);
    setShowHint(false);
    setScore(0);
    setIsFinished(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fadeIn">
      {/* Header Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-white transition px-3 py-2 rounded-xl bg-pitch-card border border-white/5"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Arena
        </Link>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/10 text-amber-400 border border-amber-500/30">
            Quote {index + 1} / {QUOTES.length}
          </span>
          <span className="text-xs font-bold text-neon-green">
            Score: {score}
          </span>
        </div>
      </div>

      {/* Game Title */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black font-orbitron text-white">
          TUNNEL <span className="text-amber-400">TALK</span>
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary max-w-xl mx-auto">
          Who delivered this iconic football press quote or dugout meltdown?
        </p>
      </div>

      {!isFinished ? (
        <div className="space-y-6">
          {/* Quote Card */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-pitch-card p-6 sm:p-10 text-center shadow-2xl space-y-6">
            <MessageSquareQuote className="h-10 w-10 text-amber-400/40 mx-auto" />
            <blockquote className="text-lg sm:text-2xl font-extrabold text-white font-outfit italic leading-relaxed">
              &ldquo;{current.quote}&rdquo;
            </blockquote>

            {/* Context Clue Toggle */}
            <div>
              {showHint ? (
                <div className="p-3 rounded-xl bg-pitch-black/60 border border-white/10 text-xs text-text-secondary max-w-lg mx-auto animate-fadeIn">
                  <span className="font-bold text-amber-400">Context: </span>
                  {current.context}
                </div>
              ) : (
                <button
                  onClick={() => setShowHint(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-text-muted hover:text-amber-400 transition"
                >
                  <HelpCircle className="h-3.5 w-3.5" /> Need a clue? Reveal context
                </button>
              )}
            </div>
          </div>

          {/* Multiple Choice Options */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {current.options.map((opt, optIdx) => {
              const isSelected = selectedOption === optIdx;
              const isAnswer = optIdx === current.answer;
              let style = 'bg-pitch-card hover:bg-pitch-cardHover border-white/10 text-white';

              if (selectedOption !== null) {
                if (isAnswer) {
                  style = 'bg-neon-green/20 border-neon-green text-neon-green shadow-neon font-black';
                } else if (isSelected) {
                  style = 'bg-rose-500/20 border-rose-500 text-rose-400 font-black';
                } else {
                  style = 'bg-pitch-black/40 border-white/5 opacity-40 text-text-muted';
                }
              }

              return (
                <button
                  key={opt}
                  disabled={selectedOption !== null}
                  onClick={() => handleSelect(optIdx)}
                  className={`p-4 rounded-2xl border text-sm font-bold transition-all duration-200 flex items-center justify-center text-center ${style}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Round Finished */
        <div className="p-6 rounded-2xl bg-gradient-to-r from-pitch-card to-pitch-dark border border-white/10 text-center space-y-4 max-w-xl mx-auto shadow-2xl animate-fadeIn">
          <Trophy className="h-10 w-10 text-trophy-gold mx-auto" />
          <h2 className="text-2xl font-black font-orbitron text-white">
            ROUND COMPLETED!
          </h2>
          <p className="text-xs text-text-secondary">
            You scored {score} / {QUOTES.length} correct quotes.
          </p>
          <div>
            <button
              onClick={handleRestart}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-neon-green text-pitch-black font-black text-xs shadow-neon transition"
            >
              <RotateCcw className="h-4 w-4" /> PLAY AGAIN
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


'use client';

import React, { useState } from 'react';
import HeroMatchCard from '@/components/dashboard/HeroMatchCard';
import RightPanelWidgets from '@/components/dashboard/RightPanelWidgets';
import GameModesExplorer from '@/components/dashboard/GameModesExplorer';

export default function HomeArenaPage() {
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [roundScore, setRoundScore] = useState(0);
  const [guessesLeft, setGuessesLeft] = useState(2);

  const handlePredictionSubmitted = (isExact: boolean, score: number) => {
    setRoundScore(prev => prev + score);
    setGuessesLeft(prev => Math.max(0, prev - 1));
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10 animate-fadeIn">
      {/* 2-Column Main Arena Section (Center Hero + Right Panel) */}
      <div className="flex flex-col xl:flex-row items-start gap-6">
        {/* Center Main Column (Hero Match Prediction Card) */}
        <div className="flex-1 min-w-0 w-full space-y-6">
          <HeroMatchCard onPredictionSubmitted={handlePredictionSubmitted} />
        </div>

        {/* Right Column (Progress, Top 5 Leaderboard, How to Play) */}
        <div className="w-full xl:w-80 shrink-0">
          <RightPanelWidgets
            currentQuestion={currentQuestion}
            totalQuestions={10}
            roundScore={roundScore}
            potentialPoints={10}
            guessesLeft={guessesLeft}
          />
        </div>
      </div>

      {/* Explore All Game Modes Section */}
      <div className="pt-2">
        <GameModesExplorer />
      </div>
    </div>
  );
}

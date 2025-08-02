import React, { useState } from 'react';
import Quiz from './Quiz';
import Scoreboard from './Scoreboard';

const App = () => {
    const [score, setScore] = useState(0);
    const [isQuizActive, setIsQuizActive] = useState(true);

    const handleScoreUpdate = (points) => {
        setScore(prevScore => prevScore + points);
    };

    const handleQuizEnd = () => {
        setIsQuizActive(false);
    };

    const handlePlayAgain = () => {
        setIsQuizActive(true);
        setScore(0);
    };

    return (
        <div className="app">
            <h1>Football Genius</h1>
            {isQuizActive ? (
                <Quiz onScoreUpdate={handleScoreUpdate} onQuizEnd={handleQuizEnd} />
            ) : (
                <Scoreboard score={score} onPlayAgain={handlePlayAgain} />
            )}
        </div>
    );
};

export default App;
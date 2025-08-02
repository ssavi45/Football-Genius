import React, { useState } from 'react';
import Question from './Question';
import Scoreboard from './Scoreboard';
import Hint from './Hint';
import questionsData from '/workspaces/Football-Genius/football-genius/src/data/questions.json';

const Quiz = () => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [chances, setChances] = useState(2);
    const [hintsUsed, setHintsUsed] = useState(0);
    const [userGuess, setUserGuess] = useState('');
    const [gameOver, setGameOver] = useState(false);

    const currentQuestion = questionsData[currentQuestionIndex];

    const handleGuess = () => {
        if (userGuess === currentQuestion.scoreline) {
            const points = calculatePoints(hintsUsed);
            setScore(score + points);
            nextQuestion();
        } else {
            setChances(chances - 1);
            if (chances - 1 === 0) {
                setGameOver(true);
            }
        }
        setUserGuess('');
    };

    const nextQuestion = () => {
        if (currentQuestionIndex < questionsData.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setHintsUsed(0);
            setChances(2);
        } else {
            setGameOver(true);
        }
    };

    const calculatePoints = (hints) => {
        switch (hints) {
            case 0:
                return 5;
            case 1:
                return 3;
            case 2:
                return 2;
            case 3:
                return 1;
            default:
                return 0;
        }
    };

    const resetGame = () => {
        setCurrentQuestionIndex(0);
        setScore(0);
        setChances(2);
        setHintsUsed(0);
        setGameOver(false);
    };

    return (
        <div className="quiz-container">
            {gameOver ? (
                <Scoreboard score={score} resetGame={resetGame} />
            ) : (
                <>
                    <Question question={currentQuestion} />
                    <input
                        type="text"
                        value={userGuess}
                        onChange={(e) => setUserGuess(e.target.value)}
                        placeholder="Enter scoreline"
                    />
                    <button onClick={handleGuess}>Submit Guess</button>
                    <Hint
                        hints={currentQuestion.hints}
                        hintsUsed={hintsUsed}
                        setHintsUsed={setHintsUsed}
                        score={score}
                    />
                </>
            )}
        </div>
    );
};

export default Quiz;
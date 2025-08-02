import React from 'react';

const Scoreboard: React.FC<{ score: number; onPlayAgain: () => void; onQuit: () => void; }> = ({ score, onPlayAgain, onQuit }) => {
    return (
        <div className="scoreboard">
            <h2>Your Score: {score}</h2>
            <button onClick={onPlayAgain}>Play Another Round</button>
            <button onClick={onQuit}>Quit</button>
        </div>
    );
};

export default Scoreboard;
import React from 'react';

interface QuestionProps {
    teamA: string;
    teamB: string;
    venue: string;
    competition: string;
    date: string;
    hints: string[];
    onHintUnlock: (hintIndex: number) => void;
    hintsUsed: number;
}

const Question: React.FC<QuestionProps> = ({
    teamA,
    teamB,
    venue,
    competition,
    date,
    hints,
    onHintUnlock,
    hintsUsed
}) => {
    return (
        <div className="question-container">
            <h2>{competition}</h2>
            <p>{`${teamA} vs ${teamB}`}</p>
            <p>{`Venue: ${venue}`}</p>
            <p>{`Date: ${date}`}</p>
            <div className="hints">
                <h3>Hints:</h3>
                {hints.map((hint, index) => (
                    <div key={index} className="hint">
                        <button 
                            onClick={() => onHintUnlock(index)} 
                            disabled={hintsUsed >= 3 || hintsUsed > index}
                        >
                            Unlock Hint {index + 1}
                        </button>
                        {hintsUsed > index && <p>{hint}</p>}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Question;
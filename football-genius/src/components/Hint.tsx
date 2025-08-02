import React, { useState } from 'react';

interface HintProps {
    hints: string[];
    onHintUsed: (hintIndex: number) => void;
    usedHints: boolean[];
}

const Hint: React.FC<HintProps> = ({ hints, onHintUsed, usedHints }) => {
    const [hintPoints, setHintPoints] = useState(0);

    const handleHintClick = (index: number) => {
        if (!usedHints[index]) {
            onHintUsed(index);
            setHintPoints(prevPoints => prevPoints + (3 - index)); // Adjust points based on hint usage
        }
    };

    return (
        <div className="hint-container">
            <h3>Hints</h3>
            <ul>
                {hints.map((hint, index) => (
                    <li key={index}>
                        <button 
                            onClick={() => handleHintClick(index)} 
                            disabled={usedHints[index]}
                        >
                            {usedHints[index] ? 'Hint Used' : `Hint ${index + 1}`}
                        </button>
                        {usedHints[index] && <span>: {hint}</span>}
                    </li>
                ))}
            </ul>
            <p>Total Hint Points: {hintPoints}</p>
        </div>
    );
};

export default Hint;
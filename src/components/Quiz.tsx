import React, { useState } from 'react';
import questionsData from '../data/questions.json';
import { getPoints } from '../utils/scoring';

interface Question {
  teams: string;
  venue: string;
  competition: string;
  date: string;
  correctScore: string;
  hints: string[];
}

const NUM_QUESTIONS = 10;

const getRandomQuestions = (questions: Question[], num: number) => {
  const shuffled = [...questions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, num);
};

const Quiz: React.FC = () => {
  const [questions] = useState<Question[]>(getRandomQuestions(questionsData as Question[], NUM_QUESTIONS));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answer, setAnswer] = useState('');
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHints, setShowHints] = useState([false, false, false]);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [quizFinished, setQuizFinished] = useState(false);

  const currentQuestion = questions[currentIndex];

  const handleHint = (idx: number) => {
    if (!showHints[idx] && hintsUsed < 3 && currentQuestion.hints && currentQuestion.hints[idx]) {
      const newShowHints = [...showHints];
      newShowHints[idx] = true;
      setShowHints(newShowHints);
      setHintsUsed(hintsUsed + 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim() === currentQuestion.correctScore) {
      const points = getPoints(hintsUsed);
      setScore(score + points);
      setFeedback(`Correct! +${points} points`);
      setTimeout(() => nextQuestion(), 1200);
    } else {
      if (attempts === 0) {
        setFeedback('Wrong! One attempt left.');
        setAttempts(1);
      } else {
        setFeedback(`Wrong! The correct answer was ${currentQuestion.correctScore}.`);
        setTimeout(() => nextQuestion(), 1500);
      }
    }
  };

  const nextQuestion = () => {
    setAnswer('');
    setHintsUsed(0);
    setShowHints([false, false, false]);
    setAttempts(0);
    setFeedback('');
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const handleRestart = () => {
    window.location.reload();
  };

  if (quizFinished) {
    return (
      <div>
        <h2>Quiz Complete!</h2>
        <p>Your total score: <strong>{score}</strong></p>
        <button onClick={handleRestart}>Play Again</button>
      </div>
    );
  }

  return (
    <div>
      <h3>Question {currentIndex + 1} of {questions.length}</h3>
      <div>
        <strong>{currentQuestion.teams}</strong>
        <div>Venue: {currentQuestion.venue}</div>
        <div>Competition: {currentQuestion.competition}</div>
        <div>Date: {currentQuestion.date}</div>
      </div>
      <form onSubmit={handleSubmit} style={{ marginTop: '1em' }}>
        <label>
          Guess the scoreline (e.g., 2-1):{' '}
          <input
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            disabled={feedback.startsWith('Correct') || feedback.startsWith('Wrong! The correct')}
            required
          />
        </label>
        <button
          type="submit"
          disabled={feedback.startsWith('Correct') || feedback.startsWith('Wrong! The correct')}
        >
          Submit
        </button>
      </form>
      <div style={{ marginTop: '1em' }}>
        {currentQuestion.hints && currentQuestion.hints.map((hint, idx) => (
          <div key={idx}>
            <button
              onClick={() => handleHint(idx)}
              disabled={showHints[idx] || hintsUsed > idx}
              style={{ marginRight: '0.5em' }}
            >
              Unlock Hint {idx + 1}
            </button>
            {showHints[idx] && <span>{hint}</span>}
          </div>
        ))}
      </div>
      <div style={{ color: feedback.startsWith('Correct') ? 'green' : 'red', marginTop: '1em' }}>
        {feedback}
      </div>
        <div style={{ marginTop: '1em' }}>
          <strong>Current Score:</strong> {score}
        </div>
        </div>
  );
};

export default Quiz;
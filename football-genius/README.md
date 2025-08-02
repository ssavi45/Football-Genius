# Football Genius - README

## Overview
Football Genius is an interactive quiz game where players guess the scoreline of various football matches. Players are presented with details such as team names, match venue, competition name, and date. The game includes hints to assist players in making their guesses, with a scoring system that rewards players based on their performance.

## Features
- 10 questions per quiz round
- Scoring system based on guesses and hints used
- Two chances per question
- Option to play another round or quit after completing a quiz
- Hints include player statistics, man of the match, and fun facts

## Project Structure
```
football-genius
├── public
│   └── index.html
├── src
│   ├── components
│   │   ├── App.tsx
│   │   ├── Quiz.tsx
│   │   ├── Question.tsx
│   │   ├── Scoreboard.tsx
│   │   └── Hint.tsx
│   ├── data
│   │   └── questions.json
│   ├── styles
│   │   └── main.css
│   ├── utils
│   │   └── scoring.ts
│   └── index.tsx
├── package.json
├── tsconfig.json
└── README.md
```

## Setup Instructions
1. **Install Node.js**: Ensure you have Node.js installed on your machine. You can download it from [nodejs.org](https://nodejs.org/).

2. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd football-genius
   ```

3. **Install Dependencies**:
   You can use either npm or yarn to install the required packages.
   ```bash
   npm install
   ```
   or
   ```bash
   yarn install
   ```

4. **Run the Application**:
   Start the development server to run the application.
   ```bash
   npm start
   ```
   or
   ```bash
   yarn start
   ```

5. **Open in Browser**: Navigate to `http://localhost:3000` in your web browser to play the game.

## Game Rules
- Players guess the scoreline of a football match based on the provided details.
- Players can use hints to assist their guesses, but using hints will reduce the points awarded.
- Points are awarded as follows:
  - 5 points for a correct guess without hints
  - 3 points for a correct guess with 1 hint
  - 2 points for a correct guess with 2 hints
  - 1 point for a correct guess with all 3 hints
  - 0 points for an incorrect guess
- Players have 2 chances to guess the scoreline for each question.

## Contributing
Contributions are welcome! If you would like to contribute to the project, please fork the repository and submit a pull request.

## License
This project is licensed under the MIT License. See the LICENSE file for details.
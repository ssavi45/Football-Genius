import 'historic_match.dart';

/// Entity representing the evaluated score and bonus breakdown for a completed round.
class ScorelineRoundResult {
  final HistoricMatch match;
  final int guessedHomeScore;
  final int guessedAwayScore;
  final String? selectedScorer;
  final int hintsUsedCount;
  final int pointsEarned;
  final bool isExactScore;
  final bool isCorrectOutcome;
  final bool isCorrectGoalDifference;
  final bool isCorrectScorer;
  final Map<String, int> scoreBreakdown;
  final bool isSkipped;

  const ScorelineRoundResult({
    required this.match,
    required this.guessedHomeScore,
    required this.guessedAwayScore,
    this.selectedScorer,
    required this.hintsUsedCount,
    required this.pointsEarned,
    required this.isExactScore,
    required this.isCorrectOutcome,
    required this.isCorrectGoalDifference,
    required this.isCorrectScorer,
    required this.scoreBreakdown,
    this.isSkipped = false,
  });

  /// Evaluates a player's submission against the match facts
  factory ScorelineRoundResult.evaluate({
    required HistoricMatch match,
    required int guessedHome,
    required int guessedAway,
    String? selectedScorer,
    required int hintsUsedCount,
    bool isHint1Used = false,
    bool isHint2Used = false,
    bool isHint3Used = false,
  }) {
    final isExact = (guessedHome == match.homeScore) && (guessedAway == match.awayScore);

    // Determine outcomes: 1 = home win, 0 = draw, -1 = away win
    final actualOutcome = match.homeScore > match.awayScore
        ? 1
        : match.homeScore < match.awayScore
            ? -1
            : 0;

    final guessedOutcome = guessedHome > guessedAway
        ? 1
        : guessedHome < guessedAway
            ? -1
            : 0;

    final isCorrectOutcome = actualOutcome == guessedOutcome;
    final isCorrectGoalDiff = (guessedHome - guessedAway) == match.goalDifference;
    final isCorrectScorer = selectedScorer != null && selectedScorer == match.correctIconicScorer;

    final breakdown = <String, int>{};
    int total = 0;

    if (isExact) {
      breakdown['Correct Scoreline'] = HistoricMatch.exactScorePoints;
      total += HistoricMatch.exactScorePoints;

      // Deduct points for unlocked hints
      if (isHint1Used) {
        breakdown['Hint 1'] = -HistoricMatch.hint1Deduction;
        total -= HistoricMatch.hint1Deduction;
      }
      if (isHint2Used) {
        breakdown['Hint 2'] = -HistoricMatch.hint2Deduction;
        total -= HistoricMatch.hint2Deduction;
      }
      if (isHint3Used) {
        breakdown['Hint 3'] = -HistoricMatch.hint3Deduction;
        total -= HistoricMatch.hint3Deduction;
      }

      if (total < 0) total = 0;
    } else {
      breakdown['Wrong Guess'] = 0;
      total = 0;
    }

    return ScorelineRoundResult(
      match: match,
      guessedHomeScore: guessedHome,
      guessedAwayScore: guessedAway,
      selectedScorer: selectedScorer,
      hintsUsedCount: hintsUsedCount,
      pointsEarned: total,
      isExactScore: isExact,
      isCorrectOutcome: isCorrectOutcome,
      isCorrectGoalDifference: isCorrectGoalDiff,
      isCorrectScorer: isCorrectScorer,
      scoreBreakdown: breakdown,
    );
  }
}


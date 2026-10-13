import '../../domain/entities/historic_match.dart';
import '../../domain/entities/scoreline_round_result.dart';

enum ScorelineGameStatus {
  loading,
  guessing,
  roundRevealed,
  sessionCompleted,
}

/// Immutable state for a Scoreline Hero game session.
class ScorelineState {
  final ScorelineGameStatus status;
  final List<HistoricMatch> matches;
  final int currentRoundIndex;
  final int currentGuessedHome;
  final int currentGuessedAway;
  final String? selectedIconicScorer;
  final bool isHint1Unlocked;
  final bool isHint2Unlocked;
  final bool isHint3Unlocked;

  // Compatibility aliases
  bool get isHalftimeHintUnlocked => isHint1Unlocked;
  bool get isGoalSumHintUnlocked => isHint2Unlocked;
  bool get isScorerHintUnlocked => isHint3Unlocked;

  final int skipsUsed;
  static const int maxSkips = 3;

  bool get canSkip => skipsUsed < maxSkips;
  int get skipsRemaining => (maxSkips - skipsUsed).clamp(0, maxSkips);

  final List<ScorelineRoundResult> completedRoundResults;
  final ScorelineRoundResult? currentRoundResult;
  final int totalScore;
  final int exactMatchesCount;
  final int streakCount;

  const ScorelineState({
    this.status = ScorelineGameStatus.loading,
    this.matches = const [],
    this.currentRoundIndex = 0,
    this.currentGuessedHome = 0,
    this.currentGuessedAway = 0,
    this.selectedIconicScorer,
    this.isHint1Unlocked = false,
    this.isHint2Unlocked = false,
    this.isHint3Unlocked = false,
    this.skipsUsed = 0,
    this.completedRoundResults = const [],
    this.currentRoundResult,
    this.totalScore = 0,
    this.exactMatchesCount = 0,
    this.streakCount = 0,
  });

  HistoricMatch? get currentMatch {
    if (matches.isEmpty || currentRoundIndex >= matches.length) return null;
    return matches[currentRoundIndex];
  }

  int get currentRoundNumber => currentRoundIndex + 1;
  int get totalRounds => matches.length;

  int get hintsUsedThisRound {
    int count = 0;
    if (isHint1Unlocked) count++;
    if (isHint2Unlocked) count++;
    if (isHint3Unlocked) count++;
    return count;
  }

  int get currentRoundHintPointsDeducted {
    int pts = 0;
    if (isHint1Unlocked) pts += HistoricMatch.hint1Deduction;
    if (isHint2Unlocked) pts += HistoricMatch.hint2Deduction;
    if (isHint3Unlocked) pts += HistoricMatch.hint3Deduction;
    return pts;
  }

  ScorelineState copyWith({
    ScorelineGameStatus? status,
    List<HistoricMatch>? matches,
    int? currentRoundIndex,
    int? currentGuessedHome,
    int? currentGuessedAway,
    String? selectedIconicScorer,
    bool clearSelectedScorer = false,
    bool? isHint1Unlocked,
    bool? isHint2Unlocked,
    bool? isHint3Unlocked,
    bool? isHalftimeHintUnlocked,
    bool? isGoalSumHintUnlocked,
    bool? isScorerHintUnlocked,
    int? skipsUsed,
    List<ScorelineRoundResult>? completedRoundResults,
    ScorelineRoundResult? currentRoundResult,
    bool clearCurrentRoundResult = false,
    int? totalScore,
    int? exactMatchesCount,
    int? streakCount,
  }) {
    return ScorelineState(
      status: status ?? this.status,
      matches: matches ?? this.matches,
      currentRoundIndex: currentRoundIndex ?? this.currentRoundIndex,
      currentGuessedHome: currentGuessedHome ?? this.currentGuessedHome,
      currentGuessedAway: currentGuessedAway ?? this.currentGuessedAway,
      selectedIconicScorer: clearSelectedScorer
          ? null
          : (selectedIconicScorer ?? this.selectedIconicScorer),
      isHint1Unlocked: isHint1Unlocked ?? (isHalftimeHintUnlocked ?? this.isHint1Unlocked),
      isHint2Unlocked: isHint2Unlocked ?? (isGoalSumHintUnlocked ?? this.isHint2Unlocked),
      isHint3Unlocked: isHint3Unlocked ?? (isScorerHintUnlocked ?? this.isHint3Unlocked),
      skipsUsed: skipsUsed ?? this.skipsUsed,
      completedRoundResults: completedRoundResults ?? this.completedRoundResults,
      currentRoundResult: clearCurrentRoundResult
          ? null
          : (currentRoundResult ?? this.currentRoundResult),
      totalScore: totalScore ?? this.totalScore,
      exactMatchesCount: exactMatchesCount ?? this.exactMatchesCount,
      streakCount: streakCount ?? this.streakCount,
    );
  }
}


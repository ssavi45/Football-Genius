import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/repositories/scoreline_repository_impl.dart';
import '../../domain/entities/scoreline_round_result.dart';
import '../../domain/repositories/scoreline_repository.dart';
import 'scoreline_state.dart';

final scorelineRepositoryProvider = Provider<ScorelineRepository>((ref) {
  return const ScorelineRepositoryImpl();
});

/// Riverpod 3 Notifier managing the full lifecycle of a Scoreline Hero session.
class ScorelineController extends Notifier<ScorelineState> {
  @override
  ScorelineState build() {
    // Schedule asynchronous initialization
    Future.microtask(_initSession);
    return const ScorelineState(status: ScorelineGameStatus.loading);
  }

  Future<void> _initSession() async {
    final repository = ref.read(scorelineRepositoryProvider);
    final matches = await repository.getSessionMatches(count: 10);

    state = ScorelineState(
      status: ScorelineGameStatus.guessing,
      matches: matches,
      currentRoundIndex: 0,
      currentGuessedHome: 0,
      currentGuessedAway: 0,
      selectedIconicScorer: null,
      isHint1Unlocked: false,
      isHint2Unlocked: false,
      isHint3Unlocked: false,
      skipsUsed: 0,
      completedRoundResults: const [],
      totalScore: 0,
      exactMatchesCount: 0,
      streakCount: 0,
    );
  }

  void incrementHomeScore() {
    if (state.currentGuessedHome < 99) {
      state = state.copyWith(currentGuessedHome: state.currentGuessedHome + 1);
    }
  }

  void decrementHomeScore() {
    if (state.currentGuessedHome > 0) {
      state = state.copyWith(currentGuessedHome: state.currentGuessedHome - 1);
    }
  }

  void incrementAwayScore() {
    if (state.currentGuessedAway < 99) {
      state = state.copyWith(currentGuessedAway: state.currentGuessedAway + 1);
    }
  }

  void decrementAwayScore() {
    if (state.currentGuessedAway > 0) {
      state = state.copyWith(currentGuessedAway: state.currentGuessedAway - 1);
    }
  }

  void selectIconicScorer(String scorer) {
    state = state.copyWith(selectedIconicScorer: scorer);
  }

  void unlockHint1() {
    if (!state.isHint1Unlocked) {
      state = state.copyWith(isHint1Unlocked: true);
    }
  }

  void unlockHint2() {
    if (!state.isHint2Unlocked) {
      state = state.copyWith(isHint2Unlocked: true);
    }
  }

  void unlockHint3() {
    if (!state.isHint3Unlocked) {
      state = state.copyWith(isHint3Unlocked: true);
    }
  }

  // Compatibility aliases
  void unlockHalftimeHint() => unlockHint1();
  void unlockGoalSumHint() => unlockHint2();
  void unlockScorerHint() => unlockHint3();

  void submitRoundGuess() {
    final match = state.currentMatch;
    if (match == null || state.status != ScorelineGameStatus.guessing) return;

    final result = ScorelineRoundResult.evaluate(
      match: match,
      guessedHome: state.currentGuessedHome,
      guessedAway: state.currentGuessedAway,
      selectedScorer: state.selectedIconicScorer,
      hintsUsedCount: state.hintsUsedThisRound,
      isHint1Used: state.isHint1Unlocked,
      isHint2Used: state.isHint2Unlocked,
      isHint3Used: state.isHint3Unlocked,
    );

    final updatedResults = [...state.completedRoundResults, result];
    final newTotalScore = state.totalScore + result.pointsEarned;
    final newExactCount = state.exactMatchesCount + (result.isExactScore ? 1 : 0);
    final newStreak = result.isExactScore
        ? state.streakCount + 1
        : 0;

    state = state.copyWith(
      status: ScorelineGameStatus.roundRevealed,
      completedRoundResults: updatedResults,
      currentRoundResult: result,
      totalScore: newTotalScore,
      exactMatchesCount: newExactCount,
      streakCount: newStreak,
    );
  }

  void skipCurrentRound() {
    final match = state.currentMatch;
    if (match == null || !state.canSkip || state.status != ScorelineGameStatus.guessing) return;

    final result = ScorelineRoundResult(
      match: match,
      guessedHomeScore: state.currentGuessedHome,
      guessedAwayScore: state.currentGuessedAway,
      selectedScorer: state.selectedIconicScorer,
      hintsUsedCount: state.hintsUsedThisRound,
      pointsEarned: 0,
      isExactScore: false,
      isCorrectOutcome: false,
      isCorrectGoalDifference: false,
      isCorrectScorer: false,
      scoreBreakdown: const {'Skipped': 0},
      isSkipped: true,
    );

    final updatedResults = [...state.completedRoundResults, result];

    state = state.copyWith(
      skipsUsed: state.skipsUsed + 1,
      status: ScorelineGameStatus.roundRevealed,
      completedRoundResults: updatedResults,
      currentRoundResult: result,
      streakCount: 0,
    );
  }

  void proceedToNextRound() {
    final nextIndex = state.currentRoundIndex + 1;

    if (nextIndex >= state.matches.length) {
      // Completed all 5 rounds
      state = state.copyWith(
        status: ScorelineGameStatus.sessionCompleted,
        clearCurrentRoundResult: true,
      );
    } else {
      // Move to next match
      state = state.copyWith(
        status: ScorelineGameStatus.guessing,
        currentRoundIndex: nextIndex,
        currentGuessedHome: 0,
        currentGuessedAway: 0,
        clearSelectedScorer: true,
        isHint1Unlocked: false,
        isHint2Unlocked: false,
        isHint3Unlocked: false,
        clearCurrentRoundResult: true,
      );
    }
  }

  void restartSession() {
    state = const ScorelineState(status: ScorelineGameStatus.loading);
    _initSession();
  }
}

final scorelineControllerProvider =
    NotifierProvider<ScorelineController, ScorelineState>(
  ScorelineController.new,
);


import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:football_genius/core/constants/app_colors.dart';
import 'package:football_genius/shared/widgets/dynamic_stadium_background.dart';
import '../controllers/scoreline_controller.dart';
import '../controllers/scoreline_state.dart';
import '../widgets/scoreline_board.dart';
import '../widgets/scoreline_clues_panel.dart';
import '../widgets/scoreline_hint_drawer.dart';
import '../widgets/scoreline_hud.dart';
import '../widgets/scoreline_match_banner.dart';
import '../widgets/scoreline_summary_modal.dart';
import '../widgets/scoreline_timeline_reveal.dart';

/// Screen entry point for Scoreline Hero historic match prediction mode.
class ScorelineScreen extends ConsumerWidget {
  const ScorelineScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(scorelineControllerProvider);
    final controller = ref.read(scorelineControllerProvider.notifier);

    return Scaffold(
      backgroundColor: AppColors.pitchBlack,
      body: Stack(
        children: [
          // Dynamic stadium floodlight & emerald gradient background
          const Positioned.fill(
            child: DynamicStadiumBackground(),
          ),

          // Content body
          SafeArea(
            child: _buildBody(context, state, controller),
          ),
        ],
      ),
    );
  }

  Widget _buildBody(
    BuildContext context,
    ScorelineState state,
    ScorelineController controller,
  ) {
    if (state.status == ScorelineGameStatus.loading) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const CircularProgressIndicator(
              color: AppColors.neonGreen,
              strokeWidth: 2.5,
            ),
            const SizedBox(height: 16),
            Text(
              'RETRIEVING HISTORIC MATCH ARCHIVES...',
              style: GoogleFonts.outfit(
                fontSize: 11,
                fontWeight: FontWeight.w800,
                letterSpacing: 1.2,
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
      );
    }

    if (state.status == ScorelineGameStatus.sessionCompleted) {
      return Center(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          child: ScorelineSummaryModal(
            totalScore: state.totalScore,
            exactCount: state.exactMatchesCount,
            results: state.completedRoundResults,
            onPlayAgain: controller.restartSession,
            onExit: () => context.pop(),
          ),
        ),
      );
    }

    final match = state.currentMatch;
    if (match == null) {
      return Center(
        child: Text(
          'No historic matches loaded',
          style: GoogleFonts.outfit(color: AppColors.textPrimary),
        ),
      );
    }

    return Column(
      children: [
        // Top HUD
        ScorelineHud(
          currentRound: state.currentRoundNumber,
          totalRounds: state.totalRounds,
          totalScore: state.totalScore,
          streak: state.streakCount,
          onExit: () => context.pop(),
        ),

        // Scrollable Round Canvas
        Expanded(
          child: SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            child: Column(
              children: [
                // Match Header Banner
                ScorelineMatchBanner(match: match),

                if (state.status == ScorelineGameStatus.guessing) ...[
                  // LED Interactive Scoreboard
                  ScorelineBoard(
                    homeScore: state.currentGuessedHome,
                    awayScore: state.currentGuessedAway,
                    skipsUsed: state.skipsUsed,
                    maxSkips: ScorelineState.maxSkips,
                    onIncrementHome: controller.incrementHomeScore,
                    onDecrementHome: controller.decrementHomeScore,
                    onIncrementAway: controller.incrementAwayScore,
                    onDecrementAway: controller.decrementAwayScore,
                    onSkip: state.canSkip ? controller.skipCurrentRound : null,
                    onSubmit: controller.submitRoundGuess,
                  ),

                  // Tactical Hints
                  ScorelineHintDrawer(
                    match: match,
                    isHint1Unlocked: state.isHint1Unlocked,
                    isHint2Unlocked: state.isHint2Unlocked,
                    isHint3Unlocked: state.isHint3Unlocked,
                    onUnlockHint1: controller.unlockHint1,
                    onUnlockHint2: controller.unlockHint2,
                    onUnlockHint3: controller.unlockHint3,
                  ),

                  // Historical Narrative & Bonus Scorer Trivia
                  ScorelineCluesPanel(
                    match: match,
                    selectedScorer: state.selectedIconicScorer,
                    onSelectScorer: controller.selectIconicScorer,
                  ),
                ] else if (state.status == ScorelineGameStatus.roundRevealed &&
                    state.currentRoundResult != null) ...[
                  // Post-round revelation & goal timeline
                  ScorelineTimelineReveal(
                    result: state.currentRoundResult!,
                    isLastRound: state.currentRoundIndex >= state.matches.length - 1,
                    onNext: controller.proceedToNextRound,
                  ),
                ],

                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ],
    );
  }
}


import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:football_genius/core/constants/app_colors.dart';
import '../../domain/entities/scoreline_round_result.dart';

/// Post-round reveal displaying verdict, points breakdown, and minute-by-minute goalscorers.
class ScorelineTimelineReveal extends StatelessWidget {
  final ScorelineRoundResult result;
  final bool isLastRound;
  final VoidCallback onNext;

  const ScorelineTimelineReveal({
    super.key,
    required this.result,
    required this.isLastRound,
    required this.onNext,
  });

  @override
  Widget build(BuildContext context) {
    final match = result.match;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppColors.pitchCard,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: result.isExactScore ? AppColors.trophyGold : const Color(0xFF6B2222),
          width: 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color: result.isExactScore
                ? AppColors.trophyGold.withAlpha(30)
                : Colors.black.withAlpha(100),
            blurRadius: 20,
          ),
        ],
      ),
      child: Column(
        children: [
          // Verdict banner
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: result.isExactScore
                  ? AppColors.trophyGold.withAlpha(30)
                  : result.isSkipped
                      ? const Color(0xFF1B2820)
                      : AppColors.errorRed.withAlpha(30),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: result.isExactScore
                    ? AppColors.trophyGold
                    : result.isSkipped
                        ? const Color(0xFF384F40)
                        : AppColors.errorRed,
                width: 1.2,
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  result.isExactScore
                      ? Icons.workspace_premium_rounded
                      : result.isSkipped
                          ? Icons.skip_next_rounded
                          : Icons.cancel_outlined,
                  size: 18,
                  color: result.isExactScore
                      ? AppColors.trophyGold
                      : result.isSkipped
                          ? const Color(0xFF8BA594)
                          : AppColors.errorRed,
                ),
                const SizedBox(width: 8),
                Text(
                  result.isExactScore
                      ? 'CORRECT SCORELINE! +${result.pointsEarned} PTS'
                      : result.isSkipped
                          ? 'ROUND SKIPPED • 0 PTS'
                          : 'WRONG GUESS • 0 PTS',
                  style: GoogleFonts.outfit(
                    fontSize: 12,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 0.5,
                    color: result.isExactScore
                        ? AppColors.trophyGold
                        : result.isSkipped
                            ? const Color(0xFFB4C8BC)
                            : const Color(0xFFFF8A80),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Actual vs Guessed comparison box
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: AppColors.pitchBlack,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.borderSubtle),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                // Actual Score
                Column(
                  children: [
                    Text(
                      'ACTUAL RESULT',
                      style: GoogleFonts.outfit(
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                        color: AppColors.textSecondary,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      match.scorelineString,
                      style: GoogleFonts.orbitron(
                        fontSize: 26,
                        fontWeight: FontWeight.w900,
                        color: AppColors.neonGreen,
                      ),
                    ),
                  ],
                ),

                Container(
                  width: 1,
                  height: 36,
                  color: AppColors.borderSubtle,
                ),

                // Guessed Score
                Column(
                  children: [
                    Text(
                      'YOUR GUESS',
                      style: GoogleFonts.outfit(
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                        color: AppColors.textSecondary,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      result.isSkipped
                          ? 'SKIPPED'
                          : '${result.guessedHomeScore} - ${result.guessedAwayScore}',
                      style: GoogleFonts.orbitron(
                        fontSize: result.isSkipped ? 20 : 26,
                        fontWeight: FontWeight.w900,
                        color: result.isExactScore
                            ? AppColors.trophyGold
                            : result.isSkipped
                                ? const Color(0xFF8BA594)
                                : AppColors.textPrimary,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          if (match.penaltyShootoutNote != null) ...[
            const SizedBox(height: 8),
            Text(
              '⚽ ${match.penaltyShootoutNote}',
              style: GoogleFonts.outfit(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: AppColors.trophyGold,
              ),
            ),
          ],

          const SizedBox(height: 14),

          // Score Breakdown chips
          if (result.scoreBreakdown.isNotEmpty) ...[
            Wrap(
              spacing: 6,
              runSpacing: 6,
              alignment: WrapAlignment.center,
              children: result.scoreBreakdown.entries.map((entry) {
                final isPenalty = entry.value < 0;
                final sign = isPenalty ? '' : '+';
                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: isPenalty ? const Color(0xFF220A0A) : AppColors.darkPill,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: isPenalty ? const Color(0xFF6B2222) : AppColors.borderSubtle,
                    ),
                  ),
                  child: Text(
                    '${entry.key}: $sign${entry.value} pts',
                    style: GoogleFonts.outfit(
                      fontSize: 10.5,
                      fontWeight: FontWeight.w700,
                      color: isPenalty ? const Color(0xFFFF6B6B) : AppColors.neonGreen,
                    ),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 16),
          ],

          // Official Goal Timeline list
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.pitchBlack.withAlpha(160),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.borderSubtle),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(
                      Icons.timeline_rounded,
                      size: 14,
                      color: AppColors.trophyGold,
                    ),
                    const SizedBox(width: 6),
                    Text(
                      'OFFICIAL GOAL TIMELINE',
                      style: GoogleFonts.outfit(
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 1.1,
                        color: AppColors.trophyGold,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                ...match.goals.map((goal) {
                  return Padding(
                    padding: const EdgeInsets.symmetric(vertical: 3),
                    child: Row(
                      children: [
                        Container(
                          width: 44,
                          padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppColors.darkPill,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            goal.formattedMinute,
                            textAlign: TextAlign.center,
                            style: GoogleFonts.orbitron(
                              fontSize: 9.5,
                              fontWeight: FontWeight.w800,
                              color: AppColors.neonGreen,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        const Icon(
                          Icons.sports_soccer,
                          size: 13,
                          color: Colors.white70,
                        ),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            '${goal.scorerName} (${goal.teamName})',
                            style: GoogleFonts.outfit(
                              fontSize: 11.5,
                              fontWeight: FontWeight.w600,
                              color: AppColors.textPrimary,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  );
                }),
              ],
            ),
          ),

          const SizedBox(height: 18),

          // Next Round Button
          SizedBox(
            width: double.infinity,
            height: 46,
            child: ElevatedButton(
              onPressed: onNext,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.neonGreen,
                foregroundColor: Colors.black,
                elevation: 0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(23),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    isLastRound ? 'VIEW SESSION RESULTS' : 'NEXT ROUND',
                    style: GoogleFonts.outfit(
                      fontSize: 13.5,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 0.8,
                      color: Colors.black,
                    ),
                  ),
                  const SizedBox(width: 6),
                  const Icon(
                    Icons.arrow_forward_rounded,
                    size: 16,
                    color: Colors.black,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:football_genius/core/constants/app_colors.dart';
import '../../domain/entities/scoreline_round_result.dart';

/// Full modal recap presented at the end of a 10-round Scoreline Hero marathon.
class ScorelineSummaryModal extends StatelessWidget {
  final int totalScore;
  final int exactCount;
  final List<ScorelineRoundResult> results;
  final VoidCallback onPlayAgain;
  final VoidCallback onExit;

  const ScorelineSummaryModal({
    super.key,
    required this.totalScore,
    required this.exactCount,
    required this.results,
    required this.onPlayAgain,
    required this.onExit,
  });

  String get _performanceTitle {
    if (exactCount >= 8) return 'HISTORIC ARCHIVIST';
    if (exactCount >= 5) return 'TACTICAL SAGE';
    if (exactCount >= 3 || totalScore >= 25) return 'MATCHDAY REGULAR';
    return 'FOOTBALL NOVICE';
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.pitchCard,
        borderRadius: BorderRadius.circular(28),
        border: Border.all(
          color: AppColors.trophyGold.withAlpha(140),
          width: 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color: AppColors.trophyGold.withAlpha(30),
            blurRadius: 24,
            spreadRadius: 2,
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Golden Trophy Icon
          Container(
            width: 58,
            height: 58,
            decoration: BoxDecoration(
              color: AppColors.trophyGold.withAlpha(30),
              shape: BoxShape.circle,
              border: Border.all(
                color: AppColors.trophyGold,
                width: 1.5,
              ),
            ),
            child: const Center(
              child: Icon(
                Icons.emoji_events_rounded,
                color: AppColors.trophyGold,
                size: 32,
              ),
            ),
          ),

          const SizedBox(height: 12),

          // Session Complete Title
          Text(
            'SCORELINE HERO COMPLETE',
            style: GoogleFonts.outfit(
              fontSize: 11,
              fontWeight: FontWeight.w900,
              letterSpacing: 1.5,
              color: AppColors.neonGreen,
            ),
          ),

          const SizedBox(height: 4),

          Text(
            _performanceTitle,
            style: GoogleFonts.orbitron(
              fontSize: 20,
              fontWeight: FontWeight.w900,
              color: AppColors.textPrimary,
              letterSpacing: -0.3,
            ),
          ),

          const SizedBox(height: 16),

          // Total Stats Ribbon
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _buildStatPill(
                label: 'TOTAL SCORE',
                value: '$totalScore',
                color: AppColors.trophyGold,
              ),
              _buildStatPill(
                label: 'EXACT GUESSES',
                value: '$exactCount / ${results.length}',
                color: AppColors.neonGreen,
              ),
              _buildStatPill(
                label: 'XP EARNED',
                value: '+${(totalScore * 1.5).round()}',
                color: AppColors.textPrimary,
              ),
            ],
          ),

          const SizedBox(height: 20),

          // Match summaries list
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.pitchBlack,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.borderSubtle),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'MATCH RECAP',
                  style: GoogleFonts.outfit(
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 1.2,
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 8),
                ...results.map((r) {
                  return Padding(
                    padding: const EdgeInsets.symmetric(vertical: 4),
                    child: Row(
                      children: [
                        Icon(
                          r.isExactScore
                              ? Icons.star_rounded
                              : r.isSkipped
                                  ? Icons.skip_next_rounded
                                  : r.isCorrectOutcome
                                      ? Icons.check_circle_outline_rounded
                                      : Icons.remove_circle_outline_rounded,
                          size: 15,
                          color: r.isExactScore
                              ? AppColors.trophyGold
                              : r.isSkipped
                                  ? const Color(0xFF6E8275)
                                  : r.isCorrectOutcome
                                      ? AppColors.neonGreen
                                      : AppColors.textSecondary,
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            '${r.match.homeTeamName} vs ${r.match.awayTeamName}',
                            style: GoogleFonts.outfit(
                              fontSize: 11.5,
                              fontWeight: FontWeight.w600,
                              color: AppColors.textPrimary,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        Text(
                          r.isSkipped
                              ? '${r.match.scorelineString} (Skipped)'
                              : '${r.match.scorelineString} (You: ${r.guessedHomeScore}-${r.guessedAwayScore})',
                          style: GoogleFonts.orbitron(
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                            color: r.isExactScore
                                ? AppColors.trophyGold
                                : r.isSkipped
                                    ? const Color(0xFF6E8275)
                                    : AppColors.textSecondary,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          '+${r.pointsEarned}',
                          style: GoogleFonts.outfit(
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                            color: AppColors.neonGreen,
                          ),
                        ),
                      ],
                    ),
                  );
                }),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // Actions
          Row(
            children: [
              Expanded(
                child: SizedBox(
                  height: 46,
                  child: OutlinedButton(
                    onPressed: onExit,
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.textPrimary,
                      side: const BorderSide(color: AppColors.borderSubtle),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(23),
                      ),
                    ),
                    child: Text(
                      'ARENA',
                      style: GoogleFonts.outfit(
                        fontSize: 13,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.8,
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: SizedBox(
                  height: 46,
                  child: ElevatedButton(
                    onPressed: onPlayAgain,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.neonGreen,
                      foregroundColor: Colors.black,
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(23),
                      ),
                    ),
                    child: Text(
                      'PLAY AGAIN',
                      style: GoogleFonts.outfit(
                        fontSize: 13,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 0.8,
                        color: Colors.black,
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatPill({
    required String label,
    required String value,
    required Color color,
  }) {
    return Column(
      children: [
        Text(
          value,
          style: GoogleFonts.orbitron(
            fontSize: 16,
            fontWeight: FontWeight.w900,
            color: color,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: GoogleFonts.outfit(
            fontSize: 9.5,
            fontWeight: FontWeight.w700,
            color: AppColors.textSecondary,
          ),
        ),
      ],
    );
  }
}


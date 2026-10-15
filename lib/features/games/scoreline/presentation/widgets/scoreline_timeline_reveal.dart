import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:football_genius/core/constants/app_colors.dart';
import '../../domain/entities/scoreline_round_result.dart';

/// Post-round reveal displaying verdict, collapsible points breakdown,
/// Next Round action on top of the goal timeline, and the official match timeline.
class ScorelineTimelineReveal extends StatefulWidget {
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
  State<ScorelineTimelineReveal> createState() =>
      _ScorelineTimelineRevealState();
}

class _ScorelineTimelineRevealState extends State<ScorelineTimelineReveal> {
  bool _showBreakdown = false;

  @override
  Widget build(BuildContext context) {
    final result = widget.result;
    final match = result.match;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppColors.pitchCard,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: result.isExactScore
              ? AppColors.trophyGold
              : const Color(0xFF6B2222),
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
          // Top Row: Verdict Pill + Icon-Only Point Breakdown Button
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Verdict pill
              Flexible(
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  decoration: BoxDecoration(
                    color: result.isExactScore
                        ? AppColors.trophyGold.withAlpha(25)
                        : result.isSkipped
                            ? const Color(0xFF1B2820)
                            : AppColors.errorRed.withAlpha(25),
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
                        size: 16,
                        color: result.isExactScore
                            ? AppColors.trophyGold
                            : result.isSkipped
                                ? const Color(0xFF8BA594)
                                : AppColors.errorRed,
                      ),
                      const SizedBox(width: 6),
                      Flexible(
                        child: Text(
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
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(width: 8),

              // Small Icon-Only Point Breakdown Toggle Button (no text)
              GestureDetector(
                onTap: () {
                  setState(() {
                    _showBreakdown = !_showBreakdown;
                  });
                },
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: _showBreakdown
                        ? AppColors.trophyGold.withAlpha(40)
                        : const Color(0xFF102016),
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: _showBreakdown
                          ? AppColors.trophyGold
                          : AppColors.borderLight,
                      width: 1.2,
                    ),
                    boxShadow: _showBreakdown
                        ? [
                            BoxShadow(
                              color: AppColors.trophyGold.withAlpha(50),
                              blurRadius: 8,
                            ),
                          ]
                        : null,
                  ),
                  child: Center(
                    child: Icon(
                      Icons.receipt_long_rounded,
                      size: 17,
                      color: _showBreakdown
                          ? AppColors.trophyGold
                          : AppColors.neonGreen,
                    ),
                  ),
                ),
              ),
            ],
          ),

          // Collapsible Points Breakdown Panel
          if (_showBreakdown) ...[
            const SizedBox(height: 12),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: const Color(0xFF09170E),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: AppColors.trophyGold.withAlpha(70),
                  width: 1,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withAlpha(120),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(
                        Icons.star_rounded,
                        size: 14,
                        color: AppColors.trophyGold,
                      ),
                      const SizedBox(width: 5),
                      Text(
                        'POINT BREAKDOWN',
                        style: GoogleFonts.outfit(
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 1.0,
                          color: AppColors.trophyGold,
                        ),
                      ),
                      const Spacer(),
                      Text(
                        '${result.pointsEarned} PTS TOTAL',
                        style: GoogleFonts.orbitron(
                          fontSize: 10.5,
                          fontWeight: FontWeight.w900,
                          color: result.isExactScore
                              ? AppColors.trophyGold
                              : Colors.white70,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  ...result.scoreBreakdown.entries.map((entry) {
                    final isPenalty = entry.value < 0;
                    final sign = isPenalty ? '' : '+';
                    return Padding(
                      padding: const EdgeInsets.symmetric(vertical: 2.5),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            entry.key,
                            style: GoogleFonts.outfit(
                              fontSize: 11.5,
                              fontWeight: FontWeight.w600,
                              color: AppColors.textSecondary,
                            ),
                          ),
                          Text(
                            '$sign${entry.value} pts',
                            style: GoogleFonts.orbitron(
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                              color: isPenalty
                                  ? const Color(0xFFFF6B6B)
                                  : (entry.value > 0
                                      ? AppColors.neonGreen
                                      : Colors.white60),
                            ),
                          ),
                        ],
                      ),
                    );
                  }),
                ],
              ),
            ),
          ],

          const SizedBox(height: 14),

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

          // Next Round Button (Width fitted to content, placed on top of goal timeline)
          Center(
            child: ElevatedButton(
              onPressed: widget.onNext,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.neonGreen,
                foregroundColor: Colors.black,
                elevation: 0,
                padding:
                    const EdgeInsets.symmetric(horizontal: 28, vertical: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(24),
                ),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    widget.isLastRound ? 'VIEW SESSION RESULTS' : 'NEXT ROUND',
                    style: GoogleFonts.outfit(
                      fontSize: 13,
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

          const SizedBox(height: 14),

          // Official Goal Timeline list (Below Next Round button)
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
                if (match.goals.isEmpty)
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 6),
                    child: Text(
                      'No goals scored in regulation / extra time.',
                      style: GoogleFonts.outfit(
                        fontSize: 11.5,
                        fontWeight: FontWeight.w500,
                        color: AppColors.textSecondary,
                        fontStyle: FontStyle.italic,
                      ),
                    ),
                  )
                else
                  ...match.goals.map((goal) {
                    return Padding(
                      padding: const EdgeInsets.symmetric(vertical: 3),
                      child: Row(
                        children: [
                          Container(
                            width: 44,
                            padding: const EdgeInsets.symmetric(
                                horizontal: 4, vertical: 2),
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
        ],
      ),
    );
  }
}

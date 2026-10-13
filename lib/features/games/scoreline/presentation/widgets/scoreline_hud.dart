import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:football_genius/core/constants/app_colors.dart';

/// Top HUD bar displaying back button, round progress capsule with dash segments,
/// streak counter, and current score points.
class ScorelineHud extends StatelessWidget {
  final int currentRound;
  final int totalRounds;
  final int totalScore;
  final int streak;
  final VoidCallback onExit;

  const ScorelineHud({
    super.key,
    required this.currentRound,
    required this.totalRounds,
    required this.totalScore,
    required this.streak,
    required this.onExit,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 6),
      child: Row(
        children: [
          // Circular Back / Exit button
          GestureDetector(
            onTap: onExit,
            child: Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                color: const Color(0xFF0F1A12),
                shape: BoxShape.circle,
                border: Border.all(
                  color: Colors.white.withAlpha(35),
                  width: 1,
                ),
              ),
              child: const Center(
                child: Icon(
                  Icons.arrow_back_ios_new_rounded,
                  size: 16,
                  color: Colors.white,
                ),
              ),
            ),
          ),

          const SizedBox(width: 10),

          // Round Capsule with Trophy & Dash Progress Bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: const Color(0xFF0D1E13),
              borderRadius: BorderRadius.circular(22),
              border: Border.all(
                color: AppColors.neonGreen.withAlpha(70),
                width: 1,
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(
                  Icons.emoji_events_outlined,
                  size: 18,
                  color: AppColors.neonGreen,
                ),
                const SizedBox(width: 8),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      'ROUND $currentRound/$totalRounds',
                      style: GoogleFonts.outfit(
                        fontSize: 10.5,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 0.6,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 3),
                    // Dash progress segments
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: List.generate(totalRounds, (index) {
                        final isCompleted = index < currentRound;
                        final double dashWidth = totalRounds > 5 ? 5.2 : 11.0;
                        final double dashGap = totalRounds > 5 ? 1.8 : 3.0;
                        return Container(
                          width: dashWidth,
                          height: 3.5,
                          margin: EdgeInsets.only(
                            right: index < totalRounds - 1 ? dashGap : 0,
                          ),
                          decoration: BoxDecoration(
                            color: isCompleted
                                ? AppColors.neonGreen
                                : const Color(0xFF22382A),
                            borderRadius: BorderRadius.circular(2),
                            boxShadow: isCompleted
                                ? [
                                    BoxShadow(
                                      color: AppColors.neonGreen.withAlpha(160),
                                      blurRadius: 4,
                                    ),
                                  ]
                                : null,
                          ),
                        );
                      }),
                    ),
                  ],
                ),
              ],
            ),
          ),

          const Spacer(),

          // Streak flame capsule
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
            decoration: BoxDecoration(
              color: const Color(0xFF1B1207),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: const Color(0xFFFF6B00).withAlpha(90),
                width: 1,
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(
                  Icons.local_fire_department_rounded,
                  size: 17,
                  color: Color(0xFFFF6B00),
                ),
                const SizedBox(width: 5),
                Text(
                  '$streak',
                  style: GoogleFonts.outfit(
                    fontSize: 12.5,
                    fontWeight: FontWeight.w900,
                    color: const Color(0xFFFF9E40),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(width: 8),

          // Gold Points capsule
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
            decoration: BoxDecoration(
              color: const Color(0xFF1E1A06),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: AppColors.trophyGold.withAlpha(110),
                width: 1,
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(
                  Icons.star_rounded,
                  size: 17,
                  color: AppColors.trophyGold,
                ),
                const SizedBox(width: 4),
                Text(
                  '$totalScore PTS',
                  style: GoogleFonts.outfit(
                    fontSize: 12,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 0.4,
                    color: AppColors.trophyGold,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

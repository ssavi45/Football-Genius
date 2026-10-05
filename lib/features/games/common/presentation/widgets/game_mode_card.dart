import 'package:flutter/material.dart';
import 'package:football_genius/core/constants/app_colors.dart';
import 'package:football_genius/shared/models/game_metadata.dart';

class GameModeCard extends StatelessWidget {
  final GameMetadata game;
  final VoidCallback onPlay;

  const GameModeCard({
    super.key,
    required this.game,
    required this.onPlay,
  });

  Color _getBadgeColor(String badge) {
    switch (badge) {
      case "TODAY'S CHALLENGE":
        return AppColors.neonGreen;
      case '1v1 AI BATTLE':
        return AppColors.flameOrange;
      case 'STREAK':
        return AppColors.trophyGold;
      case 'VISUAL':
        return const Color(0xFF00E5FF);
      case 'PUZZLE':
        return const Color(0xFFB388FF);
      case 'HISTORIC':
        return const Color(0xFFFFD54F);
      case 'CULTURE':
        return const Color(0xFFFF4081);
      case 'CAREER':
        return const Color(0xFF69F0AE);
      default:
        return AppColors.neonGreen;
    }
  }

  @override
  Widget build(BuildContext context) {
    final badgeColor = _getBadgeColor(game.badge);

    return Container(
      decoration: BoxDecoration(
        color: AppColors.pitchCard,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(
          color: game.hasDailyChallenge
              ? AppColors.neonGreen.withAlpha(120)
              : AppColors.borderSubtle,
          width: game.hasDailyChallenge ? 1.5 : 1.0,
        ),
        boxShadow: game.hasDailyChallenge
            ? [
                BoxShadow(
                  color: AppColors.neonGreen.withAlpha(25),
                  blurRadius: 18,
                  spreadRadius: 1,
                ),
              ]
            : null,
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: Stack(
          children: [
            // Background Artwork
            Positioned.fill(
              child: Image.asset(
                game.cardArtPath,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) => Container(
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      colors: [Color(0xFF0D2514), AppColors.pitchDark],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                  ),
                ),
              ),
            ),

            // Gradient Overlay for readability
            Positioned.fill(
              child: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      AppColors.pitchBlack.withAlpha(235),
                      AppColors.pitchBlack.withAlpha(160),
                      AppColors.pitchBlack.withAlpha(220),
                    ],
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                  ),
                ),
              ),
            ),

            // Card Body
            Padding(
              padding: const EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Top Tags Row
                  Row(
                    children: [
                      // Badge Pill
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 9, vertical: 4),
                        decoration: BoxDecoration(
                          color: badgeColor.withAlpha(30),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: badgeColor.withAlpha(100),
                            width: 1,
                          ),
                        ),
                        child: Text(
                          game.badge,
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 1.1,
                            color: badgeColor,
                          ),
                        ),
                      ),
                      const Spacer(),
                      // Duration Pill
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: Colors.white10,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Row(
                          children: [
                            const Icon(
                              Icons.schedule_rounded,
                              size: 12,
                              color: AppColors.textSecondary,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              '${game.averageDurationMinutes}m',
                              style: const TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 6),
                      // Difficulty Pill
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: Colors.white10,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          game.difficulty,
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 14),

                  // Header with Icon & Title
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      // Mode Icon
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          color: AppColors.surfaceGlass,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: badgeColor.withAlpha(80),
                            width: 1,
                          ),
                        ),
                        padding: const EdgeInsets.all(7),
                        child: Image.asset(
                          game.iconPath,
                          fit: BoxFit.contain,
                          errorBuilder: (context, error, stackTrace) =>
                              Icon(Icons.sports_soccer, color: badgeColor, size: 22),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              game.title,
                              style: const TextStyle(
                                fontSize: 19,
                                fontWeight: FontWeight.w900,
                                color: AppColors.textPrimary,
                                letterSpacing: -0.3,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              game.subtitle,
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: badgeColor,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 10),

                  // Description
                  Text(
                    game.description,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.textSecondary,
                      height: 1.35,
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Play Action Button
                  SizedBox(
                    width: double.infinity,
                    height: 42,
                    child: ElevatedButton(
                      onPressed: onPlay,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: game.hasDailyChallenge
                            ? AppColors.neonGreen
                            : AppColors.surfaceGlass,
                        foregroundColor: game.hasDailyChallenge
                            ? Colors.black
                            : AppColors.textPrimary,
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(21),
                          side: BorderSide(
                            color: game.hasDailyChallenge
                                ? AppColors.neonGreen
                                : AppColors.borderSubtle,
                            width: 1,
                          ),
                        ),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.play_arrow_rounded,
                            size: 20,
                            color: game.hasDailyChallenge
                                ? Colors.black
                                : AppColors.neonGreen,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            game.hasDailyChallenge ? 'Play Daily Challenge' : 'Play Mode',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w800,
                              color: game.hasDailyChallenge
                                  ? Colors.black
                                  : AppColors.textPrimary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

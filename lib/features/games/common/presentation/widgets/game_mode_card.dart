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
        return const Color(0xFFFF5252);
      case 'CAREER':
        return const Color(0xFF69F0AE);
      default:
        return AppColors.neonGreen;
    }
  }

  @override
  Widget build(BuildContext context) {
    final badgeColor = _getBadgeColor(game.badge);
    final isDaily = game.hasDailyChallenge;

    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF0B1910),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(
          color: isDaily
              ? AppColors.neonGreen.withAlpha(140)
              : AppColors.borderSubtle,
          width: isDaily ? 1.5 : 1.0,
        ),
        boxShadow: isDaily
            ? [
                BoxShadow(
                  color: AppColors.neonGreen.withAlpha(25),
                  blurRadius: 16,
                  spreadRadius: 1,
                ),
              ]
            : null,
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(21),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Top: Art Showcase Banner with Badges
            SizedBox(
              height: 125,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  // Card Artwork
                  Image.asset(
                    game.cardArtPath,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) => Container(
                      color: const Color(0xFF07130B),
                      child: Center(
                        child: Icon(Icons.sports_soccer,
                            size: 40, color: badgeColor.withAlpha(120)),
                      ),
                    ),
                  ),

                  // Bottom Vignette Gradient transitioning into card body
                  Positioned.fill(
                    child: Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            Colors.black.withAlpha(80),
                            Colors.transparent,
                            const Color(0xFF0B1910),
                          ],
                          stops: const [0.0, 0.45, 1.0],
                        ),
                      ),
                    ),
                  ),

                  // Floating Top Badges (Category Pill + Duration / Difficulty)
                  Positioned(
                    top: 12,
                    left: 12,
                    right: 12,
                    child: Row(
                      children: [
                        // Main Badge Pill
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 10, vertical: 5),
                          decoration: BoxDecoration(
                            color: Colors.black.withAlpha(190),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                              color: badgeColor.withAlpha(160),
                              width: 1.2,
                            ),
                          ),
                          child: Text(
                            game.badge,
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w900,
                              letterSpacing: 1.0,
                              color: badgeColor,
                            ),
                          ),
                        ),
                        const Spacer(),
                        // Duration Tag
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.black.withAlpha(190),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                              color: Colors.white24,
                              width: 0.8,
                            ),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(
                                Icons.schedule_rounded,
                                size: 12,
                                color: Color(0xFFD0DDD3),
                              ),
                              const SizedBox(width: 4),
                              Text(
                                '${game.averageDurationMinutes}m',
                                style: const TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                  color: Color(0xFFD0DDD3),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 6),
                        // Difficulty Tag
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.black.withAlpha(190),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                              color: Colors.white24,
                              width: 0.8,
                            ),
                          ),
                          child: Text(
                            game.difficulty,
                            style: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: Color(0xFFD0DDD3),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Bottom: Clean High-Contrast Info Body
            Container(
              color: const Color(0xFF0B1910),
              padding: const EdgeInsets.fromLTRB(16, 4, 16, 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Title Row with Icon
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      // Mode Icon
                      Container(
                        width: 42,
                        height: 42,
                        decoration: BoxDecoration(
                          color: const Color(0xFF132A1C),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: badgeColor.withAlpha(90),
                            width: 1,
                          ),
                        ),
                        padding: const EdgeInsets.all(7),
                        child: Image.asset(
                          game.iconPath,
                          fit: BoxFit.contain,
                          errorBuilder: (context, error, stackTrace) =>
                              Icon(Icons.sports_soccer, color: badgeColor, size: 20),
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
                                fontSize: 18,
                                fontWeight: FontWeight.w900,
                                color: Colors.white,
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

                  // Description on 100% solid dark background for maximum readability
                  Text(
                    game.description,
                    style: const TextStyle(
                      fontSize: 12.5,
                      fontWeight: FontWeight.w500,
                      color: Color(0xFFBACDC0),
                      height: 1.35,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),

                  const SizedBox(height: 14),

                  // Play Button (46px height with generous vertical room so text never clips)
                  SizedBox(
                    width: double.infinity,
                    height: 46,
                    child: ElevatedButton(
                      onPressed: onPlay,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: isDaily
                            ? AppColors.neonGreen
                            : const Color(0xFF142E1F),
                        foregroundColor: isDaily
                            ? Colors.black
                            : Colors.white,
                        elevation: 0,
                        padding: EdgeInsets.zero,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(23),
                          side: BorderSide(
                            color: isDaily
                                ? AppColors.neonGreen
                                : const Color(0xFF2E6342),
                            width: 1.2,
                          ),
                        ),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.play_arrow_rounded,
                            size: 22,
                            color: isDaily ? Colors.black : AppColors.neonGreen,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            isDaily ? 'Play Daily Challenge' : 'Play Mode',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w900,
                              color: isDaily ? Colors.black : Colors.white,
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


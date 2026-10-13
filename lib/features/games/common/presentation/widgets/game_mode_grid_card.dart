import 'package:flutter/material.dart';
import 'package:football_genius/core/constants/app_colors.dart';
import 'package:football_genius/shared/models/game_metadata.dart';

class GameModeGridCard extends StatelessWidget {
  final GameMetadata game;
  final VoidCallback onPlay;

  const GameModeGridCard({
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

  /// Short, uncluttered badge label for compact 2-column grid cards
  String _getShortBadge(String badge) {
    switch (badge) {
      case "TODAY'S CHALLENGE":
        return 'DAILY';
      case '1v1 AI BATTLE':
        return '1v1 DUEL';
      default:
        return badge;
    }
  }

  @override
  Widget build(BuildContext context) {
    final badgeColor = _getBadgeColor(game.badge);
    final shortBadge = _getShortBadge(game.badge);
    final isDaily = game.hasDailyChallenge;

    return GestureDetector(
      onTap: onPlay,
      child: Container(
        decoration: BoxDecoration(
          color: const Color(0xFF0B1910),
          borderRadius: BorderRadius.circular(18),
          border: Border.all(
            color: isDaily
                ? AppColors.neonGreen.withAlpha(150)
                : AppColors.borderSubtle,
            width: isDaily ? 1.5 : 1.0,
          ),
          boxShadow: isDaily
              ? [
                  BoxShadow(
                    color: AppColors.neonGreen.withAlpha(28),
                    blurRadius: 14,
                    spreadRadius: 1,
                  ),
                ]
              : null,
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(17),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Top Artwork Banner (Uncluttered, dedicated hero art)
              Expanded(
                flex: 11,
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    Image.asset(
                      game.cardArtPath,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) => Container(
                        color: const Color(0xFF07130B),
                        child: Center(
                          child: Icon(Icons.sports_soccer,
                              size: 32, color: badgeColor.withAlpha(120)),
                        ),
                      ),
                    ),

                    // Soft bottom gradient vignette
                    Positioned.fill(
                      child: Container(
                        decoration: const BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [
                              Colors.black38,
                              Colors.transparent,
                              Color(0xFF0B1910),
                            ],
                            stops: [0.0, 0.45, 1.0],
                          ),
                        ),
                      ),
                    ),

                    // Top Left: Compact Badge Pill
                    Positioned(
                      top: 8,
                      left: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 7, vertical: 3),
                        decoration: BoxDecoration(
                          color: Colors.black.withAlpha(210),
                          borderRadius: BorderRadius.circular(7),
                          border: Border.all(
                            color: badgeColor.withAlpha(180),
                            width: 1.0,
                          ),
                        ),
                        child: Text(
                          shortBadge,
                          style: TextStyle(
                            fontSize: 9,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 0.8,
                            color: badgeColor,
                          ),
                        ),
                      ),
                    ),

                    // Top Right: Duration Tag
                    Positioned(
                      top: 8,
                      right: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 6, vertical: 3),
                        decoration: BoxDecoration(
                          color: Colors.black.withAlpha(210),
                          borderRadius: BorderRadius.circular(7),
                          border: Border.all(color: Colors.white24, width: 0.8),
                        ),
                        child: Text(
                          '${game.averageDurationMinutes}m',
                          style: const TextStyle(
                            fontSize: 9.5,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFFD0DDD3),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              // Bottom Clean Info Area (No overflow, high contrast)
              Expanded(
                flex: 7,
                child: Padding(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      // Title & Subtitle
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              game.title,
                              style: const TextStyle(
                                fontSize: 13.5,
                                fontWeight: FontWeight.w900,
                                color: Colors.white,
                                letterSpacing: -0.2,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 2),
                            Text(
                              game.subtitle,
                              style: TextStyle(
                                fontSize: 10.5,
                                fontWeight: FontWeight.w600,
                                color: badgeColor,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(width: 6),

                      // Sleek Circular Play Action Button
                      Container(
                        width: 32,
                        height: 32,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: isDaily
                              ? AppColors.neonGreen
                              : const Color(0xFF142E1F),
                          border: Border.all(
                            color: isDaily
                                ? AppColors.neonGreen
                                : const Color(0xFF2E6342),
                            width: 1.2,
                          ),
                          boxShadow: isDaily
                              ? [
                                  BoxShadow(
                                    color: AppColors.neonGreen.withAlpha(80),
                                    blurRadius: 8,
                                  ),
                                ]
                              : null,
                        ),
                        child: Center(
                          child: Icon(
                            Icons.play_arrow_rounded,
                            size: 19,
                            color: isDaily ? Colors.black : AppColors.neonGreen,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}


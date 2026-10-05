import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/asset_paths.dart';

class ScoutsDuelBanner extends StatelessWidget {
  final VoidCallback? onPlayNow;

  const ScoutsDuelBanner({
    super.key,
    this.onPlayNow,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
      child: Container(
        height: 126,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: AppColors.trophyGold.withAlpha(90),
            width: 1.2,
          ),
          boxShadow: [
            BoxShadow(
              color: AppColors.trophyGold.withAlpha(20),
              blurRadius: 16,
              spreadRadius: 1,
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(19),
          child: Stack(
            children: [
              // High-res Scout's Duel background artwork
              Positioned.fill(
                child: Image.asset(
                  AssetPaths.cardScoutsDuel,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) =>
                      const SizedBox.shrink(),
                ),
              ),

              // Gradient fade from dark left (for text readability) to transparent right
              Positioned.fill(
                child: Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        AppColors.pitchBlack.withAlpha(240),
                        AppColors.pitchBlack.withAlpha(170),
                        AppColors.pitchBlack.withAlpha(40),
                      ],
                      begin: Alignment.centerLeft,
                      end: Alignment.centerRight,
                    ),
                  ),
                ),
              ),

              // Content Layout
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
                child: Row(
                  children: [
                    // Left: Crossed Swords Icon with golden halo
                    Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        color: AppColors.pitchBlack.withAlpha(180),
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: AppColors.trophyGold.withAlpha(120),
                          width: 1.2,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.trophyGold.withAlpha(30),
                            blurRadius: 10,
                          ),
                        ],
                      ),
                      child: const Center(
                        child: Icon(
                          Icons.military_tech_rounded,
                          color: AppColors.trophyGold,
                          size: 28,
                        ),
                      ),
                    ),
                    const SizedBox(width: 14),

                    // Middle Column: Title, Subtitle, Play Now Button
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          RichText(
                            text: const TextSpan(
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w900,
                                letterSpacing: -0.3,
                              ),
                              children: [
                                TextSpan(
                                  text: "Scout's ",
                                  style: TextStyle(color: AppColors.textPrimary),
                                ),
                                TextSpan(
                                  text: "Duel",
                                  style: TextStyle(color: AppColors.trophyGold),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 2),
                          const Text(
                            'Play AI or a friend',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w500,
                              color: AppColors.textSecondary,
                            ),
                          ),
                          const SizedBox(height: 8),
                          // Small Pill Button: Play Now >
                          GestureDetector(
                            onTap: onPlayNow,
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 16,
                                vertical: 6,
                              ),
                              decoration: BoxDecoration(
                                color: AppColors.pitchBlack.withAlpha(220),
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(
                                  color: AppColors.trophyGold.withAlpha(180),
                                  width: 1.2,
                                ),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: const [
                                  Text(
                                    'Play Now',
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w800,
                                      color: AppColors.textPrimary,
                                    ),
                                  ),
                                  SizedBox(width: 5),
                                  Icon(
                                    Icons.arrow_forward_ios_rounded,
                                    size: 10,
                                    color: AppColors.trophyGold,
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
            ],
          ),
        ),
      ),
    );
  }
}

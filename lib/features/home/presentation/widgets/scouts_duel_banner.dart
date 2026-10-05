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
        height: 120,
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
              // Dark stadium backdrop
              Positioned.fill(
                child: Image.asset(
                  AssetPaths.stadiumBg,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) =>
                      const SizedBox.shrink(),
                ),
              ),
              // Dark golden gradient overlay
              Positioned.fill(
                child: Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        AppColors.pitchBlack.withAlpha(245),
                        AppColors.pitchCard.withAlpha(230),
                        AppColors.trophyGold.withAlpha(35),
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
                    // Left: Crossed Golden Swords Icon
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: AppColors.trophyGold.withAlpha(25),
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: AppColors.trophyGold.withAlpha(90),
                        ),
                      ),
                      child: const Center(
                        child: Icon(
                          Icons.military_tech_rounded,
                          color: AppColors.trophyGold,
                          size: 26,
                        ),
                      ),
                    ),
                    const SizedBox(width: 14),

                    // Middle Column: Title, Subtitle, Play Button
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          RichText(
                            text: const TextSpan(
                              style: TextStyle(
                                fontSize: 17,
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
                              fontSize: 11.5,
                              color: AppColors.textSecondary,
                            ),
                          ),
                          const SizedBox(height: 8),
                          // Small Pill Button: Play Now >
                          GestureDetector(
                            onTap: onPlayNow,
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 14,
                                vertical: 6,
                              ),
                              decoration: BoxDecoration(
                                color: AppColors.pitchBlack,
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(
                                  color: AppColors.trophyGold.withAlpha(160),
                                  width: 1,
                                ),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: const [
                                  Text(
                                    'Play Now',
                                    style: TextStyle(
                                      fontSize: 11.5,
                                      fontWeight: FontWeight.w800,
                                      color: AppColors.textPrimary,
                                    ),
                                  ),
                                  SizedBox(width: 4),
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

                    // Right: Scout silhouette illustration with crown
                    Stack(
                      alignment: Alignment.topRight,
                      clipBehavior: Clip.none,
                      children: [
                        // Crown
                        const Positioned(
                          top: -6,
                          right: 14,
                          child: Icon(
                            Icons.workspace_premium_rounded,
                            size: 18,
                            color: AppColors.trophyGold,
                          ),
                        ),
                        // Manager Silhouette
                        Container(
                          width: 68,
                          height: 78,
                          margin: const EdgeInsets.only(top: 8),
                          child: const Icon(
                            Icons.person,
                            size: 64,
                            color: Color(0xFF1B3524),
                          ),
                        ),
                      ],
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

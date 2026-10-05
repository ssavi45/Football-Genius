import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/asset_paths.dart';

class FeaturedChallengeCard extends StatelessWidget {
  final VoidCallback? onContinue;

  const FeaturedChallengeCard({
    super.key,
    this.onContinue,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: AppColors.neonGreen.withAlpha(120),
            width: 1.5,
          ),
          boxShadow: [
            BoxShadow(
              color: AppColors.neonGreen.withAlpha(25),
              blurRadius: 20,
              spreadRadius: 1,
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(22),
          child: Stack(
            children: [
              // Pitch atmosphere background
              Positioned.fill(
                child: Image.asset(
                  AssetPaths.cardMatrixStadium,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) =>
                      const SizedBox.shrink(),
                ),
              ),
              // Dark gradient scrim
              Positioned.fill(
                child: Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        AppColors.pitchBlack.withAlpha(225),
                        AppColors.pitchDark.withAlpha(140),
                        AppColors.pitchBlack.withAlpha(195),
                      ],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                  ),
                ),
              ),

              // Card Content
              Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Kicker tag
                    const Text(
                      "TODAY'S CHALLENGE",
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 1.4,
                        color: AppColors.neonGreen,
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Main Info + 3x3 Grid
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Left Column (Text & Progress)
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Football\nMatrix',
                                style: TextStyle(
                                  fontSize: 28,
                                  fontWeight: FontWeight.w900,
                                  color: AppColors.textPrimary,
                                  height: 1.05,
                                  letterSpacing: -0.5,
                                ),
                              ),
                              const SizedBox(height: 8),
                              // Subtitle
                              Row(
                                children: const [
                                  Icon(
                                    Icons.calendar_today_rounded,
                                    size: 14,
                                    color: AppColors.trophyGold,
                                  ),
                                  SizedBox(width: 6),
                                  Text(
                                    'Daily challenge',
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600,
                                      color: AppColors.textPrimary,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 10),
                              const Text(
                                'Find the 9 players who match the clues. Think, link, complete!',
                                style: TextStyle(
                                  fontSize: 11.5,
                                  color: AppColors.textSecondary,
                                  height: 1.3,
                                ),
                              ),
                              const SizedBox(height: 14),
                              // 6/9 completed + Progress bar
                              RichText(
                                text: const TextSpan(
                                  style: TextStyle(fontSize: 12),
                                  children: [
                                    TextSpan(
                                      text: '6/9 ',
                                      style: TextStyle(
                                        fontWeight: FontWeight.w800,
                                        color: AppColors.textPrimary,
                                      ),
                                    ),
                                    TextSpan(
                                      text: 'completed',
                                      style: TextStyle(
                                        fontWeight: FontWeight.w500,
                                        color: AppColors.textSecondary,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(height: 6),
                              ClipRRect(
                                borderRadius: BorderRadius.circular(4),
                                child: Container(
                                  height: 6,
                                  width: 140,
                                  color: Colors.white12,
                                  child: FractionallySizedBox(
                                    alignment: Alignment.centerLeft,
                                    widthFactor: 6 / 9,
                                    child: Container(
                                      color: AppColors.neonGreen,
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),

                        const SizedBox(width: 16),

                        // Right: 3x3 Mini Grid
                        const _MiniGrid3x3(),
                      ],
                    ),

                    const SizedBox(height: 18),

                    // Bottom CTA Button: Continue
                    SizedBox(
                      width: double.infinity,
                      height: 48,
                      child: ElevatedButton(
                        onPressed: onContinue,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.neonGreen,
                          foregroundColor: Colors.black,
                          elevation: 0,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(24),
                          ),
                          padding: const EdgeInsets.symmetric(horizontal: 20),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: const [
                            Icon(Icons.play_arrow_rounded, size: 22, color: Colors.black),
                            SizedBox(width: 6),
                            Text(
                              'Continue',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w900,
                                color: Colors.black,
                              ),
                            ),
                            Spacer(),
                            Icon(Icons.arrow_forward_ios_rounded, size: 14, color: Colors.black),
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
      ),
    );
  }
}

class _MiniGrid3x3 extends StatelessWidget {
  const _MiniGrid3x3();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 114,
      height: 114,
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: AppColors.pitchBlack.withAlpha(160),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.borderSubtle),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildCell(
                child: Image.asset(
                  AssetPaths.clubRealMadrid,
                  fit: BoxFit.contain,
                  errorBuilder: (context, error, stackTrace) =>
                      const Icon(Icons.shield, size: 16, color: Colors.white70),
                ),
              ),
              _buildSilhouetteCell(),
              _buildCell(
                child: ClipOval(
                  child: Image.asset(
                    AssetPaths.countryFrance,
                    fit: BoxFit.cover,
                    width: 20,
                    height: 20,
                    errorBuilder: (context, error, stackTrace) =>
                        const Icon(Icons.flag, size: 16, color: Colors.white70),
                  ),
                ),
              ),
            ],
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildSilhouetteCell(),
              // Middle Active Cell (Soccer ball with green glow)
              _buildActiveBallCell(),
              _buildSilhouetteCell(),
            ],
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildCell(
                child: ClipOval(
                  child: Image.asset(
                    AssetPaths.countryBrazil,
                    fit: BoxFit.cover,
                    width: 20,
                    height: 20,
                    errorBuilder: (context, error, stackTrace) =>
                        const Icon(Icons.flag, size: 16, color: Colors.white70),
                  ),
                ),
              ),
              _buildSilhouetteCell(),
              _buildCell(
                child: Image.asset(
                  AssetPaths.tournamentEpl,
                  fit: BoxFit.contain,
                  errorBuilder: (context, error, stackTrace) =>
                      const Icon(Icons.emoji_events, size: 16, color: Colors.white70),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildCell({required Widget child}) {
    return Container(
      width: 32,
      height: 32,
      decoration: BoxDecoration(
        color: AppColors.gridSilhouette,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.borderSubtle),
      ),
      padding: const EdgeInsets.all(4),
      child: Center(child: child),
    );
  }

  Widget _buildSilhouetteCell() {
    return Container(
      width: 32,
      height: 32,
      decoration: BoxDecoration(
        color: AppColors.gridSilhouette,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.borderSubtle),
      ),
      child: const Center(
        child: Icon(
          Icons.person,
          size: 18,
          color: AppColors.gridSilhouetteIcon,
        ),
      ),
    );
  }

  Widget _buildActiveBallCell() {
    return Container(
      width: 32,
      height: 32,
      decoration: BoxDecoration(
        color: AppColors.neonGreen.withAlpha(30),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.neonGreen, width: 1.5),
        boxShadow: [
          BoxShadow(
            color: AppColors.neonGreen.withAlpha(60),
            blurRadius: 8,
          ),
        ],
      ),
      child: const Center(
        child: Icon(
          Icons.sports_soccer,
          size: 18,
          color: Colors.white,
        ),
      ),
    );
  }
}

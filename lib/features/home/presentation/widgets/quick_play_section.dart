import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/asset_paths.dart';

class QuickPlaySection extends StatelessWidget {
  final VoidCallback? onSeeAll;
  final ValueChanged<String>? onSelectMode;

  const QuickPlaySection({
    super.key,
    this.onSeeAll,
    this.onSelectMode,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Section Header
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          child: Row(
            children: [
              const Text(
                'Quick Play',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(width: 8),
              const Text(
                'Play a game, anytime',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  color: AppColors.textSecondary,
                ),
              ),
              const Spacer(),
              GestureDetector(
                onTap: onSeeAll,
                child: Row(
                  children: const [
                    Text(
                      'See all',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textSecondary,
                      ),
                    ),
                    SizedBox(width: 2),
                    Icon(
                      Icons.arrow_forward_ios_rounded,
                      size: 10,
                      color: AppColors.textSecondary,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),

        // 3 Cards Horizontal Scroll
        SizedBox(
          height: 184,
          child: ListView(
            scrollDirection: Axis.horizontal,
            physics: const BouncingScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 20),
            children: [
              // Card 1: Higher or Lower
              _buildCard(
                title: 'Higher or Lower',
                subtitle: 'Guess the rating',
                onTap: () => onSelectMode?.call('higher_lower'),
                visual: _buildHigherLowerVisual(),
              ),
              const SizedBox(width: 12),

              // Card 2: Pixel Pitch
              _buildCard(
                title: 'Pixel Pitch',
                subtitle: 'Name the player',
                onTap: () => onSelectMode?.call('pixel_pitch'),
                visual: _buildPixelPitchVisual(),
              ),
              const SizedBox(width: 12),

              // Card 3: Bootroom Scramble
              _buildCard(
                title: 'Bootroom\nScramble',
                subtitle: 'Unscramble & win',
                onTap: () => onSelectMode?.call('unscramble'),
                visual: _buildBootroomScrambleVisual(),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildCard({
    required String title,
    required String subtitle,
    required Widget visual,
    required VoidCallback onTap,
  }) {
    return Container(
      width: 136,
      decoration: BoxDecoration(
        color: AppColors.pitchCard,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.borderSubtle),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(20),
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.fromLTRB(12, 12, 12, 14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Visual Area
                Expanded(
                  child: Center(child: visual),
                ),
                const SizedBox(height: 6),
                // Title
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w800,
                    color: AppColors.textPrimary,
                    height: 1.15,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                // Subtitle
                Text(
                  subtitle,
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                    color: AppColors.textSecondary,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // Visual for Higher or Lower
  Widget _buildHigherLowerVisual() {
    return ClipRRect(
      borderRadius: BorderRadius.circular(12),
      child: Image.asset(
        AssetPaths.cardHigherLower,
        height: 82,
        fit: BoxFit.contain,
        errorBuilder: (context, error, stackTrace) => Container(
          height: 70,
          alignment: Alignment.center,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: const [
              Icon(Icons.arrow_upward_rounded, color: AppColors.neonGreen, size: 28),
              Icon(Icons.sports_soccer, color: Colors.white, size: 28),
              Icon(Icons.arrow_downward_rounded, color: AppColors.errorRed, size: 28),
            ],
          ),
        ),
      ),
    );
  }

  // Visual for Pixel Pitch
  Widget _buildPixelPitchVisual() {
    return ClipRRect(
      borderRadius: BorderRadius.circular(12),
      child: Image.asset(
        AssetPaths.cardPixelPitch,
        height: 82,
        fit: BoxFit.contain,
        errorBuilder: (context, error, stackTrace) => Container(
          width: 60,
          height: 60,
          color: AppColors.gridSilhouette,
          child: const Icon(Icons.person, color: AppColors.neonGreen),
        ),
      ),
    );
  }

  // Visual for Bootroom Scramble
  Widget _buildBootroomScrambleVisual() {
    return ClipRRect(
      borderRadius: BorderRadius.circular(12),
      child: Image.asset(
        AssetPaths.cardBootroomScramble,
        height: 82,
        fit: BoxFit.contain,
        errorBuilder: (context, error, stackTrace) => Container(
          width: 60,
          height: 60,
          color: AppColors.gridSilhouette,
          child: const Icon(Icons.sports_soccer, color: AppColors.trophyGold),
        ),
      ),
    );
  }
}

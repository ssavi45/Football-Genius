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

        // 3 Cards Horizontal Scroll / Row
        SizedBox(
          height: 172,
          child: ListView(
            scrollDirection: Axis.horizontal,
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
                title: 'Bootroom Scramble',
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
      width: 130,
      decoration: BoxDecoration(
        color: AppColors.pitchCard,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.borderSubtle),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(18),
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top Visual Area
                Expanded(
                  child: Center(child: visual),
                ),
                const SizedBox(height: 8),
                // Title
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w800,
                    color: AppColors.textPrimary,
                    height: 1.15,
                  ),
                  maxLines: 1,
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

  // Visual for Higher or Lower: Green Up Arrow + Ball + Red Down Arrow
  Widget _buildHigherLowerVisual() {
    return Container(
      height: 70,
      alignment: Alignment.center,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // Green Up Arrow
          ShaderMask(
            shaderCallback: (bounds) => const LinearGradient(
              colors: [Color(0xFF2EFD72), Color(0xFF1ABC54)],
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
            ).createShader(bounds),
            child: const Icon(
              Icons.arrow_upward_rounded,
              color: Colors.white,
              size: 32,
            ),
          ),
          // Soccer Ball
          Container(
            width: 32,
            height: 32,
            margin: const EdgeInsets.symmetric(horizontal: 2),
            decoration: const BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.white,
            ),
            child: const Center(
              child: Icon(
                Icons.sports_soccer,
                size: 30,
                color: Colors.black,
              ),
            ),
          ),
          // Red Down Arrow
          ShaderMask(
            shaderCallback: (bounds) => const LinearGradient(
              colors: [Color(0xFFFF4D4D), Color(0xFFD63031)],
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
            ).createShader(bounds),
            child: const Icon(
              Icons.arrow_downward_rounded,
              color: Colors.white,
              size: 32,
            ),
          ),
        ],
      ),
    );
  }

  // Visual for Pixel Pitch: Pixelated #10 Jersey back
  Widget _buildPixelPitchVisual() {
    return ClipRRect(
      borderRadius: BorderRadius.circular(10),
      child: Image.asset(
        AssetPaths.iconPixelPitch,
        width: 72,
        height: 72,
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

  // Visual for Bootroom Scramble: Golden boot & tactics
  Widget _buildBootroomScrambleVisual() {
    return ClipRRect(
      borderRadius: BorderRadius.circular(10),
      child: Image.asset(
        AssetPaths.iconUnscramble,
        width: 72,
        height: 72,
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

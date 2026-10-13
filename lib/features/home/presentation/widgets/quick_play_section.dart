import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
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
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
          child: Row(
            children: [
              Text(
                'Quick Play',
                style: GoogleFonts.outfit(
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textPrimary,
                  letterSpacing: -0.3,
                ),
              ),
              const SizedBox(width: 8),
              Text(
                'Play a game, anytime',
                style: GoogleFonts.outfit(
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  color: AppColors.textSecondary,
                ),
              ),
              const Spacer(),
              GestureDetector(
                onTap: onSeeAll,
                child: Row(
                  children: [
                    Text(
                      'See all',
                      style: GoogleFonts.outfit(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textSecondary,
                      ),
                    ),
                    const SizedBox(width: 2),
                    const Icon(
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

        // Square Cards Horizontal Scroll
        SizedBox(
          height: 152,
          child: ListView(
            scrollDirection: Axis.horizontal,
            physics: const BouncingScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 20),
            children: [
              _QuickPlayCard(
                title: 'Higher or Lower',
                artPath: AssetPaths.cardHigherLower,
                onTap: () => onSelectMode?.call('higher_lower'),
              ),
              const SizedBox(width: 12),
              _QuickPlayCard(
                title: 'Pixel Pitch',
                artPath: AssetPaths.cardPixelPitch,
                onTap: () => onSelectMode?.call('pixel_pitch'),
              ),
              const SizedBox(width: 12),
              _QuickPlayCard(
                title: 'Bootroom Scramble',
                artPath: AssetPaths.cardBootroomScramble,
                onTap: () => onSelectMode?.call('unscramble'),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

/// A square card with a full-bleed background image and a frosted glass
/// bottom strip showing the game mode name.
class _QuickPlayCard extends StatelessWidget {
  final String title;
  final String artPath;
  final VoidCallback? onTap;

  const _QuickPlayCard({
    required this.title,
    required this.artPath,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 148,
        height: 148,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: AppColors.borderSubtle),
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(17),
          child: Stack(
            fit: StackFit.expand,
            children: [
              // Full-bleed card artwork
              Image.asset(
                artPath,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) => Container(
                  color: AppColors.pitchCard,
                  child: const Center(
                    child: Icon(
                      Icons.sports_soccer,
                      color: AppColors.neonGreen,
                      size: 40,
                    ),
                  ),
                ),
              ),

              // Frosted glass bottom strip with game name
              Positioned(
                left: 0,
                right: 0,
                bottom: 0,
                child: ClipRect(
                  child: BackdropFilter(
                    filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 8,
                      ),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            Colors.black.withAlpha(100),
                            Colors.black.withAlpha(180),
                          ],
                        ),
                      ),
                      child: Text(
                        title,
                        style: GoogleFonts.outfit(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary,
                          height: 1.2,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
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

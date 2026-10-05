import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/asset_paths.dart';

class GameModeItem {
  final String id;
  final String title;
  final String tagline;
  final String iconAsset;
  final String? badge;
  final Color accentColor;

  const GameModeItem({
    required this.id,
    required this.title,
    required this.tagline,
    required this.iconAsset,
    this.badge,
    this.accentColor = AppColors.neonGreen,
  });
}

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  static const List<GameModeItem> modes = [
    GameModeItem(
      id: 'scoutsduel',
      title: "Scout's Duel",
      tagline: '24-Card Guess Who vs Gemini AI & Live Peers',
      iconAsset: AssetPaths.iconScoutsDuel,
      badge: 'AI + LIVE',
      accentColor: AppColors.neonGreen,
    ),
    GameModeItem(
      id: 'scoreline',
      title: 'Scoreline Hero',
      tagline: 'Predict the final score of historic matches',
      iconAsset: AssetPaths.iconScorelineHero,
      badge: 'POPULAR',
      accentColor: AppColors.trophyGold,
    ),
    GameModeItem(
      id: 'grid',
      title: 'Football Matrix',
      tagline: '3x3 Immaculate Grid daily knowledge puzzle',
      iconAsset: AssetPaths.iconFootballMatrix,
      badge: 'DAILY',
      accentColor: AppColors.neonGreen,
    ),
    GameModeItem(
      id: 'transfer',
      title: 'JourneyMan',
      tagline: 'Deduce the player from their club transfer trail',
      iconAsset: AssetPaths.iconJourneyman,
      accentColor: Color(0xFF3498DB),
    ),
    GameModeItem(
      id: 'pixel_pitch',
      title: 'Pixel Pitch',
      tagline: 'Spot the player through clearing pixel fog',
      iconAsset: AssetPaths.iconPixelPitch,
      badge: 'SPEED',
      accentColor: Color(0xFFE67E22),
    ),
    GameModeItem(
      id: 'higher_lower',
      title: 'Higher or Lower',
      tagline: 'Goals, trophies & market values showdown streak',
      iconAsset: AssetPaths.iconHigherLower,
      accentColor: AppColors.trophyGold,
    ),
    GameModeItem(
      id: 'who',
      title: 'Tunnel Talk',
      tagline: 'Iconic quotes, bust-ups & dressing room banter',
      iconAsset: AssetPaths.iconTunnelTalk,
      accentColor: Color(0xFF9B59B6),
    ),
    GameModeItem(
      id: 'unscramble',
      title: 'Bootroom Scramble',
      tagline: 'Decipher anagrammed legend and modern names',
      iconAsset: AssetPaths.iconUnscramble,
      accentColor: AppColors.neonGreen,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Background stadium ambient atmosphere
          Positioned.fill(
            child: Opacity(
              opacity: 0.18,
              child: Image.asset(
                AssetPaths.stadiumBg,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) =>
                    const SizedBox.shrink(),
              ),
            ),
          ),
          SafeArea(
            child: CustomScrollView(
              slivers: [
                _buildAppBar(context),
                _buildHeroBanner(),
                _buildModesGrid(context),
                const SliverToBoxAdapter(
                  child: SizedBox(height: 32),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAppBar(BuildContext context) {
    return SliverToBoxAdapter(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        child: Row(
          children: [
            Image.asset(
              AssetPaths.logo,
              height: 40,
              width: 40,
              errorBuilder: (context, error, stackTrace) => const Icon(
                Icons.sports_soccer,
                color: AppColors.neonGreen,
                size: 36,
              ),
            ),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'FOOTBALL GENIUS',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 1.2,
                    color: AppColors.textPrimary,
                  ),
                ),
                Text(
                  'Game Hub 2.0',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                    color: AppColors.neonGreen.withAlpha(220),
                  ),
                ),
              ],
            ),
            const Spacer(),
            OutlinedButton.icon(
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Leaderboard coming up!')),
                );
              },
              icon: const Icon(Icons.leaderboard_rounded, size: 18, color: AppColors.trophyGold),
              label: const Text('Ranks', style: TextStyle(color: AppColors.textPrimary)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeroBanner() {
    return SliverToBoxAdapter(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 20),
        child: Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                AppColors.neonGreen.withAlpha(35),
                AppColors.pitchCard,
              ],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.neonGreen.withAlpha(60)),
          ),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.neonGreen.withAlpha(50),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Text(
                        'FLUTTER CROSS-PLATFORM',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 1,
                          color: AppColors.neonGreen,
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Ultimate Football Trivia Hub',
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w800,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      '8 distinct modes testing your tactical, transfer, and historical football IQ.',
                      style: TextStyle(
                        fontSize: 13,
                        color: AppColors.textSecondary,
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

  Widget _buildModesGrid(BuildContext context) {
    return SliverPadding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      sliver: SliverLayoutBuilder(
        builder: (context, constraints) {
          final crossAxisCount = constraints.crossAxisExtent > 900
              ? 4
              : constraints.crossAxisExtent > 600
                  ? 3
                  : 1;

          return SliverGrid(
            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: crossAxisCount,
              mainAxisSpacing: 14,
              crossAxisSpacing: 14,
              childAspectRatio: crossAxisCount == 1 ? 3.0 : 1.35,
            ),
            delegate: SliverChildBuilderDelegate(
              (context, index) {
                final mode = modes[index];
                return _buildModeCard(context, mode);
              },
              childCount: modes.length,
            ),
          );
        },
      ),
    );
  }

  Widget _buildModeCard(BuildContext context, GameModeItem mode) {
    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('${mode.title} selected! Mode under active build.')),
          );
        },
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                width: 56,
                height: 56,
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.surfaceGlass,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: mode.accentColor.withAlpha(60)),
                ),
                child: Image.asset(
                  mode.iconAsset,
                  fit: BoxFit.contain,
                  errorBuilder: (context, error, stackTrace) => Icon(
                    Icons.sports_soccer,
                    color: mode.accentColor,
                    size: 28,
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Row(
                      children: [
                        Flexible(
                          child: Text(
                            mode.title,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textPrimary,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        if (mode.badge != null) ...[
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: mode.accentColor.withAlpha(35),
                              borderRadius: BorderRadius.circular(4),
                              border: Border.all(color: mode.accentColor.withAlpha(100), width: 0.8),
                            ),
                            child: Text(
                              mode.badge!,
                              style: TextStyle(
                                fontSize: 9,
                                fontWeight: FontWeight.w800,
                                color: mode.accentColor,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      mode.tagline,
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppColors.textSecondary,
                        height: 1.25,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              const Icon(
                Icons.arrow_forward_ios_rounded,
                size: 14,
                color: AppColors.textMuted,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

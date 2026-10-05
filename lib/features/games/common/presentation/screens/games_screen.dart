import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:football_genius/core/constants/app_colors.dart';
import 'package:football_genius/core/constants/asset_paths.dart';
import 'package:football_genius/core/router/app_routes.dart';
import 'package:football_genius/shared/widgets/fg_bottom_nav_bar.dart';
import '../controllers/games_controller.dart';
import '../widgets/game_mode_card.dart';
import '../widgets/game_mode_filter_chips.dart';

class GamesScreen extends ConsumerStatefulWidget {
  const GamesScreen({super.key});

  @override
  ConsumerState<GamesScreen> createState() => _GamesScreenState();
}

class _GamesScreenState extends ConsumerState<GamesScreen> {
  int _navIndex = 1; // 'Games' tab selected

  void _showSnack(String message) {
    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final games = ref.watch(filteredGamesProvider);

    return Scaffold(
      backgroundColor: AppColors.pitchBlack,
      body: Stack(
        children: [
          // Background stadium ambient atmosphere
          Positioned.fill(
            child: Opacity(
              opacity: 0.10,
              child: Image.asset(
                AssetPaths.stadiumBg,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) =>
                    const SizedBox.shrink(),
              ),
            ),
          ),

          // Deep pitch radial gradient
          Positioned.fill(
            child: Container(
              decoration: const BoxDecoration(
                gradient: RadialGradient(
                  center: Alignment(0, -0.4),
                  radius: 1.2,
                  colors: [
                    Color(0xFF0C2413),
                    AppColors.pitchBlack,
                  ],
                ),
              ),
            ),
          ),

          // Main Scrollable Content
          SafeArea(
            bottom: false,
            child: CustomScrollView(
              physics: const BouncingScrollPhysics(),
              slivers: [
                // Top Header Bar
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(20, 12, 20, 16),
                    child: Row(
                      children: [
                        // Back Button
                        GestureDetector(
                          onTap: () {
                            if (context.canPop()) {
                              context.pop();
                            } else {
                              context.go(AppRoutes.home);
                            }
                          },
                          child: Container(
                            width: 40,
                            height: 40,
                            decoration: BoxDecoration(
                              color: AppColors.pitchCard,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: AppColors.borderSubtle),
                            ),
                            child: const Icon(
                              Icons.arrow_back_ios_new_rounded,
                              size: 16,
                              color: AppColors.textPrimary,
                            ),
                          ),
                        ),
                        const SizedBox(width: 14),
                        // Title Column
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: const [
                              Text(
                                'FOOTYGEN ARENA',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w900,
                                  letterSpacing: 1.4,
                                  color: AppColors.neonGreen,
                                ),
                              ),
                              SizedBox(height: 2),
                              Text(
                                'Game Modes',
                                style: TextStyle(
                                  fontSize: 24,
                                  fontWeight: FontWeight.w900,
                                  color: AppColors.textPrimary,
                                  letterSpacing: -0.5,
                                ),
                              ),
                            ],
                          ),
                        ),
                        // FootyGen Brand Logo
                        Image.asset(
                          AssetPaths.logo,
                          height: 34,
                          fit: BoxFit.contain,
                          errorBuilder: (context, error, stackTrace) =>
                              const SizedBox.shrink(),
                        ),
                      ],
                    ),
                  ),
                ),

                // Category Filter Pills
                const SliverToBoxAdapter(
                  child: Padding(
                    padding: EdgeInsets.only(bottom: 16),
                    child: GameModeFilterChips(),
                  ),
                ),

                // Game Modes List
                SliverPadding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, index) {
                        final game = games[index];
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 16),
                          child: GameModeCard(
                            game: game,
                            onPlay: () {
                              _showSnack('Launching ${game.title}...');
                            },
                          ),
                        );
                      },
                      childCount: games.length,
                    ),
                  ),
                ),

                // Bottom padding for navigation bar
                const SliverToBoxAdapter(
                  child: SizedBox(height: 80),
                ),
              ],
            ),
          ),
        ],
      ),
      bottomNavigationBar: FGBottomNavBar(
        selectedIndex: _navIndex,
        onItemSelected: (index) {
          if (index == _navIndex) return;
          setState(() => _navIndex = index);
          if (index == 0) {
            context.go(AppRoutes.home);
          } else if (index == 2) {
            _showSnack('Leaderboards & Ranks screen');
          } else if (index == 3) {
            _showSnack('User Profile screen');
          }
        },
      ),
    );
  }
}


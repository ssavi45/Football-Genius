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
import '../widgets/game_mode_grid_card.dart';

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
    final layout = ref.watch(gamesViewLayoutProvider);

    return Scaffold(
      backgroundColor: AppColors.pitchBlack,
      body: Stack(
        children: [
          // Background stadium ambient atmosphere
          Positioned.fill(
            child: Opacity(
              opacity: 0.08,
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
                    padding: const EdgeInsets.fromLTRB(20, 12, 20, 14),
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
                        const Expanded(
                          child: Text(
                            'Game Modes',
                            style: TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.w900,
                              color: AppColors.textPrimary,
                              letterSpacing: -0.5,
                            ),
                          ),
                        ),

                        // Segmented Layout Switcher [ ⊞ Grid | ☰ List ]
                        Container(
                          padding: const EdgeInsets.all(3),
                          decoration: BoxDecoration(
                            color: const Color(0xFF0C1910),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: AppColors.borderSubtle,
                              width: 1,
                            ),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              // Grid View Option
                              GestureDetector(
                                onTap: () {
                                  ref
                                      .read(gamesViewLayoutProvider.notifier)
                                      .setLayout(GamesViewLayout.grid);
                                },
                                child: AnimatedContainer(
                                  duration: const Duration(milliseconds: 150),
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 9, vertical: 5),
                                  decoration: BoxDecoration(
                                    color: layout == GamesViewLayout.grid
                                        ? AppColors.neonGreen.withAlpha(35)
                                        : Colors.transparent,
                                    borderRadius: BorderRadius.circular(9),
                                    border: layout == GamesViewLayout.grid
                                        ? Border.all(
                                            color: AppColors.neonGreen,
                                            width: 1.2,
                                          )
                                        : null,
                                  ),
                                  child: Icon(
                                    Icons.grid_view_rounded,
                                    size: 16,
                                    color: layout == GamesViewLayout.grid
                                        ? AppColors.neonGreen
                                        : AppColors.textSecondary,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 2),
                              // List View Option
                              GestureDetector(
                                onTap: () {
                                  ref
                                      .read(gamesViewLayoutProvider.notifier)
                                      .setLayout(GamesViewLayout.list);
                                },
                                child: AnimatedContainer(
                                  duration: const Duration(milliseconds: 150),
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 9, vertical: 5),
                                  decoration: BoxDecoration(
                                    color: layout == GamesViewLayout.list
                                        ? AppColors.neonGreen.withAlpha(35)
                                        : Colors.transparent,
                                    borderRadius: BorderRadius.circular(9),
                                    border: layout == GamesViewLayout.list
                                        ? Border.all(
                                            color: AppColors.neonGreen,
                                            width: 1.2,
                                          )
                                        : null,
                                  ),
                                  child: Icon(
                                    Icons.view_agenda_rounded,
                                    size: 16,
                                    color: layout == GamesViewLayout.list
                                        ? AppColors.neonGreen
                                        : AppColors.textSecondary,
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

                // Category Filter Pills
                const SliverToBoxAdapter(
                  child: Padding(
                    padding: EdgeInsets.only(bottom: 16),
                    child: GameModeFilterChips(),
                  ),
                ),

                // Game Modes Content (List View vs 2x4 Grid View)
                if (layout == GamesViewLayout.list)
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
                                ref
                                    .read(lastPlayedGameIdProvider.notifier)
                                    .setLastPlayed(game.id);
                                if (game.routePath == AppRoutes.scoreline) {
                                  context.push(game.routePath);
                                } else {
                                  _showSnack('Launching ${game.title}...');
                                }
                              },
                            ),
                          );
                        },
                        childCount: games.length,
                      ),
                    ),
                  )
                else
                  SliverPadding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    sliver: SliverGrid(
                      gridDelegate:
                          const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        crossAxisSpacing: 12,
                        mainAxisSpacing: 14,
                        childAspectRatio: 0.80,
                      ),
                      delegate: SliverChildBuilderDelegate(
                        (context, index) {
                          final game = games[index];
                          return GameModeGridCard(
                            game: game,
                            onPlay: () {
                              ref
                                  .read(lastPlayedGameIdProvider.notifier)
                                  .setLastPlayed(game.id);
                              if (game.routePath == AppRoutes.scoreline) {
                                context.push(game.routePath);
                              } else {
                                _showSnack('Launching ${game.title}...');
                              }
                            },
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


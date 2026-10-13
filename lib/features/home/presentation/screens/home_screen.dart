import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/asset_paths.dart';
import '../../../../core/router/app_routes.dart';
import '../../../games/common/presentation/controllers/games_controller.dart';
import '../widgets/featured_challenge_card.dart';
import '../widgets/home_bottom_nav_bar.dart';
import '../widgets/home_stats_ribbon.dart';
import '../widgets/home_top_bar.dart';
import '../widgets/quick_play_section.dart';
import '../widgets/scouts_duel_banner.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  int _navIndex = 0;

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
    final lastPlayedGame = ref.watch(lastPlayedGameProvider);

    return Scaffold(
      backgroundColor: AppColors.pitchBlack,
      body: Stack(
        children: [
          // Background stadium ambient atmosphere
          Positioned.fill(
            child: Opacity(
              opacity: 0.12,
              child: Image.asset(
                AssetPaths.stadiumBg,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) =>
                    const SizedBox.shrink(),
              ),
            ),
          ),
          // Deep pitch gradient overlay
          Positioned.fill(
            child: Container(
              decoration: const BoxDecoration(
                gradient: RadialGradient(
                  center: Alignment(0, -0.2),
                  radius: 1.1,
                  colors: [
                    Color(0xFF0D2514),
                    AppColors.pitchBlack,
                  ],
                ),
              ),
            ),
          ),

          // Scrollable Home View
          SafeArea(
            bottom: false,
            child: CustomScrollView(
              physics: const BouncingScrollPhysics(),
              slivers: [
                // Top Bar (Brand + Notifications + Avatar)
                const SliverToBoxAdapter(
                  child: HomeTopBar(),
                ),

                // Gamification Stats Ribbon (7 Day Streak | Level 12 | 1,240 XP)
                const SliverToBoxAdapter(
                  child: HomeStatsRibbon(),
                ),

                const SliverToBoxAdapter(
                  child: SizedBox(height: 6),
                ),

                // Last Played Card (resumes the game mode the user was last playing)
                SliverToBoxAdapter(
                  child: FeaturedChallengeCard(
                    onContinue: () {
                      if (lastPlayedGame.routePath == AppRoutes.scoreline) {
                        context.push(AppRoutes.scoreline);
                      } else {
                        _showSnack('Resuming ${lastPlayedGame.title}...');
                      }
                    },
                  ),
                ),

                const SliverToBoxAdapter(
                  child: SizedBox(height: 4),
                ),

                // Quick Play Horizontal Section (Higher or Lower | Pixel Pitch | Bootroom Scramble)
                SliverToBoxAdapter(
                  child: QuickPlaySection(
                    onSeeAll: () => context.push(AppRoutes.games),
                    onSelectMode: (mode) {
                      ref
                          .read(lastPlayedGameIdProvider.notifier)
                          .setLastPlayed(mode);
                      _showSnack('Selected mode: $mode');
                    },
                  ),
                ),

                // Scout's Duel Wide Banner Card
                SliverToBoxAdapter(
                  child: ScoutsDuelBanner(
                    onPlayNow: () {
                      ref
                          .read(lastPlayedGameIdProvider.notifier)
                          .setLastPlayed('scouts_duel');
                      _showSnack("Launching Scout's Duel...");
                    },
                  ),
                ),

                // Bottom Padding for Nav Bar
                const SliverToBoxAdapter(
                  child: SizedBox(height: 80),
                ),
              ],
            ),
          ),
        ],
      ),
      bottomNavigationBar: HomeBottomNavBar(
        selectedIndex: _navIndex,
        onItemSelected: (index) {
          if (index == _navIndex) return;
          setState(() => _navIndex = index);
          if (index == 1) {
            context.push(AppRoutes.games).then((_) {
              if (mounted) setState(() => _navIndex = 0);
            });
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


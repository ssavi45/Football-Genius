import 'dart:ui';
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
  late final ScrollController _scrollController;
  bool _isScrolled = false;

  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController();
    _scrollController.addListener(_onScroll);
  }

  void _onScroll() {
    final scrolled = _scrollController.hasClients && _scrollController.offset > 8;
    if (scrolled != _isScrolled) {
      setState(() => _isScrolled = scrolled);
    }
  }

  @override
  void dispose() {
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    super.dispose();
  }

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
          // Cinematic stadium wallpaper background
          Positioned.fill(
            child: Image.asset(
              AssetPaths.homeStadiumBg,
              fit: BoxFit.cover,
              alignment: Alignment.topCenter,
              errorBuilder: (context, error, stackTrace) =>
                  const SizedBox.shrink(),
            ),
          ),
          // Deep atmospheric gradient overlay for high UI legibility
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.black.withAlpha(130),
                    Colors.black.withAlpha(55),
                    Colors.black.withAlpha(85),
                    Colors.black.withAlpha(195),
                  ],
                  stops: const [0.0, 0.22, 0.65, 1.0],
                ),
              ),
            ),
          ),

          // Scrollable Home View
          Positioned.fill(
            child: CustomScrollView(
              controller: _scrollController,
              physics: const BouncingScrollPhysics(),
              slivers: [
                // Top spacing matching Safe Area top + HomeTopBar height (58)
                SliverToBoxAdapter(
                  child: SizedBox(
                    height: MediaQuery.paddingOf(context).top + 58,
                  ),
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
                    onSeeAll: () {
                      ref
                          .read(gamesViewLayoutProvider.notifier)
                          .setLayout(GamesViewLayout.grid);
                      context.push(AppRoutes.games);
                    },
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

          // Fixed Top Section (Brand + Notifications + Avatar)
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: ClipRect(
              child: BackdropFilter(
                filter: ImageFilter.blur(
                  sigmaX: _isScrolled ? 16 : 0,
                  sigmaY: _isScrolled ? 16 : 0,
                ),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  curve: Curves.easeInOut,
                  decoration: BoxDecoration(
                    color: _isScrolled
                        ? AppColors.pitchBlack.withAlpha(210)
                        : Colors.transparent,
                    border: Border(
                      bottom: BorderSide(
                        color: _isScrolled
                            ? Colors.white.withAlpha(18)
                            : Colors.transparent,
                        width: 0.8,
                      ),
                    ),
                  ),
                  child: const SafeArea(
                    bottom: false,
                    child: HomeTopBar(),
                  ),
                ),
              ),
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


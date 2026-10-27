import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/router/app_routes.dart';
import '../../../games/common/presentation/controllers/games_controller.dart';
import '../home_style.dart';
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
    _scrollController = ScrollController()..addListener(_onScroll);
  }

  void _onScroll() {
    final scrolled =
        _scrollController.hasClients && _scrollController.offset > 8;
    if (scrolled != _isScrolled) setState(() => _isScrolled = scrolled);
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
      SnackBar(content: Text(message), duration: const Duration(seconds: 2)),
    );
  }

  @override
  Widget build(BuildContext context) {
    final lastPlayedGame = ref.watch(lastPlayedGameProvider);
    final u = HomeStyle.unit(context);
    final topInset = MediaQuery.paddingOf(context).top;
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: HomeStyle.systemBars,
      child: Theme(
        data: HomeStyle.theme,
        child: Scaffold(
          backgroundColor: HomeStyle.background,
          body: Stack(
            children: [
              const Positioned.fill(
                child: CustomPaint(painter: _IvoryBackground()),
              ),
              SafeArea(
                top: false,
                bottom: false,
                child: Center(
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(
                      maxWidth: HomeStyle.maxWidth,
                    ),
                    child: SizedBox.expand(
                      child: Stack(
                        children: [
                          Positioned.fill(
                            child: LayoutBuilder(
                              builder: (context, viewport) {
                                final cardWidth = viewport.maxWidth - 30 * u;
                                final tileWidth = (cardWidth - 16 * u) / 3;
                                final baseline =
                                    topInset +
                                    (64 + 52 + 8 + 48 + 8 + 112 + 8) * u +
                                    cardWidth / 1.7 +
                                    tileWidth;
                                // Grow the artwork on tall phones; never shrink
                                // content or accessibility text to force a fit.
                                final extra = HomeStyle.largeText(context)
                                    ? 0.0
                                    : (viewport.maxHeight - baseline).clamp(
                                        0.0,
                                        double.infinity,
                                      );
                                return SingleChildScrollView(
                                  key: const ValueKey('home-scroll'),
                                  controller: _scrollController,
                                  physics: const BouncingScrollPhysics(),
                                  child: ConstrainedBox(
                                    constraints: BoxConstraints(
                                      minHeight: viewport.maxHeight,
                                    ),
                                    child: Column(
                                      mainAxisAlignment:
                                          MainAxisAlignment.spaceBetween,
                                      children: [
                                        SizedBox(height: topInset + 64 * u),
                                        const HomeStatsRibbon(),
                                        SizedBox(height: 8 * u),
                                        Padding(
                                          padding: EdgeInsets.symmetric(
                                            horizontal: HomeStyle.margin * u,
                                          ),
                                          child: FeaturedChallengeCard(
                                            extraHeight: extra * .5,
                                            onContinue: () {
                                              if (lastPlayedGame.routePath ==
                                                  AppRoutes.scoreline) {
                                                context.push(
                                                  AppRoutes.scoreline,
                                                );
                                              } else {
                                                _showSnack(
                                                  'Resuming ${lastPlayedGame.title}...',
                                                );
                                              }
                                            },
                                          ),
                                        ),
                                        Padding(
                                          padding: EdgeInsets.symmetric(
                                            horizontal: HomeStyle.margin * u,
                                          ),
                                          child: QuickPlaySection(
                                            extraHeight: extra * .3,
                                            onSeeAll: () {
                                              ref
                                                  .read(
                                                    gamesViewLayoutProvider
                                                        .notifier,
                                                  )
                                                  .setLayout(
                                                    GamesViewLayout.grid,
                                                  );
                                              context.push(AppRoutes.games);
                                            },
                                            onSelectMode: (mode) {
                                              ref
                                                  .read(
                                                    lastPlayedGameIdProvider
                                                        .notifier,
                                                  )
                                                  .setLastPlayed(mode);
                                              _showSnack(
                                                'Selected mode: $mode',
                                              );
                                            },
                                          ),
                                        ),
                                        SizedBox(height: 8 * u),
                                        Padding(
                                          padding: EdgeInsets.symmetric(
                                            horizontal: HomeStyle.margin * u,
                                          ),
                                          child: ScoutsDuelBanner(
                                            extraHeight: extra * .2,
                                            onPlayNow: () {
                                              ref
                                                  .read(
                                                    lastPlayedGameIdProvider
                                                        .notifier,
                                                  )
                                                  .setLastPlayed('scouts_duel');
                                              _showSnack(
                                                "Launching Scout's Duel...",
                                              );
                                            },
                                          ),
                                        ),
                                        SizedBox(height: 8 * u),
                                      ],
                                    ),
                                  ),
                                );
                              },
                            ),
                          ),
                          Positioned(
                            top: 0,
                            left: 0,
                            right: 0,
                            child: ClipRect(
                              child: BackdropFilter(
                                filter: ImageFilter.blur(
                                  sigmaX: _isScrolled ? 12 : 0,
                                  sigmaY: _isScrolled ? 12 : 0,
                                ),
                                child: AnimatedContainer(
                                  duration:
                                      MediaQuery.disableAnimationsOf(context)
                                      ? Duration.zero
                                      : const Duration(milliseconds: 160),
                                  decoration: BoxDecoration(
                                    color: _isScrolled
                                        ? Colors.white.withValues(alpha: .91)
                                        : Colors.transparent,
                                    border: Border(
                                      bottom: BorderSide(
                                        color: _isScrolled
                                            ? const Color(0xFFEDECE7)
                                            : Colors.transparent,
                                        width: .5,
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
        ),
      ),
    );
  }
}

class _IvoryBackground extends CustomPainter {
  const _IvoryBackground();
  @override
  void paint(Canvas canvas, Size size) {
    final wedge = Path()
      ..moveTo(size.width * .57, 0)
      ..lineTo(size.width, size.width * .32)
      ..lineTo(size.width, 0)
      ..close();
    canvas.drawPath(wedge, Paint()..color = const Color(0x66F1EAD9));
  }

  @override
  bool shouldRepaint(_IvoryBackground oldDelegate) => false;
}

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../../core/router/app_routes.dart';
import '../../../../../shared/models/game_metadata.dart';
import '../../../../home/presentation/home_style.dart';
import '../../../../home/presentation/widgets/home_bottom_nav_bar.dart';
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
  int _navIndex = 1;
  void _showSnack(String message) {
    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), duration: const Duration(seconds: 2)),
    );
  }

  void _play(GameMetadata game) {
    ref.read(lastPlayedGameIdProvider.notifier).setLastPlayed(game.id);
    if (game.routePath == AppRoutes.scoreline) {
      context.push(game.routePath);
    } else {
      _showSnack('Launching ${game.title}...');
    }
  }

  @override
  Widget build(BuildContext context) {
    final games = ref.watch(filteredGamesProvider);
    final layout = ref.watch(gamesViewLayoutProvider);
    final u = HomeStyle.unit(context);
    final large = HomeStyle.largeText(context);
    final scale = MediaQuery.textScalerOf(context).scale(14) / 14;
    final topInset = MediaQuery.paddingOf(context).top;
    final list = layout == GamesViewLayout.list || large;
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: HomeStyle.systemBars,
      child: Theme(
        data: HomeStyle.theme,
        child: Scaffold(
          backgroundColor: HomeStyle.background,
          body: DecoratedBox(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  HomeStyle.background,
                  Color(0xFFFAF7EF),
                  HomeStyle.background,
                ],
                stops: [0, .35, .7],
              ),
            ),
            child: SafeArea(
              top: false,
              bottom: false,
              child: Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(
                    maxWidth: HomeStyle.maxWidth,
                  ),
                  child: Stack(
                    children: [
                      CustomScrollView(
                        key: const ValueKey('games-scroll'),
                        physics: const BouncingScrollPhysics(),
                        slivers: [
                          SliverToBoxAdapter(
                            child: SizedBox(height: topInset + 14 * u),
                          ),
                          SliverPadding(
                            padding: EdgeInsets.symmetric(horizontal: 15 * u),
                            sliver: SliverToBoxAdapter(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  if (large) ...[
                                    Text(
                                      'Game Modes',
                                      style: HomeStyle.text(
                                        29 * u,
                                        weight: FontWeight.w800,
                                        spacing: -.8,
                                      ),
                                    ),
                                    SizedBox(height: 8 * u),
                                    _LayoutSwitch(
                                      layout: layout,
                                      onChanged: (value) => ref
                                          .read(
                                            gamesViewLayoutProvider.notifier,
                                          )
                                          .setLayout(value),
                                    ),
                                  ] else
                                    Row(
                                      children: [
                                        Expanded(
                                          child: Text(
                                            'Game Modes',
                                            style: HomeStyle.text(
                                              29 * u,
                                              weight: FontWeight.w800,
                                              spacing: -.8,
                                            ),
                                          ),
                                        ),
                                        _LayoutSwitch(
                                          layout: layout,
                                          onChanged: (value) => ref
                                              .read(
                                                gamesViewLayoutProvider
                                                    .notifier,
                                              )
                                              .setLayout(value),
                                        ),
                                      ],
                                    ),
                                  SizedBox(height: 4 * u),
                                  Text(
                                    'Know Football. Prove It.',
                                    style: HomeStyle.text(
                                      13 * u,
                                      color: const Color(0xFF7D858C),
                                    ),
                                  ),
                                  SizedBox(height: 15 * u),
                                ],
                              ),
                            ),
                          ),
                          const SliverToBoxAdapter(
                            child: GameModeFilterChips(),
                          ),
                          SliverToBoxAdapter(child: SizedBox(height: 13 * u)),
                          if (games.isEmpty)
                            const SliverToBoxAdapter(
                              child: Padding(
                                padding: EdgeInsets.all(32),
                                child: Text('No games in this category yet.'),
                              ),
                            )
                          else if (list)
                            SliverPadding(
                              padding: EdgeInsets.symmetric(horizontal: 15 * u),
                              sliver: SliverList.separated(
                                itemCount: games.length,
                                separatorBuilder: (_, _) =>
                                    SizedBox(height: 14 * u),
                                itemBuilder: (_, i) => GameModeCard(
                                  game: games[i],
                                  onPlay: () => _play(games[i]),
                                ),
                              ),
                            )
                          else
                            SliverPadding(
                              padding: EdgeInsets.symmetric(horizontal: 15 * u),
                              sliver: SliverGrid(
                                gridDelegate:
                                    SliverGridDelegateWithFixedCrossAxisCount(
                                      crossAxisCount: 2,
                                      crossAxisSpacing: 12 * u,
                                      mainAxisSpacing: 14 * u,
                                      mainAxisExtent:
                                          (190 +
                                              (scale - 1).clamp(0, 1) * 160) *
                                          u,
                                    ),
                                delegate: SliverChildBuilderDelegate(
                                  (_, i) => GameModeGridCard(
                                    game: games[i],
                                    onPlay: () => _play(games[i]),
                                  ),
                                  childCount: games.length,
                                ),
                              ),
                            ),
                          SliverToBoxAdapter(child: SizedBox(height: 18 * u)),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
          bottomNavigationBar: HomeBottomNavBar(
            selectedIndex: _navIndex,
            onItemSelected: (index) {
              if (index == _navIndex) return;
              setState(() => _navIndex = index);
              if (index == 0) {
                if (context.canPop()) {
                  context.pop();
                } else {
                  context.go(AppRoutes.home);
                }
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

class _LayoutSwitch extends StatelessWidget {
  const _LayoutSwitch({required this.layout, required this.onChanged});
  final GamesViewLayout layout;
  final ValueChanged<GamesViewLayout> onChanged;
  @override
  Widget build(BuildContext context) => Container(
    decoration: BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(15),
      border: Border.all(color: const Color(0xFFECEAE2)),
    ),
    padding: const EdgeInsets.all(2),
    child: Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        for (final mode in const [GamesViewLayout.grid, GamesViewLayout.list])
          IconButton(
            tooltip: mode == GamesViewLayout.grid ? 'Grid view' : 'List view',
            onPressed: () => onChanged(mode),
            isSelected: layout == mode,
            constraints: const BoxConstraints(minWidth: 48, minHeight: 48),
            style: IconButton.styleFrom(
              backgroundColor: layout == mode
                  ? const Color(0xFFE7F0EB)
                  : Colors.transparent,
              foregroundColor: layout == mode
                  ? HomeStyle.teal
                  : HomeStyle.muted,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(11),
              ),
            ),
            icon: Icon(
              mode == GamesViewLayout.grid
                  ? Icons.grid_view_rounded
                  : Icons.view_agenda_rounded,
              size: 21,
            ),
          ),
      ],
    ),
  );
}

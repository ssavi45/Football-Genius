import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'core/router/app_router.dart';
import 'core/router/app_routes.dart';
import 'core/theme/app_theme.dart';
import 'features/games/common/presentation/screens/games_screen.dart';
import 'features/games/scoreline/presentation/screens/scoreline_screen.dart';
import 'features/home/presentation/screens/home_screen.dart';
import 'features/games/higher_lower/domain/higher_lower_models.dart';
import 'features/games/higher_lower/presentation/screens/higher_lower_lobby.dart';
import 'features/games/higher_lower/presentation/screens/higher_lower_duel.dart';

/// Root application widget configuring MaterialApp with theme and GoRouter.
class FootballGeniusApp extends StatelessWidget {
  const FootballGeniusApp({super.key});

  /// Feature route definitions composed at the application root.
  static List<RouteBase> get appRoutes => [
    GoRoute(
      path: AppRoutes.home,
      name: 'home',
      builder: (context, state) => const HomeScreen(),
    ),
    GoRoute(
      path: AppRoutes.games,
      name: 'games',
      builder: (context, state) => const GamesScreen(),
    ),
    GoRoute(
      path: AppRoutes.higherLower,
      name: 'higher-lower',
      builder: (context, state) => const HigherLowerLobby(),
      routes: [
        GoRoute(
          path: 'play/:category',
          redirect: (context, state) =>
              HlCategory.values.any(
                (category) => category.name == state.pathParameters['category'],
              )
              ? null
              : AppRoutes.higherLower,
          builder: (context, state) => HigherLowerDuel(
            category: HlCategory.parse(state.pathParameters['category']!),
          ),
        ),
      ],
    ),
    GoRoute(
      path: AppRoutes.scoreline,
      name: 'scoreline',
      builder: (context, state) => const ScorelineScreen(),
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Football Genius',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      routerConfig: AppRouter.router,
    );
  }
}

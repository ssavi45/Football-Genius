import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:football_genius/app.dart';
import 'package:football_genius/core/router/app_router.dart';
import 'package:football_genius/features/games/common/presentation/controllers/games_controller.dart';
import 'package:football_genius/features/games/common/presentation/screens/games_screen.dart';
import 'package:football_genius/features/games/common/presentation/widgets/game_mode_tile.dart';
import 'package:football_genius/features/games/common/presentation/widgets/game_mode_grid_card.dart';
import 'package:football_genius/features/games/common/presentation/widgets/game_mode_card.dart';
import 'package:football_genius/features/home/presentation/home_style.dart';
import 'package:football_genius/features/home/presentation/widgets/home_bottom_nav_bar.dart';
import 'package:football_genius/features/home/presentation/widgets/home_top_bar.dart';
import 'package:football_genius/features/home/presentation/screens/home_screen.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  setUpAll(() async {
    await (FontLoader(
      'Outfit',
    )..addFont(rootBundle.load('assets/fonts/Outfit.ttf'))).load();
    await (FontLoader(
      'MaterialIcons',
    )..addFont(rootBundle.load('fonts/MaterialIcons-Regular.otf'))).load();
  });
  setUp(() => SharedPreferences.setMockInitialValues({}));

  Future<ProviderContainer> mount(
    WidgetTester tester, {
    double width = 393,
    double height = 873,
    double scale = 1,
  }) async {
    tester.view.devicePixelRatio = 1;
    tester.view.physicalSize = Size(width, height);
    tester.view.padding = const FakeViewPadding(top: 24, bottom: 16);
    addTearDown(tester.view.resetDevicePixelRatio);
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetPadding);
    AppRouter.initialize(
      routes: FootballGeniusApp.appRoutes,
      initialLocation: '/games',
    );
    addTearDown(AppRouter.router.dispose);
    final container = ProviderContainer();
    addTearDown(container.dispose);
    await tester.pumpWidget(
      UncontrolledProviderScope(
        container: container,
        child: RepaintBoundary(
          key: const ValueKey('games-golden'),
          child: scale == 1
              ? const FootballGeniusApp()
              : MaterialApp(
                  home: Builder(
                    builder: (context) => MediaQuery(
                      data: MediaQuery.of(context)
                          .copyWith(textScaler: TextScaler.linear(scale)),
                      child: const GamesScreen(),
                    ),
                  ),
                ),
        ),
      ),
    );
    await tester.runAsync(() async {
      final context = tester.element(find.byType(GamesScreen));
      for (final path in [
        HomeArt.logo,
        HomeArt.portrait,
        ...container.read(allGamesProvider).map(GameModeArt.path),
      ]) {
        await precacheImage(AssetImage(path), context);
      }
    });
    await tester.pumpAndSettle();
    return container;
  }

  testWidgets(
    'light catalogue shares Home dock and renders grid/list goldens',
    (tester) async {
      await mount(tester);
      expect(find.byType(HomeBottomNavBar), findsOneWidget);
      expect(
        tester
            .widget<HomeBottomNavBar>(find.byType(HomeBottomNavBar))
            .selectedIndex,
        1,
      );
      expect(
        Theme.of(tester.element(find.byType(HomeBottomNavBar))).brightness,
        Brightness.light,
      );
      expect(tester.takeException(), isNull);
      await expectLater(
        find.byKey(const ValueKey('games-golden')),
        matchesGoldenFile('goldens/games_grid.png'),
      );
      await tester.tap(find.byTooltip('List view'));
      await tester.pumpAndSettle();
      expect(find.byType(GameModeCard), findsWidgets);
      expect(tester.takeException(), isNull);
      await expectLater(
        find.byKey(const ValueKey('games-golden')),
        matchesGoldenFile('goldens/games_list.png'),
      );
    },
  );

  for (final width in [320.0, 360.0, 393.0, 430.0, 768.0]) {
    testWidgets('catalogue scrolls cleanly at width $width', (tester) async {
      await mount(tester, width: width);
      expect(tester.takeException(), isNull);
      expect(find.byType(HomeTopBar), findsNothing);
      final dockY = tester.getTopLeft(find.byType(HomeBottomNavBar)).dy;
      await tester.drag(
        find.byKey(const ValueKey('games-scroll')),
        const Offset(0, -1600),
      );
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);
      expect(tester.getTopLeft(find.byType(HomeBottomNavBar)).dy, dockY);
    });
  }

  for (final scale in [1.3, 2.0]) {
    testWidgets('catalogue supports $scale text on small phones', (
      tester,
    ) async {
      await mount(tester, width: 320, scale: scale);
      expect(tester.takeException(), isNull);
      await tester.drag(
        find.byKey(const ValueKey('games-scroll')),
        const Offset(0, -1200),
      );
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);
      if (scale > 1.3) expect(find.byType(GameModeGridCard), findsNothing);
    });
  }

  testWidgets(
    'filters preserve selection and game callbacks persist last played',
    (tester) async {
      final container = await mount(tester);
      await tester.tap(find.text('Daily'));
      await tester.pumpAndSettle();
      expect(container.read(filteredGamesProvider).map((g) => g.id), [
        'matrix',
      ]);
      await tester.tap(find.text('Football Matrix'));
      await tester.pumpAndSettle();
      expect(container.read(lastPlayedGameIdProvider), 'matrix');
      expect(
        (await SharedPreferences.getInstance()).getString(
          'last_played_game_id',
        ),
        'matrix',
      );
      expect(find.text('Launching Football Matrix...'), findsOneWidget);
      await tester.tap(find.byTooltip('List view'));
      await tester.pumpAndSettle();
      expect(container.read(selectedGameCategoryProvider), 'Daily');
      expect(container.read(gamesViewLayoutProvider), GamesViewLayout.list);
    },
  );

  testWidgets('dock Home returns from a direct catalogue entry', (
    tester,
  ) async {
    await mount(tester);
    await tester.tap(find.text('Home'));
    await tester.pumpAndSettle();
    expect(find.byType(HomeScreen), findsOneWidget);
    expect(
      tester
          .widget<HomeBottomNavBar>(find.byType(HomeBottomNavBar))
          .selectedIndex,
      0,
    );
    expect(tester.takeException(), isNull);
  });
}

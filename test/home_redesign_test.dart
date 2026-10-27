import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:football_genius/app.dart';
import 'package:football_genius/core/router/app_router.dart';
import 'package:football_genius/features/home/presentation/home_style.dart';
import 'package:football_genius/features/home/presentation/widgets/home_bottom_nav_bar.dart';
import 'package:football_genius/features/home/presentation/widgets/home_top_bar.dart';
import 'package:football_genius/features/home/presentation/widgets/scouts_duel_banner.dart';
import 'package:football_genius/features/home/presentation/widgets/featured_challenge_card.dart';
import 'package:football_genius/features/home/presentation/screens/home_screen.dart';
import 'package:football_genius/features/games/common/presentation/controllers/games_controller.dart';
import 'package:football_genius/features/games/scoreline/data/datasources/scoreline_local_datasource.dart';
import 'package:football_genius/features/games/scoreline/presentation/controllers/scoreline_controller.dart';
import 'package:football_genius/features/games/scoreline/presentation/controllers/scoreline_state.dart';
import 'package:football_genius/features/games/scoreline/presentation/screens/scoreline_screen.dart';
import 'package:football_genius/features/games/common/presentation/screens/games_screen.dart';

class _FixedSession extends ScorelineController {
  _FixedSession(this.initial);
  final ScorelineState initial;
  @override
  ScorelineState build() => initial;
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  late ScorelineState fixture;
  setUpAll(() async {
    final loader = FontLoader('Outfit')
      ..addFont(rootBundle.load('assets/fonts/Outfit.ttf'));
    await loader.load();
    final icons = FontLoader('MaterialIcons')
      ..addFont(rootBundle.load('fonts/MaterialIcons-Regular.otf'));
    await icons.load();
    final all = await const ScorelineLocalDatasource().getMatches();
    final matches = all.map((dto) => dto.toEntity()).toList();
    final derby = matches.firstWhere(
      (m) =>
          m.homeTeamName.contains('Real Madrid') &&
          m.awayTeamName.contains('Barcelona'),
    );
    fixture = ScorelineState(
      status: ScorelineGameStatus.guessing,
      matches: [derby, ...matches.where((m) => m.id != derby.id).take(9)],
      currentGuessedHome: 2,
      currentGuessedAway: 1,
    );
  });
  setUp(() => SharedPreferences.setMockInitialValues({}));

  Future<ProviderContainer> mount(
    WidgetTester tester, {
    double width = 393,
    double height = 698,
    double textScale = 1,
    bool golden = false,
  }) async {
    final ratio = golden ? 941 / 393 : 1.0;
    tester.view.devicePixelRatio = ratio;
    tester.view.physicalSize = Size(width * ratio, height * ratio);
    tester.view.padding = FakeViewPadding(top: 24 * ratio, bottom: 16 * ratio);
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    addTearDown(tester.view.resetPadding);
    AppRouter.initialize(routes: FootballGeniusApp.appRoutes);
    final container = ProviderContainer(
      overrides: [
        scorelineControllerProvider.overrideWith(() => _FixedSession(fixture)),
      ],
    );
    addTearDown(container.dispose);
    await tester.pumpWidget(
      UncontrolledProviderScope(
        container: container,
        child: RepaintBoundary(
          key: const ValueKey('home-golden'),
          child: const FootballGeniusApp(),
        ),
      ),
    );
    // MaterialApp owns MediaQuery, so apply the accessibility override within its route.
    if (textScale != 1) {
      await tester.pumpWidget(
        UncontrolledProviderScope(
          container: container,
          child: MaterialApp(
            home: Builder(
              builder: (context) => MediaQuery(
                data: MediaQuery.of(context)
                    .copyWith(textScaler: TextScaler.linear(textScale)),
                child: const HomeScreen(),
              ),
            ),
          ),
        ),
      );
    }
    await tester.runAsync(() async {
      final context = tester.element(find.byType(HomeScreen));
      for (final art in [
        HomeArt.logo,
        HomeArt.scoreline,
        HomeArt.portrait,
        HomeArt.higherLower,
        HomeArt.pixelPitch,
        HomeArt.bootroom,
        HomeArt.scoutsDuel,
        HomeArt.scorecard,
        'assets/images/branding/scoreline_hero_logo.png',
        fixture.currentMatch!.homeTeamCrestPath,
        fixture.currentMatch!.awayTeamCrestPath,
      ]) {
        await precacheImage(AssetImage(art), context);
      }
    });
    await tester.pumpAndSettle();
    return container;
  }

  testWidgets(
    'reference-proportion Home golden uses real Flutter UI and original artwork',
    (tester) async {
      await mount(tester, golden: true);
      expect(find.text('LAST PLAYED'), findsOneWidget);
      expect(find.text('Bootroom Scramble'), findsOneWidget);
      expect(find.text('2 - 1'), findsOneWidget);
      expect(tester.takeException(), isNull);
      await expectLater(
        find.byKey(const ValueKey('home-golden')),
        matchesGoldenFile('goldens/home_light.png'),
      );
      await tester.drag(
        find.byKey(const ValueKey('home-scroll')),
        const Offset(0, -240),
      );
      await tester.pumpAndSettle();
      expect(
        tester.getBottomLeft(find.text('Play Now')).dy,
        lessThan(tester.getTopLeft(find.byType(HomeBottomNavBar)).dy),
      );
      await expectLater(
        find.byKey(const ValueKey('home-golden')),
        matchesGoldenFile('goldens/home_light_scrolled.png'),
      );
    },
  );

  for (final width in [320.0, 360.0, 393.0, 430.0, 768.0]) {
    testWidgets('Home is responsive without overflow at width $width', (
      tester,
    ) async {
      await mount(tester, width: width, height: 900);
      expect(tester.takeException(), isNull);
      expect(find.text('Higher or\nLower'), findsOneWidget);
      expect(find.text('Pixel Pitch'), findsOneWidget);
      expect(find.text('Bootroom Scramble'), findsOneWidget);
      expect(
        find.descendant(
          of: find.byType(FeaturedChallengeCard),
          matching: find.byType(LinearProgressIndicator),
        ),
        findsNothing,
      );
      final scroll = find.byKey(const ValueKey('home-scroll'));
      final headerY = tester.getTopLeft(find.byType(HomeTopBar)).dy;
      await tester.drag(scroll, const Offset(0, -350));
      await tester.pumpAndSettle();
      expect(tester.getTopLeft(find.byType(HomeTopBar)).dy, headerY);
      expect(find.text('Play Now'), findsOneWidget);
      expect(tester.takeException(), isNull);
    });
  }

  testWidgets('small phone supports 2x text and keeps Scout CTA reachable', (
    tester,
  ) async {
    await mount(tester, width: 320, height: 700, textScale: 2);
    expect(tester.takeException(), isNull);
    await tester.scrollUntilVisible(
      find.text('Play Now'),
      250,
      scrollable: find.descendant(
        of: find.byKey(const ValueKey('home-scroll')),
        matching: find.byType(Scrollable),
      ),
    );
    await tester.pumpAndSettle();
    expect(tester.takeException(), isNull);
    expect(
      tester.getBottomLeft(find.text('Play Now')).dy,
      lessThan(tester.getTopLeft(find.byType(HomeBottomNavBar)).dy),
    );
  });

  testWidgets('Home respects a tall status safe area and 1.3x text', (
    tester,
  ) async {
    await mount(tester, width: 360, height: 780, textScale: 1.3);
    tester.view.padding = const FakeViewPadding(top: 44, bottom: 34);
    await tester.pumpAndSettle();
    expect(tester.getTopLeft(find.byType(HomeTopBar)).dy, 44);
    expect(tester.takeException(), isNull);
    expect(find.widgetWithText(HomeGoldButton, 'CONTINUE'), findsOneWidget);
  });

  testWidgets('tall phone fills the viewport instead of leaving a lower gap', (
    tester,
  ) async {
    await mount(tester, width: 393, height: 873, golden: true);
    final bannerBottom = tester.getBottomLeft(find.byType(ScoutsDuelBanner)).dy;
    final navTop = tester.getTopLeft(find.byType(HomeBottomNavBar)).dy;
    expect(navTop - bannerBottom, inInclusiveRange(0, 15));
    expect(
      tester.getSize(find.byKey(const ValueKey('home-featured-card'))).height,
      greaterThan(240),
    );
    expect(tester.takeException(), isNull);
    await expectLater(
      find.byKey(const ValueKey('home-golden')),
      matchesGoldenFile('goldens/home_light_tall.png'),
    );
  });

  testWidgets('Continue preserves Scoreline progress and dark game theme', (
    tester,
  ) async {
    final container = await mount(tester, width: 520, height: 1000);
    container.read(scorelineControllerProvider.notifier).incrementHomeScore();
    await tester.pump(const Duration(milliseconds: 450));
    // Decorative preview stays static while the real game state advances.
    expect(find.text('2 - 1'), findsOneWidget);
    expect(find.textContaining('Round 1/'), findsNothing);
    await tester.tap(find.text('CONTINUE'));
    // Scoreline intentionally runs a continuous stadium animation.
    await tester.pump(const Duration(milliseconds: 450));
    expect(find.byType(ScorelineScreen), findsOneWidget);
    expect(container.read(scorelineControllerProvider).currentGuessedHome, 3);
    expect(
      Theme.of(tester.element(find.byType(ScorelineScreen))).brightness,
      Brightness.dark,
    );
    AppRouter.router.pop();
    await tester.pumpAndSettle();
    expect(find.byType(HomeScreen), findsOneWidget);
    expect(
      Theme.of(tester.element(find.byType(HomeBottomNavBar))).brightness,
      Brightness.light,
    );
    final homeOverlay = find.descendant(
      of: find.byType(HomeScreen),
      matching: find.byType(AnnotatedRegion<SystemUiOverlayStyle>),
    );
    final overlay = tester
        .widget<AnnotatedRegion<SystemUiOverlayStyle>>(homeOverlay.first)
        .value;
    expect(overlay.statusBarIconBrightness, Brightness.dark);
    expect(overlay.systemNavigationBarColor, Colors.white);
  });

  testWidgets(
    'Quick Play retains canonical last-played and snackbar behavior',
    (tester) async {
      final container = await mount(tester, height: 850);
      await tester.tap(find.text('Bootroom Scramble'));
      await tester.pumpAndSettle();
      expect(container.read(lastPlayedGameIdProvider), 'scramble');
      expect(
        find.descendant(
          of: find.byType(FeaturedChallengeCard),
          matching: find.text('Bootroom Scramble'),
        ),
        findsOneWidget,
      );
      expect(find.text('Selected mode: unscramble'), findsOneWidget);
    },
  );

  testWidgets('See all keeps Games navigation and the shared light dock', (
    tester,
  ) async {
    await mount(tester, height: 850);
    await tester.tap(find.text('See all'));
    await tester.pumpAndSettle();
    expect(find.byType(GamesScreen), findsOneWidget);
    expect(find.byType(HomeBottomNavBar), findsOneWidget);
    expect(
      Theme.of(tester.element(find.byType(HomeBottomNavBar))).brightness,
      Brightness.light,
    );
    AppRouter.router.pop();
    await tester.pumpAndSettle();
    await tester.tap(find.text('Games'));
    await tester.pumpAndSettle();
    expect(find.byType(GamesScreen), findsOneWidget);
  });

  testWidgets('missing decorative artwork has a non-crashing fallback', (
    tester,
  ) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: SizedBox(
          width: 100,
          height: 100,
          child: HomeArtwork('assets/images/home/missing.webp'),
        ),
      ),
    );
    await tester.pumpAndSettle();
    expect(tester.takeException(), isNull);
    expect(find.byType(ColoredBox), findsWidgets);
  });
}

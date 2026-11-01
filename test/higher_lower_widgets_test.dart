import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:football_genius/app.dart';
import 'package:football_genius/core/router/app_router.dart';
import 'package:football_genius/core/router/app_routes.dart';
import 'package:football_genius/features/games/higher_lower/domain/higher_lower_models.dart';
import 'package:football_genius/features/games/higher_lower/presentation/controllers/higher_lower_providers.dart';
import 'package:football_genius/features/games/higher_lower/presentation/widgets/higher_lower_lobby_art.dart';
import 'package:football_genius/features/games/higher_lower/presentation/widgets/higher_lower_widgets.dart';

import 'support/higher_lower_harness.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  Future<void> settle(WidgetTester tester) async {
    // Let real bundle/repository futures and Riverpod frame publication advance
    // together instead of waiting on real I/O with only the fake test clock.
    for (var step = 0; step < 40; step++) {
      await tester.pump(const Duration(milliseconds: 20));
      await tester.runAsync(
        () => Future<void>.delayed(const Duration(milliseconds: 5)),
      );
      if (!tester.binding.hasScheduledFrame &&
          find.byType(CircularProgressIndicator).evaluate().isEmpty &&
          find.byType(LinearProgressIndicator).evaluate().isEmpty) {
        break;
      }
    }
    await tester.pumpAndSettle(
      const Duration(milliseconds: 100),
      EnginePhase.sendSemanticsUpdate,
      const Duration(seconds: 5),
    );
  }

  late HlHarness harness;
  final identityFixtures = <String, ImageProvider<Object>>{};
  setUpAll(() async {
    final entries = jsonDecode(
      File('test/fixtures/higher_lower/provenance.json').readAsStringSync(),
    ) as List;
    for (final item in entries) {
      identityFixtures[item['source'] as String] = MemoryImage(
        File('test/fixtures/higher_lower/${item['fixture']}').readAsBytesSync(),
      );
    }
    await (FontLoader(
      'Outfit',
    )..addFont(rootBundle.load('assets/fonts/Outfit.ttf'))).load();
    await (FontLoader(
      'MaterialIcons',
    )..addFont(rootBundle.load('fonts/MaterialIcons-Regular.otf'))).load();
    await (FontLoader('BarlowSemiCondensed')
          ..addFont(
            rootBundle.load('assets/fonts/BarlowSemiCondensed-BlackItalic.ttf'),
          )
          ..addFont(
            rootBundle.load('assets/fonts/BarlowSemiCondensed-Regular.ttf'),
          )
          ..addFont(
            rootBundle.load(
              'assets/fonts/BarlowSemiCondensed-MediumItalic.ttf',
            ),
          ))
        .load();
  });
  setUp(() async {
    SharedPreferences.setMockInitialValues({});
    harness = await HlHarness.create();
  });
  tearDown(() => harness.dispose());
  Future<ProviderContainer> mount(
    WidgetTester tester, {
    double width = 393,
    double height = 852,
    double textScale = 1,
    double safeTop = 0,
    String route = AppRoutes.higherLower,
    bool reducedMotion = false,
    bool photoFixtures = false,
    bool waitForReady = true,
  }) async {
    tester.view.devicePixelRatio = 1;
    tester.view.physicalSize = Size(width, height);
    addTearDown(tester.view.resetDevicePixelRatio);
    addTearDown(tester.view.resetPhysicalSize);
    final scope = harness.container(
      imageOverrides: photoFixtures ? identityFixtures : const {},
    );
    addTearDown(scope.dispose);
    AppRouter.initialize(
      routes: FootballGeniusApp.appRoutes,
      initialLocation: route,
    );
    addTearDown(AppRouter.router.dispose);
    await tester.pumpWidget(
      UncontrolledProviderScope(
        container: scope,
        child: RepaintBoundary(
          key: const ValueKey('hl-golden'),
          child: MediaQuery(
            data: MediaQueryData(
              size: Size(width, height),
              textScaler: TextScaler.linear(textScale),
              disableAnimations: reducedMotion,
              padding: EdgeInsets.only(top: safeTop),
            ),
            child: const FootballGeniusApp(),
          ),
        ),
      ),
    );
    await tester.pump();
    await tester.runAsync(() async {
      final context = tester.element(find.byType(FootballGeniusApp));
      await Future.wait(
        ['hero', 'turf', 'market', 'goals', 'assists', 'transfer'].map(
          (asset) => precacheImage(
            AssetImage('assets/images/higher_lower/lobby_$asset.webp'),
            context,
          ),
        ),
      );
      await Future.wait(
        ['stadium', 'emerald', 'purple'].map(
          (asset) => precacheImage(
            AssetImage('assets/images/higher_lower/duel_$asset.webp'),
            context,
          ),
        ),
      );
      if (photoFixtures) {
        await Future.wait(
          identityFixtures.values.map((image) => precacheImage(image, context)),
        );
      }
    });
    // Cached bundle futures originate outside the widget test's fake clock.
    await tester.runAsync(
      () => Future<void>.delayed(const Duration(milliseconds: 30)),
    );
    if (waitForReady) await settle(tester);
    return scope;
  }

  for (final width in [320.0, 360.0, 393.0, 430.0, 768.0]) {
    testWidgets('lobby layout and golden at $width', (tester) async {
      await mount(tester, width: width);
      expect(find.text('CHOOSE YOUR CHALLENGE'), findsOneWidget);
      expect(
        find.byKey(const ValueKey('hl-category-transfer')),
        findsOneWidget,
      );
      expect(tester.takeException(), isNull);
      if (width <= 430) {
        final gap =
            tester.getTopLeft(find.byType(HlLobbyDock)).dy -
            tester
                .getBottomRight(
                  find.byKey(const ValueKey('hl-category-transfer')),
                )
                .dy;
        expect(
          gap,
          closeTo(12 * width / 393, 1),
          reason: 'Cards should fill the page above the dock.',
        );
      }
      await expectLater(
        find.byKey(const ValueKey('hl-golden')),
        matchesGoldenFile('goldens/higher_lower_lobby_${width.toInt()}.png'),
      );
    });
    testWidgets('duel layout and golden at $width', (tester) async {
      await mount(
        tester,
        width: width,
        route: '${AppRoutes.higherLower}/play/marketValue',
      );
      expect(find.text('???'), findsNWidgets(2));
      expect(tester.takeException(), isNull);
      await expectLater(
        find.byKey(const ValueKey('hl-golden')),
        matchesGoldenFile('goldens/higher_lower_duel_${width.toInt()}.png'),
      );
    });
  }
  testWidgets(
    'correct choice reveals then rotates, while Back preserves the streak',
    (tester) async {
      final scope = await mount(tester);
      await tester.tap(find.byKey(const ValueKey('hl-category-marketValue')));
      await settle(tester);
      final run = scope.read(hlDuelProvider(HlCategory.marketValue)).run!;
      final semantics = tester.ensureSemantics();
      final choices = find.bySemanticsLabel(
        RegExp(r'^Choose .* as the player'),
      );
      expect(choices, findsNWidgets(2));
      expect(
        tester
            .getSemantics(choices.first)
            .getSemanticsData()
            .hasAction(SemanticsAction.tap),
        isTrue,
      );
      semantics.dispose();
      final side =
          run.left.value(run.category)! >= run.right.value(run.category)!
          ? HlSide.left
          : HlSide.right;
      await tester.tap(find.byKey(ValueKey('hl-pick-${side.name}')));
      await settle(tester);
      expect(find.text('Correct pick \u00b7 +15 XP'), findsOneWidget);
      await tester.pump(const Duration(milliseconds: 1250));
      await settle(tester);
      expect(find.text('???'), findsOneWidget);
      await tester.tap(find.byTooltip('Back'));
      await settle(tester);
      expect(find.text('RESUME'), findsOneWidget);
      expect(await harness.repository.guestXp(), 15);
    },
  );
  testWidgets('transfer details and very large text scroll without overflow', (
    tester,
  ) async {
    await mount(
      tester,
      width: 320,
      height: 568,
      textScale: 2,
      route: '${AppRoutes.higherLower}/play/transfer',
      reducedMotion: true,
    );
    expect(find.byKey(const ValueKey('hl-pick-left')), findsOneWidget);
    final media = MediaQuery.of(
      tester.element(find.byKey(const ValueKey('hl-pick-left'))),
    );
    expect(media.textScaler.scale(14), 28);
    expect(media.disableAnimations, isTrue);
    await tester.drag(
      find.byKey(const ValueKey('hl-duel-scroll')),
      const Offset(0, -800),
    );
    await settle(tester);
    expect(find.byKey(const ValueKey('hl-pick-right')), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
  testWidgets(
    'transfer cards fit the reference phone and show the fixed move',
    (tester) async {
      final scope = await mount(
        tester,
        route: '${AppRoutes.higherLower}/play/transfer',
      );
      final run = scope.read(hlDuelProvider(HlCategory.transfer)).run!;
      expect(find.text(run.left.selectedTransfer!.date), findsWidgets);
      expect(find.text(run.left.club!), findsWidgets);
      expect(
        find.byWidgetPredicate(
          (widget) =>
              widget is HlIdentityImage &&
              !widget.portrait &&
              widget.source == run.left.flag,
        ),
        findsWidgets,
      );
      expect(
        tester.getBottomRight(find.byKey(const ValueKey('hl-pick-right'))).dy,
        lessThanOrEqualTo(852),
      );
      expect(tester.takeException(), isNull);
      await expectLater(
        find.byKey(const ValueKey('hl-golden')),
        matchesGoldenFile('goldens/higher_lower_transfer.png'),
      );
    },
  );
  testWidgets(
    'reveal and result show the original comparison and restart cleanly',
    (tester) async {
      final scope = await mount(
        tester,
        route: '${AppRoutes.higherLower}/play/marketValue',
      );
      final provider = hlDuelProvider(HlCategory.marketValue);
      var run = scope.read(provider).run!;
      final winner =
          run.left.value(run.category)! >= run.right.value(run.category)!
          ? HlSide.left
          : HlSide.right;
      await tester.tap(find.byKey(ValueKey('hl-pick-${winner.name}')));
      await settle(tester);
      expect(find.text('???'), findsNothing);
      expect(scope.read(provider).reveal!.before.toJson(), run.toJson());
      await expectLater(
        find.byKey(const ValueKey('hl-golden')),
        matchesGoldenFile('goldens/higher_lower_reveal.png'),
      );
      await tester.pump(const Duration(milliseconds: 1250));
      await settle(tester);
      run = scope.read(provider).run!;
      expect(
        run.left.value(run.category),
        isNot(run.right.value(run.category)),
      );
      final loser =
          run.left.value(run.category)! > run.right.value(run.category)!
          ? HlSide.right
          : HlSide.left;
      await tester.tap(find.byKey(ValueKey('hl-pick-${loser.name}')));
      await settle(tester);
      await tester.pump(const Duration(milliseconds: 1250));
      await settle(tester);
      expect(find.text('+15 XP earned this run'), findsOneWidget);
      expect(find.text(run.left.name.toUpperCase()), findsOneWidget);
      expect(find.text(run.right.name.toUpperCase()), findsOneWidget);
      await expectLater(
        find.byKey(const ValueKey('hl-golden')),
        matchesGoldenFile('goldens/higher_lower_result.png'),
      );
      await tester.tap(find.text('Try again'));
      await settle(tester);
      expect(find.text('???'), findsNWidgets(2));
      expect(await harness.repository.guestXp(), 15);
      expect(tester.takeException(), isNull);
    },
  );
  testWidgets(
    'unavailable account records offer retry through a category or separate guest play',
    (tester) async {
      harness.account.id = 'test-account';
      await mount(tester);
      expect(find.text('Best · unavailable'), findsNWidgets(4));
      expect(find.text('Best streak · 0'), findsNothing);
      await expectLater(
        find.byKey(const ValueKey('hl-golden')),
        matchesGoldenFile('goldens/higher_lower_offline_account.png'),
      );
      await tester.tap(find.text('Play as guest instead'));
      await settle(tester);
      expect(find.text('Best streak · 0'), findsNWidgets(4));
      expect(tester.takeException(), isNull);
    },
  );
  testWidgets(
    'large-text lobby, records, help and account sheets remain usable',
    (tester) async {
      await mount(tester, width: 320, height: 700, textScale: 2);
      await Scrollable.ensureVisible(
        tester.element(find.byTooltip('Personal records')),
        alignment: .5,
      );
      await settle(tester);
      await tester.tap(find.byTooltip('Personal records'));
      await settle(tester);
      expect(find.text('Your personal records'), findsOneWidget);
      expect(tester.takeException(), isNull);
      await tester.binding.handlePopRoute();
      await settle(tester);
      await tester.tap(find.byTooltip('How to play'));
      await settle(tester);
      expect(find.text('A little instinct. A longer streak.'), findsOneWidget);
      expect(tester.takeException(), isNull);
      await tester.binding.handlePopRoute();
      await settle(tester);
      await tester.tap(find.byTooltip('Your account'));
      await settle(tester);
      expect(find.text('Continue with Google'), findsOneWidget);
      expect(tester.takeException(), isNull);
    },
  );
  testWidgets('catalogue opens the real mode', (tester) async {
    await mount(tester, route: AppRoutes.games);
    final game = find.text('Higher or Lower');
    await Scrollable.ensureVisible(tester.element(game), alignment: .4);
    await settle(tester);
    await tester.tap(game);
    await settle(tester);
    expect(find.text('CHOOSE YOUR CHALLENGE'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
  testWidgets('Home Quick Play and featured Continue open the category lobby', (
    tester,
  ) async {
    await mount(tester, route: AppRoutes.home);
    final quick = find.text('Higher or\nLower');
    await Scrollable.ensureVisible(tester.element(quick), alignment: .5);
    await settle(tester);
    await tester.tap(quick);
    await settle(tester);
    expect(find.text('CHOOSE YOUR CHALLENGE'), findsOneWidget);
    await tester.tap(find.byTooltip('Back'));
    await settle(tester);
    final continueButton = find.text('CONTINUE');
    await Scrollable.ensureVisible(
      tester.element(continueButton),
      alignment: .5,
    );
    await settle(tester);
    await tester.tap(continueButton);
    await settle(tester);
    expect(find.text('CHOOSE YOUR CHALLENGE'), findsOneWidget);
  });
  testWidgets(
    'reference composition at 393 by 698 with real saved-state actions',
    (tester) async {
      await tester.runAsync(() async {
        for (final category in HlCategory.values) {
          var run = await harness.repository.prepareGuest(category);
          final winner = run.left.value(category)! >= run.right.value(category)!
              ? HlSide.left
              : HlSide.right;
          run = (await harness.repository.pickGuest(run, winner)).after;
          if (category != HlCategory.goals) {
            for (
              var attempt = 0;
              attempt < 10 &&
                  run.left.value(category) == run.right.value(category);
              attempt++
            ) {
              run = await harness.repository.prepareGuest(
                category,
                restart: true,
              );
            }
            expect(run.left.value(category), isNot(run.right.value(category)));
            final loser = run.left.value(category)! > run.right.value(category)!
                ? HlSide.right
                : HlSide.left;
            await harness.repository.pickGuest(run, loser);
          }
        }
      });
      await mount(tester, height: 698, safeTop: 24);
      expect(find.text('Best streak · 1'), findsNWidgets(4));
      expect(find.text('RESUME'), findsOneWidget);
      expect(find.text('PLAY AGAIN'), findsNWidgets(3));
      final lastCard = find.byKey(const ValueKey('hl-category-transfer'));
      expect(tester.getBottomRight(lastCard).dy, lessThan(639));
      expect(tester.takeException(), isNull);
      await expectLater(
        find.byKey(const ValueKey('hl-golden')),
        matchesGoldenFile('goldens/higher_lower_lobby_reference.png'),
      );
    },
  );
  testWidgets(
    'dock keeps Home, catalogue, records and account actions connected',
    (tester) async {
      await mount(tester, height: 568, reducedMotion: true);
      final scroll = find.descendant(
        of: find.byKey(const ValueKey('hl-lobby-scroll')),
        matching: find.byType(Scrollable),
      );
      await tester.drag(
        find.byKey(const ValueKey('hl-lobby-scroll')),
        const Offset(0, -500),
      );
      await settle(tester);
      expect(
        tester.state<ScrollableState>(scroll).position.pixels,
        greaterThan(0),
      );
      await tester.tap(find.byTooltip('Higher or Lower categories'));
      await settle(tester);
      expect(tester.state<ScrollableState>(scroll).position.pixels, 0);
      await tester.tap(find.byTooltip('Your personal records'));
      await settle(tester);
      expect(find.text('Your personal records'), findsOneWidget);
      await tester.binding.handlePopRoute();
      await settle(tester);
      await tester.tap(find.byTooltip('Your FootyGen account'));
      await settle(tester);
      expect(find.text('Continue with Google'), findsOneWidget);
      await tester.binding.handlePopRoute();
      await settle(tester);
      await tester.tap(find.byTooltip('Home'));
      await settle(tester);
      expect(find.text('Quick Play'), findsOneWidget);
      final quick = find.text('Higher or\nLower');
      await Scrollable.ensureVisible(tester.element(quick), alignment: .5);
      await settle(tester);
      await tester.tap(quick);
      await settle(tester);
      expect(find.text('CHOOSE YOUR CHALLENGE'), findsOneWidget);
      await tester.tap(find.byTooltip('Game catalogue'));
      await settle(tester);
      expect(find.text('CHOOSE YOUR CHALLENGE'), findsNothing);
      expect(find.text('Higher or Lower'), findsOneWidget);
      expect(tester.takeException(), isNull);
    },
  );
  testWidgets(
    'premium duel reference with reviewed player photos at 393 by 874',
    (tester) async {
      await tester.runAsync(() async {
        final snapshot = await harness.snapshots.current();
        final players = harness.snapshots.media.players(snapshot);
        final run = HlRun(
          id: 'visual-goals',
          version: snapshot.version,
          createdAt: snapshot.createdAt.toIso8601String(),
          category: HlCategory.goals,
          left: players.firstWhere((player) => player.id == 'guerreiro'),
          right: players.firstWhere((player) => player.id == 'dembele'),
          best: 1,
        );
        await harness.store.write('guest', {
          'version': 1,
          'xp': 15,
          'bests': {'goals': 1},
          'runs': {'goals': run.toJson()},
        });
      });
      await mount(
        tester,
        height: 874,
        safeTop: 24,
        photoFixtures: true,
        route: '${AppRoutes.higherLower}/play/goals',
      );
      expect(find.text('RAPHAËL'), findsOneWidget);
      expect(find.text('GUERREIRO'), findsOneWidget);
      expect(find.text('DEMBÉLÉ'), findsOneWidget);
      expect(find.text('Without Club'), findsOneWidget);
      expect(find.text('???'), findsNWidgets(2));
      final gap =
          tester.getTopLeft(find.byType(HlLobbyDock)).dy -
          tester.getBottomRight(find.byKey(const ValueKey('hl-pick-right'))).dy;
      expect(gap, closeTo(12, 1));
      expect(tester.takeException(), isNull);
      await expectLater(
        find.byKey(const ValueKey('hl-golden')),
        matchesGoldenFile('goldens/higher_lower_duel_reference.png'),
      );
    },
  );
  testWidgets(
    'game dock preserves accepted picks and opens records, account and categories',
    (tester) async {
      final scope = await mount(tester);
      await tester.tap(find.byKey(const ValueKey('hl-category-goals')));
      await settle(tester);
      final provider = hlDuelProvider(HlCategory.goals);
      final run = scope.read(provider).run!;
      final winner =
          run.left.value(run.category)! >= run.right.value(run.category)!
          ? HlSide.left
          : HlSide.right;
      await tester.tap(find.byKey(ValueKey('hl-pick-${winner.name}')));
      await settle(tester);
      await tester.pump(const Duration(milliseconds: 1250));
      await settle(tester);
      await tester.tap(find.byTooltip('Your personal records'));
      await settle(tester);
      expect(find.text('Your personal records'), findsOneWidget);
      expect(
        scope.read(hlLobbyProvider).requireValue.bests[HlCategory.goals],
        1,
      );
      await tester.binding.handlePopRoute();
      await settle(tester);
      await tester.tap(find.byTooltip('Your FootyGen account'));
      await settle(tester);
      expect(find.text('Continue with Google'), findsOneWidget);
      await tester.binding.handlePopRoute();
      await settle(tester);
      await tester.tap(find.byTooltip('Higher or Lower categories'));
      await settle(tester);
      expect(find.text('CHOOSE YOUR CHALLENGE'), findsOneWidget);
      expect(find.text('RESUME'), findsOneWidget);
      expect(await harness.repository.guestXp(), 15);
      await tester.tap(find.byKey(const ValueKey('hl-category-goals')));
      await settle(tester);
      await tester.tap(find.byTooltip('Home'));
      await settle(tester);
      expect(find.text('Quick Play'), findsOneWidget);
      AppRouter.router.go('${AppRoutes.higherLower}/play/goals');
      await settle(tester);
      await tester.tap(find.byTooltip('Game catalogue'));
      await settle(tester);
      expect(find.text('Higher or Lower'), findsOneWidget);
      expect(await harness.repository.guestXp(), 15);
      expect(tester.takeException(), isNull);
    },
  );
  testWidgets(
    'stadium loading and account recovery preserve separate guest play',
    (tester) async {
      await harness.dispose();
      final response = Completer<http.Response>();
      harness = (await tester.runAsync(
        () => HlHarness.create(client: MockClient((_) => response.future)),
      ))!;
      harness.account.id = 'test-account';
      await mount(
        tester,
        height: 874,
        safeTop: 24,
        route: '${AppRoutes.higherLower}/play/goals',
        waitForReady: false,
      );
      await tester.pump(const Duration(milliseconds: 100));
      expect(find.text('Getting your comparison ready…'), findsOneWidget);
      expect(find.text('???'), findsNothing);
      expect(find.text('0'), findsNothing);
      await expectLater(
        find.byKey(const ValueKey('hl-golden')),
        matchesGoldenFile('goldens/higher_lower_duel_loading.png'),
      );
      response.complete(http.Response('{}', 503));
      await settle(tester);
      expect(find.text('Try again'), findsOneWidget);
      expect(find.text('Play as guest instead'), findsOneWidget);
      expect(find.text('0'), findsNothing);
      expect(tester.takeException(), isNull);
      await expectLater(
        find.byKey(const ValueKey('hl-golden')),
        matchesGoldenFile('goldens/higher_lower_duel_recovery.png'),
      );
      await tester.tap(find.text('Play as guest instead'));
      await settle(tester);
      expect(find.text('???'), findsNWidgets(2));
      expect(await harness.repository.guestXp(), 0);
      expect(tester.takeException(), isNull);
    },
  );
  for (final finished in [false, true]) {
    testWidgets(
      'long names and retired identity at 2x text, finished=$finished',
      (tester) async {
        await tester.runAsync(() async {
          final snapshot = await harness.snapshots.current();
          final players = harness.snapshots.media.players(snapshot);
          final run = HlRun(
            id: 'long-name-layout',
            version: snapshot.version,
            createdAt: snapshot.createdAt.toIso8601String(),
            category: HlCategory.goals,
            left: players.firstWhere((player) => player.id == 'aubameyang'),
            right: players.firstWhere(
              (player) => player.id == 'bastian_schweinsteiger',
            ),
            gameOver: finished,
            lastPick: finished ? HlSide.left : null,
          );
          await harness.store.write('guest', {
            'version': 1,
            'xp': 0,
            'bests': <String, dynamic>{},
            'runs': {'goals': run.toJson()},
          });
        });
        await mount(
          tester,
          width: 320,
          height: 568,
          textScale: 2,
          reducedMotion: true,
          route: '${AppRoutes.higherLower}/play/goals',
        );
        expect(find.textContaining('SCHWEINSTEIGER'), findsOneWidget);
        expect(find.textContaining('Retired'), findsOneWidget);
        final scroll = find.byKey(
          ValueKey(finished ? 'hl-result-scroll' : 'hl-duel-scroll'),
        );
        await tester.drag(scroll, const Offset(0, -1200));
        await settle(tester);
        expect(tester.takeException(), isNull);
      },
    );
  }
  testWidgets('assists supports mononyms and missing-image gold initials', (
    tester,
  ) async {
    await tester.runAsync(() async {
      final snapshot = await harness.snapshots.current();
      final players = harness.snapshots.media.players(snapshot);
      final run = HlRun(
        id: 'mononym-layout',
        version: snapshot.version,
        createdAt: snapshot.createdAt.toIso8601String(),
        category: HlCategory.assists,
        left: players.firstWhere((player) => player.id == 'pedri'),
        right: players.firstWhere((player) => player.id == 'gavi'),
      );
      await harness.store.write('guest', {
        'version': 1,
        'xp': 0,
        'bests': <String, dynamic>{},
        'runs': {'assists': run.toJson()},
      });
    });
    await mount(
      tester,
      width: 320,
      height: 568,
      textScale: 2,
      route: '${AppRoutes.higherLower}/play/assists',
    );
    expect(find.text('PEDRI'), findsOneWidget);
    expect(find.text('GAVI'), findsOneWidget);
    expect(find.text('P'), findsOneWidget);
    expect(find.text('G'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
  testWidgets('unknown category routes recover to the lobby', (tester) async {
    await mount(tester, route: '${AppRoutes.higherLower}/play/not-a-category');
    expect(find.text('CHOOSE YOUR CHALLENGE'), findsOneWidget);
  });
}

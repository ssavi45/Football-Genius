import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:football_genius/app.dart';
import 'package:football_genius/core/router/app_router.dart';

void main() {
  testWidgets('FootyGen Home Screen smoke test', (WidgetTester tester) async {
    AppRouter.initialize(routes: FootballGeniusApp.appRoutes);

    await tester.pumpWidget(
      const ProviderScope(
        child: FootballGeniusApp(),
      ),
    );

    expect(find.text('LAST PLAYED'), findsOneWidget);
    expect(find.text('Quick Play'), findsOneWidget);
    expect(find.text('Continue'), findsOneWidget);
  });

  testWidgets('Navigating to Games screen shows game modes and toggles grid/list',
      (WidgetTester tester) async {
    AppRouter.initialize(routes: FootballGeniusApp.appRoutes);

    await tester.pumpWidget(
      const ProviderScope(
        child: FootballGeniusApp(),
      ),
    );

    // Tap 'See all' on the Home Screen
    final seeAllFinder = find.text('See all');
    expect(seeAllFinder, findsOneWidget);
    await tester.tap(seeAllFinder);
    await tester.pumpAndSettle();

    // Verify Games Screen header and top cards in default List view
    expect(find.text('Game Modes'), findsOneWidget);
    expect(find.text('FOOTYGEN ARENA'), findsOneWidget);
    expect(find.text('Football Matrix'), findsOneWidget);
    expect(find.text("Scout's Duel"), findsOneWidget);

    // Verify Segmented toggle icons are present
    final gridIconFinder = find.byIcon(Icons.grid_view_rounded);
    final listIconFinder = find.byIcon(Icons.view_agenda_rounded);
    expect(gridIconFinder, findsOneWidget);
    expect(listIconFinder, findsOneWidget);

    // Switch to Grid view
    await tester.tap(gridIconFinder);
    await tester.pumpAndSettle();

    // Verify grid cards render cleanly without overflow
    expect(find.text('Football Matrix'), findsOneWidget);

    // Switch back to List view
    await tester.tap(listIconFinder);
    await tester.pumpAndSettle();
    expect(find.text('Football Matrix'), findsOneWidget);
  });
}


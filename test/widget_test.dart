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

    expect(find.text("TODAY'S CHALLENGE"), findsOneWidget);
    expect(find.text('Quick Play'), findsOneWidget);
    expect(find.text('Continue'), findsOneWidget);
  });

  testWidgets('Navigating to Games screen shows game modes',
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

    // Verify Games Screen header and top cards
    expect(find.text('Game Modes'), findsOneWidget);
    expect(find.text('FOOTYGEN ARENA'), findsOneWidget);
    expect(find.text('Football Matrix'), findsOneWidget);
    expect(find.text("Scout's Duel"), findsOneWidget);
  });
}


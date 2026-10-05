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
}


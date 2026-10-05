import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:football_genius/main.dart';

void main() {
  testWidgets('FootyGen Home Screen smoke test', (WidgetTester tester) async {
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

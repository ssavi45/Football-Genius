import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:football_genius/main.dart';

void main() {
  testWidgets('Football Genius App smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: FootballGeniusApp(),
      ),
    );

    expect(find.text('FOOTBALL GENIUS'), findsOneWidget);
    expect(find.text('Game Hub 2.0'), findsOneWidget);
  });
}

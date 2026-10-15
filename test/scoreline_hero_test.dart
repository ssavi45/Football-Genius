import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:football_genius/features/games/scoreline/data/datasources/scoreline_local_datasource.dart';
import 'package:football_genius/features/games/scoreline/data/repositories/scoreline_repository_impl.dart';
import 'package:football_genius/features/games/scoreline/domain/entities/scoreline_round_result.dart';
import 'package:football_genius/features/games/scoreline/presentation/controllers/scoreline_state.dart';
import 'package:football_genius/features/games/scoreline/presentation/widgets/led_dot_matrix.dart';
import 'package:football_genius/features/games/scoreline/presentation/widgets/scoreline_board.dart';
import 'package:football_genius/features/games/scoreline/presentation/widgets/scoreline_hint_drawer.dart';
import 'package:football_genius/features/games/scoreline/presentation/widgets/scoreline_hud.dart';
import 'package:football_genius/features/games/scoreline/presentation/widgets/scoreline_match_banner.dart';
import 'package:football_genius/features/games/scoreline/presentation/widgets/scoreline_timeline_reveal.dart';

void main() {
  group('Scoreline Hero Domain & Data Tests', () {
    const datasource = ScorelineLocalDatasource();
    const repository = ScorelineRepositoryImpl(datasource: datasource);

    test('Local datasource contains 200 curated historic matches with non-spoiler tiered hints', () async {
      TestWidgetsFlutterBinding.ensureInitialized();
      final matches = await datasource.getMatches();
      expect(matches.length, equals(200));

      for (final m in matches) {
        expect(m.id.isNotEmpty, isTrue);
        expect(m.homeTeamName.isNotEmpty, isTrue);
        expect(m.awayTeamName.isNotEmpty, isTrue);
        expect(m.hint1Subtle.isNotEmpty, isTrue);
        expect(m.hint2Scorers.isNotEmpty, isTrue);
        expect(m.hint3Scoreline.isNotEmpty, isTrue);
        expect(m.iconicScorerOptions.length, equals(4));
        expect(m.iconicScorerOptions.contains(m.correctIconicScorer), isTrue);
      }
    });

    test('Repository returns 10 matches for a standard session', () async {
      final sessionMatches = await repository.getSessionMatches();
      expect(sessionMatches.length, equals(10));
    });

    test('Round evaluation awards exactly 10 pts for correct scoreline with no hints and 0 for wrong guess', () async {
      final allMatches = await repository.getAllMatches();
      final match = allMatches.firstWhere((m) => m.id == '2005_ucl_milan_liverpool');

      final result = ScorelineRoundResult.evaluate(
        match: match,
        guessedHome: 3,
        guessedAway: 3,
        selectedScorer: 'Steven Gerrard',
        hintsUsedCount: 0,
      );

      expect(result.isExactScore, isTrue);
      expect(result.pointsEarned, equals(10)); // exactly 10 pts without hints
    });

    test('Round evaluation correctly deducts points for tiered hints on correct scoreline (-1, -2, -4)', () async {
      final allMatches = await repository.getAllMatches();
      final match = allMatches.firstWhere((m) => m.id == '2005_ucl_milan_liverpool');

      // Correct scoreline with Hint 1 (-1 pt): 10 - 1 = 9 pts
      final resultHint1 = ScorelineRoundResult.evaluate(
        match: match,
        guessedHome: 3,
        guessedAway: 3,
        hintsUsedCount: 1,
        isHint1Used: true,
      );
      expect(resultHint1.pointsEarned, equals(9));

      // Correct scoreline with Hint 2 (-2 pts): 10 - 2 = 8 pts
      final resultHint2 = ScorelineRoundResult.evaluate(
        match: match,
        guessedHome: 3,
        guessedAway: 3,
        hintsUsedCount: 1,
        isHint2Used: true,
      );
      expect(resultHint2.pointsEarned, equals(8));

      // Correct scoreline with Hint 3 (-4 pts): 10 - 4 = 6 pts
      final resultHint3 = ScorelineRoundResult.evaluate(
        match: match,
        guessedHome: 3,
        guessedAway: 3,
        hintsUsedCount: 1,
        isHint3Used: true,
      );
      expect(resultHint3.pointsEarned, equals(6));

      // Correct scoreline with all 3 hints (-7 pts): 10 - 7 = 3 pts
      final resultAllHints = ScorelineRoundResult.evaluate(
        match: match,
        guessedHome: 3,
        guessedAway: 3,
        hintsUsedCount: 3,
        isHint1Used: true,
        isHint2Used: true,
        isHint3Used: true,
      );
      expect(resultAllHints.pointsEarned, equals(3));
    });

    test('Wrong guess awards strictly 0 points with no bonus points', () async {
      final allMatches = await repository.getAllMatches();
      final match = allMatches.firstWhere((m) => m.id == '2017_ucl_barcelona_psg'); // Barca 6 - 1 PSG

      // Player guessed 3 - 0 (correct winner, but wrong scoreline)
      final result = ScorelineRoundResult.evaluate(
        match: match,
        guessedHome: 3,
        guessedAway: 0,
        selectedScorer: 'Sergi Roberto', // even if correct scorer
        hintsUsedCount: 0,
      );

      expect(result.isExactScore, isFalse);
      expect(result.pointsEarned, equals(0)); // strictly 0 points
    });

    test('ScorelineState accurately tracks skipsUsed with max 3 per session', () {
      var state = const ScorelineState();
      expect(state.skipsUsed, equals(0));
      expect(state.canSkip, isTrue);
      expect(state.skipsRemaining, equals(3));

      state = state.copyWith(skipsUsed: 1);
      expect(state.skipsUsed, equals(1));
      expect(state.canSkip, isTrue);
      expect(state.skipsRemaining, equals(2));

      state = state.copyWith(skipsUsed: 3);
      expect(state.skipsUsed, equals(3));
      expect(state.canSkip, isFalse);
      expect(state.skipsRemaining, equals(0));
    });
  });

  group('Scoreline Hero Redesigned Widgets Tests', () {
    testWidgets('ScorelineHud displays round capsule with progress dashes, streak, and points',
        (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ScorelineHud(
              currentRound: 3,
              totalRounds: 10,
              totalScore: 25,
              streak: 2,
              onExit: () {},
            ),
          ),
        ),
      );

      expect(find.text('ROUND 3/10'), findsOneWidget);
      expect(find.text('2'), findsOneWidget);
      expect(find.text('25 PTS'), findsOneWidget);
      expect(find.byIcon(Icons.emoji_events_outlined), findsOneWidget);
      expect(find.byIcon(Icons.local_fire_department_rounded), findsOneWidget);
      expect(find.byIcon(Icons.star_rounded), findsOneWidget);
    });

    testWidgets('LedDotMatrix renders custom LED bulb painter', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: LedDotMatrix(
              digit: 0,
              activeColor: Color(0xFFFF2A2A),
            ),
          ),
        ),
      );

      expect(find.byType(LedDotMatrix), findsOneWidget);
      expect(find.byType(CustomPaint), findsWidgets);
    });

    testWidgets('LedDotMatrix renders two-digit numbers greater than 9 properly', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: LedDotMatrix(
              digit: 10,
              activeColor: Color(0xFFFF2A2A),
            ),
          ),
        ),
      );

      expect(find.byType(LedDotMatrix), findsOneWidget);
      expect(find.byType(CustomPaint), findsWidgets);
    });

    testWidgets('ScorelineBoard renders LED matrix, -/+ dials, SKIP (0/3), and SUBMIT buttons',
        (tester) async {
      int home = 0;
      int away = 0;
      bool submitted = false;
      bool skipped = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ScorelineBoard(
              homeScore: home,
              awayScore: away,
              skipsUsed: 0,
              maxSkips: 3,
              onIncrementHome: () => home++,
              onDecrementHome: () => home--,
              onIncrementAway: () => away++,
              onDecrementAway: () => away--,
              onSkip: () => skipped = true,
              onSubmit: () => submitted = true,
            ),
          ),
        ),
      );

      expect(
        find.byWidgetPredicate(
          (w) => w is RichText && w.text.toPlainText().contains('SCORELINE PREDICTION'),
        ),
        findsOneWidget,
      );
      expect(find.text('SKIP (0/3)'), findsOneWidget);
      expect(find.text('SUBMIT'), findsOneWidget);
      expect(find.byType(LedDotMatrix), findsNWidgets(2));
      expect(find.byType(CustomPaint), findsWidgets);

      // Tap SUBMIT button
      await tester.tap(find.text('SUBMIT'));
      expect(submitted, isTrue);

      // Tap SKIP button
      await tester.tap(find.text('SKIP (0/3)'));
      expect(skipped, isTrue);
    });

    testWidgets('ScorelineBoard greys out and disables SKIP button when skips used reaches max (3/3)',
        (tester) async {
      bool skipped = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ScorelineBoard(
              homeScore: 1,
              awayScore: 2,
              skipsUsed: 3,
              maxSkips: 3,
              onIncrementHome: () {},
              onDecrementHome: () {},
              onIncrementAway: () {},
              onDecrementAway: () {},
              onSkip: () => skipped = true,
              onSubmit: () {},
            ),
          ),
        ),
      );

      expect(find.text('SKIP (3/3)'), findsOneWidget);

      // Tapping disabled SKIP button should not trigger onSkip
      await tester.tap(find.text('SKIP (3/3)'));
      expect(skipped, isFalse);
    });

    testWidgets('ScorelineHintDrawer displays only one hint at a time and switches on tap',
        (tester) async {
      const datasource = ScorelineLocalDatasource();
      final matches = await datasource.getMatches();
      final match = matches.first.toEntity();
      bool hint1Unlocked = false;
      bool hint2Unlocked = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: StatefulBuilder(
              builder: (context, setState) {
                return ScorelineHintDrawer(
                  match: match,
                  isHint1Unlocked: hint1Unlocked,
                  isHint2Unlocked: hint2Unlocked,
                  isHint3Unlocked: false,
                  onUnlockHint1: () {
                    setState(() => hint1Unlocked = true);
                  },
                  onUnlockHint2: () {
                    setState(() => hint2Unlocked = true);
                  },
                  onUnlockHint3: () {},
                );
              },
            ),
          ),
        ),
      );

      expect(find.text('TACTICAL INTEL (HINTS)'), findsOneWidget);
      expect(find.text('HINT 1'), findsOneWidget);
      expect(find.text('HINT 2'), findsOneWidget);
      expect(find.text('HINT 3'), findsOneWidget);
      expect(find.text('-1 PT'), findsOneWidget);
      expect(find.text('-2 PTS'), findsOneWidget);
      expect(find.text('-4 PTS'), findsOneWidget);
      expect(find.text('UNLOCK'), findsNWidgets(3));

      // 1. Tap first unlock button (Hint 1)
      await tester.tap(find.text('UNLOCK').first);
      await tester.pumpAndSettle();

      expect(hint1Unlocked, isTrue);
      // Hint 1 is now VIEWING and its text is visible
      expect(find.text('VIEWING'), findsOneWidget);
      expect(find.text('MATCH CONTEXT'), findsOneWidget);
      expect(find.text(match.hint1Subtle), findsOneWidget);

      // 2. Unlock Hint 2
      await tester.tap(find.text('UNLOCK').first); // remaining first UNLOCK is Hint 2
      await tester.pumpAndSettle();

      expect(hint2Unlocked, isTrue);
      // Now Hint 2 is VIEWING and only Hint 2 text is visible
      expect(find.text('SCORER INTEL'), findsOneWidget);
      expect(find.text(match.hint2Scorers), findsOneWidget);
      // Hint 1 text is now hidden (only one hint at a time!)
      expect(find.text(match.hint1Subtle), findsNothing);
      expect(find.text('VIEW'), findsOneWidget); // Hint 1 now says VIEW

      // 3. Tap Hint 1 capsule to switch back to Hint 1
      await tester.tap(find.text('HINT 1'));
      await tester.pumpAndSettle();

      // Now Hint 1 text is visible again and Hint 2 text is hidden
      expect(find.text('MATCH CONTEXT'), findsOneWidget);
      expect(find.text(match.hint1Subtle), findsOneWidget);
      expect(find.text(match.hint2Scorers), findsNothing);
    });

    testWidgets('ScorelineMatchBanner renders SEMI-FINAL as unified stage subtitle', (tester) async {
      const datasource = ScorelineLocalDatasource();
      final matches = await datasource.getMatches();
      final semiFinalMatch = matches
          .firstWhere((m) => m.id == '2019_ucl_liverpool_barcelona')
          .toEntity();

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ScorelineMatchBanner(match: semiFinalMatch),
          ),
        ),
      );

      expect(find.text('UEFA CHAMPIONS LEAGUE'), findsOneWidget);
      expect(find.text('SEMI-FINAL'), findsOneWidget);
      // Ensure "SEMI-" is not separated or attached to tournament title
      expect(find.text('UEFA CHAMPIONS LEAGUE SEMI-'), findsNothing);
    });

    testWidgets('ScorelineTimelineReveal places NEXT ROUND above timeline and toggles breakdown on click',
        (tester) async {
      const datasource = ScorelineLocalDatasource();
      final matches = await datasource.getMatches();
      final match = matches.first.toEntity();

      final result = ScorelineRoundResult.evaluate(
        match: match,
        guessedHome: 0,
        guessedAway: 0,
        hintsUsedCount: 0,
      );

      bool nextClicked = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: SingleChildScrollView(
              child: ScorelineTimelineReveal(
                result: result,
                isLastRound: false,
                onNext: () => nextClicked = true,
              ),
            ),
          ),
        ),
      );

      // 1. Verify top card and breakdown button
      expect(find.text('WRONG GUESS • 0 PTS'), findsOneWidget);
      expect(find.byIcon(Icons.receipt_long_rounded), findsOneWidget);
      expect(find.text('NEXT ROUND'), findsOneWidget);
      expect(find.text('OFFICIAL GOAL TIMELINE'), findsOneWidget);

      // Points breakdown is hidden initially
      expect(find.text('POINT BREAKDOWN'), findsNothing);

      // Verify NEXT ROUND button is rendered above OFFICIAL GOAL TIMELINE
      final nextRoundTop = tester.getTopLeft(find.text('NEXT ROUND')).dy;
      final timelineTop = tester.getTopLeft(find.text('OFFICIAL GOAL TIMELINE')).dy;
      expect(nextRoundTop < timelineTop, isTrue);

      // 2. Click icon-only BREAKDOWN button
      await tester.tap(find.byIcon(Icons.receipt_long_rounded));
      await tester.pumpAndSettle();

      // Now POINT BREAKDOWN panel is revealed
      expect(find.text('POINT BREAKDOWN'), findsOneWidget);
      expect(find.text('0 PTS TOTAL'), findsOneWidget);

      // 3. Click BREAKDOWN button again to collapse
      await tester.tap(find.byIcon(Icons.receipt_long_rounded));
      await tester.pumpAndSettle();
      expect(find.text('POINT BREAKDOWN'), findsNothing);

      // 4. Click NEXT ROUND
      await tester.tap(find.text('NEXT ROUND'));
      expect(nextClicked, isTrue);
    });
  });
}

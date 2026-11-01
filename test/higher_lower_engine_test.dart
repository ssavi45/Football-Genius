import 'dart:convert';
import 'dart:io';
import 'dart:math';

import 'package:flutter_test/flutter_test.dart';
import 'package:football_genius/features/games/higher_lower/domain/higher_lower_engine.dart';
import 'package:football_genius/features/games/higher_lower/domain/higher_lower_models.dart';

void main() {
  late Map<String, dynamic> raw;
  late HlSnapshot snapshot;
  setUpAll(() {
    raw = jsonDecode(
      File('assets/data/higher_lower_snapshot.json').readAsStringSync(),
    ) as Map<String, dynamic>;
    snapshot = HlSnapshot.fromJson(raw);
  });
  test('real schema-v3 snapshot validates with the web category coverage', () {
    expect(snapshot.players, hasLength(500));
    expect(
      [
        for (final c in HlCategory.values)
          snapshot.players.where((p) => p.eligible(c)).length,
      ],
      [452, 495, 495, 470],
    );
  });
  test('rejects partial publications and inconsistent career coverage', () {
    expect(
      () => HlSnapshot.fromJson({...raw, 'playerCount': 499}),
      throwsFormatException,
    );
    final broken = jsonDecode(jsonEncode(raw)) as Map<String, dynamic>;
    broken['players'][0]['coverage']['appearances'] = 1;
    expect(() => HlSnapshot.fromJson(broken), throwsFormatException);
  });
  test('unknown stats stay unavailable while known zero totals and free moves work', () {
    final p = snapshot.players.first;
    final zero = HlPlayer(
      id: 'zero',
      name: 'Zero',
      stats: {'marketValue': 0, 'goals': 0, 'assists': null},
      transfers: p.transfers,
    );
    expect(zero.eligible(HlCategory.marketValue), isFalse);
    expect(zero.eligible(HlCategory.goals), isTrue);
    expect(zero.eligible(HlCategory.assists), isFalse);
    expect(zero.value(HlCategory.transfer), isNull);
    expect(
      snapshot.players.expand((p) => p.transfers).any((move) => move.fee == 0),
      isTrue,
    );
  });
  for (final side in HlSide.values) {
    test('a tie accepts ${side.name}, including zero', () {
      final result = HlEngine.resolve(0, 0, side, {
        HlSide.left: 0,
        HlSide.right: 0,
      });
      expect(result.correct, isTrue);
      expect(result.survivor, side);
    });
    test('retires the winning ${side.name} card after its second matchup', () {
      final first = HlEngine.resolve(
        side == HlSide.left ? 100 : 10,
        side == HlSide.right ? 100 : 10,
        side,
        {HlSide.left: 0, HlSide.right: 0},
      );
      final second = HlEngine.resolve(
        side == HlSide.left ? 100 : 20,
        side == HlSide.right ? 100 : 20,
        side,
        first.roundsPlayed,
      );
      expect(second.correct, isTrue);
      expect(second.replace, side);
      expect(second.survivor, side.opposite);
    });
  }
  test('formatting never changes the numbers used for comparisons', () {
    expect(HlEngine.format(1500000, HlCategory.marketValue), '€1.5M');
    expect(HlEngine.format(1005000, HlCategory.marketValue), '€1.01M');
    expect(HlEngine.format(950000, HlCategory.transfer), '€950K');
    expect(HlEngine.format(0, HlCategory.transfer), '€0');
    expect(HlEngine.format(1234, HlCategory.goals), '1,234');
    expect(
      HlEngine.resolve(1004000, 1003000, HlSide.right, {}).correct,
      isFalse,
    );
  });
  test(
    'transfer choices fix one actual move and serialize it without mutation',
    () {
      final p = HlEngine.choose(
        HlCategory.transfer,
        snapshot.players,
        {},
        Random(8),
      );
      expect(p.selectedTransfer, isNotNull);
      expect(
        p.transfers.any((move) => move.id == p.selectedTransfer!.id),
        isTrue,
      );
      expect(
        HlPlayer.fromJson(p.toJson()).selectedTransfer!.toJson(),
        p.selectedTransfer!.toJson(),
      );
      expect(
        HlEngine.choose(HlCategory.transfer, snapshot.players, {
          p.id,
        }, Random(8)).id,
        isNot(p.id),
      );
    },
  );
  test('all categories support long runs without duplicate players or moving retained cards', () {
    for (final category in HlCategory.values) {
      final random = Random(17);
      var run = HlEngine.create(
        snapshot,
        snapshot.players,
        category,
        'fixture-${category.name}',
        random,
      );
      for (var i = 0; i < 60; i++) {
        final side = run.left.value(category)! >= run.right.value(category)!
            ? HlSide.left
            : HlSide.right;
        final pick = HlEngine.pick(run, side, snapshot.players, random);
        expect(pick.correct, isTrue);
        expect(pick.after.score, i + 1);
        expect(pick.after.xp, (i + 1) * 15);
        expect(pick.after.left.id, isNot(pick.after.right.id));
        final retained = pick.after.currentSide!;
        expect(pick.after.player(retained).id, run.player(retained).id);
        run = HlRun.fromJson(pick.after.toJson());
      }
      final wrong = run.left.value(category)! > run.right.value(category)!
          ? HlSide.right
          : HlSide.left;
      if (run.left.value(category) != run.right.value(category)) {
        final loss = HlEngine.pick(run, wrong, snapshot.players, random);
        expect(loss.after.gameOver, isTrue);
        expect(loss.after.xp, run.xp);
        expect(
          () => HlEngine.pick(loss.after, wrong, snapshot.players, random),
          throwsStateError,
        );
      }
    }
  });
}

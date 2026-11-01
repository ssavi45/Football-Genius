import 'dart:math';

import 'higher_lower_models.dart';

class HlRotation {
  const HlRotation(
    this.correct,
    this.survivor,
    this.replace,
    this.roundsPlayed,
  );
  final bool correct;
  final HlSide survivor;
  final HlSide replace;
  final Map<HlSide, int> roundsPlayed;
}

class HlPick {
  const HlPick({
    required this.before,
    required this.after,
    required this.side,
    required this.correct,
  });
  final HlRun before;
  final HlRun after;
  final HlSide side;
  final bool correct;
}

abstract final class HlEngine {
  static HlRotation resolve(
    int left,
    int right,
    HlSide picked,
    Map<HlSide, int> counts,
  ) {
    final winner = left == right
        ? picked
        : left > right
        ? HlSide.left
        : HlSide.right;
    final survivor = (counts[winner] ?? 0) >= 1 ? winner.opposite : winner;
    return HlRotation(picked == winner, survivor, survivor.opposite, {
      for (final side in HlSide.values)
        side: side == survivor ? (counts[side] ?? 0) + 1 : 0,
    });
  }

  static HlPlayer choose(
    HlCategory category,
    List<HlPlayer> players,
    Set<String> exclude,
    Random random,
  ) {
    final pool = players
        .where((p) => p.eligible(category) && !exclude.contains(p.id))
        .toList();
    if (pool.isEmpty) {
      throw StateError('Not enough eligible players to continue.');
    }
    final player = pool[random.nextInt(pool.length)];
    return category == HlCategory.transfer
        ? player.copyWith(
            selectedTransfer:
                player.transfers[random.nextInt(player.transfers.length)],
          )
        : player;
  }

  static HlRun create(
    HlSnapshot snapshot,
    List<HlPlayer> players,
    HlCategory category,
    String id,
    Random random, {
    int best = 0,
  }) {
    final left = choose(category, players, {}, random);
    final right = choose(category, players, {left.id}, random);
    return HlRun(
      id: id,
      version: snapshot.version,
      createdAt: snapshot.createdAt.toIso8601String(),
      category: category,
      left: left,
      right: right,
      best: best,
    );
  }

  static HlPick pick(
    HlRun run,
    HlSide side,
    List<HlPlayer> players,
    Random random,
  ) {
    if (run.gameOver) throw StateError('Start a new streak to play again.');
    final result = resolve(
      run.left.value(run.category)!,
      run.right.value(run.category)!,
      side,
      run.roundsPlayed,
    );
    HlRun after;
    if (!result.correct) {
      after = HlRun.fromJson({
        ...run.toJson(),
        'gameOver': true,
        'lastPick': side.name,
        'revision': run.revision + 1,
      });
    } else {
      final replacement = choose(run.category, players, {
        run.left.id,
        run.right.id,
      }, random);
      after = HlRun(
        id: run.id,
        version: run.version,
        createdAt: run.createdAt,
        category: run.category,
        left: result.replace == HlSide.left ? replacement : run.left,
        right: result.replace == HlSide.right ? replacement : run.right,
        score: run.score + 1,
        best: max(run.best, run.score + 1),
        revision: run.revision + 1,
        roundsPlayed: result.roundsPlayed,
        currentSide: result.survivor,
      );
    }
    return HlPick(
      before: run,
      after: after,
      side: side,
      correct: result.correct,
    );
  }

  static String format(int? value, HlCategory category) {
    if (value == null) return 'Unavailable';
    if (category == HlCategory.goals || category == HlCategory.assists) {
      return value.toString().replaceAllMapped(
        RegExp(r'\B(?=(\d{3})+(?!\d))'),
        (_) => ',',
      );
    }
    final divisor = value >= 1000000
        ? 1000000
        : value >= 1000
        ? 1000
        : 1;
    final suffix = divisor == 1000000
        ? 'M'
        : divisor == 1000
        ? 'K'
        : '';
    // Round integer euros before rendering, avoiding binary-float half cases.
    final hundredths = ((value % divisor) * 100 + divisor ~/ 2) ~/ divisor;
    final whole = value ~/ divisor + hundredths ~/ 100;
    final fraction = hundredths % 100;
    final amount = fraction == 0
        ? '$whole'
        : '$whole.${fraction.toString().padLeft(2, '0').replaceFirst(RegExp(r'0$'), '')}';
    return '€$amount$suffix';
  }
}

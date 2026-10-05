/// Shared result and progression data produced when a user completes a game session.
class GameResult {
  final String gameId;
  final int score;
  final int maxPossibleScore;
  final int xpEarned;
  final Duration timeTaken;
  final DateTime completedAt;
  final bool isDailyChallenge;
  final Map<String, dynamic> extraStats;

  const GameResult({
    required this.gameId,
    required this.score,
    required this.maxPossibleScore,
    required this.xpEarned,
    required this.timeTaken,
    required this.completedAt,
    this.isDailyChallenge = false,
    this.extraStats = const {},
  });

  factory GameResult.fromJson(Map<String, dynamic> json) {
    return GameResult(
      gameId: json['game_id'] as String? ?? '',
      score: json['score'] as int? ?? 0,
      maxPossibleScore: json['max_possible_score'] as int? ?? 0,
      xpEarned: json['xp_earned'] as int? ?? 0,
      timeTaken: Duration(seconds: json['time_taken_seconds'] as int? ?? 0),
      completedAt: json['completed_at'] != null
          ? DateTime.parse(json['completed_at'] as String)
          : DateTime.now(),
      isDailyChallenge: json['is_daily_challenge'] as bool? ?? false,
      extraStats: (json['extra_stats'] as Map<String, dynamic>?) ?? const {},
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'game_id': gameId,
      'score': score,
      'max_possible_score': maxPossibleScore,
      'xp_earned': xpEarned,
      'time_taken_seconds': timeTaken.inSeconds,
      'completed_at': completedAt.toIso8601String(),
      'is_daily_challenge': isDailyChallenge,
      'extra_stats': extraStats,
    };
  }
}

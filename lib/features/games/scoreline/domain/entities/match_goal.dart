/// Entity representing an individual goal in a historic match.
class MatchGoal {
  final String scorerName;
  final String teamName;
  final int minute;
  final bool isPenalty;
  final bool isOwnGoal;
  final String? extraTimeNote;

  const MatchGoal({
    required this.scorerName,
    required this.teamName,
    required this.minute,
    this.isPenalty = false,
    this.isOwnGoal = false,
    this.extraTimeNote,
  });

  String get formattedMinute {
    if (extraTimeNote != null) {
      return '$minute\' ($extraTimeNote)';
    }
    return '$minute\'';
  }
}


import 'match_goal.dart';

/// Entity representing a legendary historic football match in Scoreline Hero.
class HistoricMatch {
  final String id;
  final String competitionName;
  final String competitionBadgePath;
  final String matchDate;
  final String venue;
  final String homeTeamName;
  final String homeTeamCrestPath;
  final String awayTeamName;
  final String awayTeamCrestPath;
  final int homeScore;
  final int awayScore;
  final int halftimeHomeScore;
  final int halftimeAwayScore;
  final String? penaltyShootoutNote;
  final String historicTitle;
  final String historicStory;
  final List<String> narrativeClues;
  final List<MatchGoal> goals;
  final String iconicQuestion;
  final List<String> iconicScorerOptions;
  final String correctIconicScorer;

  /// Tiered Tactical Intel Hints
  /// Hint 1: Subtle contextual fact / atmosphere (least revealing, -1 pt)
  final String hint1Subtle;

  /// Hint 2: Scorer intel (braces, hat-tricks, key goals, -2 pts)
  final String hint2Scorers;

  /// Hint 3: Close to scoreline (total goals, winner, margin, -4 pts)
  final String hint3Scoreline;

  /// Point deductions for unlocking hints (10 points total per match)
  static const int hint1Deduction = 1;
  static const int hint2Deduction = 2;
  static const int hint3Deduction = 4;
  static const int exactScorePoints = 10;

  const HistoricMatch({
    required this.id,
    required this.competitionName,
    required this.competitionBadgePath,
    required this.matchDate,
    required this.venue,
    required this.homeTeamName,
    required this.homeTeamCrestPath,
    required this.awayTeamName,
    required this.awayTeamCrestPath,
    required this.homeScore,
    required this.awayScore,
    required this.halftimeHomeScore,
    required this.halftimeAwayScore,
    this.penaltyShootoutNote,
    required this.historicTitle,
    required this.historicStory,
    required this.narrativeClues,
    required this.goals,
    required this.iconicQuestion,
    required this.iconicScorerOptions,
    required this.correctIconicScorer,
    required this.hint1Subtle,
    required this.hint2Scorers,
    required this.hint3Scoreline,
  });

  /// Total goals scored in regular/extra time
  int get totalGoals => homeScore + awayScore;

  /// Goal difference from home perspective
  int get goalDifference => homeScore - awayScore;

  /// Formatted score string (e.g. "3 - 3")
  String get scorelineString => '$homeScore - $awayScore';

  /// Formatted halftime score string (e.g. "3 - 0")
  String get halftimeScorelineString => '$halftimeHomeScore - $halftimeAwayScore';
}


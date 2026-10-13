import '../../domain/entities/historic_match.dart';
import '../../domain/entities/match_goal.dart';

/// DTO for MatchGoal serialization and conversion.
class MatchGoalDto {
  final String scorerName;
  final String teamName;
  final int minute;
  final bool isPenalty;
  final bool isOwnGoal;
  final String? extraTimeNote;

  const MatchGoalDto({
    required this.scorerName,
    required this.teamName,
    required this.minute,
    this.isPenalty = false,
    this.isOwnGoal = false,
    this.extraTimeNote,
  });

  factory MatchGoalDto.fromJson(Map<String, dynamic> json) {
    return MatchGoalDto(
      scorerName: json['scorer_name'] as String,
      teamName: json['team_name'] as String,
      minute: json['minute'] as int,
      isPenalty: json['is_penalty'] as bool? ?? false,
      isOwnGoal: json['is_own_goal'] as bool? ?? false,
      extraTimeNote: json['extra_time_note'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'scorer_name': scorerName,
      'team_name': teamName,
      'minute': minute,
      'is_penalty': isPenalty,
      'is_own_goal': isOwnGoal,
      'extra_time_note': extraTimeNote,
    };
  }

  MatchGoal toEntity() {
    return MatchGoal(
      scorerName: scorerName,
      teamName: teamName,
      minute: minute,
      isPenalty: isPenalty,
      isOwnGoal: isOwnGoal,
      extraTimeNote: extraTimeNote,
    );
  }
}

/// DTO for HistoricMatch serialization and conversion to Domain entity.
class HistoricMatchDto {
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
  final List<MatchGoalDto> goals;
  final String iconicQuestion;
  final List<String> iconicScorerOptions;
  final String correctIconicScorer;
  final String hint1Subtle;
  final String hint2Scorers;
  final String hint3Scoreline;

  const HistoricMatchDto({
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

  factory HistoricMatchDto.fromJson(Map<String, dynamic> json) {
    return HistoricMatchDto(
      id: json['id'] as String,
      competitionName: json['competition_name'] as String,
      competitionBadgePath: json['competition_badge_path'] as String,
      matchDate: json['match_date'] as String,
      venue: json['venue'] as String,
      homeTeamName: json['home_team_name'] as String,
      homeTeamCrestPath: json['home_team_crest_path'] as String,
      awayTeamName: json['away_team_name'] as String,
      awayTeamCrestPath: json['away_team_crest_path'] as String,
      homeScore: json['home_score'] as int,
      awayScore: json['away_score'] as int,
      halftimeHomeScore: json['halftime_home_score'] as int,
      halftimeAwayScore: json['halftime_away_score'] as int,
      penaltyShootoutNote: json['penalty_shootout_note'] as String?,
      historicTitle: json['historic_title'] as String,
      historicStory: json['historic_story'] as String,
      narrativeClues: (json['narrative_clues'] as List<dynamic>).map((e) => e as String).toList(),
      goals: (json['goals'] as List<dynamic>)
          .map((e) => MatchGoalDto.fromJson(e as Map<String, dynamic>))
          .toList(),
      iconicQuestion: json['iconic_question'] as String,
      iconicScorerOptions: (json['iconic_scorer_options'] as List<dynamic>).map((e) => e as String).toList(),
      correctIconicScorer: json['correct_iconic_scorer'] as String,
      hint1Subtle: json['hint1_subtle'] as String? ?? '',
      hint2Scorers: json['hint2_scorers'] as String? ?? '',
      hint3Scoreline: json['hint3_scoreline'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'competition_name': competitionName,
      'competition_badge_path': competitionBadgePath,
      'match_date': matchDate,
      'venue': venue,
      'home_team_name': homeTeamName,
      'home_team_crest_path': homeTeamCrestPath,
      'away_team_name': awayTeamName,
      'away_team_crest_path': awayTeamCrestPath,
      'home_score': homeScore,
      'away_score': awayScore,
      'halftime_home_score': halftimeHomeScore,
      'halftime_away_score': halftimeAwayScore,
      'penalty_shootout_note': penaltyShootoutNote,
      'historic_title': historicTitle,
      'historic_story': historicStory,
      'narrative_clues': narrativeClues,
      'goals': goals.map((e) => e.toJson()).toList(),
      'iconic_question': iconicQuestion,
      'iconic_scorer_options': iconicScorerOptions,
      'correct_iconic_scorer': correctIconicScorer,
      'hint1_subtle': hint1Subtle,
      'hint2_scorers': hint2Scorers,
      'hint3_scoreline': hint3Scoreline,
    };
  }

  HistoricMatch toEntity() {
    return HistoricMatch(
      id: id,
      competitionName: competitionName,
      competitionBadgePath: competitionBadgePath,
      matchDate: matchDate,
      venue: venue,
      homeTeamName: homeTeamName,
      homeTeamCrestPath: homeTeamCrestPath,
      awayTeamName: awayTeamName,
      awayTeamCrestPath: awayTeamCrestPath,
      homeScore: homeScore,
      awayScore: awayScore,
      halftimeHomeScore: halftimeHomeScore,
      halftimeAwayScore: halftimeAwayScore,
      penaltyShootoutNote: penaltyShootoutNote,
      historicTitle: historicTitle,
      historicStory: historicStory,
      narrativeClues: narrativeClues,
      goals: goals.map((g) => g.toEntity()).toList(),
      iconicQuestion: iconicQuestion,
      iconicScorerOptions: iconicScorerOptions,
      correctIconicScorer: correctIconicScorer,
      hint1Subtle: hint1Subtle,
      hint2Scorers: hint2Scorers,
      hint3Scoreline: hint3Scoreline,
    );
  }
}


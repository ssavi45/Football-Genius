import '../entities/historic_match.dart';

/// Repository interface contract for retrieving historic matches for Scoreline Hero.
abstract class ScorelineRepository {
  /// Retrieves a randomized sequence of iconic matches for a game session.
  Future<List<HistoricMatch>> getSessionMatches({int count = 10});

  /// Retrieves the designated daily challenge historic match.
  Future<HistoricMatch> getDailyMatch();

  /// Retrieves all matches in the curated library.
  Future<List<HistoricMatch>> getAllMatches();
}


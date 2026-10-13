import 'dart:math';
import '../../domain/entities/historic_match.dart';
import '../../domain/repositories/scoreline_repository.dart';
import '../datasources/scoreline_local_datasource.dart';

/// Concrete implementation of ScorelineRepository fetching from local curated catalog.
class ScorelineRepositoryImpl implements ScorelineRepository {
  final ScorelineLocalDatasource _datasource;

  const ScorelineRepositoryImpl({
    ScorelineLocalDatasource? datasource,
  }) : _datasource = datasource ?? const ScorelineLocalDatasource();

  @override
  Future<List<HistoricMatch>> getSessionMatches({int count = 10}) async {
    final allDtos = await _datasource.getMatches();
    final entities = allDtos.map((dto) => dto.toEntity()).toList();

    // Shuffle and pick desired count
    final random = Random();
    entities.shuffle(random);
    return entities.take(count).toList();
  }

  @override
  Future<HistoricMatch> getDailyMatch() async {
    final allDtos = await _datasource.getMatches();
    final entities = allDtos.map((dto) => dto.toEntity()).toList();

    // Deterministic selection based on day of year
    final now = DateTime.now();
    final dayOfYear = now.difference(DateTime(now.year, 1, 1)).inDays;
    final index = entities.isEmpty ? 0 : dayOfYear % entities.length;
    return entities[index];
  }

  @override
  Future<List<HistoricMatch>> getAllMatches() async {
    final allDtos = await _datasource.getMatches();
    return allDtos.map((dto) => dto.toEntity()).toList();
  }
}

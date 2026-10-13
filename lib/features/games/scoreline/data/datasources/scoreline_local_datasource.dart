import 'dart:convert';
import 'package:flutter/services.dart' show rootBundle;
import '../models/historic_match_dto.dart';

/// Local datasource supplying 200 curated legendary historic matches loaded from JSON.
/// Content is crafted with 3-tiered hints:
/// - Hint 1: Subtle contextual fact / match atmosphere (-1 PT)
/// - Hint 2: Key scorer highlights without listing all goals (-2 PTS)
/// - Hint 3: Scoreline gravity (total goals & qualitative outcome) without arithmetic spoilers (-4 PTS)
class ScorelineLocalDatasource {
  static const String matchesAssetPath = 'assets/data/scoreline_matches.json';

  // Static in-memory cache so JSON parsing happens only once per app lifecycle
  static List<HistoricMatchDto>? _cachedMatches;

  const ScorelineLocalDatasource();

  /// Loads and parses the 200 curated historic matches from the JSON asset.
  Future<List<HistoricMatchDto>> getMatches() async {
    if (_cachedMatches != null && _cachedMatches!.isNotEmpty) {
      return _cachedMatches!;
    }

    try {
      final jsonString = await rootBundle.loadString(matchesAssetPath);
      final List<dynamic> jsonList = jsonDecode(jsonString) as List<dynamic>;

      final matches = jsonList
          .map((item) => HistoricMatchDto.fromJson(item as Map<String, dynamic>))
          .toList();

      _cachedMatches = matches;
      return matches;
    } catch (_) {
      return _cachedMatches ?? const [];
    }
  }

  /// Synchronous getter returning cached matches.
  List<HistoricMatchDto> getCuratedMatches() {
    return _cachedMatches ?? const [];
  }

  /// Manually populate cached matches (useful for testing or prefetching).
  static void setCachedMatches(List<HistoricMatchDto> matches) {
    _cachedMatches = matches;
  }

  /// Clears cache.
  static void clearCache() {
    _cachedMatches = null;
  }
}

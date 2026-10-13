import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:football_genius/core/constants/asset_paths.dart';
import 'package:football_genius/core/router/app_routes.dart';
import 'package:football_genius/shared/models/game_metadata.dart';

/// Catalog of all 8 official Football Genius game modes.
final allGamesProvider = Provider<List<GameMetadata>>((ref) {
  return const [
    GameMetadata(
      id: 'matrix',
      title: 'Football Matrix',
      subtitle: 'Daily 3x3 Grid Challenge',
      description:
          'Find 9 footballers who match row and column clues. Clubs, trophies, nationalities & teammates.',
      badge: "TODAY'S CHALLENGE",
      category: 'Daily',
      difficulty: 'Dynamic',
      hasDailyChallenge: true,
      averageDurationMinutes: 4,
      routePath: AppRoutes.matrix,
      iconPath: AssetPaths.iconFootballMatrix,
      cardArtPath: AssetPaths.cardFootballMatrix,
    ),
    GameMetadata(
      id: 'scouts_duel',
      title: "Scout's Duel",
      subtitle: '1v1 Strategic Footballer Duel',
      description:
          'Outsmart the AI or a rival in turn-based strategic deduction. Ask clues, narrow the pool, strike to guess.',
      badge: '1v1 AI BATTLE',
      category: 'Duel',
      difficulty: 'Expert',
      averageDurationMinutes: 5,
      routePath: AppRoutes.scoutsDuel,
      iconPath: AssetPaths.iconScoutsDuel,
      cardArtPath: AssetPaths.cardScoutsDuel,
    ),
    GameMetadata(
      id: 'higher_lower',
      title: 'Higher or Lower',
      subtitle: 'Fast-Paced Stats Showdown',
      description:
          'Who scored more career goals? Who has more caps or higher market value? Build your winning streak.',
      badge: 'STREAK',
      category: 'Quick Play',
      difficulty: 'Easy',
      averageDurationMinutes: 2,
      routePath: AppRoutes.higherLower,
      iconPath: AssetPaths.iconHigherLower,
      cardArtPath: AssetPaths.cardHigherLower,
    ),
    GameMetadata(
      id: 'pixel_pitch',
      title: 'Pixel Pitch',
      subtitle: 'Visual Mystery Identity',
      description:
          'Guess the player from blurred pixelated kits and retro cards before the image sharpens.',
      badge: 'VISUAL',
      category: 'Quick Play',
      difficulty: 'Medium',
      averageDurationMinutes: 3,
      routePath: AppRoutes.pixelPitch,
      iconPath: AssetPaths.iconPixelPitch,
      cardArtPath: AssetPaths.cardPixelPitch,
    ),
    GameMetadata(
      id: 'scramble',
      title: 'Bootroom Scramble',
      subtitle: 'Anagrams & Squad Puzzles',
      description:
          'Unscramble anagrammed names, iconic starting XIs, and legendary transfer moves against the clock.',
      badge: 'PUZZLE',
      category: 'Quick Play',
      difficulty: 'Medium',
      averageDurationMinutes: 3,
      routePath: AppRoutes.scramble,
      iconPath: AssetPaths.iconUnscramble,
      cardArtPath: AssetPaths.cardBootroomScramble,
    ),
    GameMetadata(
      id: 'scoreline',
      title: 'Scoreline Hero',
      subtitle: 'Iconic Historic Matches',
      description:
          'Relive epic Champions League finals, World Cup thrillers, and derbies. Recall exact scorelines and scorers.',
      badge: 'HISTORIC',
      category: 'Trivia',
      difficulty: 'Hard',
      averageDurationMinutes: 3,
      routePath: AppRoutes.scoreline,
      iconPath: AssetPaths.iconScorelineHero,
      cardArtPath: AssetPaths.cardScorelineHero,
    ),
    GameMetadata(
      id: 'quotes',
      title: 'Tunnel Talk',
      subtitle: 'Who Said That Quote?',
      description:
          '"I think I am a special one." Match legendary quotes, press conference burns, and dressing room speeches.',
      badge: 'CULTURE',
      category: 'Trivia',
      difficulty: 'Medium',
      averageDurationMinutes: 2,
      routePath: AppRoutes.quotes,
      iconPath: AssetPaths.iconTunnelTalk,
      cardArtPath: AssetPaths.cardTunnelTalk,
    ),
    GameMetadata(
      id: 'journeyman',
      title: 'The Journeyman',
      subtitle: 'Career Path Detective',
      description:
          'Trace chronological club transfers, loan spells, and international appearances to unmask the star.',
      badge: 'CAREER',
      category: 'Trivia',
      difficulty: 'Hard',
      averageDurationMinutes: 4,
      routePath: AppRoutes.journeyman,
      iconPath: AssetPaths.iconJourneyman,
      cardArtPath: AssetPaths.cardJourneyman,
    ),
  ];
});

/// Tracks the ID of the game mode the user was last playing, persisted locally.
class LastPlayedGameNotifier extends Notifier<String> {
  static const String _prefsKey = 'last_played_game_id';

  @override
  String build() {
    _loadSavedGameId();
    return 'scoreline';
  }

  Future<void> _loadSavedGameId() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final saved = prefs.getString(_prefsKey);
      if (saved != null && saved.isNotEmpty && saved != state) {
        state = saved;
      }
    } catch (_) {
      // Ignore storage errors in test environments without initialized plugin
    }
  }

  Future<void> setLastPlayed(String gameId) async {
    final normalized = gameId == 'unscramble' ? 'scramble' : gameId;
    if (state != normalized) {
      state = normalized;
    }
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_prefsKey, normalized);
    } catch (_) {
      // Ignore storage errors in test environments
    }
  }
}

/// Provider for the ID of the last played game mode.
final lastPlayedGameIdProvider =
    NotifierProvider<LastPlayedGameNotifier, String>(
  LastPlayedGameNotifier.new,
);

/// Provider resolving the full [GameMetadata] for the user's last played game mode.
final lastPlayedGameProvider = Provider<GameMetadata>((ref) {
  final allGames = ref.watch(allGamesProvider);
  final lastId = ref.watch(lastPlayedGameIdProvider);
  return allGames.firstWhere(
    (game) => game.id == lastId,
    orElse: () => allGames.firstWhere(
      (game) => game.id == 'scoreline',
      orElse: () => allGames.first,
    ),
  );
});

/// Category filter state notifier.
class GameCategoryNotifier extends Notifier<String> {
  @override
  String build() => 'All';

  void setCategory(String category) {
    state = category;
  }
}

/// Currently selected game category filter.
final selectedGameCategoryProvider =
    NotifierProvider<GameCategoryNotifier, String>(GameCategoryNotifier.new);

/// Filtered list of games based on active category.
final filteredGamesProvider = Provider<List<GameMetadata>>((ref) {
  final allGames = ref.watch(allGamesProvider);
  final category = ref.watch(selectedGameCategoryProvider);

  if (category == 'All') {
    return allGames;
  }
  return allGames.where((game) => game.category == category).toList();
});

/// Layout modes for the Games screen (List vs 2-column Grid).
enum GamesViewLayout {
  list,
  grid,
}

/// Layout mode state notifier.
class GamesViewLayoutNotifier extends Notifier<GamesViewLayout> {
  @override
  GamesViewLayout build() => GamesViewLayout.list;

  void setLayout(GamesViewLayout layout) {
    state = layout;
  }

  void toggle() {
    state = state == GamesViewLayout.list
        ? GamesViewLayout.grid
        : GamesViewLayout.list;
  }
}

/// Provider for current layout mode.
final gamesViewLayoutProvider =
    NotifierProvider<GamesViewLayoutNotifier, GamesViewLayout>(
  GamesViewLayoutNotifier.new,
);


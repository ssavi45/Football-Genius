/// Shared metadata describing a game mode in Football Genius.
class GameMetadata {
  final String id;
  final String title;
  final String subtitle;
  final String description;
  final String cardArtPath;
  final String iconPath;
  final String routePath;
  final String badge;
  final String difficulty;
  final String category;
  final bool hasDailyChallenge;
  final int averageDurationMinutes;

  const GameMetadata({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.description,
    required this.cardArtPath,
    required this.iconPath,
    required this.routePath,
    this.badge = 'CLASSIC',
    this.difficulty = 'Medium',
    this.category = 'All Modes',
    this.hasDailyChallenge = false,
    this.averageDurationMinutes = 3,
  });
}


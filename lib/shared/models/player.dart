/// Domain representation of a Football player shared across multiple game modes and features.
class Player {
  final String id;
  final String name;
  final String? fullName;
  final String nationality;
  final String? countryFlagPath;
  final String? photoPath;
  final String? currentClub;
  final List<String> clubsPlayed;
  final List<String> positions;
  final int? birthYear;
  final int careerGoals;
  final int careerAssists;
  final List<String> trophies;

  const Player({
    required this.id,
    required this.name,
    this.fullName,
    required this.nationality,
    this.countryFlagPath,
    this.photoPath,
    this.currentClub,
    this.clubsPlayed = const [],
    this.positions = const [],
    this.birthYear,
    this.careerGoals = 0,
    this.careerAssists = 0,
    this.trophies = const [],
  });

  factory Player.fromJson(Map<String, dynamic> json) {
    return Player(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      fullName: json['full_name'] as String?,
      nationality: json['nationality'] as String? ?? '',
      countryFlagPath: json['country_flag_path'] as String?,
      photoPath: json['photo_path'] as String?,
      currentClub: json['current_club'] as String?,
      clubsPlayed: (json['clubs_played'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          const [],
      positions: (json['positions'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          const [],
      birthYear: json['birth_year'] as int?,
      careerGoals: json['career_goals'] as int? ?? 0,
      careerAssists: json['career_assists'] as int? ?? 0,
      trophies: (json['trophies'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          const [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      if (fullName != null) 'full_name': fullName,
      'nationality': nationality,
      if (countryFlagPath != null) 'country_flag_path': countryFlagPath,
      if (photoPath != null) 'photo_path': photoPath,
      if (currentClub != null) 'current_club': currentClub,
      'clubs_played': clubsPlayed,
      'positions': positions,
      if (birthYear != null) 'birth_year': birthYear,
      'career_goals': careerGoals,
      'career_assists': careerAssists,
      'trophies': trophies,
    };
  }

  Player copyWith({
    String? id,
    String? name,
    String? fullName,
    String? nationality,
    String? countryFlagPath,
    String? photoPath,
    String? currentClub,
    List<String>? clubsPlayed,
    List<String>? positions,
    int? birthYear,
    int? careerGoals,
    int? careerAssists,
    List<String>? trophies,
  }) {
    return Player(
      id: id ?? this.id,
      name: name ?? this.name,
      fullName: fullName ?? this.fullName,
      nationality: nationality ?? this.nationality,
      countryFlagPath: countryFlagPath ?? this.countryFlagPath,
      photoPath: photoPath ?? this.photoPath,
      currentClub: currentClub ?? this.currentClub,
      clubsPlayed: clubsPlayed ?? this.clubsPlayed,
      positions: positions ?? this.positions,
      birthYear: birthYear ?? this.birthYear,
      careerGoals: careerGoals ?? this.careerGoals,
      careerAssists: careerAssists ?? this.careerAssists,
      trophies: trophies ?? this.trophies,
    );
  }
}

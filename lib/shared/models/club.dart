/// Domain representation of a Football Club shared across multiple game modes and features.
class Club {
  final String id;
  final String name;
  final String shortName;
  final String? badgePath;
  final String league;
  final String country;

  const Club({
    required this.id,
    required this.name,
    required this.shortName,
    this.badgePath,
    required this.league,
    required this.country,
  });

  factory Club.fromJson(Map<String, dynamic> json) {
    return Club(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      shortName: json['short_name'] as String? ?? '',
      badgePath: json['badge_path'] as String?,
      league: json['league'] as String? ?? '',
      country: json['country'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'short_name': shortName,
      if (badgePath != null) 'badge_path': badgePath,
      'league': league,
      'country': country,
    };
  }

  Club copyWith({
    String? id,
    String? name,
    String? shortName,
    String? badgePath,
    String? league,
    String? country,
  }) {
    return Club(
      id: id ?? this.id,
      name: name ?? this.name,
      shortName: shortName ?? this.shortName,
      badgePath: badgePath ?? this.badgePath,
      league: league ?? this.league,
      country: country ?? this.country,
    );
  }
}

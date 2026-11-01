enum HlCategory {
  marketValue(
    'Market Value',
    'Current market value',
    'Latest available valuation in euros. Active players with a positive valuation only.',
  ),
  goals(
    'Career Goals',
    'Career goals',
    'Senior club and full-A international goals. Youth, reserves, Olympics and shoot-out kicks are excluded. Historical coverage varies.',
  ),
  assists(
    'Career Assists',
    'Career assists',
    'Senior club and full-A international assists. Players with incomplete assist statistics are excluded.',
  ),
  transfer(
    'Transfer Fee',
    'Transfer fee',
    'The fee of the specific permanent senior club move shown. Known free transfers count as zero.',
  );

  const HlCategory(this.label, this.statLabel, this.description);
  final String label;
  final String statLabel;
  final String description;
  static HlCategory parse(String value) => values.firstWhere(
    (category) => category.name == value,
    orElse: () => throw const FormatException('Unknown comparison category.'),
  );
}

enum HlSide {
  left,
  right;

  HlSide get opposite => this == left ? right : left;
  static HlSide parse(String value) => values.firstWhere(
    (side) => side.name == value,
    orElse: () => throw const FormatException('Unknown player position.'),
  );
}

int hlInt(Object? value) {
  if (value is! int || value < 0 || value > 9007199254740991) {
    throw const FormatException('Expected a non-negative safe integer.');
  }
  return value;
}

String hlString(Object? value) {
  if (value is! String || value.trim().isEmpty) {
    throw const FormatException('Expected non-empty text.');
  }
  return value;
}

Map<String, dynamic> hlMap(Object? value) {
  if (value is! Map) throw const FormatException('Expected an object.');
  return Map<String, dynamic>.from(value);
}

class HlClub {
  const HlClub({required this.id, required this.name, required this.crest});
  final String id;
  final String name;
  final String crest;
  factory HlClub.fromJson(Map<String, dynamic> json) => HlClub(
    id: hlString(json['id']),
    name: hlString(json['name']),
    crest: hlString(json['crest']),
  );
  HlClub withCrest(String value) => HlClub(id: id, name: name, crest: value);
  Map<String, dynamic> toJson() => {'id': id, 'name': name, 'crest': crest};
}

class HlTransfer {
  const HlTransfer({
    required this.id,
    required this.date,
    required this.fee,
    required this.from,
    required this.to,
    this.season,
  });
  final String id;
  final String date;
  final String? season;
  final int fee;
  final HlClub from;
  final HlClub to;
  factory HlTransfer.fromJson(Map<String, dynamic> json) => HlTransfer(
    id: hlString(json['id']),
    date: hlString(json['date']),
    season: json['season'] as String?,
    fee: hlInt(json['fee']),
    from: HlClub.fromJson(hlMap(json['from'])),
    to: HlClub.fromJson(hlMap(json['to'])),
  );
  HlTransfer withClubs(HlClub origin, HlClub destination) => HlTransfer(
    id: id,
    date: date,
    season: season,
    fee: fee,
    from: origin,
    to: destination,
  );
  Map<String, dynamic> toJson() => {
    'id': id,
    'date': date,
    'season': season,
    'fee': fee,
    'from': from.toJson(),
    'to': to.toJson(),
  };
}

class HlPlayer {
  HlPlayer({
    required this.id,
    required this.name,
    required Map<String, int?> stats,
    required List<HlTransfer> transfers,
    this.nationality = '',
    this.flag,
    this.clubId,
    this.club,
    this.clubBadge,
    this.position,
    this.age,
    this.league,
    this.isRetired = false,
    this.portrait,
    this.selectedTransfer,
  }) : stats = Map.unmodifiable(stats),
       transfers = List.unmodifiable(transfers);
  final String id;
  final String name;
  final String nationality;
  final String? flag;
  final String? clubId;
  final String? club;
  final String? clubBadge;
  final String? position;
  final int? age;
  final String? league;
  final bool isRetired;
  final String? portrait;
  final Map<String, int?> stats;
  final List<HlTransfer> transfers;
  final HlTransfer? selectedTransfer;
  factory HlPlayer.fromJson(Map<String, dynamic> json) {
    final stats = hlMap(json['stats']);
    return HlPlayer(
      id: hlString(json['id']),
      name: hlString(json['name']),
      stats: {
        for (final key in ['marketValue', 'goals', 'assists'])
          key: stats[key] == null ? null : hlInt(stats[key]),
      },
      transfers: (json['transfers'] as List)
          .map((item) => HlTransfer.fromJson(hlMap(item)))
          .toList(),
      nationality: json['nationality'] as String? ?? '',
      flag: json['nationalityFlag'] as String?,
      clubId: json['clubId'] as String?,
      club: json['club'] as String?,
      clubBadge: json['clubBadge'] as String?,
      position: json['position'] as String?,
      age: json['age'] == null ? null : hlInt(json['age']),
      league: json['league'] as String?,
      isRetired: json['isRetired'] as bool? ?? false,
      portrait: json['portrait'] as String?,
      selectedTransfer: json['selectedTransfer'] == null
          ? null
          : HlTransfer.fromJson(hlMap(json['selectedTransfer'])),
    );
  }
  int? value(HlCategory category) => category == HlCategory.transfer
      ? selectedTransfer?.fee
      : stats[category.name];
  bool eligible(HlCategory category) => switch (category) {
    HlCategory.transfer => transfers.isNotEmpty,
    HlCategory.marketValue => !isRetired && (stats['marketValue'] ?? 0) > 0,
    _ => stats[category.name] != null,
  };
  HlPlayer copyWith({
    String? portrait,
    String? clubBadge,
    List<HlTransfer>? transfers,
    HlTransfer? selectedTransfer,
  }) => HlPlayer(
    id: id,
    name: name,
    stats: stats,
    transfers: transfers ?? this.transfers,
    nationality: nationality,
    flag: flag,
    clubId: clubId,
    club: club,
    clubBadge: clubBadge ?? this.clubBadge,
    position: position,
    age: age,
    league: league,
    isRetired: isRetired,
    portrait: portrait ?? this.portrait,
    selectedTransfer: selectedTransfer ?? this.selectedTransfer,
  );
  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'stats': stats,
    'transfers': transfers.map((move) => move.toJson()).toList(),
    'nationality': nationality,
    'nationalityFlag': flag,
    'clubId': clubId,
    'club': club,
    'clubBadge': clubBadge,
    'position': position,
    'age': age,
    'league': league,
    'isRetired': isRetired,
    'portrait': portrait,
    if (selectedTransfer != null)
      'selectedTransfer': selectedTransfer!.toJson(),
  };
}

class HlSnapshot {
  HlSnapshot._(this.raw, this.version, this.createdAt, this.players);
  final Map<String, dynamic> raw;
  final String version;
  final DateTime createdAt;
  final List<HlPlayer> players;
  factory HlSnapshot.fromJson(Map<String, dynamic> json) {
    _validateSnapshot(json);
    return HlSnapshot._(
      Map.unmodifiable(json),
      hlString(json['version']),
      DateTime.parse(json['createdAt'] as String),
      List.unmodifiable(
        (json['players'] as List).map((item) => HlPlayer.fromJson(hlMap(item))),
      ),
    );
  }
}

void _validateSnapshot(Map<String, dynamic> data) {
  void require(bool condition) {
    if (!condition) {
      throw const FormatException('Invalid Higher or Lower snapshot.');
    }
  }

  bool date(Object? value) =>
      value is String && DateTime.tryParse(value) != null;
  require(
    data['schemaVersion'] == 3 &&
        data['playerCount'] == 500 &&
        data['players'] is List &&
        (data['players'] as List).length == 500,
  );
  hlString(data['version']);
  require(date(data['createdAt']));
  hlString(hlMap(data['source'])['name']);
  final scope = hlMap(data['scope']);
  final ids = <String>{}, providerIds = <String>{};
  final rawPlayers = (data['players'] as List).map(hlMap).toList();
  for (final p in rawPlayers) {
    final id = hlString(p['id']), provider = hlString(p['transfermarktId']);
    require(
      ids.add(id) &&
          providerIds.add(provider) &&
          RegExp(r'^\d+$').hasMatch(provider),
    );
    hlString(p['name']);
    require(
      p['isRetired'] is bool &&
          p['image'] is String &&
          (p['image'] as String).startsWith('/img/') &&
          date(p['fetchedAt']),
    );
    final stats = hlMap(p['stats']), coverage = hlMap(p['coverage']);
    require(
      coverage['scope'] == 'recorded-senior-career-matches' &&
          hlInt(coverage['appearances']) > 0,
    );
    final club = hlMap(coverage['club']),
        international = hlMap(coverage['international']);
    for (final part in [club, international]) {
      final appearances = hlInt(part['appearances']);
      for (final key in ['goals', 'assists']) {
        final missingKey = key == 'goals' ? 'missingGoals' : 'missingAssists';
        final missing = hlInt(part[missingKey]);
        require(missing <= appearances);
        require(missing > 0 ? part[key] == null : part[key] != null);
        if (part[key] != null) hlInt(part[key]);
        require(appearances != 0 || part[key] == 0);
      }
    }
    require(
      coverage['appearances'] ==
          (club['appearances'] as int) + (international['appearances'] as int),
    );
    for (final key in ['goals', 'assists']) {
      final missingKey = key == 'goals' ? 'missingGoals' : 'missingAssists';
      final missing =
          (club[missingKey] as int) + (international[missingKey] as int);
      final total = missing > 0
          ? null
          : (club[key] as int) + (international[key] as int);
      require(coverage[missingKey] == missing && stats[key] == total);
    }
    for (final key in ['marketValue', 'goals', 'assists']) {
      if (stats[key] != null) hlInt(stats[key]);
    }
    require(
      !(p['isRetired'] == true && stats['marketValue'] != null) &&
          stats['marketValue'] != 0 &&
          p['transfers'] is List,
    );
    final moves = <String>{};
    for (final item in p['transfers'] as List) {
      final move = hlMap(item);
      require(moves.add(hlString(move['id'])));
      hlInt(move['fee']);
      require(
        move['date'] is String &&
            RegExp(r'^\d{4}-\d{2}-\d{2}$').hasMatch(move['date'] as String) &&
            date(move['date']),
      );
      require(
        !DateTime.parse(move['date'] as String)
            .isAfter(DateTime.parse(p['fetchedAt'] as String)),
      );
      require(move['season'] == null || move['season'] is String);
      final from = hlMap(move['from']), to = hlMap(move['to']);
      require(from['id'] != to['id']);
      for (final endpoint in [from, to]) {
        require(RegExp(r'^\d+$').hasMatch(hlString(endpoint['id'])));
        hlString(endpoint['name']);
        require(hlString(endpoint['crest']).startsWith('https://'));
      }
    }
  }
  for (final key in ['marketValue', 'goals', 'assists']) {
    hlString(scope[key]);
    require(
      rawPlayers.where((p) => hlMap(p['stats'])[key] != null).length >= 20,
    );
  }
  hlString(scope['transfer']);
  require(
    rawPlayers.where((p) => (p['transfers'] as List).isNotEmpty).length >= 20,
  );
  require(
    rawPlayers.any((p) => p['isRetired'] == true) &&
        rawPlayers.any((p) => p['isRetired'] == false),
  );
}

class HlRun {
  HlRun({
    required this.id,
    required this.version,
    required this.createdAt,
    required this.category,
    required this.left,
    required this.right,
    this.score = 0,
    this.best = 0,
    this.revision = 0,
    Map<HlSide, int> roundsPlayed = const {HlSide.left: 0, HlSide.right: 0},
    this.currentSide,
    this.gameOver = false,
    this.lastPick,
    List<String> upcomingImages = const [],
  }) : roundsPlayed = Map.unmodifiable(roundsPlayed),
       upcomingImages = List.unmodifiable(upcomingImages);
  final String id;
  final String version;
  final String createdAt;
  final HlCategory category;
  final HlPlayer left;
  final HlPlayer right;
  final int score;
  final int best;
  final int revision;
  final Map<HlSide, int> roundsPlayed;
  final HlSide? currentSide;
  final bool gameOver;
  final HlSide? lastPick;
  final List<String> upcomingImages;
  HlPlayer player(HlSide side) => side == HlSide.left ? left : right;
  int get xp => score * 15;
  bool get hasProgress => score > 0 || currentSide != null;
  factory HlRun.fromJson(
    Map<String, dynamic> json, {
    String? runId,
    int? revision,
  }) {
    final category = HlCategory.parse(hlString(json['category']));
    final left = HlPlayer.fromJson(hlMap(json['left'])),
        right = HlPlayer.fromJson(hlMap(json['right']));
    if (left.id == right.id ||
        left.value(category) == null ||
        right.value(category) == null) {
      throw const FormatException('Invalid comparison pair.');
    }
    final counts = hlMap(json['roundsPlayed']);
    final score = hlInt(json['score']), best = hlInt(json['best']);
    if (best < score) throw const FormatException('Invalid personal best.');
    return HlRun(
      id: runId ?? hlString(json['id']),
      version: hlString(json['version']),
      createdAt: hlString(json['createdAt']),
      category: category,
      left: left,
      right: right,
      score: score,
      best: best,
      revision: revision ?? hlInt(json['revision'] ?? 0),
      roundsPlayed: {
        for (final side in HlSide.values) side: hlInt(counts[side.name]),
      },
      currentSide: json['currentSide'] == null
          ? null
          : HlSide.parse(json['currentSide'] as String),
      gameOver: json['gameOver'] as bool,
      lastPick: json['lastPick'] == null
          ? null
          : HlSide.parse(json['lastPick'] as String),
      upcomingImages: (json['upcomingImages'] as List? ?? []).cast<String>(),
    );
  }
  factory HlRun.fromCloud(Map<String, dynamic> json) => HlRun.fromJson(
    hlMap(json['state']),
    runId: hlString(json['runId']),
    revision: hlInt(json['revision']),
  );
  Map<String, dynamic> toJson() => {
    'id': id,
    'version': version,
    'createdAt': createdAt,
    'category': category.name,
    'left': left.toJson(),
    'right': right.toJson(),
    'score': score,
    'best': best,
    'revision': revision,
    'roundsPlayed': {
      for (final side in HlSide.values) side.name: roundsPlayed[side],
    },
    'currentSide': currentSide?.name,
    'gameOver': gameOver,
    'lastPick': lastPick?.name,
    'upcomingImages': upcomingImages,
  };
}

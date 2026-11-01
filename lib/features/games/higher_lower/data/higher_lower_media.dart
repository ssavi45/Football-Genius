import '../domain/higher_lower_models.dart';

class HlMedia {
  HlMedia(Map<String, dynamic> json, this.origin)
    : portraits = hlMap(json['portraits']),
      badges = hlMap(json['clubBadges']),
      optimized = hlMap(json['optimized']);
  final Uri origin;
  final Map<String, dynamic> portraits;
  final Map<String, dynamic> badges;
  final Map<String, dynamic> optimized;
  List<HlPlayer> players(HlSnapshot snapshot) => snapshot.players
      .where((p) => portraits.containsKey(p.id))
      .map(
        (p) => p.copyWith(
          portrait: portraits[p.id] as String,
          clubBadge: badges[p.clubId] as String? ?? p.clubBadge,
          transfers: p.transfers
              .map(
                (move) => move.withClubs(
                  move.from.withCrest(
                    badges[move.from.id] as String? ?? move.from.crest,
                  ),
                  move.to.withCrest(
                    badges[move.to.id] as String? ?? move.to.crest,
                  ),
                ),
              )
              .toList(),
        ),
      )
      .toList();

  String? image(String? source, {int width = 384}) {
    if (source == null || source.isEmpty) return null;
    final asset = optimized[source.split('?').first];
    if (asset is List && asset.length == 2) {
      final sizes = (asset[1] as List).cast<int>();
      source = sizes.isEmpty
          ? '/img/optimized/${asset[0]}.svg'
          : '/img/optimized/${asset[0]}-${sizes.firstWhere((size) => size >= width, orElse: () => sizes.last)}.webp';
    }
    final resolved = origin.resolve(source);
    return ['https', 'http'].contains(resolved.scheme)
        ? resolved.toString()
        : null;
  }
}

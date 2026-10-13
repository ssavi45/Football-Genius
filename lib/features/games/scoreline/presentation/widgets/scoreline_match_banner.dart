import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:football_genius/core/constants/app_colors.dart';
import 'package:football_genius/core/constants/asset_paths.dart';
import '../../domain/entities/historic_match.dart';

/// Cinematic match header banner reproducing the reference stadium visual:
/// Grand illuminated stadium bowl under matchday atmosphere, tournament branding,
/// and frameless club crests / national flags faceoff on the pitch.
class ScorelineMatchBanner extends StatelessWidget {
  final HistoricMatch match;

  const ScorelineMatchBanner({
    super.key,
    required this.match,
  });

  @override
  Widget build(BuildContext context) {
    // Determine tournament main title & stage subtitle
    final (tournamentName, stageSubtitle) = _parseCompetition(match.competitionName);

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      height: 216,
      decoration: BoxDecoration(
        color: AppColors.pitchBlack,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: const Color(0xFF00E5FF).withAlpha(50),
          width: 1.2,
        ),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF00E5FF).withAlpha(20),
            blurRadius: 16,
            spreadRadius: 1,
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(23),
        child: Stack(
          fit: StackFit.expand,
          children: [
            // 1. Grand stadium bowl background image
            Image.asset(
              AssetPaths.matchStadiumBanner,
              fit: BoxFit.cover,
              alignment: const Alignment(0, 0.05),
              errorBuilder: (_, _, _) => Container(
                color: const Color(0xFF071B12),
              ),
            ),

            // 2. High-contrast ambient gradient vignette
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.black.withAlpha(245),
                    Colors.black.withAlpha(140),
                    Colors.black.withAlpha(60),
                    Colors.black.withAlpha(220),
                  ],
                  stops: const [0.0, 0.35, 0.65, 1.0],
                ),
              ),
            ),

            // 3. Watermark competition badge in top-right sky
            Positioned(
              top: -24,
              right: -16,
              child: Opacity(
                opacity: 0.12,
                child: Image.asset(
                  _effectiveBadgePath(match.competitionBadgePath),
                  width: 150,
                  height: 150,
                  fit: BoxFit.contain,
                  color: Colors.white,
                  errorBuilder: (_, _, _) => Image.asset(
                    AssetPaths.defaultTournament,
                    width: 150,
                    height: 150,
                    fit: BoxFit.contain,
                    color: Colors.white,
                  ),
                ),
              ),
            ),

            // 4. Content overlay
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // Top section: Tournament icon + name - stage (single line) + matchday & venue (tight group)
                  Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Competition icon badge (consistent 42x42 box, preserving full-color logos)
                      SizedBox(
                        width: 46,
                        height: 42,
                        child: Image.asset(
                          _effectiveBadgePath(match.competitionBadgePath),
                          fit: BoxFit.contain,
                          color: _shouldTintBadgeWhite(match.competitionBadgePath)
                              ? Colors.white
                              : null,
                          errorBuilder: (_, _, _) => Image.asset(
                            AssetPaths.defaultTournament,
                            fit: BoxFit.contain,
                          ),
                        ),
                      ),
                      const SizedBox(height: 4),

                      // TOURNAMENT NAME - STAGE SUBTITLE in the same line with bright high-visibility colors
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Flexible(
                            child: Text(
                              tournamentName,
                              style: GoogleFonts.outfit(
                                fontSize: 13,
                                fontWeight: FontWeight.w900,
                                letterSpacing: 1.2,
                                color: const Color(0xFFFFE600),
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 6),
                            child: Text(
                              '-',
                              style: GoogleFonts.outfit(
                                fontSize: 13,
                                fontWeight: FontWeight.w800,
                                color: Colors.white,
                              ),
                            ),
                          ),
                          Text(
                            stageSubtitle,
                            style: GoogleFonts.outfit(
                              fontSize: 12.5,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 1.2,
                              color: Colors.white,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),

                      // Matchday & Venue Row (bright & clearly visible)
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(
                            Icons.location_on_rounded,
                            size: 13,
                            color: Color(0xFF2EFD72),
                          ),
                          const SizedBox(width: 4),
                          Flexible(
                            child: Text(
                              '${match.matchDate} • ${match.venue}',
                              style: GoogleFonts.outfit(
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                                color: Colors.white,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),

                  // Bottom section: Frameless Team Crests Faceoff on Pitch (consistent visual size)
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      // Home Team (Frameless crest / national logo / flag)
                      Expanded(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            _buildCrest(
                              crestPath: match.homeTeamCrestPath,
                              fallbackColor: const Color(0xFFFFC72C),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              match.homeTeamName,
                              style: GoogleFonts.outfit(
                                fontSize: 13.5,
                                fontWeight: FontWeight.w900,
                                color: Colors.white,
                              ),
                              textAlign: TextAlign.center,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),

                      // Center VS pill badge
                      Container(
                        width: 44,
                        height: 26,
                        decoration: BoxDecoration(
                          color: const Color(0xFF04140A),
                          borderRadius: BorderRadius.circular(13),
                          border: Border.all(
                            color: const Color(0xFF1B4324),
                            width: 1.2,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withAlpha(160),
                              blurRadius: 6,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Center(
                          child: Text(
                            'VS',
                            style: GoogleFonts.orbitron(
                              fontSize: 11,
                              fontWeight: FontWeight.w900,
                              color: AppColors.neonGreen,
                            ),
                          ),
                        ),
                      ),

                      // Away Team (Frameless crest / national logo / flag)
                      Expanded(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            _buildCrest(
                              crestPath: match.awayTeamCrestPath,
                              fallbackColor: const Color(0xFF00B4D8),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              match.awayTeamName,
                              style: GoogleFonts.outfit(
                                fontSize: 13.5,
                                fontWeight: FontWeight.w900,
                                color: Colors.white,
                              ),
                              textAlign: TextAlign.center,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Returns the competition badge path, falling back to the default tournament logo when empty.
  String _effectiveBadgePath(String rawPath) {
    final trimmed = rawPath.trim();
    return trimmed.isEmpty ? AssetPaths.defaultTournament : trimmed;
  }

  /// Only dark monochrome silhouette tournament badges should be tinted solid white.
  /// Full-color tournament logos (World Cup, Euro, default trophy, La Liga, Serie A, etc.)
  /// keep their original colors so they don't turn into a solid white rectangle.
  bool _shouldTintBadgeWhite(String badgePath) {
    final lower = badgePath.toLowerCase();
    const darkMonochromeBadges = [
      'ucl.png',
      'uel.png',
      'uecl.png',
      'epl.png',
      'l1.png',
      'copa_del_rey.png',
      'supercopa.png',
    ];
    return darkMonochromeBadges.any(lower.endsWith);
  }

  /// Builds a consistently sized club crest, national team logo, or national flag
  /// directly over the pitch visual so all team emblems share the same visual height.
  Widget _buildCrest({
    required String crestPath,
    required Color fallbackColor,
  }) {
    final isCountryFlag = crestPath.contains('/countries/');
    return SizedBox(
      height: 60,
      child: Center(
        child: isCountryFlag
            ? Container(
                width: 78,
                height: 52,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(6),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withAlpha(110),
                      blurRadius: 6,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                clipBehavior: Clip.antiAlias,
                child: Image.asset(
                  crestPath,
                  fit: BoxFit.cover,
                  errorBuilder: (_, _, _) => Icon(
                    Icons.flag_rounded,
                    size: 46,
                    color: fallbackColor,
                  ),
                ),
              )
            : SizedBox(
                width: 58,
                height: 58,
                child: Image.asset(
                  crestPath,
                  fit: BoxFit.contain,
                  errorBuilder: (_, _, _) => Icon(
                    Icons.shield_outlined,
                    size: 52,
                    color: fallbackColor,
                  ),
                ),
              ),
      ),
    );
  }

  /// Extracts tournament title and round/stage subtitle from competition string
  (String, String) _parseCompetition(String raw) {
    final upper = raw.toUpperCase().trim();
    const stagePatterns = [
      'FINAL MATCHDAY',
      'THIRD PLACE PLAY-OFF',
      'PLAY-OFFS SEMI-FINAL',
      'PLAY-OFF FINAL',
      'SEMI-FINAL 1ST LEG',
      'SEMI-FINAL 2ND LEG',
      'SEMI-FINAL',
      'SEMI FINAL',
      'QUARTER-FINAL 1ST LEG',
      'QUARTER-FINAL 2ND LEG',
      'QUARTER-FINAL',
      'QUARTER FINAL',
      'ROUND OF 16 1ST LEG',
      'ROUND OF 16 2ND LEG',
      'ROUND OF 16',
      'SECOND GROUP STAGE',
      'GROUP STAGE',
      'QUALIFIERS',
      'FINAL',
    ];

    for (final stage in stagePatterns) {
      if (upper.endsWith(stage)) {
        final name = upper.substring(0, upper.length - stage.length).trim();
        return (
          name.isEmpty ? 'HISTORIC TOURNAMENT' : name,
          stage.replaceAll('SEMI FINAL', 'SEMI-FINAL').replaceAll('QUARTER FINAL', 'QUARTER-FINAL'),
        );
      }
    }

    if (upper.contains('MATCHDAY')) {
      final parts = upper.split('MATCHDAY');
      return (parts.first.trim(), 'MATCHDAY ${parts.last.trim()}');
    }
    return (upper, 'HISTORIC ENCOUNTER');
  }
}

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/asset_paths.dart';
import '../../../../shared/models/game_metadata.dart';
import '../../../games/common/presentation/controllers/games_controller.dart';
import '../../../games/scoreline/presentation/controllers/scoreline_controller.dart';
import '../../../games/scoreline/presentation/controllers/scoreline_state.dart';

class FeaturedChallengeCard extends ConsumerWidget {
  final VoidCallback? onContinue;

  const FeaturedChallengeCard({
    super.key,
    this.onContinue,
  });

  String _formatTitleTwoLines(String title) {
    final words = title.trim().split(RegExp(r'\s+'));
    if (words.length <= 1) return title;
    if (words.length == 2) return '${words[0]}\n${words[1]}';
    final splitIndex = words.length - 1;
    return '${words.sublist(0, splitIndex).join(' ')}\n${words[splitIndex]}';
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final game = ref.watch(lastPlayedGameProvider);
    final scorelineState = ref.watch(scorelineControllerProvider);

    final isScoreline = game.id == 'scoreline';
    final isMatrix = game.id == 'matrix';

    final int currentRound = isScoreline && scorelineState.matches.isNotEmpty
        ? scorelineState.currentRoundNumber
        : 1;
    final int totalRounds = isScoreline && scorelineState.matches.isNotEmpty
        ? scorelineState.totalRounds
        : 10;
    final int scorePts = isScoreline ? scorelineState.totalScore : 0;

    final String progressBoldText = isScoreline
        ? 'Round $currentRound/$totalRounds '
        : isMatrix
            ? '6/9 '
            : '${game.badge} ';
    final String progressSubText = isScoreline
        ? '• $scorePts PTS'
        : isMatrix
            ? 'completed'
            : '• ${game.difficulty}';
    final double progressFactor = isScoreline
        ? (currentRound / totalRounds).clamp(0.1, 1.0)
        : isMatrix
            ? 6 / 9
            : 0.65;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 6),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: AppColors.neonGreen.withAlpha(120),
            width: 1.5,
          ),
          boxShadow: [
            BoxShadow(
              color: AppColors.neonGreen.withAlpha(25),
              blurRadius: 18,
              spreadRadius: 1,
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(18),
          child: Stack(
            children: [
              // Pitch atmosphere background
              Positioned.fill(
                child: Image.asset(
                  AssetPaths.cardMatrixStadium,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) =>
                      const SizedBox.shrink(),
                ),
              ),
              // Dark gradient scrim
              Positioned.fill(
                child: Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        AppColors.pitchBlack.withAlpha(230),
                        AppColors.pitchDark.withAlpha(145),
                        AppColors.pitchBlack.withAlpha(200),
                      ],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                  ),
                ),
              ),

              // Card Content
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 14, 16, 14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Kicker tag: LAST PLAYED
                    Row(
                      children: [
                        const Icon(
                          Icons.history_rounded,
                          size: 13,
                          color: AppColors.neonGreen,
                        ),
                        const SizedBox(width: 5),
                        Text(
                          'LAST PLAYED',
                          style: GoogleFonts.outfit(
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 1.5,
                            color: AppColors.neonGreen,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),

                    // Main Info + Mode Preview
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Left Column (Text & Progress)
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              if (isScoreline)
                                Padding(
                                  padding: const EdgeInsets.only(bottom: 2),
                                  child: Image.asset(
                                    AssetPaths.scorelineHeroLogo,
                                    height: 56,
                                    fit: BoxFit.contain,
                                    alignment: Alignment.centerLeft,
                                  ),
                                )
                              else
                                Text(
                                  _formatTitleTwoLines(game.title),
                                  style: GoogleFonts.outfit(
                                    fontSize: 22,
                                    fontWeight: FontWeight.w900,
                                    color: AppColors.textPrimary,
                                    height: 1.05,
                                    letterSpacing: -0.5,
                                  ),
                                ),
                              const SizedBox(height: 4),
                              // Subtitle
                              Row(
                                children: [
                                  const Icon(
                                    Icons.sports_soccer_rounded,
                                    size: 12,
                                    color: AppColors.trophyGold,
                                  ),
                                  const SizedBox(width: 5),
                                  Flexible(
                                    child: Text(
                                      game.subtitle,
                                      style: GoogleFonts.outfit(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w600,
                                        color: AppColors.textSecondary,
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 10),
                              // Live session progress + Progress bar
                              RichText(
                                text: TextSpan(
                                  style: GoogleFonts.outfit(fontSize: 11.5),
                                  children: [
                                    TextSpan(
                                      text: progressBoldText,
                                      style: const TextStyle(
                                        fontWeight: FontWeight.w800,
                                        color: AppColors.textPrimary,
                                      ),
                                    ),
                                    TextSpan(
                                      text: progressSubText,
                                      style: const TextStyle(
                                        fontWeight: FontWeight.w600,
                                        color: AppColors.textSecondary,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(height: 4),
                              ClipRRect(
                                borderRadius: BorderRadius.circular(3),
                                child: Container(
                                  height: 4,
                                  width: 120,
                                  color: Colors.white12,
                                  child: FractionallySizedBox(
                                    alignment: Alignment.centerLeft,
                                    widthFactor: progressFactor,
                                    child: Container(
                                      color: AppColors.neonGreen,
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),

                        const SizedBox(width: 14),

                        // Right: Mode-specific 96x96 visual preview
                        if (isMatrix)
                          const _MiniGrid3x3()
                        else
                          _GameModePreviewBox(
                            game: game,
                            scorelineState: isScoreline ? scorelineState : null,
                          ),
                      ],
                    ),

                    const SizedBox(height: 12),

                    // Modern Football-Themed CTA Button: Continue
                    Container(
                      width: double.infinity,
                      height: 42,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(14),
                        gradient: const LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: [
                            Color(0xFF2EFD72),
                            Color(0xFF00E676),
                            Color(0xFF00C853),
                          ],
                        ),
                        border: Border.all(
                          color: const Color(0xFF80FFA5),
                          width: 1.2,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFF2EFD72).withAlpha(95),
                            blurRadius: 14,
                            offset: const Offset(0, 3),
                          ),
                          BoxShadow(
                            color: Colors.black.withAlpha(120),
                            blurRadius: 6,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Material(
                        color: Colors.transparent,
                        child: InkWell(
                          onTap: onContinue,
                          borderRadius: BorderRadius.circular(13),
                          splashColor: Colors.white.withAlpha(60),
                          highlightColor: Colors.white.withAlpha(30),
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 14),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(4),
                                  decoration: BoxDecoration(
                                    color: Colors.black.withAlpha(35),
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Icon(
                                    Icons.sports_soccer_rounded,
                                    size: 15,
                                    color: Color(0xFF051B0D),
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  'CONTINUE',
                                  style: GoogleFonts.outfit(
                                    fontSize: 13.5,
                                    fontWeight: FontWeight.w900,
                                    letterSpacing: 1.1,
                                    color: const Color(0xFF051B0D),
                                  ),
                                ),
                                const Spacer(),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 6,
                                    vertical: 2,
                                  ),
                                  decoration: BoxDecoration(
                                    color: Colors.black.withAlpha(25),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: const Icon(
                                    Icons.keyboard_double_arrow_right_rounded,
                                    size: 16,
                                    color: Color(0xFF051B0D),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// 96x96 preview card for the currently active game mode (e.g., Scoreline Hero with live match faceoff).
class _GameModePreviewBox extends StatelessWidget {
  final GameMetadata game;
  final ScorelineState? scorelineState;

  const _GameModePreviewBox({
    required this.game,
    this.scorelineState,
  });

  @override
  Widget build(BuildContext context) {
    final activeMatch = scorelineState?.currentMatch;

    return Container(
      width: 96,
      height: 96,
      decoration: BoxDecoration(
        color: AppColors.pitchBlack.withAlpha(180),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: AppColors.neonGreen.withAlpha(90),
          width: 1.2,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(140),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(13),
        child: Stack(
          fit: StackFit.expand,
          children: [
            Image.asset(
              game.cardArtPath,
              fit: BoxFit.cover,
              errorBuilder: (_, _, _) => Container(
                color: AppColors.pitchCard,
                child: const Icon(
                  Icons.sports_soccer_rounded,
                  color: AppColors.neonGreen,
                  size: 32,
                ),
              ),
            ),
            if (activeMatch != null) ...[
              Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      Colors.black.withAlpha(90),
                      Colors.black.withAlpha(210),
                    ],
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(6),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        _buildMiniEmblem(activeMatch.homeTeamCrestPath),
                        Text(
                          'VS',
                          style: GoogleFonts.orbitron(
                            fontSize: 9,
                            fontWeight: FontWeight.w900,
                            color: AppColors.neonGreen,
                          ),
                        ),
                        _buildMiniEmblem(activeMatch.awayTeamCrestPath),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 6,
                        vertical: 2,
                      ),
                      decoration: BoxDecoration(
                        color: const Color(0xFF071B10),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(
                          color: AppColors.neonGreen.withAlpha(80),
                          width: 0.8,
                        ),
                      ),
                      child: Text(
                        '${scorelineState!.currentGuessedHome} - ${scorelineState!.currentGuessedAway}',
                        style: GoogleFonts.orbitron(
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildMiniEmblem(String path) {
    final isFlag = path.contains('/countries/');
    return SizedBox(
      width: 28,
      height: 24,
      child: Center(
        child: isFlag
            ? ClipRRect(
                borderRadius: BorderRadius.circular(3),
                child: Image.asset(
                  path,
                  width: 27,
                  height: 18,
                  fit: BoxFit.cover,
                  errorBuilder: (_, _, _) => const Icon(
                    Icons.flag_rounded,
                    size: 16,
                    color: Colors.white70,
                  ),
                ),
              )
            : Image.asset(
                path,
                width: 24,
                height: 24,
                fit: BoxFit.contain,
                errorBuilder: (_, _, _) => const Icon(
                  Icons.shield_outlined,
                  size: 18,
                  color: Colors.white70,
                ),
              ),
      ),
    );
  }
}

class _MiniGrid3x3 extends StatelessWidget {
  const _MiniGrid3x3();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 96,
      height: 96,
      padding: const EdgeInsets.all(3),
      decoration: BoxDecoration(
        color: AppColors.pitchBlack.withAlpha(160),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.borderSubtle),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildCell(
                child: Image.asset(
                  AssetPaths.clubRealMadrid,
                  fit: BoxFit.contain,
                  errorBuilder: (context, error, stackTrace) =>
                      const Icon(Icons.shield, size: 14, color: Colors.white70),
                ),
              ),
              _buildSilhouetteCell(),
              _buildCell(
                child: ClipOval(
                  child: Image.asset(
                    AssetPaths.countryFrance,
                    fit: BoxFit.cover,
                    width: 17,
                    height: 17,
                    errorBuilder: (context, error, stackTrace) =>
                        const Icon(Icons.flag, size: 14, color: Colors.white70),
                  ),
                ),
              ),
            ],
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildSilhouetteCell(),
              // Middle Active Cell (Soccer ball with green glow)
              _buildActiveBallCell(),
              _buildSilhouetteCell(),
            ],
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildCell(
                child: ClipOval(
                  child: Image.asset(
                    AssetPaths.countryBrazil,
                    fit: BoxFit.cover,
                    width: 17,
                    height: 17,
                    errorBuilder: (context, error, stackTrace) =>
                        const Icon(Icons.flag, size: 14, color: Colors.white70),
                  ),
                ),
              ),
              _buildSilhouetteCell(),
              _buildCell(
                child: Image.asset(
                  AssetPaths.tournamentEpl,
                  fit: BoxFit.contain,
                  errorBuilder: (context, error, stackTrace) =>
                      const Icon(Icons.emoji_events, size: 14, color: Colors.white70),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildCell({required Widget child}) {
    return Container(
      width: 27,
      height: 27,
      decoration: BoxDecoration(
        color: AppColors.gridSilhouette,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: AppColors.borderSubtle),
      ),
      padding: const EdgeInsets.all(3),
      child: Center(child: child),
    );
  }

  Widget _buildSilhouetteCell() {
    return Container(
      width: 27,
      height: 27,
      decoration: BoxDecoration(
        color: AppColors.gridSilhouette,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: AppColors.borderSubtle),
      ),
      child: const Center(
        child: Icon(
          Icons.person,
          size: 15,
          color: AppColors.gridSilhouetteIcon,
        ),
      ),
    );
  }

  Widget _buildActiveBallCell() {
    return Container(
      width: 27,
      height: 27,
      decoration: BoxDecoration(
        color: AppColors.neonGreen.withAlpha(30),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: AppColors.neonGreen, width: 1.2),
        boxShadow: [
          BoxShadow(
            color: AppColors.neonGreen.withAlpha(60),
            blurRadius: 6,
          ),
        ],
      ),
      child: const Center(
        child: Icon(
          Icons.sports_soccer,
          size: 15,
          color: Colors.white,
        ),
      ),
    );
  }
}

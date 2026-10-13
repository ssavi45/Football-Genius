import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:football_genius/core/constants/app_colors.dart';
import '../../domain/entities/historic_match.dart';

/// Tactical Intel (Hints) drawer redesigned according to single-view architecture:
/// - Only ONE hint is displayed in the readout area at a time.
/// - Tapping an already unlocked hint switches the display to that hint.
/// - Tapping a locked hint unlocks it and sets it as the active displayed hint.
/// - Deductions: Hint 1 (-1 PT), Hint 2 (-2 PTS), Hint 3 (-4 PTS).
class ScorelineHintDrawer extends StatefulWidget {
  final HistoricMatch match;
  final bool isHint1Unlocked;
  final bool isHint2Unlocked;
  final bool isHint3Unlocked;
  final VoidCallback onUnlockHint1;
  final VoidCallback onUnlockHint2;
  final VoidCallback onUnlockHint3;

  // Backwards-compatibility parameters
  final bool? isHalftimeUnlocked;
  final bool? isGoalSumUnlocked;
  final bool? isScorerClueUnlocked;
  final VoidCallback? onUnlockHalftime;
  final VoidCallback? onUnlockGoalSum;
  final VoidCallback? onUnlockScorer;

  const ScorelineHintDrawer({
    super.key,
    required this.match,
    this.isHint1Unlocked = false,
    this.isHint2Unlocked = false,
    this.isHint3Unlocked = false,
    VoidCallback? onUnlockHint1,
    VoidCallback? onUnlockHint2,
    VoidCallback? onUnlockHint3,
    this.isHalftimeUnlocked,
    this.isGoalSumUnlocked,
    this.isScorerClueUnlocked,
    this.onUnlockHalftime,
    this.onUnlockGoalSum,
    this.onUnlockScorer,
  })  : onUnlockHint1 = onUnlockHint1 ?? onUnlockHalftime ?? _noop,
        onUnlockHint2 = onUnlockHint2 ?? onUnlockGoalSum ?? _noop,
        onUnlockHint3 = onUnlockHint3 ?? onUnlockScorer ?? _noop;

  static void _noop() {}

  @override
  State<ScorelineHintDrawer> createState() => _ScorelineHintDrawerState();
}

class _ScorelineHintDrawerState extends State<ScorelineHintDrawer> {
  int? _activeHintIndex;

  bool get _hint1Active => widget.isHint1Unlocked || (widget.isHalftimeUnlocked ?? false);
  bool get _hint2Active => widget.isHint2Unlocked || (widget.isGoalSumUnlocked ?? false);
  bool get _hint3Active => widget.isHint3Unlocked || (widget.isScorerClueUnlocked ?? false);

  @override
  void initState() {
    super.initState();
    _resolveActiveHint();
  }

  @override
  void didUpdateWidget(ScorelineHintDrawer oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.match.id != widget.match.id) {
      _activeHintIndex = null;
    } else {
      // If a new hint was just unlocked, automatically view it
      final oldH1 = oldWidget.isHint1Unlocked || (oldWidget.isHalftimeUnlocked ?? false);
      final oldH2 = oldWidget.isHint2Unlocked || (oldWidget.isGoalSumUnlocked ?? false);
      final oldH3 = oldWidget.isHint3Unlocked || (oldWidget.isScorerClueUnlocked ?? false);

      if (!oldH3 && _hint3Active) {
        _activeHintIndex = 3;
      } else if (!oldH2 && _hint2Active) {
        _activeHintIndex = 2;
      } else if (!oldH1 && _hint1Active) {
        _activeHintIndex = 1;
      }
    }
    _resolveActiveHint();
  }

  void _resolveActiveHint() {
    if (_activeHintIndex == 1 && !_hint1Active) _activeHintIndex = null;
    if (_activeHintIndex == 2 && !_hint2Active) _activeHintIndex = null;
    if (_activeHintIndex == 3 && !_hint3Active) _activeHintIndex = null;

    if (_activeHintIndex == null) {
      if (_hint3Active) {
        _activeHintIndex = 3;
      } else if (_hint2Active) {
        _activeHintIndex = 2;
      } else if (_hint1Active) {
        _activeHintIndex = 1;
      }
    }
  }

  void _handleTapHint(int hintIndex) {
    if (hintIndex == 1) {
      if (!_hint1Active) {
        widget.onUnlockHint1();
      }
      setState(() => _activeHintIndex = 1);
    } else if (hintIndex == 2) {
      if (!_hint2Active) {
        widget.onUnlockHint2();
      }
      setState(() => _activeHintIndex = 2);
    } else if (hintIndex == 3) {
      if (!_hint3Active) {
        widget.onUnlockHint3();
      }
      setState(() => _activeHintIndex = 3);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF041208),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: const Color(0xFF0E381C),
          width: 1.2,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header: Lightbulb icon + TACTICAL INTEL (HINTS) + Deducts Points badge
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(
                    Icons.lightbulb_rounded,
                    size: 15,
                    color: Color(0xFFFFC72C),
                  ),
                  const SizedBox(width: 6),
                  Text(
                    'TACTICAL INTEL (HINTS)',
                    style: GoogleFonts.outfit(
                      fontSize: 11,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 1.1,
                      color: const Color(0xFFFFE600),
                    ),
                  ),
                ],
              ),
              Flexible(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0D2817),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(
                      color: const Color(0xFF1D5A34),
                      width: 0.8,
                    ),
                  ),
                  child: Text(
                    'Deducts Points',
                    style: GoogleFonts.outfit(
                      fontSize: 9.5,
                      fontWeight: FontWeight.w700,
                      color: const Color(0xFFF1F5F9),
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 12),

          // 3 Side-by-side Hint Capsules without icons
          Row(
            children: [
              // Hint 1: Subtle Clue (-1 PT)
              Expanded(
                child: _buildHintCapsule(
                  hintNumber: 1,
                  label: 'HINT 1',
                  cost: HistoricMatch.hint1Deduction,
                  isUnlocked: _hint1Active,
                  isViewing: _activeHintIndex == 1 && _hint1Active,
                  onTap: () => _handleTapHint(1),
                ),
              ),

              const SizedBox(width: 8),

              // Hint 2: Key Scorers (-2 PTS)
              Expanded(
                child: _buildHintCapsule(
                  hintNumber: 2,
                  label: 'HINT 2',
                  cost: HistoricMatch.hint2Deduction,
                  isUnlocked: _hint2Active,
                  isViewing: _activeHintIndex == 2 && _hint2Active,
                  onTap: () => _handleTapHint(2),
                ),
              ),

              const SizedBox(width: 8),

              // Hint 3: Scoreline Intel (-4 PTS)
              Expanded(
                child: _buildHintCapsule(
                  hintNumber: 3,
                  label: 'HINT 3',
                  cost: HistoricMatch.hint3Deduction,
                  isUnlocked: _hint3Active,
                  isViewing: _activeHintIndex == 3 && _hint3Active,
                  onTap: () => _handleTapHint(3),
                ),
              ),
            ],
          ),

          // Single active hint readout (only one hint shown at a time)
          if (_activeHintIndex != null) ...[
            if (_activeHintIndex == 1 && _hint1Active)
              _buildSingleRevealedHintTile(
                hintNumber: 1,
                tierTitle: 'MATCH CONTEXT',
                cost: HistoricMatch.hint1Deduction,
                content: widget.match.hint1Subtle,
              )
            else if (_activeHintIndex == 2 && _hint2Active)
              _buildSingleRevealedHintTile(
                hintNumber: 2,
                tierTitle: 'SCORER INTEL',
                cost: HistoricMatch.hint2Deduction,
                content: widget.match.hint2Scorers,
              )
            else if (_activeHintIndex == 3 && _hint3Active)
              _buildSingleRevealedHintTile(
                hintNumber: 3,
                tierTitle: 'SCORELINE GRAVITY',
                cost: HistoricMatch.hint3Deduction,
                content: widget.match.hint3Scoreline,
              ),
          ],
        ],
      ),
    );
  }

  Color _getHintAccentColor(int hintNumber) {
    switch (hintNumber) {
      case 1:
        return const Color(0xFF00E5FF); // Electric Cyan (Subtle Context, -1 PT)
      case 2:
        return const Color(0xFFFFC72C); // Radiant Gold (Scorer Intel, -2 PTS)
      case 3:
        return const Color(0xFFFF5252); // Fiery Coral (Scoreline Gravity, -4 PTS)
      default:
        return AppColors.neonGreen;
    }
  }

  Color _getHintBgDark(int hintNumber) {
    switch (hintNumber) {
      case 1:
        return const Color(0xFF021B1C); // Deep Teal Black
      case 2:
        return const Color(0xFF1F1603); // Deep Amber Black
      case 3:
        return const Color(0xFF21050F); // Deep Crimson Black
      default:
        return const Color(0xFF04140A);
    }
  }

  /// Compact capsule displaying HINT label, cost, and unlock/view status
  Widget _buildHintCapsule({
    required int hintNumber,
    required String label,
    required int cost,
    required bool isUnlocked,
    required bool isViewing,
    required VoidCallback onTap,
  }) {
    final accent = _getHintAccentColor(hintNumber);
    final bgDark = _getHintBgDark(hintNumber);

    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 10),
        decoration: BoxDecoration(
          color: isViewing
              ? bgDark.withAlpha(240)
              : isUnlocked
                  ? bgDark.withAlpha(190)
                  : bgDark.withAlpha(120),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isViewing
                ? accent
                : isUnlocked
                    ? accent.withAlpha(140)
                    : accent.withAlpha(75),
            width: isViewing ? 1.6 : 1.1,
          ),
          boxShadow: [
            BoxShadow(
              color: isViewing
                  ? accent.withAlpha(65)
                  : isUnlocked
                      ? accent.withAlpha(30)
                      : Colors.black.withAlpha(90),
              blurRadius: isViewing ? 10 : 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Text(
              label,
              style: GoogleFonts.outfit(
                fontSize: 11,
                fontWeight: FontWeight.w900,
                letterSpacing: 0.6,
                color: isViewing
                    ? accent
                    : isUnlocked
                        ? Colors.white
                        : accent.withAlpha(220),
              ),
              maxLines: 1,
            ),
            const SizedBox(height: 2),
            Text(
              '-$cost ${cost == 1 ? 'PT' : 'PTS'}',
              style: GoogleFonts.outfit(
                fontSize: 9.5,
                fontWeight: FontWeight.w800,
                color: isViewing
                    ? Colors.white
                    : isUnlocked
                        ? accent.withAlpha(210)
                        : accent,
              ),
              maxLines: 1,
            ),
            const SizedBox(height: 6),
            if (isUnlocked)
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 6,
                  vertical: 2.5,
                ),
                decoration: BoxDecoration(
                  color: isViewing
                      ? accent.withAlpha(45)
                      : const Color(0xFF041209),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: isViewing
                        ? accent
                        : accent.withAlpha(120),
                    width: 0.9,
                  ),
                ),
                child: Text(
                  isViewing ? 'VIEWING' : 'VIEW',
                  style: GoogleFonts.outfit(
                    fontSize: 8,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 0.4,
                    color: isViewing ? accent : Colors.white,
                  ),
                  maxLines: 1,
                ),
              )
            else
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 6,
                  vertical: 2.5,
                ),
                decoration: BoxDecoration(
                  color: accent.withAlpha(28),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: accent,
                    width: 0.9,
                  ),
                ),
                child: Text(
                  'UNLOCK',
                  style: GoogleFonts.outfit(
                    fontSize: 8,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 0.4,
                    color: accent,
                  ),
                  maxLines: 1,
                ),
              ),
          ],
        ),
      ),
    );
  }

  /// Single revealed hint card - only one hint shown at a time
  Widget _buildSingleRevealedHintTile({
    required int hintNumber,
    required String tierTitle,
    required int cost,
    required String content,
  }) {
    final accent = _getHintAccentColor(hintNumber);
    final bgDark = _getHintBgDark(hintNumber);

    return Container(
      margin: const EdgeInsets.only(top: 10),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: bgDark.withAlpha(230),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: accent.withAlpha(140),
          width: 1.2,
        ),
        boxShadow: [
          BoxShadow(
            color: accent.withAlpha(30),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: accent.withAlpha(40),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(
                    color: accent.withAlpha(150),
                    width: 0.8,
                  ),
                ),
                child: Text(
                  'HINT $hintNumber',
                  style: GoogleFonts.outfit(
                    fontSize: 9,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 0.5,
                    color: accent,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  tierTitle,
                  style: GoogleFonts.outfit(
                    fontSize: 9.5,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 0.6,
                    color: accent,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Text(
                '-$cost ${cost == 1 ? 'PT' : 'PTS'}',
                style: GoogleFonts.outfit(
                  fontSize: 9.5,
                  fontWeight: FontWeight.w800,
                  color: accent,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            content,
            style: GoogleFonts.outfit(
              fontSize: 12.5,
              fontWeight: FontWeight.w500,
              color: const Color(0xFFE2EFE5),
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }
}

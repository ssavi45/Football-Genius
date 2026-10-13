import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:football_genius/core/constants/asset_paths.dart';
import '../../domain/entities/historic_match.dart';

/// Context clues & historical drama panel faithfully matching the reference design:
/// - Top Card: Historical Drama & Fun Facts
///   - Open book icon in gold + two-line title in white & gold + 'NO SPOILERS' badge
///   - Concise, fun human-drama narrative blurb + match illustration cutout
///   - Glowing lightbulb + 'DID YOU KNOW? • MATCH LORE' subheader
///   - 4-item vertical timeline with neon soccer nodes, vertical dashed line, and fact cards with bolded key terms
/// - Bottom Card: Trivia Question
///   - Stadium pitch background + glowing golden trophy illustration
///   - 'TRIVIA QUESTION /////' kicker
///   - Highlighted question text with gold key terms
///   - 2x2 grid of 4 option cards with green person avatar icon & bold white player names
class ScorelineCluesPanel extends StatelessWidget {
  final HistoricMatch match;
  final String? selectedScorer;
  final ValueChanged<String> onSelectScorer;

  const ScorelineCluesPanel({
    super.key,
    required this.match,
    required this.selectedScorer,
    required this.onSelectScorer,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // 1. TOP CARD: Historical Drama & Fun Facts
        _buildHistoricalDramaCard(),

        // 2. BOTTOM CARD: Trivia Question
        _buildTriviaQuestionCard(),
      ],
    );
  }

  /// Builds the top "HISTORICAL DRAMA & FUN FACTS" card
  Widget _buildHistoricalDramaCard() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 7),
      decoration: BoxDecoration(
        color: const Color(0xFF041208),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(
          color: const Color(0xFF134224),
          width: 1.2,
        ),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF00E575).withAlpha(15),
            blurRadius: 20,
            spreadRadius: 0,
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(21),
        child: Stack(
          children: [
            // Top ambient floodlight glow
            Positioned(
              top: 0,
              right: 0,
              left: 0,
              height: 120,
              child: Container(
                decoration: BoxDecoration(
                  gradient: RadialGradient(
                    center: const Alignment(0.6, -0.8),
                    radius: 1.1,
                    colors: [
                      const Color(0xFF2EFD72).withAlpha(25),
                      const Color(0xFF00E5FF).withAlpha(12),
                      Colors.transparent,
                    ],
                    stops: const [0.0, 0.45, 1.0],
                  ),
                ),
              ),
            ),

            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Top Header Row: Book Icon + Title + NO SPOILERS badge
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(
                        Icons.auto_stories_rounded,
                        size: 26,
                        color: Color(0xFFFFC72C),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'HISTORICAL DRAMA &',
                              style: GoogleFonts.outfit(
                                fontSize: 15,
                                fontWeight: FontWeight.w900,
                                letterSpacing: 0.8,
                                color: Colors.white,
                                height: 1.15,
                              ),
                            ),
                            Text(
                              'FUN FACTS',
                              style: GoogleFonts.outfit(
                                fontSize: 15,
                                fontWeight: FontWeight.w900,
                                letterSpacing: 0.8,
                                color: const Color(0xFFFFC72C),
                                height: 1.15,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 5,
                        ),
                        decoration: BoxDecoration(
                          color: const Color(0xFF062312),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: const Color(0xFF1B552F),
                            width: 1.0,
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(
                              Icons.visibility_off_rounded,
                              size: 14,
                              color: Color(0xFF2EFD72),
                            ),
                            const SizedBox(width: 5),
                            Text(
                              'NO SPOILERS',
                              style: GoogleFonts.outfit(
                                fontSize: 10,
                                fontWeight: FontWeight.w800,
                                letterSpacing: 0.6,
                                color: const Color(0xFF2EFD72),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 14),

                  // Drama Story & Cutout Illustration Row
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Expanded(
                        flex: 6,
                        child: Text(
                          _getConciseDramaBlurb(match),
                          style: GoogleFonts.outfit(
                            fontSize: 12.5,
                            fontWeight: FontWeight.w500,
                            color: const Color(0xFFD6E3DA),
                            height: 1.45,
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      SizedBox(
                        width: 110,
                        height: 110,
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(16),
                          child: Stack(
                            fit: StackFit.expand,
                            children: [
                              Image.asset(
                                AssetPaths.matchDramaMoment,
                                fit: BoxFit.cover,
                                alignment: Alignment.center,
                                errorBuilder: (_, _, _) => Container(
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF082213),
                                    borderRadius: BorderRadius.circular(16),
                                    border: Border.all(
                                      color: const Color(0xFF1B552F),
                                    ),
                                  ),
                                  child: const Center(
                                    child: Icon(
                                      Icons.sports_soccer_rounded,
                                      size: 40,
                                      color: Color(0xFF2EFD72),
                                    ),
                                  ),
                                ),
                              ),
                              // Soft edge vignette
                              Container(
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(16),
                                  gradient: LinearGradient(
                                    begin: Alignment.centerLeft,
                                    end: Alignment.centerRight,
                                    colors: [
                                      const Color(0xFF041208).withAlpha(100),
                                      Colors.transparent,
                                    ],
                                    stops: const [0.0, 0.35],
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 18),

                  // Subheader: Lightbulb + DID YOU KNOW? • MATCH LORE
                  Row(
                    children: [
                      const Icon(
                        Icons.lightbulb_rounded,
                        size: 19,
                        color: Color(0xFFFFC72C),
                      ),
                      const SizedBox(width: 7),
                      Text(
                        'DID YOU KNOW? • MATCH LORE',
                        style: GoogleFonts.outfit(
                          fontSize: 11.5,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 1.1,
                          color: const Color(0xFFFFC72C),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 12),

                  // 4 Timeline Fact Cards with dashed connector
                  Column(
                    children: List.generate(match.narrativeClues.length, (index) {
                      final clue = match.narrativeClues[index];
                      final isLast = index == match.narrativeClues.length - 1;

                      return IntrinsicHeight(
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            // Left Timeline Track: Soccer Node + Dashed Line
                            SizedBox(
                              width: 24,
                              child: Column(
                                children: [
                                  // Circular Soccer Ball Node
                                  Container(
                                    width: 24,
                                    height: 24,
                                    decoration: BoxDecoration(
                                      shape: BoxShape.circle,
                                      color: const Color(0xFF072614),
                                      border: Border.all(
                                        color: const Color(0xFF2EFD72),
                                        width: 1.2,
                                      ),
                                      boxShadow: [
                                        BoxShadow(
                                          color: const Color(0xFF2EFD72).withAlpha(55),
                                          blurRadius: 6,
                                          spreadRadius: 1,
                                        ),
                                      ],
                                    ),
                                    child: const Center(
                                      child: Icon(
                                        Icons.sports_soccer_rounded,
                                        size: 13,
                                        color: Color(0xFF2EFD72),
                                      ),
                                    ),
                                  ),
                                  // Dashed Vertical Connector
                                  if (!isLast)
                                    Expanded(
                                      child: CustomPaint(
                                        painter: _DashedLinePainter(
                                          color: const Color(0xFF1B552F),
                                          dashHeight: 3.5,
                                          dashSpace: 3.0,
                                        ),
                                      ),
                                    ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 12),
                            // Right Fact Bubble Card
                            Expanded(
                              child: Padding(
                                padding: EdgeInsets.only(bottom: isLast ? 0 : 10),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 14,
                                    vertical: 10,
                                  ),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF061A0E),
                                    borderRadius: BorderRadius.circular(11),
                                    border: Border.all(
                                      color: const Color(0xFF0F361C),
                                      width: 1.0,
                                    ),
                                  ),
                                  child: _buildFormattedFact(clue),
                                ),
                              ),
                            ),
                          ],
                        ),
                      );
                    }),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Builds the bottom "TRIVIA QUESTION" card
  Widget _buildTriviaQuestionCard() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 7),
      decoration: BoxDecoration(
        color: const Color(0xFF041209),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(
          color: const Color(0xFF134224),
          width: 1.2,
        ),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF00E575).withAlpha(15),
            blurRadius: 20,
            spreadRadius: 0,
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(21),
        child: Stack(
          children: [
            // Background night stadium atmosphere with pitch
            Positioned.fill(
              child: Opacity(
                opacity: 0.16,
                child: Image.asset(
                  AssetPaths.matchStadiumBanner,
                  fit: BoxFit.cover,
                  alignment: Alignment.bottomCenter,
                  errorBuilder: (_, _, _) => const SizedBox.shrink(),
                ),
              ),
            ),

            // Left Golden Trophy illustration
            Positioned(
              left: 0,
              top: 0,
              bottom: 80,
              width: 95,
              child: Opacity(
                opacity: 0.90,
                child: Image.asset(
                  AssetPaths.goldenTriviaTrophy,
                  fit: BoxFit.contain,
                  alignment: Alignment.centerLeft,
                  errorBuilder: (_, _, _) => const SizedBox.shrink(),
                ),
              ),
            ),

            // Ambient dark vignette to keep text fully legible
            Positioned.fill(
              child: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.centerLeft,
                    end: Alignment.centerRight,
                    colors: [
                      const Color(0xFF041209).withAlpha(130),
                      const Color(0xFF041209).withAlpha(210),
                    ],
                    stops: const [0.0, 0.4],
                  ),
                ),
              ),
            ),

            // Content overlay
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Top Kicker: TRIVIA QUESTION /////
                  Row(
                    children: [
                      Text(
                        'TRIVIA QUESTION',
                        style: GoogleFonts.outfit(
                          fontSize: 10.5,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 1.5,
                          color: const Color(0xFF2EFD72),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        '/////',
                        style: GoogleFonts.outfit(
                          fontSize: 11,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 2.0,
                          color: const Color(0xFF1B552F),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 10),

                  // Question Text with intelligent highlight
                  _buildHighlightedQuestion(match.iconicQuestion),

                  const SizedBox(height: 14),

                  // 2x2 Grid of 4 Options
                  _buildOptionsGrid(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// 2x2 Grid of 4 Option Buttons matching reference screenshot
  Widget _buildOptionsGrid() {
    final options = match.iconicScorerOptions;
    if (options.length < 4) return const SizedBox.shrink();

    return Column(
      children: [
        Row(
          children: [
            Expanded(child: _buildOptionTile(options[0])),
            const SizedBox(width: 10),
            Expanded(child: _buildOptionTile(options[1])),
          ],
        ),
        const SizedBox(height: 10),
        Row(
          children: [
            Expanded(child: _buildOptionTile(options[2])),
            const SizedBox(width: 10),
            Expanded(child: _buildOptionTile(options[3])),
          ],
        ),
      ],
    );
  }

  /// Option capsule button with person icon and bright text
  Widget _buildOptionTile(String scorer) {
    final isSelected = selectedScorer == scorer;

    return GestureDetector(
      onTap: () => onSelectScorer(scorer),
      behavior: HitTestBehavior.opaque,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF0E381C) : const Color(0xFF06180E),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? const Color(0xFF2EFD72) : const Color(0xFF123B20),
            width: isSelected ? 1.5 : 1.0,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: const Color(0xFF2EFD72).withAlpha(60),
                    blurRadius: 10,
                    offset: const Offset(0, 2),
                  ),
                ]
              : null,
        ),
        child: Row(
          children: [
            const Icon(
              Icons.person_outline_rounded,
              size: 17,
              color: Color(0xFF2EFD72),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                scorer,
                style: GoogleFonts.outfit(
                  fontSize: 12.5,
                  fontWeight: isSelected ? FontWeight.w800 : FontWeight.w700,
                  color: Colors.white,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Highlighted question text with key phrase in radiant gold
  Widget _buildHighlightedQuestion(String question) {
    if (question.contains('**')) {
      final parts = question.split('**');
      return RichText(
        text: TextSpan(
          children: List.generate(parts.length, (i) {
            final isHighlight = i.isOdd;
            return TextSpan(
              text: parts[i],
              style: GoogleFonts.outfit(
                fontSize: 14.5,
                fontWeight: isHighlight ? FontWeight.w900 : FontWeight.w800,
                color: isHighlight ? const Color(0xFFFFE600) : Colors.white,
                height: 1.35,
              ),
            );
          }),
        ),
      );
    }

    // Default intelligent highlighting for scoring / record phrases
    return Text(
      question,
      style: GoogleFonts.outfit(
        fontSize: 14.5,
        fontWeight: FontWeight.w800,
        color: Colors.white,
        height: 1.35,
      ),
    );
  }

  /// Fact text parsing markdown **bold** words to bold white
  Widget _buildFormattedFact(String clue) {
    if (clue.contains('**')) {
      final parts = clue.split('**');
      return RichText(
        text: TextSpan(
          children: List.generate(parts.length, (i) {
            final isBold = i.isOdd;
            return TextSpan(
              text: parts[i],
              style: GoogleFonts.outfit(
                fontSize: 11.5,
                fontWeight: isBold ? FontWeight.w800 : FontWeight.w500,
                color: isBold ? Colors.white : const Color(0xFFC0D3C5),
                height: 1.35,
              ),
            );
          }),
        ),
      );
    }

    return Text(
      clue,
      style: GoogleFonts.outfit(
        fontSize: 11.5,
        fontWeight: FontWeight.w500,
        color: const Color(0xFFC0D3C5),
        height: 1.35,
      ),
    );
  }

  /// Curates concise, fun, high-stakes human drama without boring walls of text
  String _getConciseDramaBlurb(HistoricMatch match) {
    switch (match.id) {
      case '2014_wc_brazil_germany':
        return 'A nation of 200 million held its breath at the Estádio Mineirão. With talisman Neymar sidelined by injury and defensive anchor Thiago Silva suspended, Luiz Felipe Scolari’s Seleção faced a ruthlessly coordinated German machine.';
      case '2017_ucl_barcelona_psg':
        return 'Trailing by four goals from Paris, Luis Enrique boldly proclaimed: "If they score four, we will score six." Over 96,000 roaring fans watched European football\'s most electrifying comeback.';
      case '2005_ucl_milan_liverpool':
        return 'Down 3-0 at the break to Carlo Ancelotti\'s superstar AC Milan, Liverpool supporters famously sang "You\'ll Never Walk Alone" into the concourses, sparking six minutes of pure madness in Istanbul.';
      case '2022_wc_argentina_france':
        return 'Lionel Messi and Kylian Mbappé collided in an unforgettable showdown for football\'s ultimate crown, producing 120 minutes of unrelenting high-wire tactical drama.';
      case '2012_epl_mancity_qpr':
        return 'Trailing into the 91st minute with the title slipping across town to their bitter rivals, Manchester City needed two stoppage-time goals to end a 44-year championship drought.';
      case '1999_ucl_manu_bayern':
        return 'Bayern ribbons were already fitted onto the trophy in the 89th minute, before two stoppage-time corner kicks delivered Sir Alex Ferguson an immortal Treble.';
      case '2019_ucl_liverpool_barca':
        return 'Missing both Mohamed Salah and Roberto Firmino, Jürgen Klopp challenged his men: "If we can do it, wonderful. If not, let us fail in the most beautiful way." Anfield delivered a miracle.';
      case '2014_ucl_real_atletico':
        return 'Consumed by a twelve-year obsession to capture "La Décima", Real Madrid were seconds from heartbreak until Sergio Ramos rose at 92:48 to rewrite European history.';
      default:
        final sentences = match.historicStory.split('. ');
        if (sentences.length > 2) {
          return '${sentences.take(2).join('. ')}.';
        }
        return match.historicStory;
    }
  }
}

/// Custom painter for dashed vertical lines connecting timeline nodes
class _DashedLinePainter extends CustomPainter {
  final Color color;
  final double dashHeight;
  final double dashSpace;

  const _DashedLinePainter({
    required this.color,
    this.dashHeight = 3.5,
    this.dashSpace = 3.0,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = 1.4
      ..strokeCap = StrokeCap.round;

    double startY = 4.0;
    final x = size.width / 2;

    while (startY < size.height - 4.0) {
      canvas.drawLine(
        Offset(x, startY),
        Offset(x, startY + dashHeight),
        paint,
      );
      startY += dashHeight + dashSpace;
    }
  }

  @override
  bool shouldRepaint(_DashedLinePainter oldDelegate) {
    return oldDelegate.color != color ||
        oldDelegate.dashHeight != dashHeight ||
        oldDelegate.dashSpace != dashSpace;
  }
}

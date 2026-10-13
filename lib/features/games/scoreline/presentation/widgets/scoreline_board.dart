import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:football_genius/core/constants/app_colors.dart';
import 'led_dot_matrix.dart';

/// Compact stadium scoreboard prediction unit:
/// - Chamfered octagonal chassis with continuous metallic gold outer rim
/// - Reduced height and smaller, refined LED score display
/// - Distinct 22px gap between circular minus and plus buttons
/// - Supports scores from 0 up to 99 (single and double digit LED rendering)
/// - Full-width radiant neon green pill "LOCK IN SCORELINE ➔" CTA button
class ScorelineBoard extends StatelessWidget {
  final int homeScore;
  final int awayScore;
  final VoidCallback onIncrementHome;
  final VoidCallback onDecrementHome;
  final VoidCallback onIncrementAway;
  final VoidCallback onDecrementAway;
  final int skipsUsed;
  final int maxSkips;
  final VoidCallback? onSkip;
  final VoidCallback onSubmit;

  const ScorelineBoard({
    super.key,
    required this.homeScore,
    required this.awayScore,
    required this.onIncrementHome,
    required this.onDecrementHome,
    required this.onIncrementAway,
    required this.onDecrementAway,
    this.skipsUsed = 0,
    this.maxSkips = 3,
    this.onSkip,
    required this.onSubmit,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 5),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: const Color(0xFF04120A),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(
          color: AppColors.neonGreen.withAlpha(110),
          width: 1.2,
        ),
        boxShadow: [
          BoxShadow(
            color: AppColors.neonGreen.withAlpha(28),
            blurRadius: 20,
            spreadRadius: 1,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: Column(
        children: [
          // Header: Target icon + YOUR SCORELINE PREDICTION
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                Icons.track_changes_rounded,
                size: 16,
                color: AppColors.neonGreen,
              ),
              const SizedBox(width: 7),
              RichText(
                text: TextSpan(
                  children: [
                    TextSpan(
                      text: 'YOUR ',
                      style: GoogleFonts.outfit(
                        fontSize: 12,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.8,
                        color: Colors.white,
                      ),
                    ),
                    TextSpan(
                      text: 'SCORELINE PREDICTION',
                      style: GoogleFonts.outfit(
                        fontSize: 12,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 1.0,
                        color: AppColors.neonGreen,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 10),

          // Compact Chamfered Octagonal Scoreboard Chassis
          CustomPaint(
            painter: const StadiumScoreboardChassisPainter(),
            child: SizedBox(
              height: 166,
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                child: Row(
                  children: [
                    // Left flank spacing for amber indicator bar
                    const SizedBox(width: 8),

                    // Home Subpanel Module (Red LED + Red - / + Buttons)
                    Expanded(
                      child: _buildSubpanelModule(
                        score: homeScore,
                        activeColor: const Color(0xFFFF2828),
                        inactiveColor: const Color(0x30FF2828),
                        ringColor: const Color(0xFFFF2828),
                        screenBg: const Color(0xFF0E0304),
                        screenBorder: const Color(0xFF381414),
                        onIncrement: onIncrementHome,
                        onDecrement: onDecrementHome,
                      ),
                    ),

                    // Center Divider spacing for neon green colon dots & grills
                    const SizedBox(width: 30),

                    // Away Subpanel Module (Cyan LED + Cyan - / + Buttons)
                    Expanded(
                      child: _buildSubpanelModule(
                        score: awayScore,
                        activeColor: const Color(0xFF0091FF),
                        inactiveColor: const Color(0x300091FF),
                        ringColor: const Color(0xFF0091FF),
                        screenBg: const Color(0xFF020912),
                        screenBorder: const Color(0xFF0F2C46),
                        onIncrement: onIncrementAway,
                        onDecrement: onDecrementAway,
                      ),
                    ),

                    // Right flank spacing for cyan indicator bar
                    const SizedBox(width: 8),
                  ],
                ),
              ),
            ),
          ),

          const SizedBox(height: 12),

          // Side-by-side Dual Buttons: SKIP (x/3) and SUBMIT
          Row(
            children: [
              // 1. SKIP button with session counter (0/3 -> 3/3 disabled)
              Expanded(
                flex: 4,
                child: _buildSkipButton(),
              ),

              const SizedBox(width: 10),

              // 2. High-visibility SUBMIT CTA button
              Expanded(
                flex: 5,
                child: _buildSubmitButton(),
              ),
            ],
          ),
        ],
      ),
    );
  }

  /// Tactical dark pill showing skips used vs max per session.
  /// When all skips are used (3/3), the button is visually greyed out and unclickable.
  Widget _buildSkipButton() {
    final bool canSkip = skipsUsed < maxSkips;
    final int displaySkips = skipsUsed.clamp(0, maxSkips);

    return GestureDetector(
      onTap: canSkip ? onSkip : null,
      behavior: HitTestBehavior.opaque,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        height: 48,
        decoration: BoxDecoration(
          color: canSkip ? const Color(0xFF0C1910) : const Color(0xFF090D0A),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: canSkip ? const Color(0xFF264F34) : const Color(0xFF162119),
            width: 1.2,
          ),
          boxShadow: canSkip
              ? [
                  BoxShadow(
                    color: AppColors.neonGreen.withAlpha(20),
                    blurRadius: 10,
                    offset: const Offset(0, 2),
                  ),
                ]
              : null,
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.skip_next_rounded,
              size: 18,
              color: canSkip ? const Color(0xFF90C29F) : const Color(0xFF45554B),
            ),
            const SizedBox(width: 6),
            Text(
              'SKIP ($displaySkips/$maxSkips)',
              style: GoogleFonts.outfit(
                fontSize: 13,
                fontWeight: FontWeight.w800,
                letterSpacing: 0.4,
                color: canSkip ? Colors.white : const Color(0xFF45554B),
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Radiant Neon Green Pill CTA: SUBMIT ➔
  Widget _buildSubmitButton() {
    return GestureDetector(
      onTap: onSubmit,
      behavior: HitTestBehavior.opaque,
      child: Container(
        height: 48,
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [
              Color(0xFF33FF85),
              Color(0xFF00E676),
              Color(0xFF00C853),
            ],
            begin: Alignment.centerLeft,
            end: Alignment.centerRight,
          ),
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(
              color: AppColors.neonGreen.withAlpha(140),
              blurRadius: 16,
              spreadRadius: 1,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.check_circle_rounded,
              size: 17,
              color: Colors.black,
            ),
            const SizedBox(width: 6),
            Text(
              'SUBMIT',
              style: GoogleFonts.outfit(
                fontSize: 14,
                fontWeight: FontWeight.w900,
                letterSpacing: 0.8,
                color: Colors.black,
              ),
            ),
            const SizedBox(width: 5),
            const Icon(
              Icons.arrow_forward_rounded,
              size: 16,
              color: Colors.black,
            ),
          ],
        ),
      ),
    );
  }

  /// Builds a modular subpanel containing the recessed LED screen and circular dial buttons
  Widget _buildSubpanelModule({
    required int score,
    required Color activeColor,
    required Color inactiveColor,
    required Color ringColor,
    required Color screenBg,
    required Color screenBorder,
    required VoidCallback onIncrement,
    required VoidCallback onDecrement,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF090D0A),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: const Color(0xFF28362E),
          width: 1.2,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(200),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
          BoxShadow(
            color: Colors.white.withAlpha(10),
            blurRadius: 1,
            offset: const Offset(0, -1),
          ),
        ],
      ),
      child: Column(
        children: [
          // Top Section: Recessed Compact LED Screen Box (Taller height)
          Container(
            height: 86,
            margin: const EdgeInsets.fromLTRB(5, 5, 5, 2),
            decoration: BoxDecoration(
              color: screenBg,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: screenBorder,
                width: 1.0,
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withAlpha(160),
                  blurRadius: 4,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Center(
              child: LedDotMatrix(
                digit: score,
                activeColor: activeColor,
                inactiveColor: inactiveColor,
                width: 82,
                height: 74,
              ),
            ),
          ),

          // Bottom Section: Circular Minus and Plus Dial Buttons centered vertically between screen and lower border
          Expanded(
            child: Center(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Minus (-) button
                  _buildCircularDialButton(
                    isPlus: false,
                    ringColor: ringColor,
                    onTap: onDecrement,
                  ),

                  // Spaced gap between minus and plus buttons
                  const SizedBox(width: 22),

                  // Plus (+) button
                  _buildCircularDialButton(
                    isPlus: true,
                    ringColor: ringColor,
                    onTap: onIncrement,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  /// Circular dial button with glowing colored ring and bold white vector symbol
  Widget _buildCircularDialButton({
    required bool isPlus,
    required Color ringColor,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 36,
        height: 36,
        decoration: BoxDecoration(
          color: const Color(0xFF050806),
          shape: BoxShape.circle,
          border: Border.all(
            color: ringColor,
            width: 1.8,
          ),
          boxShadow: [
            BoxShadow(
              color: ringColor.withAlpha(120),
              blurRadius: 8,
              spreadRadius: 1,
            ),
          ],
        ),
        child: Center(
          child: isPlus
              ? SizedBox(
                  width: 13,
                  height: 13,
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      // Horizontal bar
                      Container(
                        width: 13,
                        height: 2.6,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(1.3),
                          boxShadow: [
                            BoxShadow(
                              color: ringColor.withAlpha(190),
                              blurRadius: 3,
                            ),
                          ],
                        ),
                      ),
                      // Vertical bar
                      Container(
                        width: 2.6,
                        height: 13,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(1.3),
                          boxShadow: [
                            BoxShadow(
                              color: ringColor.withAlpha(190),
                              blurRadius: 3,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                )
              : Container(
                  width: 13,
                  height: 2.6,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(1.3),
                    boxShadow: [
                      BoxShadow(
                        color: ringColor.withAlpha(190),
                        blurRadius: 3,
                      ),
                    ],
                  ),
                ),
        ),
      ),
    );
  }
}

/// Custom painter rendering the compact chamfered octagonal chassis, gold metallic rim,
/// titanium bevels, flank slots with amber & cyan light bars, and center divider with colon LEDs.
class StadiumScoreboardChassisPainter extends CustomPainter {
  const StadiumScoreboardChassisPainter();

  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width;
    final h = size.height;
    const double chamfer = 18.0; // 45-degree corner cut

    // Octagonal path generator
    Path createOctagon(double left, double top, double right, double bottom, double c) {
      return Path()
        ..moveTo(left + c, top)
        ..lineTo(right - c, top)
        ..lineTo(right, top + c)
        ..lineTo(right, bottom - c)
        ..lineTo(right - c, bottom)
        ..lineTo(left + c, bottom)
        ..lineTo(left, bottom - c)
        ..lineTo(left, top + c)
        ..close();
    }

    final outerPath = createOctagon(1, 1, w - 1, h - 1, chamfer);

    // 1. Outermost Gold Glow Halo
    final glowPaint = Paint()
      ..color = const Color(0xFFFFC72C).withAlpha(75)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3.0
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 8);
    canvas.drawPath(outerPath, glowPaint);

    // 2. Outermost Metallic Gold/Bronze Rim
    final goldShader = const LinearGradient(
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
      colors: [
        Color(0xFFFFEE58), // bright gold highlight
        Color(0xFFFFC107), // rich gold
        Color(0xFFFFA000), // deep amber gold
        Color(0xFFFFD54F), // light gold
        Color(0xFFFF8F00), // dark gold
      ],
      stops: [0.0, 0.25, 0.5, 0.75, 1.0],
    ).createShader(Rect.fromLTWH(0, 0, w, h));

    final goldStrokePaint = Paint()
      ..shader = goldShader
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0;
    canvas.drawPath(outerPath, goldStrokePaint);

    // 3. Chassis Body Fill (Brushed Dark Titanium / Gunmetal)
    final bodyPath = createOctagon(2.5, 2.5, w - 2.5, h - 2.5, chamfer - 1.5);
    final bodyShader = const LinearGradient(
      begin: Alignment.topCenter,
      end: Alignment.bottomCenter,
      colors: [
        Color(0xFF242E27), // top specular sheen
        Color(0xFF131915), // upper body
        Color(0xFF0D120E), // deep center body
        Color(0xFF161E18), // lower bevel
      ],
      stops: [0.0, 0.2, 0.8, 1.0],
    ).createShader(Rect.fromLTWH(0, 0, w, h));

    canvas.drawPath(bodyPath, Paint()..shader = bodyShader..style = PaintingStyle.fill);

    // 4. Specular Highlight along Top Edge and Top Chamfers
    final topHighlightPath = Path()
      ..moveTo(chamfer + 1, 3.0)
      ..lineTo(w - chamfer - 1, 3.0)
      ..moveTo(3.0, chamfer + 1)
      ..lineTo(chamfer + 1, 3.0)
      ..moveTo(w - chamfer - 1, 3.0)
      ..lineTo(w - 3.0, chamfer + 1);
    final topHighlightPaint = Paint()
      ..color = Colors.white.withAlpha(45)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.0;
    canvas.drawPath(topHighlightPath, topHighlightPaint);

    // Bottom Shadow line along bottom edge and bottom chamfers
    final bottomShadowPath = Path()
      ..moveTo(chamfer + 1, h - 3.0)
      ..lineTo(w - chamfer - 1, h - 3.0)
      ..moveTo(3.0, h - chamfer - 1)
      ..lineTo(chamfer + 1, h - 3.0)
      ..moveTo(w - chamfer - 1, h - 3.0)
      ..lineTo(w - 3.0, h - chamfer - 1);
    final bottomShadowPaint = Paint()
      ..color = Colors.black.withAlpha(160)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5;
    canvas.drawPath(bottomShadowPath, bottomShadowPaint);

    // 5. Left Flank: Recessed groove and Amber glowing light bar
    final leftSlotRect = Rect.fromLTWH(8, h / 2 - 18, 5, 36);
    canvas.drawRRect(
      RRect.fromRectAndRadius(leftSlotRect, const Radius.circular(2.5)),
      Paint()..color = const Color(0xFF070B08)..style = PaintingStyle.fill,
    );
    canvas.drawRRect(
      RRect.fromRectAndRadius(leftSlotRect, const Radius.circular(2.5)),
      Paint()..color = const Color(0xFF1D2620)..style = PaintingStyle.stroke..strokeWidth = 0.9,
    );
    // Amber light bar glow
    final amberGlowPaint = Paint()
      ..color = const Color(0xFFFF9100).withAlpha(190)
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 6);
    canvas.drawRRect(
      RRect.fromRectAndRadius(Rect.fromLTWH(9, h / 2 - 15, 3, 30), const Radius.circular(1.5)),
      amberGlowPaint,
    );
    // Amber light bar body
    canvas.drawRRect(
      RRect.fromRectAndRadius(Rect.fromLTWH(9, h / 2 - 15, 3, 30), const Radius.circular(1.5)),
      Paint()..color = const Color(0xFFFFB300)..style = PaintingStyle.fill,
    );
    // Amber center white core
    canvas.drawLine(
      Offset(10.5, h / 2 - 12),
      Offset(10.5, h / 2 + 12),
      Paint()..color = Colors.white.withAlpha(200)..strokeWidth = 1.0,
    );

    // 6. Right Flank: Recessed groove and Cyan glowing light bar
    final rightSlotRect = Rect.fromLTWH(w - 13, h / 2 - 18, 5, 36);
    canvas.drawRRect(
      RRect.fromRectAndRadius(rightSlotRect, const Radius.circular(2.5)),
      Paint()..color = const Color(0xFF04070A)..style = PaintingStyle.fill,
    );
    canvas.drawRRect(
      RRect.fromRectAndRadius(rightSlotRect, const Radius.circular(2.5)),
      Paint()..color = const Color(0xFF142028)..style = PaintingStyle.stroke..strokeWidth = 0.9,
    );
    // Cyan light bar glow
    final cyanGlowPaint = Paint()
      ..color = const Color(0xFF00B4D8).withAlpha(190)
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 6);
    canvas.drawRRect(
      RRect.fromRectAndRadius(Rect.fromLTWH(w - 12, h / 2 - 15, 3, 30), const Radius.circular(1.5)),
      cyanGlowPaint,
    );
    // Cyan light bar body
    canvas.drawRRect(
      RRect.fromRectAndRadius(Rect.fromLTWH(w - 12, h / 2 - 15, 3, 30), const Radius.circular(1.5)),
      Paint()..color = const Color(0xFF00E5FF)..style = PaintingStyle.fill,
    );
    // Cyan center white core
    canvas.drawLine(
      Offset(w - 10.5, h / 2 - 12),
      Offset(w - 10.5, h / 2 + 12),
      Paint()..color = Colors.white.withAlpha(200)..strokeWidth = 1.0,
    );

    // 7. Center Divider Pillar
    final cx = w / 2;
    final dividerRect = Rect.fromLTWH(cx - 13, 6, 26, h - 12);
    canvas.drawRRect(
      RRect.fromRectAndRadius(dividerRect, const Radius.circular(5)),
      Paint()..color = const Color(0xFF111813)..style = PaintingStyle.fill,
    );
    canvas.drawRRect(
      RRect.fromRectAndRadius(dividerRect, const Radius.circular(5)),
      Paint()..color = const Color(0xFF26332A)..style = PaintingStyle.stroke..strokeWidth = 1.0,
    );

    // Perforated micro-vent grill dots (top and bottom of divider)
    final ventPaint = Paint()..color = const Color(0xFF060907)..style = PaintingStyle.fill;
    // Top grill
    for (int r = 0; r < 3; r++) {
      for (int c = 0; c < 3; c++) {
        canvas.drawCircle(Offset(cx - 5 + c * 5.0, 12 + r * 4.5), 1.0, ventPaint);
      }
    }
    // Bottom grill
    for (int r = 0; r < 3; r++) {
      for (int c = 0; c < 3; c++) {
        canvas.drawCircle(Offset(cx - 5 + c * 5.0, h - 25 + r * 4.5), 1.0, ventPaint);
      }
    }

    // Two Glowing Neon Green Colon LEDs in Center (Aligned with center of LED screen at y = 51)
    const screenCenterY = 51.0;
    const colonRadius = 4.8;

    final dot1 = Offset(cx, screenCenterY - 9.5);
    final dot2 = Offset(cx, screenCenterY + 9.5);

    final greenBloomPaint = Paint()
      ..color = AppColors.neonGreen.withAlpha(210)
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 10);
    canvas.drawCircle(dot1, colonRadius * 1.8, greenBloomPaint);
    canvas.drawCircle(dot2, colonRadius * 1.8, greenBloomPaint);

    final greenBulbPaint = Paint()
      ..color = AppColors.neonGreen
      ..style = PaintingStyle.fill;
    canvas.drawCircle(dot1, colonRadius, greenBulbPaint);
    canvas.drawCircle(dot2, colonRadius, greenBulbPaint);

    final whiteCorePaint = Paint()
      ..color = Colors.white.withAlpha(240)
      ..style = PaintingStyle.fill;
    canvas.drawCircle(dot1, colonRadius * 0.45, whiteCorePaint);
    canvas.drawCircle(dot2, colonRadius * 0.45, whiteCorePaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

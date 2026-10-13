import 'package:flutter/material.dart';

/// Renders an authentic stadium scoreboard LED dot-matrix display.
/// Supports scores from 0 up to 99:
/// - Single digits (0-9) are centered in bold 7x11 stadium bitmask patterns.
/// - Double digits (10-99) display tens and ones side-by-side in 5x11 bitmasks.
/// - Unlit background dots remain faint to simulate physical scoreboard lenses.
class LedDotMatrix extends StatelessWidget {
  final int digit;
  final Color activeColor;
  final Color inactiveColor;
  final double width;
  final double height;

  const LedDotMatrix({
    super.key,
    required this.digit,
    required this.activeColor,
    this.inactiveColor = const Color(0x18FFFFFF),
    this.width = 82,
    this.height = 66,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: width,
      height: height,
      child: CustomPaint(
        painter: _LedMatrixPainter(
          digit: digit,
          activeColor: activeColor,
          inactiveColor: inactiveColor,
        ),
      ),
    );
  }
}

class _LedMatrixPainter extends CustomPainter {
  final int digit;
  final Color activeColor;
  final Color inactiveColor;

  // 7 columns x 11 rows bold bitmask patterns for single digits (0-9)
  static const Map<int, List<int>> _singleDigitPatterns = {
    0: [0x1C, 0x3E, 0x63, 0x63, 0x63, 0x63, 0x63, 0x63, 0x63, 0x3E, 0x1C],
    1: [0x0C, 0x1C, 0x3C, 0x0C, 0x0C, 0x0C, 0x0C, 0x0C, 0x0C, 0x3E, 0x3E],
    2: [0x3E, 0x7F, 0x63, 0x03, 0x06, 0x0C, 0x18, 0x30, 0x60, 0x7F, 0x7F],
    3: [0x3E, 0x7F, 0x63, 0x03, 0x1E, 0x1E, 0x03, 0x03, 0x63, 0x7F, 0x3E],
    4: [0x06, 0x0E, 0x1E, 0x36, 0x66, 0x7F, 0x7F, 0x06, 0x06, 0x06, 0x06],
    5: [0x7F, 0x7F, 0x60, 0x7E, 0x7F, 0x03, 0x03, 0x03, 0x63, 0x7F, 0x3E],
    6: [0x3E, 0x7F, 0x60, 0x60, 0x7E, 0x7F, 0x63, 0x63, 0x63, 0x7F, 0x3E],
    7: [0x7F, 0x7F, 0x03, 0x06, 0x0C, 0x18, 0x30, 0x30, 0x60, 0x60, 0x60],
    8: [0x3E, 0x7F, 0x63, 0x63, 0x3E, 0x7F, 0x63, 0x63, 0x63, 0x7F, 0x3E],
    9: [0x3E, 0x7F, 0x63, 0x63, 0x7F, 0x3F, 0x03, 0x03, 0x63, 0x7F, 0x3E],
  };

  // 5 columns x 11 rows bitmask patterns for dual digits (10-99)
  static const Map<int, List<int>> _dualDigitPatterns = {
    0: [0x0E, 0x1F, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x1F, 0x0E],
    1: [0x04, 0x0C, 0x1C, 0x04, 0x04, 0x04, 0x04, 0x04, 0x04, 0x0E, 0x0E],
    2: [0x0E, 0x1F, 0x11, 0x01, 0x02, 0x04, 0x08, 0x10, 0x10, 0x1F, 0x1F],
    3: [0x0E, 0x1F, 0x11, 0x01, 0x0E, 0x0E, 0x01, 0x01, 0x11, 0x1F, 0x0E],
    4: [0x02, 0x06, 0x0E, 0x12, 0x12, 0x1F, 0x1F, 0x02, 0x02, 0x02, 0x02],
    5: [0x1F, 0x1F, 0x10, 0x1E, 0x1F, 0x01, 0x01, 0x01, 0x11, 0x1F, 0x0E],
    6: [0x0E, 0x1F, 0x10, 0x1E, 0x1F, 0x11, 0x11, 0x11, 0x11, 0x1F, 0x0E],
    7: [0x1F, 0x1F, 0x01, 0x02, 0x04, 0x08, 0x10, 0x10, 0x10, 0x10, 0x10],
    8: [0x0E, 0x1F, 0x11, 0x11, 0x0E, 0x1F, 0x11, 0x11, 0x11, 0x1F, 0x0E],
    9: [0x0E, 0x1F, 0x11, 0x11, 0x1F, 0x0F, 0x01, 0x01, 0x11, 0x1F, 0x0E],
  };

  const _LedMatrixPainter({
    required this.digit,
    required this.activeColor,
    required this.inactiveColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    const int cols = 15; // 15 columns for fine-grained dual/single alignment
    const int rows = 13; // 11 active rows + 1 margin top/bottom

    final cellWidth = size.width / cols;
    final cellHeight = size.height / rows;
    final dotRadius = (cellWidth < cellHeight ? cellWidth : cellHeight) * 0.36;

    final displayValue = digit.clamp(0, 99);
    final isDualDigit = displayValue >= 10;

    final tens = isDualDigit ? (displayValue ~/ 10).clamp(0, 9) : 0;
    final ones = isDualDigit ? (displayValue % 10).clamp(0, 9) : displayValue;

    final singlePattern = _singleDigitPatterns[displayValue] ?? _singleDigitPatterns[0]!;
    final tensPattern = isDualDigit ? (_dualDigitPatterns[tens] ?? _dualDigitPatterns[0]!) : null;
    final onesPattern = isDualDigit ? (_dualDigitPatterns[ones] ?? _dualDigitPatterns[0]!) : null;

    // Paints for glowing active bulbs
    final activeHaloPaint = Paint()
      ..color = activeColor.withAlpha(90)
      ..style = PaintingStyle.fill
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 4.5);

    final activeBulbPaint = Paint()
      ..color = activeColor
      ..style = PaintingStyle.fill;

    final activeCorePaint = Paint()
      ..color = Colors.white.withAlpha(240)
      ..style = PaintingStyle.fill;

    // Paint for background inactive bulbs (lens tinted to active channel)
    final inactiveBulbPaint = Paint()
      ..color = inactiveColor
      ..style = PaintingStyle.fill;

    for (int r = 0; r < rows; r++) {
      for (int c = 0; c < cols; c++) {
        final cx = c * cellWidth + cellWidth / 2;
        final cy = r * cellHeight + cellHeight / 2;
        final center = Offset(cx, cy);

        // Active 11 rows start at r = 1
        final gridRow = r - 1;
        bool isActive = false;

        if (gridRow >= 0 && gridRow < 11) {
          if (!isDualDigit) {
            // Single digit: 7 columns centered at c = 4..10
            final gridCol = c - 4;
            if (gridCol >= 0 && gridCol < 7) {
              final rowMask = singlePattern[gridRow];
              isActive = (rowMask & (1 << (6 - gridCol))) != 0;
            }
          } else {
            // Dual digit:
            // Tens digit: columns 2..6 (gridCol = c - 2)
            // Column 7: center gap (unlit)
            // Ones digit: columns 8..12 (gridCol = c - 8)
            if (c >= 2 && c <= 6 && tensPattern != null) {
              final gridCol = c - 2;
              final rowMask = tensPattern[gridRow];
              isActive = (rowMask & (1 << (4 - gridCol))) != 0;
            } else if (c >= 8 && c <= 12 && onesPattern != null) {
              final gridCol = c - 8;
              final rowMask = onesPattern[gridRow];
              isActive = (rowMask & (1 << (4 - gridCol))) != 0;
            }
          }
        }

        if (isActive) {
          // Outer bloom halo
          canvas.drawCircle(center, dotRadius * 1.6, activeHaloPaint);
          // Vivid bulb body
          canvas.drawCircle(center, dotRadius, activeBulbPaint);
          // Intense center hot core
          canvas.drawCircle(center, dotRadius * 0.42, activeCorePaint);
        } else {
          // Faint unlit background LED dot
          canvas.drawCircle(center, dotRadius * 0.70, inactiveBulbPaint);
        }
      }
    }
  }

  @override
  bool shouldRepaint(covariant _LedMatrixPainter oldDelegate) {
    return oldDelegate.digit != digit ||
        oldDelegate.activeColor != activeColor ||
        oldDelegate.inactiveColor != inactiveColor;
  }
}

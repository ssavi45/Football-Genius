import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../domain/higher_lower_models.dart';

abstract final class HlStyle {
  static const background = Color(0xFFF6F8F5);
  static const ink = Color(0xFF102E35);
  static const teal = Color(0xFF006C60);
  static const mint = Color(0xFFE0EFE7);
  static const gold = Color(0xFFF2BD41);
  static const muted = Color(0xFF607375);
  static const line = Color(0xFFDEE6DF);
  static const correct = Color(0xFF167044);
  static const incorrect = Color(0xFFB83636);
  static ThemeData get theme => ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    fontFamily: 'Outfit',
    scaffoldBackgroundColor: background,
    colorScheme: const ColorScheme.light(
      primary: teal,
      secondary: gold,
      surface: background,
      onSurface: ink,
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: background,
      foregroundColor: ink,
      elevation: 0,
      scrolledUnderElevation: 0,
      centerTitle: false,
    ),
    bottomSheetTheme: const BottomSheetThemeData(
      backgroundColor: background,
      showDragHandle: true,
    ),
  );
  static const systemBars = SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.dark,
    statusBarBrightness: Brightness.light,
    systemNavigationBarColor: background,
    systemNavigationBarIconBrightness: Brightness.dark,
  );
  static TextStyle text(
    double size, {
    FontWeight weight = FontWeight.w500,
    Color color = ink,
    double height = 1.2,
  }) => TextStyle(
    fontFamily: 'Outfit',
    fontSize: size,
    fontWeight: weight,
    color: color,
    height: height,
  );
  static bool large(BuildContext context) =>
      MediaQuery.textScalerOf(context).scale(14) > 18.2;
  static IconData icon(HlCategory category) => switch (category) {
    HlCategory.marketValue => Icons.euro_rounded,
    HlCategory.goals => Icons.sports_soccer_rounded,
    HlCategory.assists => Icons.assistant_direction_rounded,
    HlCategory.transfer => Icons.swap_horiz_rounded,
  };
  static Color tint(HlCategory category) => switch (category) {
    HlCategory.marketValue => const Color(0xFFE0EFE7),
    HlCategory.goals => const Color(0xFFE9EAF8),
    HlCategory.assists => const Color(0xFFFFECD6),
    HlCategory.transfer => const Color(0xFFFFF2CE),
  };
}

class HlArrowArt extends StatelessWidget {
  const HlArrowArt({super.key, this.size = 100});
  final double size;
  @override
  Widget build(BuildContext context) => ExcludeSemantics(
    child: SizedBox.square(
      dimension: size,
      child: CustomPaint(painter: _Arrows()),
    ),
  );
}

class _Arrows extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    canvas.save();
    canvas.scale(size.width / 100, size.height / 100);
    canvas.drawCircle(
      const Offset(50, 50),
      48,
      Paint()..color = Colors.white.withValues(alpha: .5),
    );
    final up = Path()
      ..moveTo(14, 45)
      ..lineTo(40, 10)
      ..lineTo(66, 45)
      ..lineTo(51, 45)
      ..lineTo(51, 82)
      ..lineTo(29, 82)
      ..lineTo(29, 45)
      ..close();
    final down = Path()
      ..moveTo(50, 57)
      ..lineTo(65, 57)
      ..lineTo(65, 20)
      ..lineTo(85, 20)
      ..lineTo(85, 57)
      ..lineTo(99, 57)
      ..lineTo(75, 92)
      ..close();
    canvas.drawPath(up, Paint()..color = HlStyle.teal);
    canvas.drawPath(down, Paint()..color = HlStyle.gold);
    canvas.restore();
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

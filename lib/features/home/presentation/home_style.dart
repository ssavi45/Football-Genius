import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// Shared Home/catalogue tokens; active games retain their dark theme.
abstract final class HomeStyle {
  static const background = Color(0xFFFAF9F6);
  static const ink = Color(0xFF061E25);
  static const teal = Color(0xFF004D47);
  static const muted = Color(0xFF858B96);
  static const gold = Color(0xFFE4AD28);
  static const green = Color(0xFF00D76A);
  static const navy = Color(0xFF041C2A);
  static const margin = 15.0;
  static const maxWidth = 520.0;
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
  );
  static const systemBars = SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.dark,
    statusBarBrightness: Brightness.light,
    systemNavigationBarColor: Colors.white,
    systemNavigationBarIconBrightness: Brightness.dark,
    systemNavigationBarDividerColor: Colors.transparent,
  );
  static double unit(BuildContext context) =>
      (MediaQuery.sizeOf(context).width.clamp(0, maxWidth) / 393).clamp(
        .8,
        1.324,
      );
  static bool largeText(BuildContext context) =>
      MediaQuery.textScalerOf(context).scale(14) / 14 > 1.3;
  static TextStyle text(
    double size, {
    Color color = ink,
    FontWeight weight = FontWeight.w500,
    double height = 1.15,
    double? spacing,
  }) => TextStyle(
    fontFamily: 'Outfit',
    fontSize: size,
    fontWeight: weight,
    color: color,
    height: height,
    letterSpacing: spacing,
  );
  static const goldGradient = LinearGradient(
    colors: [Color(0xFFFFDF57), Color(0xFFF5BD30), Color(0xFFFFD74C)],
    stops: [0, .65, 1],
  );
  static const shadow = [
    BoxShadow(color: Color(0x0D493F20), blurRadius: 20, offset: Offset(0, 8)),
  ];
}

abstract final class HomeArt {
  static const logo = 'assets/images/branding/footygen_blue.webp';
  static const scoreline = 'assets/images/home/scoreline.webp';
  static const portrait = 'assets/images/home/portrait.webp';
  static const higherLower = 'assets/images/home/higher-lower.webp';
  static const pixelPitch = 'assets/images/home/pixel-pitch.webp';
  static const bootroom = 'assets/images/home/bootroom.webp';
  static const scoutsDuel = 'assets/images/home/scouts-duel.webp';
  static const scorecard = 'assets/images/home/scorecard-frame.webp';
}

class HomeArtwork extends StatelessWidget {
  const HomeArtwork(
    this.path, {
    super.key,
    this.fit = BoxFit.cover,
    this.alignment = Alignment.center,
  });
  final String path;
  final BoxFit fit;
  final Alignment alignment;
  @override
  Widget build(BuildContext context) => Image.asset(
    path,
    fit: fit,
    alignment: alignment,
    excludeFromSemantics: true,
    filterQuality: FilterQuality.high,
    errorBuilder: (_, _, _) => const ColoredBox(color: HomeStyle.navy),
  );
}

class HomeGoldButton extends StatelessWidget {
  const HomeGoldButton({
    super.key,
    required this.label,
    this.onTap,
    this.icon,
    this.width,
    this.emphasized = false,
  });
  final String label;
  final VoidCallback? onTap;
  final IconData? icon;
  final double? width;
  final bool emphasized;
  @override
  Widget build(BuildContext context) {
    final u = HomeStyle.unit(context);
    return SizedBox(
      width: width,
      child: Semantics(
        button: true,
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: onTap,
            borderRadius: BorderRadius.circular(30),
            child: ConstrainedBox(
              constraints: const BoxConstraints(minHeight: 46),
              child: Center(
                widthFactor: 1,
                child: Ink(
                  padding: EdgeInsets.symmetric(
                    horizontal: (emphasized ? 13 : 14) * u,
                    vertical: 7 * u,
                  ),
                  decoration: BoxDecoration(
                    gradient: HomeStyle.goldGradient,
                    borderRadius: BorderRadius.circular(30),
                    border: Border.all(color: const Color(0xFFFFE785)),
                  ),
                  child: Row(
                    mainAxisSize: width == null
                        ? MainAxisSize.min
                        : MainAxisSize.max,
                    children: [
                      if (icon != null) ...[
                        Icon(icon, size: (emphasized ? 19 : 21) * u, color: Colors.black),
                        SizedBox(width: (emphasized ? 7 : 10) * u),
                      ],
                      Flexible(
                        fit: width == null ? FlexFit.loose : FlexFit.tight,
                        child: Text(
                          label,
                          maxLines: 1,
                          softWrap: false,
                          overflow: TextOverflow.clip,
                          style: HomeStyle.text(
                            (emphasized ? 14 : 13) * u,
                            color: Colors.black,
                            weight: FontWeight.w800,
                            spacing: emphasized ? .2 : -.1,
                          ),
                        ),
                      ),
                      SizedBox(width: (emphasized ? 7 : 10) * u),
                      DecoratedBox(
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: Colors.black.withValues(alpha: .12),
                        ),
                        child: Padding(
                          padding: EdgeInsets.all(3 * u),
                          child: Icon(
                            Icons.chevron_right_rounded,
                            color: Colors.black,
                            size: 21 * u,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

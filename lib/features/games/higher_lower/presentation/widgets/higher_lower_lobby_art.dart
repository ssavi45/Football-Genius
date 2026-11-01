import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../../domain/higher_lower_models.dart';

/// Original code-drawn trim and symbols. No screenshot pixels or paths are used.
abstract final class HlLobbyStyle {
  static const background = Color(0xFF001A17);
  static const gold = Color(0xFFFFD77F);
  static const silver = Color(0xFFF4F8F5);
  static const metal = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [
      Color(0xFFFFFFED),
      Color(0xFFFFDF90),
      Color(0xFFD6A13B),
      Color(0xFFFFE7A2),
    ],
    stops: [0, .35, .69, 1],
  );
  static TextStyle display(
    double size, {
    double height = 1,
    Color color = silver,
  }) => TextStyle(
    fontFamily: 'BarlowSemiCondensed',
    fontWeight: FontWeight.w900,
    fontStyle: FontStyle.italic,
    fontSize: size,
    height: height,
    color: color,
    shadows: const [
      Shadow(color: Color(0xE6000707), offset: Offset(1, 2), blurRadius: 2),
    ],
  );
  static TextStyle body(
    double size, {
    Color color = silver,
    bool italic = false,
    double spacing = 0,
  }) => TextStyle(
    fontFamily: 'BarlowSemiCondensed',
    fontSize: size,
    height: 1.15,
    fontWeight: italic ? FontWeight.w500 : FontWeight.w400,
    fontStyle: italic ? FontStyle.italic : FontStyle.normal,
    color: color,
    letterSpacing: spacing,
    shadows: const [
      Shadow(color: Colors.black, blurRadius: 2, offset: Offset(0, 1)),
    ],
  );
  static Color accent(HlCategory category) => switch (category) {
    HlCategory.marketValue => const Color(0xFF39F0A8),
    HlCategory.goals => const Color(0xFF65BAFF),
    HlCategory.assists => const Color(0xFFC373FF),
    HlCategory.transfer => const Color(0xFFEBC47D),
  };
  static String image(HlCategory category) =>
      'assets/images/higher_lower/lobby_${switch (category) {
        HlCategory.marketValue => 'market',
        HlCategory.goals => 'goals',
        HlCategory.assists => 'assists',
        HlCategory.transfer => 'transfer',
      }}.webp';
  static String title(HlCategory category) => switch (category) {
    HlCategory.marketValue => 'MARKET\nVALUE',
    HlCategory.goals => 'CAREER\nGOALS',
    HlCategory.assists => 'CAREER\nASSISTS',
    HlCategory.transfer => 'TRANSFER\nFEE',
  };
}

class HlMetalText extends StatelessWidget {
  const HlMetalText(
    this.text, {
    super.key,
    required this.size,
    this.gold = false,
    this.height = 1,
    this.align = TextAlign.start,
  });
  final String text;
  final double size;
  final bool gold;
  final double height;
  final TextAlign align;
  @override
  Widget build(BuildContext context) => Text(
    text,
    textAlign: align,
    style: HlLobbyStyle.display(size, height: height).copyWith(
      foreground: Paint()
        ..shader =
            (gold
                    ? HlLobbyStyle.metal
                    : const LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.white,
                          Color(0xFFF5F8F8),
                          Color(0xFFBEC6C8),
                          Colors.white,
                        ],
                        stops: [0, .35, .68, 1],
                      ))
                .createShader(
                  Rect.fromLTWH(
                    0,
                    0,
                    1000,
                    MediaQuery.textScalerOf(context).scale(size) *
                        height *
                        text.split('\n').length,
                  ),
                ),
    ),
  );
}

class HlTitleLaurel extends StatelessWidget {
  const HlTitleLaurel({super.key, required this.unit, this.right = false});
  final double unit;
  final bool right;
  @override
  Widget build(BuildContext context) => CustomPaint(
    painter: _TitleLaurelPainter(right),
    size: Size(13 * unit, 30 * unit),
  );
}

class _TitleLaurelPainter extends CustomPainter {
  const _TitleLaurelPainter(this.right);
  final bool right;
  @override
  void paint(Canvas canvas, Size size) {
    if (right) {
      canvas.translate(size.width, 0);
      canvas.scale(-1, 1);
    }
    final paint = Paint()
      ..shader = HlLobbyStyle.metal.createShader(Offset.zero & size);
    final stem = Path();
    for (var index = 0; index <= 8; index++) {
      final t = index / 9;
      final point = Offset(
        (.82 - .6 * math.sin(t * math.pi)) * size.width,
        (.95 - .9 * t) * size.height,
      );
      if (index == 0) {
        stem.moveTo(point.dx, point.dy);
      } else {
        stem.lineTo(point.dx, point.dy);
      }
      final leaf = Path()
        ..moveTo(point.dx, point.dy)
        ..quadraticBezierTo(
          point.dx - size.width * .48,
          point.dy - size.height * .045,
          point.dx - size.width * .36,
          point.dy - size.height * .19,
        )
        ..quadraticBezierTo(
          point.dx + size.width * .08,
          point.dy - size.height * .10,
          point.dx,
          point.dy,
        );
      canvas.drawPath(leaf, paint);
    }
    canvas.drawPath(
      stem,
      Paint()
        ..color = HlLobbyStyle.gold
        ..strokeWidth = .65
        ..style = PaintingStyle.stroke,
    );
  }

  @override
  bool shouldRepaint(_TitleLaurelPainter oldDelegate) =>
      right != oldDelegate.right;
}

class HlCutClipper extends CustomClipper<Path> {
  const HlCutClipper({this.slant = false});
  final bool slant;
  @override
  Path getClip(Size size) {
    final cut = math.min(size.height * .27, 12.0);
    final inset = slant ? size.height * .15 : 0.0;
    return Path()
      ..moveTo(cut + inset, 0)
      ..lineTo(size.width - cut, 0)
      ..lineTo(size.width, cut)
      ..lineTo(size.width - inset, size.height - cut)
      ..lineTo(size.width - cut - inset, size.height)
      ..lineTo(cut, size.height)
      ..lineTo(0, size.height - cut)
      ..lineTo(inset, cut)
      ..close();
  }

  @override
  bool shouldReclip(HlCutClipper oldClipper) => slant != oldClipper.slant;
}

class HlBevel extends StatelessWidget {
  const HlBevel({
    super.key,
    required this.child,
    this.gold = false,
    this.slant = false,
  });
  final Widget child;
  final bool gold;
  final bool slant;
  @override
  Widget build(BuildContext context) => CustomPaint(
    foregroundPainter: _BevelBorder(slant: slant),
    child: ClipPath(
      clipper: HlCutClipper(slant: slant),
      child: DecoratedBox(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: gold
                ? const [
                    Color(0xFFFFF4C6),
                    Color(0xFFD99B21),
                    Color(0xFFF9DB83),
                    Color(0xFF9D650F),
                  ]
                : const [
                    Color(0xFF174338),
                    Color(0xFF031C23),
                    Color(0xFF001011),
                  ],
            stops: gold ? const [0, .33, .59, 1] : null,
          ),
        ),
        child: child,
      ),
    ),
  );
}

class _BevelBorder extends CustomPainter {
  const _BevelBorder({this.slant = false});
  final bool slant;
  @override
  void paint(Canvas canvas, Size size) {
    final rect = Offset.zero & size;
    final path = HlCutClipper(slant: slant).getClip(size);
    canvas.drawPath(
      path,
      Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1.2
        ..shader = HlLobbyStyle.metal.createShader(rect),
    );
    canvas.save();
    canvas.translate(1.4, 1.4);
    canvas.drawPath(
      HlCutClipper(slant: slant)
          .getClip(Size(size.width - 2.8, size.height - 2.8)),
      Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = .45
        ..color = const Color(0xFF91C4B8),
    );
    canvas.restore();
  }

  @override
  bool shouldRepaint(_BevelBorder oldDelegate) => slant != oldDelegate.slant;
}

class HlLobbyIconButton extends StatelessWidget {
  const HlLobbyIconButton({
    super.key,
    required this.tooltip,
    required this.icon,
    required this.onPressed,
    this.unit = 1,
    this.visualShift = 0,
  });
  final String tooltip;
  final IconData icon;
  final VoidCallback? onPressed;
  final double unit;
  final double visualShift;
  @override
  Widget build(BuildContext context) => Semantics(
    button: true,
    enabled: onPressed != null,
    label: tooltip,
    onTap: onPressed,
    excludeSemantics: true,
    child: Tooltip(
      message: tooltip,
      child: InkResponse(
        onTap: onPressed,
        radius: 25,
        child: SizedBox(
          width: math.max(43 * unit, 48),
          height: math.max(43 * unit, 48),
          child: Center(
            child: Transform.translate(
              offset: Offset(visualShift, 0),
              transformHitTests: false,
              child: SizedBox(
                width: 33 * unit,
                height: 29 * unit,
                child: HlBevel(
                  child: Center(
                    child: ShaderMask(
                      shaderCallback: HlLobbyStyle.metal.createShader,
                      child: Icon(icon, color: Colors.white, size: 23 * unit),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    ),
  );
}

class HlLaurels extends StatelessWidget {
  const HlLaurels({super.key, this.width = 42, this.height = 38, this.child});
  final double width;
  final double height;
  final Widget? child;
  @override
  Widget build(BuildContext context) => CustomPaint(
    painter: const _LaurelPainter(),
    child: SizedBox(
      width: width,
      height: height,
      child: Center(child: child),
    ),
  );
}

class _LaurelPainter extends CustomPainter {
  const _LaurelPainter();
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..shader = HlLobbyStyle.metal.createShader(Offset.zero & size);
    for (final side in [-1, 1]) {
      final stem = Path();
      Offset point(double t) => Offset(
        (.5 + side * (.11 + .34 * math.sin(t * 2.4))) * size.width,
        (.94 - t * .86) * size.height,
      );
      for (var index = 0; index <= 9; index++) {
        final t = index / 10;
        final p = point(t);
        if (index == 0) {
          stem.moveTo(p.dx, p.dy);
        } else {
          stem.lineTo(p.dx, p.dy);
        }
        final length = size.height * (.16 - .055 * t);
        canvas.save();
        canvas.translate(p.dx, p.dy);
        canvas.rotate(side * (-.8 + t * 1.1));
        final leaf = Path()
          ..moveTo(0, 0)
          ..quadraticBezierTo(
            side * length * .65,
            -length * .22,
            side * length * .37,
            -length,
          )
          ..quadraticBezierTo(-side * length * .2, -length * .47, 0, 0)
          ..close();
        canvas.drawPath(leaf, paint);
        canvas.restore();
      }
      canvas.drawPath(
        stem,
        Paint()
          ..style = PaintingStyle.stroke
          ..strokeWidth = .65
          ..color = HlLobbyStyle.gold,
      );
    }
  }

  @override
  bool shouldRepaint(_LaurelPainter oldDelegate) => false;
}

class HlCategoryBadge extends StatelessWidget {
  const HlCategoryBadge({super.key, required this.category, this.unit = 1});
  final HlCategory category;
  final double unit;
  @override
  Widget build(BuildContext context) {
    final shield = CustomPaint(
      painter: _ShieldPainter(HlLobbyStyle.accent(category)),
      child: SizedBox(
        width: 37 * unit,
        height: 39 * unit,
        child: Center(
          child: Padding(
            padding: EdgeInsets.only(bottom: 3 * unit),
            child: ShaderMask(
              shaderCallback: HlLobbyStyle.metal.createShader,
              child: Icon(
                switch (category) {
                  HlCategory.marketValue => Icons.euro_rounded,
                  HlCategory.goals => Icons.sports_soccer,
                  HlCategory.assists => Icons.fast_forward_rounded,
                  HlCategory.transfer => Icons.swap_horiz_rounded,
                },
                color: Colors.white,
                size: (category == HlCategory.marketValue ? 29 : 26) * unit,
              ),
            ),
          ),
        ),
      ),
    );
    return ExcludeSemantics(
      child: SizedBox(
        width: 49 * unit,
        height: 40 * unit,
        child: category == HlCategory.marketValue
            ? HlLaurels(width: 49 * unit, height: 40 * unit, child: shield)
            : Align(alignment: Alignment.centerLeft, child: shield),
      ),
    );
  }
}

class _ShieldPainter extends CustomPainter {
  const _ShieldPainter(this.color);
  final Color color;
  @override
  void paint(Canvas canvas, Size size) {
    final rect = Offset.zero & size;
    final shield = Path()
      ..moveTo(size.width * .5, 0)
      ..lineTo(size.width * .95, size.height * .13)
      ..lineTo(size.width * .88, size.height * .64)
      ..quadraticBezierTo(
        size.width * .8,
        size.height * .88,
        size.width * .5,
        size.height,
      )
      ..quadraticBezierTo(
        size.width * .2,
        size.height * .88,
        size.width * .12,
        size.height * .64,
      )
      ..lineTo(size.width * .05, size.height * .13)
      ..close();
    canvas.drawShadow(shield, Colors.black, 3, false);
    canvas.drawPath(
      shield,
      Paint()
        ..shader = LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            color.withValues(alpha: .75),
            const Color(0xFF00130F),
            color.withValues(alpha: .2),
          ],
        ).createShader(rect),
    );
    canvas.drawPath(
      shield,
      Paint()
        ..shader = HlLobbyStyle.metal.createShader(rect)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2,
    );
    canvas.save();
    canvas.translate(size.width * .07, size.height * .055);
    canvas.scale(.86, .86);
    canvas.drawPath(
      shield,
      Paint()
        ..color = const Color(0xFFFAF3D2)
        ..style = PaintingStyle.stroke
        ..strokeWidth = .65,
    );
    canvas.restore();
  }

  @override
  bool shouldRepaint(_ShieldPainter oldDelegate) => color != oldDelegate.color;
}

class HlLobbyAction extends StatelessWidget {
  const HlLobbyAction({
    super.key,
    required this.label,
    required this.unit,
    this.resume = false,
    this.busy = false,
  });
  final String label;
  final double unit;
  final bool resume;
  final bool busy;
  @override
  Widget build(BuildContext context) => CustomPaint(
    foregroundPainter: _ActionGlintPainter(resume),
    child: HlBevel(
      gold: resume,
      slant: true,
      child: Container(
        constraints: BoxConstraints(minHeight: 27 * unit),
        padding: EdgeInsets.symmetric(
          horizontal: 18 * unit,
          vertical: 3 * unit,
        ),
        decoration: resume
            ? null
            : const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Color(0xFF008B6E),
                    Color(0xFF004E40),
                    Color(0xFF00231E),
                  ],
                ),
              ),
        child: Row(
          children: [
            Expanded(
              child: Text(
                label.toUpperCase(),
                style: HlLobbyStyle.display(
                  17 * unit,
                  color: resume ? const Color(0xFF10150E) : Colors.white,
                ).copyWith(shadows: resume ? const [] : null),
              ),
            ),
            if (busy)
              SizedBox.square(
                dimension: 14 * unit,
                child: CircularProgressIndicator(
                  strokeWidth: 1.5,
                  color: resume ? const Color(0xFF152017) : Colors.white,
                ),
              )
            else
              Icon(
                Icons.arrow_forward_rounded,
                color: resume ? const Color(0xFF172017) : Colors.white,
                size: 20 * unit,
              ),
          ],
        ),
      ),
    ),
  );
}

class _ActionGlintPainter extends CustomPainter {
  const _ActionGlintPainter(this.gold);
  final bool gold;
  @override
  void paint(Canvas canvas, Size size) {
    final start = math.min(size.height * .27, 12.0) + size.height * .15;
    final end = size.width - math.min(size.height * .27, 12.0) - 2;
    final glow = gold ? const Color(0xFFFFEAB1) : const Color(0xFF8CFFE2);
    final line = Path()
      ..moveTo(start, .8)
      ..lineTo(end, .8);
    canvas.drawPath(
      line,
      Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = 3
        ..color = glow.withValues(alpha: .7)
        ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 2),
    );
    canvas.drawPath(
      line,
      Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = .8
        ..color = glow,
    );
    final glint = Path()
      ..moveTo(end - 6, -2)
      ..lineTo(end - 5, 1)
      ..lineTo(end - 1, 2)
      ..lineTo(end - 5, 3)
      ..lineTo(end - 6, 6)
      ..lineTo(end - 7, 3)
      ..lineTo(end - 10, 2)
      ..lineTo(end - 7, 1)
      ..close();
    canvas.drawPath(glint, Paint()..color = const Color(0xFFFFFFD7));
  }

  @override
  bool shouldRepaint(_ActionGlintPainter oldDelegate) =>
      gold != oldDelegate.gold;
}

class HlLobbyDock extends StatelessWidget {
  const HlLobbyDock({
    super.key,
    required this.onHome,
    required this.onGames,
    required this.onMode,
    required this.onRecords,
    required this.onAccount,
    required this.unit,
  });
  final VoidCallback onHome, onGames, onMode, onRecords, onAccount;
  final double unit;
  @override
  Widget build(BuildContext context) => CustomPaint(
    painter: const _DockPainter(),
    child: SafeArea(
      top: false,
      child: Padding(
        padding: EdgeInsets.only(top: 5 * unit),
        child: SizedBox(
          height: math.max(54 * unit, 54),
          child: Row(
            children: [
              _item('Home', Icons.home_filled, onHome, active: true),
              _item('Game catalogue', Icons.menu_rounded, onGames),
              Expanded(
                child: Tooltip(
                  message: 'Higher or Lower categories',
                  child: Semantics(
                    button: true,
                    label: 'Higher or Lower categories',
                    child: InkResponse(
                      onTap: onMode,
                      child: SizedBox.expand(
                        child: Center(
                          child: HlLaurels(
                            width: 54 * unit,
                            height: 39 * unit,
                            child: CustomPaint(
                              painter: const _FootballPainter(),
                              size: Size.square(34 * unit),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
              _item(
                'Your personal records',
                Icons.emoji_events_rounded,
                onRecords,
              ),
              _item(
                'Your FootyGen account',
                Icons.accessibility_new_rounded,
                onAccount,
              ),
            ],
          ),
        ),
      ),
    ),
  );
  Widget _item(
    String label,
    IconData icon,
    VoidCallback action, {
    bool active = false,
  }) => Expanded(
    child: Tooltip(
      message: label,
      child: Semantics(
        button: true,
        label: label,
        child: InkResponse(
          onTap: action,
          child: SizedBox.expand(
            child: Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  ShaderMask(
                    shaderCallback: (bounds) =>
                        (active
                                ? HlLobbyStyle.metal
                                : const LinearGradient(
                                    begin: Alignment.topCenter,
                                    end: Alignment.bottomCenter,
                                    colors: [
                                      Colors.white,
                                      Color(0xFF929EA1),
                                      Color(0xFFFFDE98),
                                    ],
                                  ))
                            .createShader(bounds),
                    child: Icon(icon, color: Colors.white, size: 25 * unit),
                  ),
                  if (active)
                    Container(
                      margin: EdgeInsets.only(top: 4 * unit),
                      width: 47 * unit,
                      height: 1,
                      decoration: const BoxDecoration(
                        color: Color(0xFF3BF99E),
                        boxShadow: [
                          BoxShadow(
                            color: Color(0xFF00FF83),
                            blurRadius: 8,
                            spreadRadius: 2,
                          ),
                        ],
                      ),
                    ),
                ],
              ),
            ),
          ),
        ),
      ),
    ),
  );
}

class _FootballPainter extends CustomPainter {
  const _FootballPainter();
  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width * .48;
    final circle = Path()
      ..addOval(Rect.fromCircle(center: center, radius: radius));
    canvas.drawShadow(circle, Colors.black, 3, false);
    canvas.drawCircle(
      center,
      radius,
      Paint()
        ..shader = const RadialGradient(
          center: Alignment(-.5, -.65),
          colors: [Colors.white, Color(0xFFE6E9E1), Color(0xFF71817B)],
          stops: [0, .55, 1],
        ).createShader(Offset.zero & size),
    );
    canvas.save();
    canvas.clipPath(circle);
    Path pentagon(Offset origin, double r, double rotation) {
      final path = Path();
      for (var index = 0; index < 5; index++) {
        final angle = rotation + index * math.pi * 2 / 5;
        final point = origin + Offset(math.cos(angle), math.sin(angle)) * r;
        if (index == 0) {
          path.moveTo(point.dx, point.dy);
        } else {
          path.lineTo(point.dx, point.dy);
        }
      }
      return path..close();
    }

    final fill = Paint()..color = const Color(0xFF071E23);
    canvas.drawPath(pentagon(center, radius * .42, -math.pi / 2), fill);
    for (var index = 0; index < 5; index++) {
      final angle = -math.pi / 2 + index * math.pi * 2 / 5;
      final location =
          center + Offset(math.cos(angle), math.sin(angle)) * radius * 1.02;
      canvas.drawLine(
        center + Offset(math.cos(angle), math.sin(angle)) * radius * .4,
        location,
        Paint()
          ..color = const Color(0xFFBBA569)
          ..strokeWidth = .6,
      );
      canvas.drawPath(pentagon(location, radius * .4, angle + math.pi), fill);
    }
    canvas.restore();
    canvas.drawCircle(
      center,
      radius,
      Paint()
        ..color = const Color(0xFFF1DA9D)
        ..style = PaintingStyle.stroke
        ..strokeWidth = .7,
    );
  }

  @override
  bool shouldRepaint(_FootballPainter oldDelegate) => false;
}

class _DockPainter extends CustomPainter {
  const _DockPainter();
  @override
  void paint(Canvas canvas, Size size) {
    final width = size.width;
    final top = Path()
      ..moveTo(0, 16)
      ..quadraticBezierTo(16, 1, 35, 1)
      ..lineTo(width * .385, 1)
      ..lineTo(width * .4, -4)
      ..lineTo(width * .6, -4)
      ..lineTo(width * .615, 1)
      ..lineTo(width - 35, 1)
      ..quadraticBezierTo(width - 16, 1, width, 16);
    final panel = Path.from(top)
      ..lineTo(width, size.height)
      ..lineTo(0, size.height)
      ..close();
    canvas.drawShadow(panel, Colors.black, 10, false);
    canvas.drawPath(
      panel,
      Paint()
        ..shader = const LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [Color(0xFF002A28), Color(0xFF000D10), Color(0xFF001313)],
        ).createShader(Offset.zero & size),
    );
    canvas.drawPath(
      top,
      Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1
        ..shader = const LinearGradient(
          colors: [
            Color(0xFFE6B148),
            Color(0xFF416D6F),
            Color(0xFF9BC4CA),
            Color(0xFF416D6F),
            Color(0xFFE6B148),
          ],
        ).createShader(Rect.fromLTWH(0, 0, width, 18)),
    );
    for (final right in [false, true]) {
      canvas.save();
      if (right) {
        canvas.translate(width, 0);
        canvas.scale(-1, 1);
      }
      final corner = Path()
        ..moveTo(0, 9)
        ..lineTo(0, -5)
        ..quadraticBezierTo(24, -4, 60, 1)
        ..quadraticBezierTo(22, -1, 0, 9)
        ..close();
      canvas.drawPath(
        corner,
        Paint()
          ..shader = HlLobbyStyle.metal.createShader(
            const Rect.fromLTWH(0, -5, 60, 15),
          ),
      );
      canvas.restore();
    }
  }

  @override
  bool shouldRepaint(_DockPainter oldDelegate) => false;
}

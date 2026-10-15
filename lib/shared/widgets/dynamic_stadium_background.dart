import 'package:flutter/material.dart';
import 'package:football_genius/core/constants/asset_paths.dart';

/// A rich, living Champions League / Midnight Navy stadium background featuring:
/// 1. Deep midnight navy & sapphire multi-stop vertical gradients.
/// 2. High-resolution stadium bowl photographic textures.
/// 3. Dynamic stadium floodlight glow nodes that gently breathe over time.
/// 4. Subtle angled light beam cones simulating matchday arena floodlights.
class DynamicStadiumBackground extends StatefulWidget {
  final Widget? child;
  final double stadiumOpacity;
  final bool animate;

  const DynamicStadiumBackground({
    super.key,
    this.child,
    this.stadiumOpacity = 0.22,
    this.animate = true,
  });

  @override
  State<DynamicStadiumBackground> createState() =>
      _DynamicStadiumBackgroundState();
}

class _DynamicStadiumBackgroundState extends State<DynamicStadiumBackground>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 7000),
    );

    _pulseAnimation = CurvedAnimation(
      parent: _controller,
      curve: Curves.easeInOutCubic,
    );

    if (widget.animate) {
      _controller.repeat(reverse: true);
    }
  }

  @override
  void didUpdateWidget(covariant DynamicStadiumBackground oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.animate != oldWidget.animate) {
      if (widget.animate) {
        _controller.repeat(reverse: true);
      } else {
        _controller.stop();
      }
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      fit: StackFit.expand,
      children: [
        // 1. Base Multi-stop Deep Midnight Navy & Sapphire Arena Gradient
        Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
                Color(0xFF030712), // Deep starry night arena sky
                Color(0xFF071126), // Midnight blue stadium atmosphere
                Color(0xFF0C1D3D), // Sapphire arena mid-tone
                Color(0xFF08142B), // Deep navy concourse tone
                Color(0xFF02040A), // Ultra-deep midnight lower vignette
              ],
              stops: [0.0, 0.22, 0.52, 0.78, 1.0],
            ),
          ),
        ),

        // 2. High-Res Stadium Backdrop Photo
        Opacity(
          opacity: widget.stadiumOpacity,
          child: Image.asset(
            AssetPaths.stadiumBg,
            fit: BoxFit.cover,
            alignment: const Alignment(0, -0.2),
            errorBuilder: (_, _, _) => const SizedBox.shrink(),
          ),
        ),

        // 3. Living Dynamic Stadium Lighting (Sapphire & Cyan Floodlights)
        AnimatedBuilder(
          animation: _pulseAnimation,
          builder: (context, _) {
            final t = _pulseAnimation.value;

            return Stack(
              fit: StackFit.expand,
              children: [
                // Top-Center Stadium Floodlight Halo (Ice Cyan & Sapphire)
                Container(
                  decoration: BoxDecoration(
                    gradient: RadialGradient(
                      center: Alignment(0.0, -0.85 + (0.05 * t)),
                      radius: 1.35 + (0.15 * t),
                      colors: [
                        Color(0xFF00E5FF).withAlpha((45 + (18 * t)).round()),
                        Color(0xFF1D4ED8).withAlpha((32 + (14 * t)).round()),
                        const Color(0xFF0A1836).withAlpha(140),
                        Colors.transparent,
                      ],
                      stops: const [0.0, 0.28, 0.65, 1.0],
                    ),
                  ),
                ),

                // Top-Left Cyan Floodlight Flare
                Container(
                  decoration: BoxDecoration(
                    gradient: RadialGradient(
                      center: const Alignment(-0.85, -0.7),
                      radius: 0.95 + (0.1 * t),
                      colors: [
                        Color(0xFF38BDF8).withAlpha((32 + (16 * (1 - t))).round()),
                        Colors.transparent,
                      ],
                      stops: const [0.0, 1.0],
                    ),
                  ),
                ),

                // Top-Right Sapphire / Golden Arena Flare
                Container(
                  decoration: BoxDecoration(
                    gradient: RadialGradient(
                      center: const Alignment(0.85, -0.7),
                      radius: 0.95 + (0.1 * (1 - t)),
                      colors: [
                        Color(0xFFFFC72C).withAlpha((24 + (12 * t)).round()),
                        Colors.transparent,
                      ],
                      stops: const [0.0, 1.0],
                    ),
                  ),
                ),

                // Mid-Screen Radial Sapphire Haze
                Container(
                  decoration: BoxDecoration(
                    gradient: RadialGradient(
                      center: Alignment(0.0, 0.25 + (0.05 * t)),
                      radius: 1.25,
                      colors: [
                        Color(0xFF142B59).withAlpha((60 + (22 * t)).round()),
                        Color(0xFF08152E).withAlpha(150),
                        Colors.transparent,
                      ],
                      stops: const [0.0, 0.55, 1.0],
                    ),
                  ),
                ),

                // Angled Stadium Light Beams Custom Painter
                CustomPaint(
                  painter: _StadiumBeamsPainter(
                    pulseProgress: t,
                  ),
                ),
              ],
            );
          },
        ),

        // 4. Perimeter Contrast Vignette for Content Legibility
        Container(
          decoration: BoxDecoration(
            gradient: RadialGradient(
              center: const Alignment(0.0, 0.0),
              radius: 1.35,
              colors: [
                Colors.transparent,
                const Color(0xFF02040A).withAlpha(90),
                const Color(0xFF02040A).withAlpha(210),
              ],
              stops: const [0.55, 0.85, 1.0],
            ),
          ),
        ),

        // Optional Child Widget
        if (widget.child != null) widget.child!,
      ],
    );
  }
}

/// Custom painter rendering soft matchday floodlight beam cones descending from the corners.
class _StadiumBeamsPainter extends CustomPainter {
  final double pulseProgress;

  const _StadiumBeamsPainter({required this.pulseProgress});

  @override
  void paint(Canvas canvas, Size size) {
    if (size.width <= 0 || size.height <= 0) return;

    final paint = Paint()
      ..style = PaintingStyle.fill
      ..isAntiAlias = true;

    final double alphaMultiplier = 0.85 + (0.3 * pulseProgress);

    // Left Floodlight Beam Cone (Cyan to Electric Blue)
    final leftPath = Path()
      ..moveTo(0, 0)
      ..lineTo(size.width * 0.45, size.height * 0.7)
      ..lineTo(size.width * 0.15, size.height * 0.85)
      ..close();

    paint.shader = LinearGradient(
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
      colors: [
        Color(0xFF00E5FF).withAlpha((34 * alphaMultiplier).round().clamp(0, 255)),
        Color(0xFF3B82F6).withAlpha((20 * alphaMultiplier).round().clamp(0, 255)),
        Colors.transparent,
      ],
      stops: const [0.0, 0.45, 1.0],
    ).createShader(Rect.fromLTWH(0, 0, size.width * 0.5, size.height * 0.85));

    canvas.drawPath(leftPath, paint);

    // Right Floodlight Beam Cone (Ice Blue to Golden Arena Highlight)
    final rightPath = Path()
      ..moveTo(size.width, 0)
      ..lineTo(size.width * 0.85, size.height * 0.85)
      ..lineTo(size.width * 0.55, size.height * 0.7)
      ..close();

    paint.shader = LinearGradient(
      begin: Alignment.topRight,
      end: Alignment.bottomLeft,
      colors: [
        Color(0xFF60A5FA).withAlpha((28 * alphaMultiplier).round().clamp(0, 255)),
        Color(0xFFFFC72C).withAlpha((18 * alphaMultiplier).round().clamp(0, 255)),
        Colors.transparent,
      ],
      stops: const [0.0, 0.45, 1.0],
    ).createShader(
      Rect.fromLTWH(size.width * 0.5, 0, size.width * 0.5, size.height * 0.85),
    );

    canvas.drawPath(rightPath, paint);
  }

  @override
  bool shouldRepaint(covariant _StadiumBeamsPainter oldDelegate) {
    return (oldDelegate.pulseProgress - pulseProgress).abs() > 0.01;
  }
}

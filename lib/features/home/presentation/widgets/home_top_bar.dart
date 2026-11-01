import 'package:flutter/material.dart';

import '../home_style.dart';

class HomeTopBar extends StatelessWidget {
  const HomeTopBar({super.key});
  @override
  Widget build(BuildContext context) {
    final u = HomeStyle.unit(context);
    final logoWidth = 154.0 * u;
    final logoHeight = 58.0 * u * (logoWidth / 220.0);
    return SizedBox(
      height: 64 * u,
      child: Padding(
        padding: EdgeInsets.symmetric(horizontal: HomeStyle.margin * u),
        child: Row(
          children: [
            Expanded(
              child: Align(
                alignment: Alignment.centerLeft,
                child: ColorFiltered(
                  colorFilter: const ColorFilter.mode(
                    HomeStyle.background,
                    BlendMode.multiply,
                  ),
                  child: SizedBox(
                    width: logoWidth,
                    height: logoHeight,
                    child: ClipPath(
                      clipper: _WordmarkClipper(),
                      child: OverflowBox(
                        alignment: Alignment.centerRight,
                        maxWidth: double.infinity,
                        maxHeight: double.infinity,
                        child: Image.asset(
                          HomeArt.logo,
                          width: logoWidth / .66,
                          fit: BoxFit.contain,
                          filterQuality: FilterQuality.high,
                          semanticLabel: 'FootyGen',
                          errorBuilder: (_, _, _) => Text(
                            'FootyGen',
                            style: HomeStyle.text(
                              20 * u,
                              weight: FontWeight.w900,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
            Semantics(
              label: 'Notifications, unread notification',
              child: SizedBox(
                width: 48 * u,
                height: 48 * u,
                child: Center(
                  child: Container(
                    width: 39 * u,
                    height: 39 * u,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: .7),
                      shape: BoxShape.circle,
                      border: Border.all(color: const Color(0xFFE7E7E5)),
                      boxShadow: const [
                        BoxShadow(
                          color: Color(0x08000000),
                          blurRadius: 9,
                          offset: Offset(0, 3),
                        ),
                      ],
                    ),
                    child: Stack(
                      alignment: Alignment.center,
                      children: [
                        Icon(
                          Icons.notifications_rounded,
                          size: 23 * u,
                          color: HomeStyle.teal,
                        ),
                        Positioned(
                          right: 6 * u,
                          top: 6 * u,
                          child: Container(
                            width: 8 * u,
                            height: 8 * u,
                            decoration: BoxDecoration(
                              color: const Color(0xFFFF4A4F),
                              shape: BoxShape.circle,
                              border: Border.all(color: Colors.white, width: 1),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
            SizedBox(width: 6 * u),
            Semantics(
              label: 'Profile portrait',
              child: SizedBox(
                width: 49 * u,
                height: 49 * u,
                child: Stack(
                  clipBehavior: Clip.none,
                  children: [
                    Container(
                      padding: EdgeInsets.all(2 * u),
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.white,
                        border: Border.all(
                          color: const Color(0xFFF1BF56),
                          width: 1.3 * u,
                        ),
                      ),
                      child: ClipOval(
                        child: const HomeArtwork(HomeArt.portrait),
                      ),
                    ),
                    Positioned(
                      right: -1,
                      bottom: 0,
                      child: Container(
                        width: 19 * u,
                        height: 19 * u,
                        decoration: BoxDecoration(
                          color: HomeStyle.navy,
                          shape: BoxShape.circle,
                          border: Border.all(color: HomeStyle.gold, width: 1),
                        ),
                        child: CustomPaint(painter: _CrownPainter()),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Show only the lettering from the approved lockup, without repainting it.
class _WordmarkClipper extends CustomClipper<Path> {
  @override
  Path getClip(Size size) => Path()
    ..moveTo(size.width * .05, 0)
    ..lineTo(size.width, 0)
    ..lineTo(size.width, size.height)
    ..lineTo(0, size.height)
    ..lineTo(0, size.height * .85)
    ..close();

  @override
  bool shouldReclip(_WordmarkClipper oldClipper) => false;
}

class _CrownPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final p = Path()
      ..moveTo(size.width * .22, size.height * .7)
      ..lineTo(size.width * .15, size.height * .3)
      ..lineTo(size.width * .36, size.height * .46)
      ..lineTo(size.width * .5, size.height * .22)
      ..lineTo(size.width * .64, size.height * .46)
      ..lineTo(size.width * .85, size.height * .3)
      ..lineTo(size.width * .78, size.height * .7)
      ..close();
    canvas.drawPath(p, Paint()..color = const Color(0xFFFFD45B));
  }

  @override
  bool shouldRepaint(_CrownPainter oldDelegate) => false;
}

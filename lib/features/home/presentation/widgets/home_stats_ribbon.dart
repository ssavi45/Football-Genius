import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../home_style.dart';

class HomeStatsRibbon extends StatelessWidget {
  const HomeStatsRibbon({super.key});
  @override
  Widget build(BuildContext context) {
    final u = HomeStyle.unit(context);
    final large = HomeStyle.largeText(context);
    final sections = [
      _metric(
        context,
        Icon(
          Icons.local_fire_department_rounded,
          color: const Color(0xFFFF8A00),
          size: 30 * u,
        ),
        Text('7 Day', style: HomeStyle.text(14 * u, weight: FontWeight.w800)),
        Text('Streak', style: HomeStyle.text(12 * u, color: HomeStyle.muted)),
      ),
      _metric(
        context,
        CustomPaint(
          painter: _HexagonPainter(),
          child: SizedBox(
            width: 29 * u,
            height: 32 * u,
            child: Center(
              child: Text(
                '12',
                style: HomeStyle.text(13 * u, weight: FontWeight.w800),
              ),
            ),
          ),
        ),
        Text.rich(
          TextSpan(
            children: [
              const TextSpan(
                text: 'Level ',
                style: TextStyle(
                  color: Color(0xFF626B77),
                  fontWeight: FontWeight.w500,
                ),
              ),
              const TextSpan(text: '12'),
            ],
          ),
          style: HomeStyle.text(13.5 * u, weight: FontWeight.w800),
        ),
        Padding(
          padding: EdgeInsets.only(top: 4 * u),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: LinearProgressIndicator(
              value: .55,
              minHeight: 5 * u,
              color: HomeStyle.green,
              backgroundColor: const Color(0xFFE3E8E8),
            ),
          ),
        ),
      ),
      _metric(
        context,
        Container(
          width: 28 * u,
          height: 28 * u,
          decoration: const BoxDecoration(
            shape: BoxShape.circle,
            gradient: LinearGradient(
              colors: [Color(0xFFE6BB3E), Color(0xFFBA7E0D)],
            ),
          ),
          child: Icon(
            Icons.star_rounded,
            size: 22 * u,
            color: const Color(0xFFFFE780),
          ),
        ),
        Text.rich(
          const TextSpan(
            children: [
              TextSpan(text: '1,240 '),
              TextSpan(
                text: 'XP',
                style: TextStyle(color: Color(0xFFD59A20)),
              ),
            ],
          ),
          style: HomeStyle.text(13 * u, weight: FontWeight.w800),
        ),
        Text(
          'to Level 13',
          style: HomeStyle.text(11.5 * u, color: HomeStyle.muted),
        ),
      ),
    ];
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: HomeStyle.margin * u),
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 12 * u, vertical: 9 * u),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: .8),
          borderRadius: BorderRadius.circular(15 * u),
          border: Border.all(color: const Color(0xFFF0EFEC)),
          boxShadow: HomeStyle.shadow,
        ),
        child: large
            ? Column(
                children: [
                  for (var i = 0; i < sections.length; i++)
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 7),
                      child: sections[i],
                    ),
                ],
              )
            : Row(
                children: [
                  for (var i = 0; i < sections.length; i++) ...[
                    if (i > 0)
                      Container(
                        width: 1,
                        height: 30 * u,
                        margin: EdgeInsets.symmetric(horizontal: 10 * u),
                        color: const Color(0xFFD8DCDF),
                      ),
                    Expanded(child: sections[i]),
                  ],
                ],
              ),
      ),
    );
  }

  Widget _metric(BuildContext context, Widget icon, Widget title, Widget sub) {
    final u = HomeStyle.unit(context);
    return Row(
      children: [
        icon,
        SizedBox(width: 8 * u),
        Expanded(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              title,
              SizedBox(height: 2 * u),
              sub,
            ],
          ),
        ),
      ],
    );
  }
}

class _HexagonPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final path = Path();
    for (var i = 0; i < 6; i++) {
      final a = math.pi / 3 * i - math.pi / 2;
      final x = size.width / 2 + (size.width / 2 - 1) * math.cos(a);
      final y = size.height / 2 + (size.height / 2 - 1) * math.sin(a);
      if (i == 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    }
    path.close();
    canvas.drawPath(
      path,
      Paint()
        ..color = HomeStyle.green
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2,
    );
  }

  @override
  bool shouldRepaint(_HexagonPainter oldDelegate) => false;
}

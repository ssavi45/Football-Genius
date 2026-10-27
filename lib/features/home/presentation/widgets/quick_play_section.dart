import 'package:flutter/material.dart';

import '../home_style.dart';

class QuickPlaySection extends StatelessWidget {
  const QuickPlaySection({
    super.key,
    this.onSeeAll,
    this.onSelectMode,
    this.extraHeight = 0,
  });
  final double extraHeight;
  final VoidCallback? onSeeAll;
  final ValueChanged<String>? onSelectMode;
  @override
  Widget build(BuildContext context) {
    final u = HomeStyle.unit(context);
    final large = HomeStyle.largeText(context);
    final cards = [
      _QuickPlayCard(
        extraHeight: extraHeight,
        title: 'Higher or Lower',
        artPath: HomeArt.higherLower,
        onTap: () => onSelectMode?.call('higher_lower'),
        arrowColor: const Color(0xFFD0E7D7),
      ),
      _QuickPlayCard(
        extraHeight: extraHeight,
        title: 'Pixel Pitch',
        artPath: HomeArt.pixelPitch,
        onTap: () => onSelectMode?.call('pixel_pitch'),
        arrowColor: const Color(0xFFD2D9FA),
      ),
      _QuickPlayCard(
        extraHeight: extraHeight,
        title: 'Bootroom Scramble',
        artPath: HomeArt.bootroom,
        onTap: () => onSelectMode?.call('unscramble'),
        arrowColor: const Color(0xFFF1CEB6),
      ),
    ];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(
              'Quick Play',
              style: HomeStyle.text(
                21 * u,
                weight: FontWeight.w800,
                spacing: -.5,
              ),
            ),
            const Spacer(),
            TextButton(
              onPressed: onSeeAll,
              style: TextButton.styleFrom(
                minimumSize: const Size(48, 48),
                padding: EdgeInsets.zero,
                foregroundColor: const Color(0xFF717A88),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    'See all',
                    style: HomeStyle.text(
                      12 * u,
                      color: const Color(0xFF777F8C),
                      weight: FontWeight.w600,
                    ),
                  ),
                  Icon(Icons.chevron_right_rounded, size: 21 * u),
                ],
              ),
            ),
          ],
        ),
        LayoutBuilder(
          builder: (context, constraints) {
            final cardWidth =
                (constraints.maxWidth - (large ? 8 : 16) * u) / (large ? 2 : 3);
            return Wrap(
              spacing: 8 * u,
              runSpacing: 8 * u,
              children: [
                for (final card in cards)
                  SizedBox(width: cardWidth, child: card),
              ],
            );
          },
        ),
      ],
    );
  }
}

class _QuickPlayCard extends StatelessWidget {
  const _QuickPlayCard({
    required this.extraHeight,
    required this.title,
    required this.artPath,
    required this.onTap,
    required this.arrowColor,
  });
  final double extraHeight;
  final String title, artPath;
  final VoidCallback onTap;
  final Color arrowColor;
  @override
  Widget build(BuildContext context) {
    final u = HomeStyle.unit(context);
    final large = HomeStyle.largeText(context);
    return LayoutBuilder(
      builder: (context, constraints) => Semantics(
        button: true,
        label: title,
        child: Material(
          color: HomeStyle.navy,
          borderRadius: BorderRadius.circular(12 * u),
          clipBehavior: Clip.antiAlias,
          child: InkWell(
            onTap: onTap,
            child: SizedBox(
              height: large
                  ? constraints.maxWidth + 40
                  : constraints.maxWidth + extraHeight,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  HomeArtwork(artPath),
                  const DecoratedBox(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.transparent,
                          Color(0x10000000),
                          Color(0xB0000000),
                        ],
                        stops: [0, .5, 1],
                      ),
                    ),
                  ),
                  Positioned(
                    left: 9 * u,
                    right: 6 * u,
                    bottom: 8 * u,
                    child: Padding(
                      padding: EdgeInsets.only(bottom: 13 * u),
                      child: Text(
                        title == 'Higher or Lower' ? 'Higher or\nLower' : title,
                        semanticsLabel: title,
                        maxLines: large ? null : 2,
                        style: HomeStyle.text(
                          10.8 * u,
                          color: Colors.white,
                          weight: FontWeight.w700,
                          height: 1.1,
                        ),
                      ),
                    ),
                  ),
                  Positioned(
                    right: 7 * u,
                    bottom: 7 * u,
                    child: Container(
                      width: 22 * u,
                      height: 22 * u,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: arrowColor.withValues(alpha: .86),
                      ),
                      child: Icon(
                        Icons.chevron_right_rounded,
                        size: 23 * u,
                        color: const Color(0xFF112D32),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

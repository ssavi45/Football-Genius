import 'dart:math' as math;
import 'package:flutter/material.dart';

import '../home_style.dart';

class ScoutsDuelBanner extends StatelessWidget {
  const ScoutsDuelBanner({super.key, this.onPlayNow, this.extraHeight = 0});
  final double extraHeight;
  final VoidCallback? onPlayNow;
  @override
  Widget build(BuildContext context) {
    final u = HomeStyle.unit(context);
    final large = HomeStyle.largeText(context);
    return LayoutBuilder(
      builder: (context, constraints) {
        if (constraints.maxWidth <= 0) return const SizedBox.shrink();
        final bannerWidth = math.max(0.0, constraints.maxWidth);
        return Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(15 * u),
          boxShadow: HomeStyle.shadow,
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(15 * u),
          child: Stack(
            children: [
              const Positioned.fill(child: HomeArtwork(HomeArt.scoutsDuel)),
              if (large)
                const Positioned.fill(
                  child: ColoredBox(color: Color(0x85031D25)),
                ),
              ConstrainedBox(
                constraints: BoxConstraints(
                  minHeight:
                      (bannerWidth / 3.6).clamp(
                        112 * u,
                        double.infinity,
                      ) +
                      extraHeight,
                ),
                child: Padding(
                  padding: EdgeInsets.fromLTRB(37 * u, 11 * u, 12 * u, 7 * u),
                  child: Align(
                    alignment: Alignment.centerLeft,
                    heightFactor: 1,
                    child: SizedBox(
                      width: math.max(0.0, bannerWidth * (large ? .9 : .57)),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text.rich(
                            const TextSpan(
                              children: [
                                TextSpan(text: "Scout’s "),
                                TextSpan(
                                  text: 'Duel',
                                  style: TextStyle(color: Color(0xFFFFD43A)),
                                ),
                              ],
                            ),
                            style: HomeStyle.text(
                              22 * u,
                              color: Colors.white,
                              weight: FontWeight.w800,
                              spacing: -.5,
                            ),
                          ),
                          SizedBox(height: 2 * u),
                          Row(
                            children: [
                              Icon(
                                Icons.people_alt_rounded,
                                size: 18 * u,
                                color: const Color(0xFFCBD4D5),
                              ),
                              SizedBox(width: 6 * u),
                              Expanded(
                                child: Text(
                                  'Play AI or a friend',
                                  style: HomeStyle.text(
                                    12 * u,
                                    color: const Color(0xFFC8CECF),
                                  ),
                                ),
                              ),
                            ],
                          ),
                          SizedBox(height: 2 * u),
                          HomeGoldButton(label: 'Play Now', onTap: onPlayNow),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      );
    },
  );
}
}

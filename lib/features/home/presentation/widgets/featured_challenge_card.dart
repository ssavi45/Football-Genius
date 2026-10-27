import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/asset_paths.dart';
import '../../../games/common/presentation/controllers/games_controller.dart';
import '../home_style.dart';

class FeaturedChallengeCard extends ConsumerWidget {
  const FeaturedChallengeCard({
    super.key,
    this.onContinue,
    this.extraHeight = 0,
  });
  final double extraHeight;
  final VoidCallback? onContinue;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final game = ref.watch(lastPlayedGameProvider);
    final scoreline = game.id == 'scoreline';
    final u = HomeStyle.unit(context);
    final large = HomeStyle.largeText(context);
    return LayoutBuilder(
      builder: (context, constraints) {
        final width = constraints.maxWidth;
        final topPadding = 28 * u + extraHeight * .2;
        final title = scoreline
            ? Image.asset(
                AssetPaths.scorelineHeroLogo,
                width: 184 * u,
                height: 64 * u,
                fit: BoxFit.contain,
                alignment: Alignment.centerLeft,
                semanticLabel: 'Scoreline Hero',
              )
            : Text(
                game.title,
                style: HomeStyle.text(
                  30 * u,
                  color: Colors.white,
                  weight: FontWeight.w900,
                  height: 1.03,
                  spacing: -.8,
                ),
              );
        final info = Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  Icons.history_rounded,
                  size: 16 * u,
                  color: const Color(0xFFA3E5AC),
                ),
                SizedBox(width: 6 * u),
                Text(
                  'LAST PLAYED',
                  style: HomeStyle.text(
                    9 * u,
                    color: const Color(0xFFA3E5AC),
                    weight: FontWeight.w600,
                    spacing: 1.8,
                  ),
                ),
              ],
            ),
            SizedBox(height: 12 * u),
            title,
            SizedBox(height: 12 * u),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(
                  Icons.sports_soccer_outlined,
                  size: 15 * u,
                  color: const Color(0xFFFFD854),
                ),
                SizedBox(width: 5 * u),
                Expanded(
                  child: Text(
                    game.subtitle,
                    maxLines: large ? null : 1,
                    overflow: large
                        ? TextOverflow.visible
                        : TextOverflow.ellipsis,
                    style: HomeStyle.text(
                      12 * u,
                      color: Colors.white,
                      weight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
          ],
        );
        return Container(
          key: const ValueKey('home-featured-card'),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16 * u),
            boxShadow: HomeStyle.shadow,
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(16 * u),
            child: Stack(
              children: [
                Positioned.fill(
                  child: HomeArtwork(
                    scoreline ? HomeArt.scoreline : game.cardArtPath,
                  ),
                ),
                if (!scoreline || large)
                  const Positioned.fill(
                    child: DecoratedBox(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            Color(0xF5041C2A),
                            Color(0xAF041C2A),
                            Color(0x25041C2A),
                          ],
                          stops: [0, .55, 1],
                        ),
                      ),
                    ),
                  ),
                if (large)
                  Padding(
                    padding: EdgeInsets.all(16 * u),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        SizedBox(width: double.infinity, child: info),
                        const SizedBox(height: 12),
                        if (scoreline) const _MatchStrip(),
                        const SizedBox(height: 8),
                        HomeGoldButton(
                          label: 'CONTINUE',
                          onTap: onContinue,
                          icon: Icons.sports_soccer_outlined,
                          width: width - 32 * u,
                          emphasized: true,
                        ),
                      ],
                    ),
                  )
                else
                  ConstrainedBox(
                    constraints: BoxConstraints(
                      minWidth: width,
                      minHeight: width / 1.70 + extraHeight,
                    ),
                    child: Stack(
                      children: [
                        Padding(
                          padding: EdgeInsets.fromLTRB(
                            16 * u,
                            topPadding,
                            0,
                            8 * u,
                          ),
                          child: ConstrainedBox(
                            constraints: BoxConstraints(
                              minHeight:
                                  width / 1.70 +
                                  extraHeight -
                                  topPadding -
                                  8 * u,
                            ),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              mainAxisSize: MainAxisSize.min,
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                SizedBox(width: width * .55, child: info),
                                SizedBox(height: 5 * u),
                                HomeGoldButton(
                                  label: 'CONTINUE',
                                  onTap: onContinue,
                                  icon: Icons.sports_soccer_outlined,
                                  width: width * .56,
                                  emphasized: true,
                                ),
                              ],
                            ),
                          ),
                        ),
                        if (scoreline)
                          Positioned(
                            right: 2 * u,
                            bottom: 9 * u,
                            child: Transform.rotate(
                              angle: -.14,
                              child: const IgnorePointer(child: _MatchStrip()),
                            ),
                          ),
                      ],
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

class _MatchStrip extends StatelessWidget {
  const _MatchStrip();
  @override
  Widget build(BuildContext context) {
    final u = HomeStyle.unit(context);
    return Semantics(
      label: 'Real Madrid 2, Barcelona 1. Decorative match preview.',
      child: SizedBox(
        width: 150 * u,
        height: 150 * u * 320 / 720,
        child: Stack(
          fit: StackFit.expand,
          children: [
            const HomeArtwork(HomeArt.scorecard, fit: BoxFit.contain),
            Padding(
              padding: EdgeInsets.fromLTRB(25 * u, 20 * u, 25 * u, 17 * u),
              child: Row(
                children: [
                  _crest(AssetPaths.clubRealMadrid, u),
                  Expanded(
                    child: Text(
                      '2 - 1',
                      textAlign: TextAlign.center,
                      style: HomeStyle.text(
                        22 * u,
                        color: Colors.white,
                        weight: FontWeight.w800,
                        spacing: .3,
                      ),
                    ),
                  ),
                  _crest('assets/images/clubs/fcb.png', u),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _crest(String path, double u) => Image.asset(
    path,
    width: 24 * u,
    height: 29 * u,
    fit: BoxFit.contain,
    excludeFromSemantics: true,
    errorBuilder: (_, _, _) => SizedBox(
      width: 24 * u,
      height: 29 * u,
      child: Icon(Icons.shield_outlined, color: Colors.white70, size: 24 * u),
    ),
  );
}

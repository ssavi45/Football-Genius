import 'package:flutter/material.dart';

import '../../../../../shared/models/game_metadata.dart';
import '../../../../home/presentation/home_style.dart';

/// One visual language for both catalogue layouts and Home's game artwork.
abstract final class GameModeArt {
  static String path(GameMetadata game) => switch (game.id) {
    'scoreline' => HomeArt.scoreline,
    'scouts_duel' => HomeArt.scoutsDuel,
    'higher_lower' => HomeArt.higherLower,
    'pixel_pitch' => HomeArt.pixelPitch,
    'scramble' => HomeArt.bootroom,
    'matrix' => 'assets/images/game-modes/matrix.webp',
    'journeyman' => 'assets/images/game-modes/journeyman.webp',
    'quotes' => 'assets/images/game-modes/tunnel-talk.webp',
    _ => game.cardArtPath,
  };
}

class GameModeTile extends StatelessWidget {
  const GameModeTile({
    super.key,
    required this.game,
    required this.onPlay,
    required this.compact,
  });
  final GameMetadata game;
  final VoidCallback onPlay;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final u = HomeStyle.unit(context);
    final large = HomeStyle.largeText(context);
    return Semantics(
      button: true,
      label: 'Play ${game.title}',
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18 * u),
          boxShadow: HomeStyle.shadow,
          border: Border.all(color: const Color(0xFFECEAE2)),
        ),
        child: Material(
          color: Colors.transparent,
          borderRadius: BorderRadius.circular(18 * u),
          clipBehavior: Clip.antiAlias,
          child: InkWell(
            onTap: onPlay,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                if (compact)
                  Expanded(child: _art(context, u))
                else
                  _art(context, u),
                _content(context, u, large),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _art(BuildContext context, double u) => AspectRatio(
    aspectRatio: compact ? 1.35 : 2.45,
    child: Stack(
      fit: StackFit.expand,
      children: [
        HomeArtwork(
          GameModeArt.path(game),
          alignment: game.id == 'scouts_duel'
              ? Alignment.centerRight
              : Alignment.center,
        ),
        const DecoratedBox(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
                Color(0x33041C2A),
                Colors.transparent,
                Color(0x66041C2A),
              ],
            ),
          ),
        ),
        Positioned(
          top: 9 * u,
          left: 9 * u,
          child: Container(
            padding: EdgeInsets.symmetric(horizontal: 8 * u, vertical: 4 * u),
            decoration: BoxDecoration(
              color: const Color(0xF5FAF9F6),
              borderRadius: BorderRadius.circular(7 * u),
            ),
            child: Text(
              game.hasDailyChallenge ? 'Daily challenge' : game.category,
              style: HomeStyle.text(
                9 * u,
                color: HomeStyle.teal,
                weight: FontWeight.w700,
              ),
            ),
          ),
        ),
        Positioned(
          left: 9 * u,
          right: 9 * u,
          bottom: 6 * u,
          child: Row(
            children: [
              Container(
                padding: EdgeInsets.symmetric(
                  horizontal: 7 * u,
                  vertical: 5 * u,
                ),
                decoration: BoxDecoration(
                  color: const Color(0xCB041C2A),
                  borderRadius: BorderRadius.circular(8 * u),
                  border: Border.all(color: const Color(0x30FFFFFF)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.schedule_rounded,
                      size: 12 * u,
                      color: Colors.white,
                    ),
                    SizedBox(width: 4 * u),
                    Text(
                      '${game.averageDurationMinutes} min',
                      style: HomeStyle.text(
                        10 * u,
                        color: Colors.white,
                        weight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
              const Spacer(),
              if (compact)
                Container(
                  width: 29 * u,
                  height: 29 * u,
                  decoration: const BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: HomeStyle.goldGradient,
                  ),
                  child: Icon(
                    Icons.arrow_forward_rounded,
                    size: 17 * u,
                    color: HomeStyle.ink,
                  ),
                )
              else
                HomeGoldButton(label: 'Play now', onTap: onPlay),
            ],
          ),
        ),
      ],
    ),
  );

  Widget _content(BuildContext context, double u, bool large) => Padding(
    padding: EdgeInsets.fromLTRB(12 * u, 9 * u, 12 * u, 8 * u),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          game.title,
          maxLines: large ? null : 2,
          style: HomeStyle.text(
            (compact ? 16 : 21) * u,
            weight: FontWeight.w800,
            spacing: -.4,
          ),
        ),
        SizedBox(height: 4 * u),
        Text(
          compact ? game.subtitle : game.description,
          maxLines: large ? null : 2,
          overflow: large ? TextOverflow.visible : TextOverflow.ellipsis,
          style: HomeStyle.text(
            (compact ? 11 : 12) * u,
            color: const Color(0xFF7D858C),
            height: 1.3,
          ),
        ),
      ],
    ),
  );
}

import 'package:flutter/material.dart';

import '../../../../../shared/models/game_metadata.dart';
import 'game_mode_tile.dart';

class GameModeGridCard extends StatelessWidget {
  const GameModeGridCard({super.key, required this.game, required this.onPlay});
  final GameMetadata game;
  final VoidCallback onPlay;

  @override
  Widget build(BuildContext context) =>
      GameModeTile(game: game, onPlay: onPlay, compact: true);
}

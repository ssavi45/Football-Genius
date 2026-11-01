import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../../domain/higher_lower_engine.dart';
import '../../domain/higher_lower_models.dart';
import 'higher_lower_lobby_art.dart';
import 'higher_lower_widgets.dart';

const hlDuelEmerald = Color(0xFF45F8BF);
const hlDuelPurple = Color(0xFFC48BFF);

class HlDuelLayout {
  HlDuelLayout({
    required this.width,
    required this.height,
    required this.textScale,
  });
  final double width, height, textScale;
  double get unit => width / 393;
  bool get large => textScale > 1.15;
  double get cardWidth => width - 20 * unit;
  double get cardHeight => math.max(184 * unit, (height - 318 * unit) / 2);
}

class HlDuelHero extends StatelessWidget {
  const HlDuelHero({
    super.key,
    required this.category,
    required this.unit,
    required this.onBack,
    required this.onHelp,
  });
  final HlCategory category;
  final double unit;
  final VoidCallback onBack, onHelp;
  @override
  Widget build(BuildContext context) {
    final words = category.label.toUpperCase().split(' ');
    return SizedBox(
      height: 156 * unit,
      child: Stack(
        children: [
          Positioned.fill(
            child: ExcludeSemantics(
              child: Image.asset(
                'assets/images/higher_lower/duel_stadium.webp',
                fit: BoxFit.cover,
              ),
            ),
          ),
          Positioned(
            left: 8 * unit,
            right: 8 * unit,
            top: 9 * unit,
            child: SizedBox(
              height: math.max(52 * unit, 48),
              child: Row(
                children: [
                  HlLobbyIconButton(
                    tooltip: 'Back',
                    icon: Icons.arrow_back_rounded,
                    onPressed: onBack,
                    unit: unit * 1.12,
                  ),
                  Expanded(
                    child: FittedBox(
                      fit: BoxFit.scaleDown,
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          HlTitleLaurel(unit: unit * 1.35),
                          SizedBox(width: 8 * unit),
                          HlMetalText(
                            '${words.sublist(0, words.length - 1).join(' ')} ',
                            size: 27 * unit,
                          ),
                          HlMetalText(words.last, size: 27 * unit, gold: true),
                          SizedBox(width: 8 * unit),
                          HlTitleLaurel(unit: unit * 1.35, right: true),
                        ],
                      ),
                    ),
                  ),
                  HlLobbyIconButton(
                    tooltip: 'How to play',
                    icon: Icons.help_outline_rounded,
                    onPressed: onHelp,
                    unit: unit * 1.12,
                  ),
                ],
              ),
            ),
          ),
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            height: 16 * unit,
            child: const DecoratedBox(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [Colors.transparent, Color(0xFF00130F)],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class HlDuelStats extends StatelessWidget {
  const HlDuelStats({
    super.key,
    required this.run,
    required this.unit,
    required this.large,
  });
  final HlRun? run;
  final double unit;
  final bool large;
  @override
  Widget build(BuildContext context) {
    final items = [
      (
        'STREAK',
        run?.score.toString() ?? '—',
        Icons.local_fire_department_rounded,
        HlLobbyStyle.gold,
      ),
      (
        'BEST',
        run?.best.toString() ?? '—',
        Icons.emoji_events_rounded,
        const Color(0xFFF7F5DE),
      ),
      (
        'RUN XP',
        run == null ? '—' : '+${run!.xp}',
        Icons.bolt_rounded,
        const Color(0xFF81FFE9),
      ),
    ];
    Widget badge(int index) => CustomPaint(
      painter: _ScoreBadgePainter(
        index == 0 ? HlLobbyStyle.gold : hlDuelEmerald,
      ),
      child: Padding(
        padding: EdgeInsets.fromLTRB(7 * unit, 6 * unit, 7 * unit, 10 * unit),
        child: large
            ? Row(
                children: [
                  Icon(
                    items[index].$3,
                    color: HlLobbyStyle.gold,
                    size: 20 * unit,
                  ),
                  SizedBox(width: 8 * unit),
                  Expanded(
                    child: Text(
                      items[index].$1,
                      style: HlLobbyStyle.display(15 * unit),
                    ),
                  ),
                  Text(
                    items[index].$2,
                    style: HlLobbyStyle.display(
                      27 * unit,
                      color: items[index].$4,
                    ),
                  ),
                ],
              )
            : Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        items[index].$3,
                        color: HlLobbyStyle.gold,
                        size: 14 * unit,
                      ),
                      SizedBox(width: 5 * unit),
                      Flexible(
                        child: Text(
                          items[index].$1,
                          style: HlLobbyStyle.display(
                            12.5 * unit,
                            color: index == 0
                                ? HlLobbyStyle.gold
                                : Colors.white,
                          ),
                        ),
                      ),
                    ],
                  ),
                  Expanded(
                    child: FittedBox(
                      fit: BoxFit.scaleDown,
                      child: Text(
                        items[index].$2,
                        style: HlLobbyStyle.display(
                          34 * unit,
                          color: items[index].$4,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
      ),
    );
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 14 * unit),
      child: large
          ? Column(
              children: [
                for (var i = 0; i < items.length; i++) ...[
                  badge(i),
                  if (i != items.length - 1) SizedBox(height: 8 * unit),
                ],
              ],
            )
          : SizedBox(
              height: 64 * unit,
              child: Row(
                children: [
                  for (var i = 0; i < items.length; i++) ...[
                    Expanded(child: badge(i)),
                    if (i != items.length - 1) SizedBox(width: 15 * unit),
                  ],
                ],
              ),
            ),
    );
  }
}

class _ScoreBadgePainter extends CustomPainter {
  const _ScoreBadgePainter(this.accent);
  final Color accent;
  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width, h = size.height;
    final cut = math.min(8.0, h * .13);
    final p = Path()
      ..moveTo(cut, 0)
      ..lineTo(w - cut, 0)
      ..lineTo(w, cut)
      ..lineTo(w, h - 15)
      ..lineTo(w - cut, h - 8)
      ..lineTo(w / 2, h)
      ..lineTo(cut, h - 8)
      ..lineTo(0, h - 15)
      ..lineTo(0, cut)
      ..close();
    canvas.drawShadow(p, accent.withValues(alpha: .4), 4, false);
    canvas.drawPath(
      p,
      Paint()
        ..shader = LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            accent.withValues(alpha: .22),
            const Color(0xFF000D0C),
            const Color(0xFF001C17),
            accent.withValues(alpha: .25),
          ],
        ).createShader(Offset.zero & size),
    );
    canvas.drawPath(
      p,
      Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1.15
        ..shader = LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            const Color(0xFFFFFFD4),
            accent,
            accent.withValues(alpha: .4),
            accent,
          ],
        ).createShader(Offset.zero & size),
    );
    final stripe = Path()
      ..moveTo(0, 15)
      ..lineTo(15, 0)
      ..lineTo(28, 0)
      ..lineTo(0, 28)
      ..close();
    canvas.save();
    canvas.clipPath(p);
    canvas.drawPath(stripe, Paint()..color = accent.withValues(alpha: .12));
    canvas.restore();
    final bottom = Path()
      ..moveTo(w * .2, h - 5)
      ..lineTo(w / 2, h)
      ..lineTo(w * .8, h - 5);
    canvas.drawPath(
      bottom,
      Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2
        ..color = accent
        ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 3),
    );
  }

  @override
  bool shouldRepaint(_ScoreBadgePainter oldDelegate) =>
      accent != oldDelegate.accent;
}

class HlDuelInstruction extends StatelessWidget {
  const HlDuelInstruction({
    super.key,
    required this.unit,
    this.correct,
    this.finished = false,
  });
  final double unit;
  final bool? correct;
  final bool finished;
  @override
  Widget build(BuildContext context) => Semantics(
    liveRegion: true,
    child: Padding(
      padding: EdgeInsets.symmetric(horizontal: 22 * unit, vertical: 5 * unit),
      child: ConstrainedBox(
        constraints: BoxConstraints(minHeight: 34 * unit),
        child: Row(
          children: [
            const Expanded(child: _GoldRule()),
            SizedBox(width: 12 * unit),
            if (correct != null) ...[
              Icon(
                correct! ? Icons.check_circle_rounded : Icons.cancel_rounded,
                color: correct! ? hlDuelEmerald : const Color(0xFFFF8F86),
                size: 19 * unit,
              ),
              SizedBox(width: 7 * unit),
            ],
            Flexible(
              flex: 18,
              child: Text(
                finished
                    ? 'STREAK FINISHED'
                    : correct == null
                    ? 'Tap the player with the higher value.'
                    : correct!
                    ? 'Correct pick · +15 XP'
                    : 'A good streak starts with the next try.',
                textAlign: TextAlign.center,
                style: finished
                    ? HlLobbyStyle.display(22 * unit, color: HlLobbyStyle.gold)
                    : HlLobbyStyle.body(18 * unit, italic: true),
              ),
            ),
            SizedBox(width: 12 * unit),
            const Expanded(child: _GoldRule(reverse: true)),
          ],
        ),
      ),
    ),
  );
}

class _GoldRule extends StatelessWidget {
  const _GoldRule({this.reverse = false});
  final bool reverse;
  @override
  Widget build(BuildContext context) => Container(
    height: 1,
    decoration: BoxDecoration(
      gradient: LinearGradient(
        colors: reverse
            ? const [HlLobbyStyle.gold, Colors.transparent]
            : const [Colors.transparent, HlLobbyStyle.gold],
      ),
    ),
  );
}

class HlDuelVersus extends StatelessWidget {
  const HlDuelVersus({super.key, required this.unit});
  final double unit;
  @override
  Widget build(BuildContext context) => ExcludeSemantics(
    child: SizedBox(
      height: 42 * unit,
      child: Padding(
        padding: EdgeInsets.symmetric(horizontal: 25 * unit),
        child: Row(
          children: [
            const Expanded(child: _GoldRule()),
            SizedBox(width: 15 * unit),
            HlLaurels(
              width: 92 * unit,
              height: 37 * unit,
              child: FittedBox(
                fit: BoxFit.scaleDown,
                child: HlMetalText('VS', size: 39 * unit, gold: true),
              ),
            ),
            SizedBox(width: 15 * unit),
            const Expanded(child: _GoldRule(reverse: true)),
          ],
        ),
      ),
    ),
  );
}

double _textHeight(
  BuildContext context,
  String text,
  TextStyle style,
  double width,
) {
  final painter = TextPainter(
    text: TextSpan(
      text: text,
      style: DefaultTextStyle.of(context).style.merge(style),
    ),
    textDirection: Directionality.of(context),
    textScaler: MediaQuery.textScalerOf(context),
  )..layout(maxWidth: math.max(1, width));
  final height = painter.height;
  painter.dispose();
  return height;
}

class HlDuelCard extends StatelessWidget {
  const HlDuelCard({
    super.key,
    required this.player,
    required this.category,
    required this.side,
    required this.hidden,
    required this.locked,
    required this.onTap,
    required this.minimumHeight,
    required this.unit,
    this.picked = false,
    this.correct,
  });
  final HlPlayer player;
  final HlCategory category;
  final HlSide side;
  final bool hidden, locked, picked;
  final bool? correct;
  final VoidCallback onTap;
  final double minimumHeight, unit;
  static (String, String) nameParts(String name) {
    final parts = name.trim().split(RegExp(r'\s+'));
    return parts.length == 1
        ? ('', parts.first)
        : (parts.first, parts.skip(1).join(' '));
  }

  static String clubLabel(HlPlayer player) => player.isRetired
      ? 'Retired · ${player.nationality}'
      : player.club ?? 'Without Club';
  static double heightFor(
    BuildContext context,
    HlPlayer player,
    HlCategory category,
    double width,
    double minimum,
    double unit,
  ) {
    final names = nameParts(player.name);
    final textWidth = width * .56 - 12 * unit;
    var height = 28 * unit;
    if (names.$1.isNotEmpty) {
      height += _textHeight(
        context,
        names.$1.toUpperCase(),
        HlLobbyStyle.display(24 * unit),
        textWidth,
      );
    }
    height += _textHeight(
      context,
      names.$2.toUpperCase(),
      HlLobbyStyle.display(32 * unit, height: .95),
      textWidth,
    );
    final move = player.selectedTransfer;
    height += math.max(
      22 * unit,
      _textHeight(
        context,
        clubLabel(player),
        HlLobbyStyle.body(16 * unit, italic: true),
        textWidth - (player.flag == null ? 27 : 61) * unit,
      ),
    );
    if (category == HlCategory.transfer && move != null) {
      height +=
          _textHeight(
            context,
            move.from.name,
            HlLobbyStyle.body(10.5 * unit, italic: true),
            textWidth - 40 * unit,
          ) +
          _textHeight(
            context,
            move.to.name,
            HlLobbyStyle.body(10.5 * unit, italic: true),
            textWidth - 40 * unit,
          ) +
          _textHeight(
            context,
            move.date,
            HlLobbyStyle.body(9.5 * unit),
            textWidth,
          ) +
          11 * unit;
    }
    height +=
        _textHeight(
          context,
          category.statLabel.toUpperCase(),
          HlLobbyStyle.body(13 * unit, spacing: 1.25 * unit),
          textWidth - 24 * unit,
        ) +
        59 * unit;
    return math.max(minimum, height);
  }

  @override
  Widget build(BuildContext context) => LayoutBuilder(
    builder: (context, constraints) {
      final height = heightFor(
        context,
        player,
        category,
        constraints.maxWidth,
        minimumHeight,
        unit,
      );
      final portraitWidth = constraints.maxWidth * .42;
      final portraitHeight = math.min(height - 6 * unit, 232 * unit);
      final accent = side == HlSide.left ? hlDuelEmerald : hlDuelPurple;
      final value = hidden
          ? '???'
          : HlEngine.format(player.value(category), category);
      final names = nameParts(player.name);
      final move = player.selectedTransfer;
      final edge = picked
          ? (correct == true
                ? const Color(0xFFFFE49B)
                : const Color(0xFFFF827E))
          : accent;
      return Semantics(
        button: true,
        enabled: !locked,
        onTap: locked ? null : onTap,
        excludeSemantics: true,
        label:
            'Choose ${player.name} as the player with the higher ${category.statLabel.toLowerCase()}. ${move == null ? '' : '${move.from.name} to ${move.to.name}, ${move.date}. '}${hidden ? 'Value hidden.' : value}',
        child: CustomPaint(
          foregroundPainter: _PlayerFramePainter(edge, picked),
          child: ClipPath(
            clipper: const _PlayerCardClipper(),
            child: Material(
              color: const Color(0xFF001A16),
              child: InkWell(
                key: ValueKey('hl-pick-${side.name}'),
                onTap: locked ? null : onTap,
                child: SizedBox(
                  height: height,
                  child: Stack(
                    children: [
                      Positioned.fill(
                        child: ExcludeSemantics(
                          child: Image.asset(
                            'assets/images/higher_lower/duel_${side == HlSide.left ? 'emerald' : 'purple'}.webp',
                            fit: BoxFit.cover,
                          ),
                        ),
                      ),
                      Positioned(
                        left: -2 * unit,
                        bottom: 2 * unit,
                        width: portraitWidth,
                        height: portraitHeight,
                        child: ShaderMask(
                          blendMode: BlendMode.dstIn,
                          shaderCallback: (bounds) => const LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [
                              Colors.white,
                              Colors.white,
                              Colors.transparent,
                            ],
                            stops: [0, .84, 1],
                          ).createShader(bounds),
                          child: HlIdentityImage(
                            source: player.portrait,
                            name: player.name,
                            width: portraitWidth,
                            height: portraitHeight,
                            fit: BoxFit.cover,
                            alignment: Alignment.bottomCenter,
                            placeholder: Center(
                              child: HlMetalText(
                                player.name
                                    .split(RegExp(r'\s+'))
                                    .take(2)
                                    .map((part) => part[0])
                                    .join()
                                    .toUpperCase(),
                                size: 33 * unit,
                                gold: true,
                              ),
                            ),
                          ),
                        ),
                      ),
                      Positioned(
                        top: 12 * unit,
                        bottom: 12 * unit,
                        left: constraints.maxWidth * .44,
                        right: 12 * unit,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            if (names.$1.isNotEmpty)
                              HlMetalText(
                                names.$1.toUpperCase(),
                                size: 24 * unit,
                              ),
                            HlMetalText(
                              names.$2.toUpperCase(),
                              size: 32 * unit,
                              height: .95,
                              gold: true,
                            ),
                            SizedBox(height: 5 * unit),
                            _PlayerIdentity(player: player, unit: unit),
                            if (category == HlCategory.transfer &&
                                move != null) ...[
                              SizedBox(height: 3 * unit),
                              _MoveClub(
                                label: 'FROM',
                                club: move.from,
                                unit: unit,
                              ),
                              SizedBox(height: 2 * unit),
                              _MoveClub(label: 'TO', club: move.to, unit: unit),
                              SizedBox(height: 2 * unit),
                              Text(
                                move.date,
                                style: HlLobbyStyle.body(9.5 * unit),
                              ),
                            ],
                            const Spacer(),
                            Container(
                              height: .5,
                              decoration: BoxDecoration(
                                gradient: LinearGradient(
                                  colors: [
                                    Colors.transparent,
                                    accent.withValues(alpha: .55),
                                    Colors.transparent,
                                  ],
                                ),
                              ),
                            ),
                            SizedBox(height: 5 * unit),
                            Row(
                              children: [
                                SizedBox(
                                  width: 16 * unit,
                                  child: FittedBox(
                                    fit: BoxFit.scaleDown,
                                    child: Text(
                                      '///',
                                      style: HlLobbyStyle.body(
                                        13 * unit,
                                        color: accent.withValues(alpha: .7),
                                      ),
                                    ),
                                  ),
                                ),
                                SizedBox(width: 8 * unit),
                                Expanded(
                                  child: Text(
                                    category.statLabel.toUpperCase(),
                                    textAlign: TextAlign.center,
                                    style: HlLobbyStyle.body(
                                      13 * unit,
                                      spacing: 1.25 * unit,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            SizedBox(height: 4 * unit),
                            Row(
                              children: [
                                Expanded(
                                  child: ClipPath(
                                    clipper: const HlCutClipper(),
                                    child: Container(
                                      height: 46 * unit,
                                      color: const Color(0xC0000E12),
                                      padding: EdgeInsets.symmetric(
                                        horizontal: 6 * unit,
                                      ),
                                      child: FittedBox(
                                        fit: BoxFit.scaleDown,
                                        child: HlMetalText(
                                          value,
                                          key: ValueKey(
                                            'hl-value-${side.name}',
                                          ),
                                          size: 45 * unit,
                                          gold: true,
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                                SizedBox(width: 12 * unit),
                                SizedBox(
                                  width: 40 * unit,
                                  height: 42 * unit,
                                  child: HlBevel(
                                    child: Center(
                                      child: ShaderMask(
                                        shaderCallback:
                                            HlLobbyStyle.metal.createShader,
                                        child: Icon(
                                          picked
                                              ? (correct == true
                                                    ? Icons
                                                          .check_circle_outline_rounded
                                                    : Icons.cancel_outlined)
                                              : Icons.touch_app_outlined,
                                          color: Colors.white,
                                          size: 29 * unit,
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              ],
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
    },
  );
}

class _PlayerIdentity extends StatelessWidget {
  const _PlayerIdentity({required this.player, required this.unit});
  final HlPlayer player;
  final double unit;
  @override
  Widget build(BuildContext context) => Row(
    crossAxisAlignment: CrossAxisAlignment.center,
    children: [
      if (player.isRetired ||
          player.club == null ||
          player.club == 'Without Club')
        Icon(
          player.isRetired ? Icons.history_rounded : Icons.block_rounded,
          color: HlLobbyStyle.gold,
          size: 21 * unit,
        )
      else
        HlIdentityImage(
          source: player.clubBadge,
          name: player.club ?? '',
          width: 21 * unit,
          height: 22 * unit,
          portrait: false,
        ),
      SizedBox(width: 6 * unit),
      Expanded(
        child: Text(
          HlDuelCard.clubLabel(player),
          style: HlLobbyStyle.body(16 * unit, italic: true),
        ),
      ),
      if (player.flag != null) ...[
        SizedBox(width: 5 * unit),
        HlIdentityImage(
          source: player.flag,
          name: player.nationality,
          width: 29 * unit,
          height: 19 * unit,
          portrait: false,
        ),
      ],
    ],
  );
}

class _MoveClub extends StatelessWidget {
  const _MoveClub({
    required this.label,
    required this.club,
    required this.unit,
  });
  final String label;
  final HlClub club;
  final double unit;
  @override
  Widget build(BuildContext context) => Row(
    children: [
      SizedBox(
        width: 24 * unit,
        child: FittedBox(
          fit: BoxFit.scaleDown,
          alignment: Alignment.centerLeft,
          child: Text(
            label,
            style: HlLobbyStyle.body(8 * unit, color: HlLobbyStyle.gold),
          ),
        ),
      ),
      HlIdentityImage(
        source: club.crest,
        name: club.name,
        width: 12 * unit,
        height: 12 * unit,
        portrait: false,
      ),
      SizedBox(width: 4 * unit),
      Expanded(
        child: Text(
          club.name,
          style: HlLobbyStyle.body(10.5 * unit, italic: true),
        ),
      ),
    ],
  );
}

class _PlayerCardClipper extends CustomClipper<Path> {
  const _PlayerCardClipper();
  @override
  Path getClip(Size size) {
    final c = math.min(size.width * .045, 17.0);
    return Path()
      ..moveTo(c, 0)
      ..lineTo(size.width - c, 0)
      ..lineTo(size.width, c)
      ..lineTo(size.width, size.height - c)
      ..lineTo(size.width - c, size.height)
      ..lineTo(c, size.height)
      ..lineTo(0, size.height - c)
      ..lineTo(0, c)
      ..close();
  }

  @override
  bool shouldReclip(_PlayerCardClipper oldClipper) => false;
}

class _PlayerFramePainter extends CustomPainter {
  const _PlayerFramePainter(this.color, this.picked);
  final Color color;
  final bool picked;
  @override
  void paint(Canvas canvas, Size size) {
    final path = const _PlayerCardClipper().getClip(size);
    canvas.drawPath(
      path,
      Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = picked ? 3 : 2
        ..color = color.withValues(alpha: .5)
        ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 4),
    );
    canvas.drawPath(
      path,
      Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = picked ? 1.8 : 1.2
        ..shader = LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            color,
            const Color(0xFFE6F5EA),
            color.withValues(alpha: .5),
            color,
          ],
        ).createShader(Offset.zero & size),
    );
    canvas.save();
    canvas.translate(1.8, 1.8);
    canvas.drawPath(
      const _PlayerCardClipper().getClip(
        Size(size.width - 3.6, size.height - 3.6),
      ),
      Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = .6
        ..color = color.withValues(alpha: .65),
    );
    canvas.restore();
    final flare = Path()
      ..moveTo(size.width * .25, size.height - .5)
      ..lineTo(size.width * .75, size.height - .5);
    canvas.drawPath(
      flare,
      Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2
        ..color = color
        ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 3),
    );
  }

  @override
  bool shouldRepaint(_PlayerFramePainter oldDelegate) =>
      color != oldDelegate.color || picked != oldDelegate.picked;
}

class HlDuelButton extends StatelessWidget {
  const HlDuelButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.secondary = false,
  });
  final String label;
  final VoidCallback? onPressed;
  final bool secondary;
  @override
  Widget build(BuildContext context) => Semantics(
    button: true,
    enabled: onPressed != null,
    label: label,
    child: Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onPressed,
        child: HlBevel(
          slant: true,
          child: Container(
            constraints: const BoxConstraints(minHeight: 48),
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 9),
            decoration: secondary
                ? null
                : const BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [Color(0xFF007C61), Color(0xFF00251F)],
                    ),
                  ),
            child: Center(
              child: Text(
                label,
                textAlign: TextAlign.center,
                style: HlLobbyStyle.display(
                  21,
                  color: secondary ? HlLobbyStyle.gold : Colors.white,
                ),
              ),
            ),
          ),
        ),
      ),
    ),
  );
}

class HlDuelNotice extends StatelessWidget {
  const HlDuelNotice(this.message, {super.key, this.error = false});
  final String message;
  final bool error;
  @override
  Widget build(BuildContext context) => Container(
    margin: const EdgeInsets.only(bottom: 10),
    padding: const EdgeInsets.all(12),
    decoration: BoxDecoration(
      color: const Color(0xF0002420),
      border: Border.all(
        color: error ? const Color(0xFFFFA28B) : HlLobbyStyle.gold,
      ),
      borderRadius: BorderRadius.circular(10),
    ),
    child: Text(
      message,
      style: HlLobbyStyle.body(
        14,
        color: error ? const Color(0xFFFFCDC0) : Colors.white,
      ),
    ),
  );
}

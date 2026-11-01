import 'dart:async';
import 'dart:math' as math;

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:football_genius/core/router/app_routes.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:football_genius/core/auth/footy_account.dart';

import '../../domain/higher_lower_engine.dart';
import '../../domain/higher_lower_models.dart';
import '../controllers/higher_lower_providers.dart';
import '../widgets/higher_lower_duel_art.dart';
import '../widgets/higher_lower_lobby_art.dart';
import '../widgets/higher_lower_records.dart';
import '../widgets/higher_lower_widgets.dart';

class HigherLowerDuel extends ConsumerStatefulWidget {
  const HigherLowerDuel({super.key, required this.category});
  final HlCategory category;
  @override
  ConsumerState<HigherLowerDuel> createState() => _HigherLowerDuelState();
}

class _HigherLowerDuelState extends ConsumerState<HigherLowerDuel>
    with WidgetsBindingObserver {
  final Set<String> _prefetched = {};
  HlDuelLayout? _layout;
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState appState) {
    if (!mounted) return;
    final controller = ref.read(hlDuelProvider(widget.category).notifier);
    if (appState == AppLifecycleState.paused ||
        appState == AppLifecycleState.inactive) {
      controller.pause();
    }
    if (appState == AppLifecycleState.resumed) unawaited(controller.recover());
  }

  void _preload(HlRun run) {
    if (!ref.read(hlImagesEnabledProvider)) return;
    final media = ref.read(hlSnapshotsProvider).media;
    final density = MediaQuery.devicePixelRatioOf(context);
    final layout = _layout;
    if (layout == null) return;
    int portraitPixels(HlPlayer player) {
      final height = HlDuelCard.heightFor(
        context,
        player,
        run.category,
        layout.cardWidth,
        layout.cardHeight,
        layout.unit,
      );
      return (math.max(
                layout.cardWidth * .42,
                math.min(height - 6 * layout.unit, 232 * layout.unit),
              ) *
              density)
          .ceil();
    }

    final badgeWidth = (29 * layout.unit * density).ceil();
    for (final (source, width) in [
      for (final player in [run.left, run.right]) ...[
        (player.portrait, portraitPixels(player)),
        (player.clubBadge, badgeWidth),
        (player.flag, badgeWidth),
        (player.selectedTransfer?.from.crest, badgeWidth),
        (player.selectedTransfer?.to.crest, badgeWidth),
      ],
      for (final (index, source) in run.upcomingImages.indexed)
        (
          source,
          index == 0
              ? (math.max(
                          layout.cardWidth * .42,
                          math.min(
                            layout.cardHeight - 6 * layout.unit,
                            232 * layout.unit,
                          ),
                        ) *
                        density)
                    .ceil()
              : badgeWidth,
        ),
    ]) {
      final url = media.image(source, width: width);
      if (url == null || !_prefetched.add(url)) continue;
      unawaited(
        precacheImage(
          CachedNetworkImageProvider(url),
          context,
          onError: (_, _) {},
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = hlDuelProvider(widget.category);
    final state = ref.watch(provider);
    final controller = ref.read(provider.notifier);
    final account = ref.watch(footyAccountProvider);
    ref.listen(provider, (previous, next) {
      if (next.run != null) _preload(next.run!);
      if (next.phase == HlPhase.revealing &&
          previous?.phase != HlPhase.revealing) {
        unawaited(
          next.reveal!.correct
              ? HapticFeedback.lightImpact()
              : HapticFeedback.mediumImpact(),
        );
      }
    });
    final shown = state.reveal?.before ?? state.run;
    final locked = state.phase != HlPhase.ready;
    final width = math.min(MediaQuery.sizeOf(context).width, 560.0);
    final unit = width / 393;
    return PopScope(
      onPopInvokedWithResult: (didPop, _) {
        if (didPop) ref.invalidate(hlLobbyProvider);
      },
      child: AnnotatedRegion<SystemUiOverlayStyle>(
        value: const SystemUiOverlayStyle(
          statusBarColor: Colors.transparent,
          statusBarIconBrightness: Brightness.light,
          statusBarBrightness: Brightness.dark,
          systemNavigationBarColor: HlLobbyStyle.background,
          systemNavigationBarIconBrightness: Brightness.light,
        ),
        child: Theme(
          data: ThemeData.dark(useMaterial3: true).copyWith(
            scaffoldBackgroundColor: HlLobbyStyle.background,
            colorScheme: const ColorScheme.dark(
              primary: HlLobbyStyle.gold,
              surface: HlLobbyStyle.background,
            ),
          ),
          child: Scaffold(
            backgroundColor: HlLobbyStyle.background,
            bottomNavigationBar: HlLobbyDock(
              unit: unit,
              onHome: () => _leave(AppRoutes.home),
              onGames: () => _leave(AppRoutes.games),
              onMode: () => _leave(AppRoutes.higherLower),
              onRecords: () {
                ref.invalidate(hlLobbyProvider);
                showHlRecords(context);
              },
              onAccount: () => hlSheet(context, const HlAccountSheet()),
            ),
            body: Stack(
              fit: StackFit.expand,
              children: [
                Positioned.fill(
                  child: ExcludeSemantics(
                    child: Image.asset(
                      'assets/images/higher_lower/lobby_turf.webp',
                      fit: BoxFit.cover,
                      color: const Color(0x88FFFFFF),
                      colorBlendMode: BlendMode.modulate,
                    ),
                  ),
                ),
                SafeArea(
                  bottom: false,
                  child: LayoutBuilder(
                    builder: (context, constraints) {
                      final layout = HlDuelLayout(
                        width: width,
                        height: constraints.maxHeight,
                        textScale: MediaQuery.textScalerOf(context).scale(1),
                      );
                      _layout = layout;
                      final finished =
                          state.phase == HlPhase.finished && state.run != null;
                      return SingleChildScrollView(
                        key: ValueKey(
                          finished ? 'hl-result-scroll' : 'hl-duel-scroll',
                        ),
                        child: Center(
                          child: SizedBox(
                            width: width,
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.stretch,
                              children: [
                                HlDuelHero(
                                  category: widget.category,
                                  unit: unit,
                                  onBack: () => _leave(AppRoutes.higherLower),
                                  onHelp: () => showHlHelp(
                                    context,
                                    category: widget.category,
                                  ),
                                ),
                                HlDuelStats(
                                  run: state.run,
                                  unit: unit,
                                  large: layout.large,
                                ),
                                if (finished) ...[
                                  HlDuelInstruction(unit: unit, finished: true),
                                  Padding(
                                    padding: EdgeInsets.symmetric(
                                      horizontal: 18 * unit,
                                    ),
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.stretch,
                                      children: [
                                        Text(
                                          '+${state.run!.xp} XP earned this run',
                                          textAlign: TextAlign.center,
                                          style: HlLobbyStyle.body(
                                            14 * unit,
                                            color: HlLobbyStyle.gold,
                                          ),
                                        ),
                                        SizedBox(height: 12 * unit),
                                        for (final side in HlSide.values) ...[
                                          _FinalComparison(
                                            run: state.run!,
                                            side: side,
                                            unit: unit,
                                          ),
                                          SizedBox(height: 10 * unit),
                                        ],
                                        HlDuelButton(
                                          label: 'Try again',
                                          onPressed: controller.restart,
                                        ),
                                        const SizedBox(height: 10),
                                        HlDuelButton(
                                          label: 'Choose category',
                                          onPressed: () =>
                                              _leave(AppRoutes.higherLower),
                                          secondary: true,
                                        ),
                                      ],
                                    ),
                                  ),
                                ] else if (shown == null)
                                  _empty(state, controller, account, unit)
                                else ...[
                                  HlDuelInstruction(
                                    unit: unit,
                                    correct: state.reveal?.correct,
                                  ),
                                  if (state.phase == HlPhase.submitting ||
                                      state.phase == HlPhase.loading)
                                    const LinearProgressIndicator(
                                      minHeight: 2,
                                      color: HlLobbyStyle.gold,
                                      backgroundColor: Color(0xFF003C31),
                                    ),
                                  if (state.message != null ||
                                      state.storageWarning)
                                    Padding(
                                      padding: EdgeInsets.symmetric(
                                        horizontal: 14 * unit,
                                      ),
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.stretch,
                                        children: [
                                          if (state.message != null)
                                            HlDuelNotice(
                                              state.message!,
                                              error:
                                                  state.phase == HlPhase.error,
                                            ),
                                          if (state.phase == HlPhase.error) ...[
                                            HlDuelButton(
                                              label: 'Reconnect and retry',
                                              onPressed: controller.recover,
                                            ),
                                            const SizedBox(height: 8),
                                            HlDuelButton(
                                              label: account.isGuest
                                                  ? 'Start a new streak'
                                                  : 'Play as guest instead',
                                              secondary: true,
                                              onPressed: account.isGuest
                                                  ? controller.restart
                                                  : ref
                                                        .read(
                                                          footyAccountProvider
                                                              .notifier,
                                                        )
                                                        .useGuest,
                                            ),
                                            const SizedBox(height: 12),
                                          ],
                                          if (state.storageWarning)
                                            const HlDuelNotice(
                                              'Your device could not save progress. This run may not survive closing the app.',
                                            ),
                                        ],
                                      ),
                                    ),
                                  for (final side in HlSide.values) ...[
                                    if (side == HlSide.right)
                                      HlDuelVersus(unit: unit),
                                    Padding(
                                      padding: EdgeInsets.symmetric(
                                        horizontal: 10 * unit,
                                      ),
                                      child: HlDuelCard(
                                        player: shown.player(side),
                                        category: widget.category,
                                        side: side,
                                        unit: unit,
                                        hidden:
                                            state.reveal == null &&
                                            !shown.gameOver &&
                                            shown.currentSide != side,
                                        locked: locked,
                                        picked: state.reveal?.side == side,
                                        correct: state.reveal?.correct,
                                        minimumHeight: layout.cardHeight,
                                        onTap: () => controller.pick(side),
                                      ),
                                    ),
                                  ],
                                ],
                                SizedBox(height: 12 * unit),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _leave(String route) {
    ref.read(hlDuelProvider(widget.category).notifier).pause();
    ref.invalidate(hlLobbyProvider);
    if (route == AppRoutes.higherLower && context.canPop()) {
      // Complete the lobby's awaited push so its category action unlocks.
      context.pop();
    } else {
      context.go(route);
    }
  }

  Widget _empty(
    HlDuelState state,
    HlDuelController controller,
    FootyAccountState account,
    double unit,
  ) => Padding(
    padding: EdgeInsets.all(20 * unit),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (state.phase != HlPhase.error) ...[
          SizedBox(height: 18 * unit),
          const Center(
            child: CircularProgressIndicator(color: HlLobbyStyle.gold),
          ),
          SizedBox(height: 16 * unit),
          Text(
            'Getting your comparison ready…',
            textAlign: TextAlign.center,
            style: HlLobbyStyle.body(16 * unit, italic: true),
          ),
          for (final color in [hlDuelEmerald, hlDuelPurple])
            Container(
              height: 110 * unit,
              margin: EdgeInsets.only(top: 18 * unit),
              decoration: BoxDecoration(
                color: const Color(0x88001518),
                border: Border.all(color: color.withValues(alpha: .55)),
                borderRadius: BorderRadius.circular(12),
              ),
            ),
        ] else ...[
          HlDuelNotice(
            state.message ?? 'Your streak could not be loaded.',
            error: true,
          ),
          HlDuelButton(label: 'Try again', onPressed: controller.recover),
          const SizedBox(height: 10),
          if (!account.isGuest) ...[
            HlDuelButton(
              label: 'Play as guest instead',
              onPressed: ref.read(footyAccountProvider.notifier).useGuest,
              secondary: true,
            ),
            const SizedBox(height: 10),
          ],
          HlDuelButton(
            label: 'Choose category',
            onPressed: () => _leave(AppRoutes.higherLower),
            secondary: true,
          ),
        ],
      ],
    ),
  );
}

class _FinalComparison extends StatelessWidget {
  const _FinalComparison({
    required this.run,
    required this.side,
    required this.unit,
  });
  final HlRun run;
  final HlSide side;
  final double unit;
  @override
  Widget build(BuildContext context) {
    final player = run.player(side);
    final accent = side == HlSide.left ? hlDuelEmerald : hlDuelPurple;
    final selected = run.lastPick == side;
    final move = player.selectedTransfer;
    return Semantics(
      label:
          '${player.name}, ${HlEngine.format(player.value(run.category), run.category)}${selected ? ', your final choice' : ''}',
      child: Container(
        decoration: BoxDecoration(
          border: Border.all(
            color: selected ? const Color(0xFFFF8F86) : accent,
          ),
          borderRadius: BorderRadius.circular(12 * unit),
          image: DecorationImage(
            image: AssetImage(
              'assets/images/higher_lower/duel_${side == HlSide.left ? 'emerald' : 'purple'}.webp',
            ),
            fit: BoxFit.cover,
          ),
        ),
        padding: EdgeInsets.all(10 * unit),
        child: Row(
          children: [
            HlIdentityImage(
              source: player.portrait,
              name: player.name,
              width: 65 * unit,
              height: 86 * unit,
              alignment: Alignment.bottomCenter,
              placeholder: Center(
                child: HlMetalText(
                  player.name
                      .split(RegExp(r'\s+'))
                      .take(2)
                      .map((part) => part[0])
                      .join()
                      .toUpperCase(),
                  size: 24 * unit,
                  gold: true,
                ),
              ),
            ),
            SizedBox(width: 10 * unit),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  HlMetalText(
                    player.name.toUpperCase(),
                    size: 20 * unit,
                    gold: true,
                  ),
                  SizedBox(height: 4 * unit),
                  Text(
                    move == null
                        ? HlDuelCard.clubLabel(player)
                        : '${move.from.name} → ${move.to.name}\n${move.date}',
                    style: HlLobbyStyle.body(11 * unit, italic: true),
                  ),
                  SizedBox(height: 5 * unit),
                  Text(
                    HlEngine.format(player.value(run.category), run.category),
                    style: HlLobbyStyle.display(24 * unit),
                  ),
                ],
              ),
            ),
            if (selected)
              Icon(
                Icons.cancel_outlined,
                color: const Color(0xFFFFA28B),
                size: 22 * unit,
              ),
          ],
        ),
      ),
    );
  }
}

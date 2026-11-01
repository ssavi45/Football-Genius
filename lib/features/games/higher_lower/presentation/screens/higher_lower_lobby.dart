import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:football_genius/core/auth/footy_account.dart';
import 'package:football_genius/core/router/app_routes.dart';
import 'package:football_genius/features/games/common/presentation/controllers/games_controller.dart';

import '../../domain/higher_lower_models.dart';
import '../controllers/higher_lower_providers.dart';
import '../widgets/higher_lower_widgets.dart';
import '../widgets/higher_lower_records.dart';
import '../widgets/higher_lower_lobby_art.dart';

class HigherLowerLobby extends ConsumerStatefulWidget {
  const HigherLowerLobby({super.key});
  @override
  ConsumerState<HigherLowerLobby> createState() => _HigherLowerLobbyState();
}

class _HigherLowerLobbyState extends ConsumerState<HigherLowerLobby> {
  final _scroll = ScrollController();
  @override
  void dispose() {
    _selectionGeneration++;
    _scroll.dispose();
    super.dispose();
  }

  HlCategory? _choosing;
  String? _notice;
  int _selectionGeneration = 0;
  Future<void> _choose(HlCategory category) async {
    if (_choosing != null) return;
    final owner = ref.read(footyAccountProvider).owner;
    final generation = ++_selectionGeneration;
    setState(() {
      _choosing = category;
      _notice = null;
    });
    try {
      final repository = ref.read(hlRepositoryProvider);
      if (owner == 'guest') {
        final saved = await repository.guestRun(category);
        await repository.prepareGuest(
          category,
          restart: saved?.gameOver ?? false,
        );
      } else {
        final run = await repository.resumeCloud(owner, category);
        if (run.gameOver) await repository.restartCloud(owner, run);
      }
      if (!mounted || ref.read(footyAccountProvider).owner != owner) return;
      await ref
          .read(lastPlayedGameIdProvider.notifier)
          .setLastPlayed('higher_lower');
      if (mounted &&
          generation == _selectionGeneration &&
          ref.read(footyAccountProvider).owner == owner) {
        await context.push('${AppRoutes.higherLower}/play/${category.name}');
      }
    } catch (error) {
      if (mounted && generation == _selectionGeneration) {
        setState(() => _notice = hlErrorMessage(error));
      }
    } finally {
      if (mounted && generation == _selectionGeneration) {
        setState(() => _choosing = null);
        ref.invalidate(hlLobbyProvider);
      }
    }
  }

  Future<void> _refresh() async {
    await ref.read(hlSnapshotsProvider).refresh(force: true);
    ref.invalidate(hlLobbyProvider);
    await ref.read(hlLobbyProvider.future);
  }

  @override
  Widget build(BuildContext context) {
    final data = ref.watch(hlLobbyProvider);
    final account = ref.watch(footyAccountProvider);
    ref.listen(footyAccountProvider.select((value) => value.owner), (_, _) {
      _selectionGeneration++;
      setState(() {
        _choosing = null;
        _notice = null;
      });
    });
    final width = math.min(MediaQuery.sizeOf(context).width, 560.0);
    final unit = width / 393;
    final large = MediaQuery.textScalerOf(context).scale(14) > 16.1;
    return AnnotatedRegion<SystemUiOverlayStyle>(
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
            onHome: () => context.go(AppRoutes.home),
            onGames: () => context.go(AppRoutes.games),
            onMode: () {
              if (!_scroll.hasClients) return;
              if (MediaQuery.disableAnimationsOf(context)) {
                _scroll.jumpTo(0);
              } else {
                _scroll.animateTo(
                  0,
                  duration: const Duration(milliseconds: 240),
                  curve: Curves.easeOut,
                );
              }
            },
            onRecords: () {
              if (data.asData != null) _records(data.asData!.value);
            },
            onAccount: () => hlSheet(context, const HlAccountSheet()),
          ),
          body: Stack(
            children: [
              Positioned.fill(
                child: ExcludeSemantics(
                  child: Image.asset(
                    'assets/images/higher_lower/lobby_turf.webp',
                    fit: BoxFit.cover,
                    color: const Color(0xB3FFFFFF),
                    colorBlendMode: BlendMode.modulate,
                  ),
                ),
              ),
              SafeArea(
                bottom: false,
                child: Column(
                  children: [
                    Center(
                      child: SizedBox(
                        width: width,
                        height: math.max(50 * unit, 50),
                        child: _LobbyHeader(
                          unit: unit,
                          onHelp: () => showHlHelp(context),
                          onAccount: () =>
                              hlSheet(context, const HlAccountSheet()),
                        ),
                      ),
                    ),
                    Expanded(
                      child: LayoutBuilder(
                        builder: (context, viewport) {
                          final scale = math.max(
                            1.0,
                            MediaQuery.textScalerOf(context).scale(1),
                          );
                          final heroHeight = (viewport.maxHeight * .31).clamp(
                            166 * unit,
                            230 * unit,
                          );
                          final headingHeight = math.max(44 * unit, 48.0);
                          final cardHeight = math.max(
                            140 * unit * scale,
                            (viewport.maxHeight -
                                    heroHeight -
                                    headingHeight -
                                    20 * unit) /
                                2,
                          );
                          return RefreshIndicator(
                            color: HlLobbyStyle.gold,
                            backgroundColor: const Color(0xFF002B25),
                            onRefresh: _refresh,
                            child: SingleChildScrollView(
                              key: const ValueKey('hl-lobby-scroll'),
                              controller: _scroll,
                              physics: const AlwaysScrollableScrollPhysics(),
                              child: Center(
                                child: SizedBox(
                                  width: width,
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.stretch,
                                    children: [
                                      _LobbyHero(
                                        unit: unit,
                                        large: large,
                                        height: heroHeight,
                                      ),
                                      _ChallengeHeading(
                                        unit: unit,
                                        large: large,
                                        onRecords: data.asData == null
                                            ? null
                                            : () =>
                                                  _records(data.asData!.value),
                                      ),
                                      if (_notice != null)
                                        Padding(
                                          padding: EdgeInsets.all(12 * unit),
                                          child: Column(
                                            children: [
                                              HlNotice(_notice!, error: true),
                                              if (!account.isGuest)
                                                HlButton(
                                                  label:
                                                      'Play as guest instead',
                                                  secondary: true,
                                                  onPressed: () {
                                                    ref
                                                        .read(
                                                          footyAccountProvider
                                                              .notifier,
                                                        )
                                                        .useGuest();
                                                    setState(
                                                      () => _notice = null,
                                                    );
                                                  },
                                                ),
                                            ],
                                          ),
                                        ),
                                      data.when(
                                        loading: () => Padding(
                                          padding: EdgeInsets.all(50 * unit),
                                          child: const Center(
                                            child: CircularProgressIndicator(
                                              color: HlLobbyStyle.gold,
                                            ),
                                          ),
                                        ),
                                        error: (error, _) => Padding(
                                          padding: const EdgeInsets.all(20),
                                          child: Column(
                                            children: [
                                              HlNotice(
                                                hlErrorMessage(error),
                                                error: true,
                                              ),
                                              HlButton(
                                                label: 'Try again',
                                                onPressed: () => ref.invalidate(
                                                  hlLobbyProvider,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                        data: (lobby) => Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.stretch,
                                          children: [
                                            if (lobby.storageWarning)
                                              const Padding(
                                                padding: EdgeInsets.all(12),
                                                child: HlNotice(
                                                  'Device storage is unavailable. You can play, but progress may not survive closing the app.',
                                                ),
                                              ),
                                            if (lobby.errors.isNotEmpty)
                                              Padding(
                                                padding: const EdgeInsets.all(
                                                  12,
                                                ),
                                                child: Column(
                                                  children: [
                                                    const HlNotice(
                                                      'Some account records could not be refreshed. Choose a category to reconnect, or play as a guest.',
                                                      error: true,
                                                    ),
                                                    HlButton(
                                                      label: 'Play as guest instead',
                                                      secondary: true,
                                                      onPressed: ref
                                                          .read(
                                                            footyAccountProvider
                                                                .notifier,
                                                          )
                                                          .useGuest,
                                                    ),
                                                  ],
                                                ),
                                              ),
                                            Padding(
                                              padding: EdgeInsets.symmetric(
                                                horizontal: 11 * unit,
                                              ),
                                              child: LayoutBuilder(
                                                builder: (context, constraints) {
                                                  final columns = large ? 1 : 2;
                                                  final tileWidth =
                                                      (constraints.maxWidth -
                                                          (columns - 1) *
                                                              8 *
                                                              unit) /
                                                      columns;
                                                  return Wrap(
                                                    spacing: 8 * unit,
                                                    runSpacing: 8 * unit,
                                                    children: [
                                                      for (final category
                                                          in HlCategory.values)
                                                        SizedBox(
                                                          width: tileWidth,
                                                          child: _CategoryTile(
                                                            category: category,
                                                            run: lobby
                                                                .runs[category],
                                                            best: lobby
                                                                .bests[category],
                                                            busy:
                                                                _choosing ==
                                                                category,
                                                            unit: unit,
                                                            large: large,
                                                            height: cardHeight,
                                                            onTap:
                                                                _choosing ==
                                                                    null
                                                                ? () => _choose(
                                                                    category,
                                                                  )
                                                                : null,
                                                          ),
                                                        ),
                                                    ],
                                                  );
                                                },
                                              ),
                                            ),
                                            SizedBox(height: 12 * unit),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
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
            ],
          ),
        ),
      ),
    );
  }

  void _records(HlLobbyData lobby) => showHlRecords(context, lobby: lobby);
}

class _LobbyHeader extends StatelessWidget {
  const _LobbyHeader({
    required this.unit,
    required this.onHelp,
    required this.onAccount,
  });
  final double unit;
  final VoidCallback onHelp, onAccount;
  @override
  Widget build(BuildContext context) => Container(
    decoration: const BoxDecoration(
      gradient: LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [Color(0xFF000D0F), Color(0xEE001A1B)],
      ),
    ),
    padding: EdgeInsets.symmetric(horizontal: 6 * unit),
    child: Row(
      children: [
        HlLobbyIconButton(
          tooltip: 'Back',
          icon: Icons.arrow_back_rounded,
          onPressed: () => hlBack(context),
          unit: unit,
        ),
        Expanded(
          child: Stack(
            alignment: Alignment.center,
            children: [
              Positioned(
                left: 50 * unit,
                right: 5 * unit,
                top: 5 * unit,
                child: Container(
                  height: .5,
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        Colors.transparent,
                        HlLobbyStyle.gold,
                        Colors.transparent,
                      ],
                    ),
                  ),
                ),
              ),
              Padding(
                padding: EdgeInsets.only(top: 5 * unit, left: 38 * unit),
                child: Row(
                  children: [
                    Transform.translate(
                      offset: Offset(-7 * unit, 0),
                      child: HlTitleLaurel(unit: unit),
                    ),
                    Expanded(
                      child: FittedBox(
                        fit: BoxFit.scaleDown,
                        child: HlMetalText('HIGHER OR LOWER', size: 25 * unit),
                      ),
                    ),
                    Transform.translate(
                      offset: Offset(7 * unit, 0),
                      child: HlTitleLaurel(unit: unit, right: true),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        HlLobbyIconButton(
          tooltip: 'How to play',
          icon: Icons.help_outline_rounded,
          onPressed: onHelp,
          unit: unit,
          visualShift: 11 * unit,
        ),
        HlLobbyIconButton(
          tooltip: 'Your account',
          icon: Icons.person_outline_rounded,
          onPressed: onAccount,
          unit: unit,
          visualShift: 4 * unit,
        ),
      ],
    ),
  );
}

class _LobbyHero extends StatelessWidget {
  final double height;
  const _LobbyHero({
    required this.unit,
    required this.large,
    required this.height,
  });
  final double unit;
  final bool large;
  @override
  Widget build(BuildContext context) {
    final heading = Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        HlMetalText('ONE PICK.', size: 37 * unit, height: .79),
        HlMetalText(
          'ONE LONGER\nSTREAK.',
          size: 37 * unit,
          height: .79,
          gold: true,
        ),
      ],
    );
    final ribbon = HlBevel(
      slant: true,
      child: Padding(
        padding: EdgeInsets.symmetric(
          horizontal: 14 * unit,
          vertical: 3 * unit,
        ),
        child: Text(
          'TRUST YOUR FOOTBALL INSTINCT',
          style: HlLobbyStyle.body(
            10 * unit,
            color: const Color(0xFFFFE6A2),
            italic: true,
            spacing: 1.05 * unit,
          ),
        ),
      ),
    );
    return Stack(
      children: [
        Positioned.fill(
          child: ExcludeSemantics(
            child: Image.asset(
              'assets/images/higher_lower/lobby_hero.webp',
              fit: BoxFit.cover,
              alignment: Alignment.centerRight,
            ),
          ),
        ),
        if (large)
          Positioned.fill(
            child: ColoredBox(color: Colors.black.withValues(alpha: .38)),
          ),
        if (large)
          Padding(
            padding: EdgeInsets.symmetric(
              horizontal: 24 * unit,
              vertical: 20 * unit,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ribbon,
                SizedBox(height: 14 * unit),
                heading,
              ],
            ),
          )
        else
          SizedBox(
            height: height,
            child: Stack(
              children: [
                Positioned(
                  left: 38 * unit,
                  top: 17 * unit + (height - 166 * unit) * .25,
                  child: ribbon,
                ),
                Positioned(
                  left: 38 * unit,
                  top: 43 * unit + (height - 166 * unit) * .25,
                  width: 215 * unit,
                  child: Transform(
                    alignment: Alignment.centerLeft,
                    transform: Matrix4.diagonal3Values(1.07, 1, 1),
                    child: heading,
                  ),
                ),
              ],
            ),
          ),
        Positioned(
          bottom: 0,
          left: 0,
          right: 0,
          child: Container(
            height: .6,
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  Colors.transparent,
                  Color(0xFF3DAB84),
                  Colors.transparent,
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _ChallengeHeading extends StatelessWidget {
  const _ChallengeHeading({
    required this.unit,
    required this.large,
    required this.onRecords,
  });
  final double unit;
  final bool large;
  final VoidCallback? onRecords;
  @override
  Widget build(BuildContext context) {
    final title = HlMetalText(
      'CHOOSE YOUR CHALLENGE',
      key: const ValueKey('hl-challenge-heading'),
      size: 22 * unit,
    );
    final records = HlLobbyIconButton(
      tooltip: 'Personal records',
      icon: Icons.bar_chart_rounded,
      unit: unit,
      onPressed: onRecords,
    );
    if (large) {
      return Padding(
        padding: EdgeInsets.all(12 * unit),
        child: Row(
          children: [
            Expanded(child: title),
            records,
          ],
        ),
      );
    }
    return SizedBox(
      height: math.max(44 * unit, 48.0),
      child: Stack(
        children: [
          Positioned(
            left: 6 * unit,
            top: 22 * unit,
            width: 28 * unit,
            child: Container(
              height: 1,
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Colors.transparent, HlLobbyStyle.gold],
                ),
              ),
            ),
          ),
          Positioned(
            left: 43 * unit,
            right: 54 * unit,
            top: 10 * unit,
            child: FittedBox(
              fit: BoxFit.scaleDown,
              alignment: Alignment.centerLeft,
              child: title,
            ),
          ),
          Positioned(top: 0, right: 8 * unit, child: records),
        ],
      ),
    );
  }
}

class _CategoryTile extends StatelessWidget {
  const _CategoryTile({
    required this.category,
    required this.run,
    required this.best,
    required this.busy,
    required this.onTap,
    required this.unit,
    required this.large,
    required this.height,
  });
  final double height;
  final HlCategory category;
  final HlRun? run;
  final int? best;
  final bool busy, large;
  final VoidCallback? onTap;
  final double unit;
  @override
  Widget build(BuildContext context) {
    final action = run?.gameOver == true
        ? 'Play again'
        : run?.hasProgress == true
        ? 'Resume'
        : 'Play';
    final accent = HlLobbyStyle.accent(category);
    final radius = BorderRadius.circular(13 * unit);
    final content = Padding(
      padding: EdgeInsets.fromLTRB(13 * unit, 8 * unit, 10 * unit, 7 * unit),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Align(
            alignment: Alignment.centerLeft,
            child: HlCategoryBadge(category: category, unit: unit * .95),
          ),
          if (!large) const Spacer(),
          HlMetalText(
            HlLobbyStyle.title(category),
            size: (large ? 25 : 20) * unit,
            height: .82,
          ),
          SizedBox(height: 3 * unit),
          Container(
            height: .5,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  HlLobbyStyle.gold.withValues(alpha: .65),
                  const Color(0xFF9B9E8B),
                  Colors.transparent,
                ],
              ),
            ),
          ),
          SizedBox(height: 3 * unit),
          Text(
            best == null ? 'Best · unavailable' : 'Best streak · $best',
            style: HlLobbyStyle.body(
              (large ? 15 : 12) * unit,
              italic: true,
              color: category == HlCategory.marketValue
                  ? const Color(0xFFFFDC83)
                  : const Color(0xFFE5E2D7),
            ),
          ),
          SizedBox(height: (large ? 12 : 5) * unit),
          HlLobbyAction(
            label: action,
            unit: unit,
            resume: action == 'Resume',
            busy: busy,
          ),
        ],
      ),
    );
    return Semantics(
      button: true,
      enabled: onTap != null,
      onTap: onTap,
      label:
          '${category.label}, ${best == null ? 'record unavailable' : 'best streak $best'}, $action',
      excludeSemantics: true,
      child: DecoratedBox(
        decoration: BoxDecoration(
          borderRadius: radius,
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              const Color(0xFFE2F2F0),
              accent,
              accent.withValues(alpha: .38),
              accent,
            ],
          ),
          boxShadow: [
            BoxShadow(
              color: accent.withValues(alpha: .24),
              blurRadius: 7 * unit,
            ),
            const BoxShadow(
              color: Colors.black,
              blurRadius: 5,
              offset: Offset(0, 3),
            ),
          ],
        ),
        child: Padding(
          padding: EdgeInsets.all(.75 * unit),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(12.3 * unit),
            child: Material(
              color: HlLobbyStyle.background,
              child: InkWell(
                key: ValueKey('hl-category-${category.name}'),
                onTap: onTap,
                child: Stack(
                  children: [
                    Positioned.fill(
                      child: ExcludeSemantics(
                        child: Image.asset(
                          HlLobbyStyle.image(category),
                          fit: BoxFit.cover,
                          alignment: Alignment.centerRight,
                        ),
                      ),
                    ),
                    Positioned.fill(
                      child: DecoratedBox(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.centerLeft,
                            end: Alignment.centerRight,
                            colors: [
                              const Color(0x66000505),
                              const Color(0x11000505),
                              Colors.transparent,
                            ],
                          ),
                        ),
                      ),
                    ),
                    Positioned.fill(
                      child: DecoratedBox(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.center,
                            end: Alignment.bottomCenter,
                            colors: [
                              Colors.transparent,
                              Colors.black.withValues(alpha: .78),
                            ],
                          ),
                        ),
                      ),
                    ),
                    if (large)
                      content
                    else
                      SizedBox(height: height - 1.5 * unit, child: content),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

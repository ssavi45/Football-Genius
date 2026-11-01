import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import 'package:football_genius/core/auth/footy_account.dart';
import 'package:football_genius/core/network/footygen_api_config.dart';

import '../../data/higher_lower_api.dart';
import '../../data/higher_lower_repository.dart';
import '../../data/higher_lower_snapshots.dart';
import '../../data/higher_lower_store.dart';
import '../../domain/higher_lower_engine.dart';
import '../../domain/higher_lower_models.dart';

final hlHttpProvider = Provider<http.Client>((ref) {
  final client = http.Client();
  ref.onDispose(client.close);
  return client;
});
final hlStoreProvider = Provider<HlStore>((ref) => createHlStore());
final hlImagesEnabledProvider = Provider<bool>((ref) => true);
final hlSnapshotsProvider = Provider<HlSnapshots>(
  (ref) => HlSnapshots(
    store: ref.watch(hlStoreProvider),
    client: ref.watch(hlHttpProvider),
    origin: FootygenApiConfig.origin,
  ),
);
final hlRepositoryProvider = Provider<HlGameRepository>((ref) {
  final gateway = ref.watch(footyAccountGatewayProvider);
  return HlGameRepository(
    store: ref.watch(hlStoreProvider),
    snapshots: ref.watch(hlSnapshotsProvider),
    api: HlApi(
      client: ref.watch(hlHttpProvider),
      origin: FootygenApiConfig.origin,
      token: (refresh) => gateway.accessToken(refresh: refresh),
      userId: () => gateway.userId,
    ),
  );
});

class HlLobbyData {
  const HlLobbyData({
    required this.snapshot,
    required this.runs,
    required this.bests,
    required this.errors,
    required this.storageWarning,
  });
  final HlSnapshot snapshot;
  final Map<HlCategory, HlRun?> runs;
  final Map<HlCategory, int?> bests;
  final Map<HlCategory, String> errors;
  final bool storageWarning;
}

String hlErrorMessage(Object error) {
  if (error is HlApiException) return error.message;
  if (error is StateError) return error.message.toString();
  return 'This streak could not be loaded. Please try again.';
}

final hlLobbyProvider = FutureProvider.autoDispose<HlLobbyData>((ref) async {
  final owner = ref.watch(
    footyAccountProvider.select((account) => account.owner),
  );
  final repository = ref.watch(hlRepositoryProvider);
  final snapshots = ref.watch(hlSnapshotsProvider);
  final snapshot = await snapshots.current();
  unawaited(snapshots.refresh());
  final runs = <HlCategory, HlRun?>{},
      bests = <HlCategory, int?>{},
      errors = <HlCategory, String>{};
  await Future.wait(
    HlCategory.values.map((category) async {
      try {
        if (owner == 'guest') {
          runs[category] = await repository.guestRun(category);
          bests[category] = await repository.guestBest(category);
        } else {
          runs[category] = await repository.resumeCloud(owner, category);
          bests[category] = runs[category]!.best;
        }
      } catch (error) {
        runs[category] = owner == 'guest'
            ? null
            : await repository.cachedCloud(owner, category);
        bests[category] = runs[category]?.best;
        errors[category] = hlErrorMessage(error);
      }
    }),
  );
  return HlLobbyData(
    snapshot: snapshot,
    runs: Map.unmodifiable(runs),
    bests: Map.unmodifiable(bests),
    errors: Map.unmodifiable(errors),
    storageWarning: repository.storageWarning || snapshots.storageWarning,
  );
});

enum HlPhase { loading, ready, submitting, revealing, finished, error }

class HlDuelState {
  const HlDuelState({
    this.phase = HlPhase.loading,
    this.run,
    this.reveal,
    this.message,
    this.storageWarning = false,
  });
  final HlPhase phase;
  final HlRun? run;
  final HlPick? reveal;
  final String? message;
  final bool storageWarning;
}

final hlDuelProvider = NotifierProvider.autoDispose
    .family<HlDuelController, HlDuelState, HlCategory>(HlDuelController.new);

class HlDuelController extends Notifier<HlDuelState> {
  HlDuelController(this.category);
  final HlCategory category;
  Timer? _timer;
  int _generation = 0;
  @override
  HlDuelState build() {
    final owner = ref.watch(
      footyAccountProvider.select((account) => account.owner),
    );
    final generation = ++_generation;
    _timer?.cancel();
    ref.onDispose(() {
      _timer?.cancel();
      _generation++;
    });
    Future.microtask(() => _load(owner, generation));
    return const HlDuelState();
  }

  bool _active(int generation) => ref.mounted && generation == _generation;
  void _ready(HlRun run, {String? message}) {
    final repository = ref.read(hlRepositoryProvider);
    state = HlDuelState(
      phase: run.gameOver ? HlPhase.finished : HlPhase.ready,
      run: run,
      message: message,
      storageWarning:
          repository.storageWarning || repository.snapshots.storageWarning,
    );
  }

  Future<void> _load(String owner, int generation) async {
    try {
      final repository = ref.read(hlRepositoryProvider);
      await repository.snapshots.load();
      final run = owner == 'guest'
          ? await repository.prepareGuest(category)
          : await repository.resumeCloud(owner, category);
      if (_active(generation)) _ready(run);
    } catch (error) {
      if (_active(generation)) {
        state = HlDuelState(
          phase: HlPhase.error,
          run: state.run,
          message: hlErrorMessage(error),
        );
      }
    }
  }

  Future<void> recover() async {
    _timer?.cancel();
    final generation = ++_generation;
    final owner = ref.read(footyAccountProvider).owner;
    state = HlDuelState(phase: HlPhase.loading, run: state.run);
    await _load(owner, generation);
  }

  Future<void> pick(HlSide side) async {
    if (state.phase != HlPhase.ready || state.run == null) return;
    final before = state.run!;
    final generation = _generation;
    final owner = ref.read(footyAccountProvider).owner;
    final repository = ref.read(hlRepositoryProvider);
    state = HlDuelState(phase: HlPhase.submitting, run: before);
    try {
      HlPick result;
      if (owner == 'guest') {
        result = await repository.pickGuest(before, side);
      } else {
        final after = await repository.pickCloud(owner, before, side);
        if (!_active(generation)) return;
        if (after.id != before.id ||
            after.revision != before.revision + 1 ||
            after.score != before.score + (after.gameOver ? 0 : 1)) {
          _ready(
            after,
            message: 'Your progress was updated on another device. This is your saved comparison.',
          );
          return;
        }
        result = HlPick(
          before: before,
          after: after,
          side: side,
          correct: !after.gameOver,
        );
        unawaited(ref.read(footyAccountProvider.notifier).refresh());
      }
      if (!_active(generation)) return;
      state = HlDuelState(
        phase: HlPhase.revealing,
        run: result.after,
        reveal: result,
        storageWarning:
            repository.storageWarning || repository.snapshots.storageWarning,
      );
      _timer = Timer(const Duration(milliseconds: 1200), () {
        if (_active(generation)) _ready(result.after);
      });
    } on HlCloudConflict catch (conflict) {
      if (_active(generation)) {
        _ready(
          conflict.run,
          message: 'Your progress changed on another device. Choose again using this saved comparison.',
        );
      }
    } catch (error) {
      if (_active(generation)) {
        state = HlDuelState(
          phase: HlPhase.error,
          run: before,
          message: hlErrorMessage(error),
        );
      }
    }
  }

  Future<void> restart() async {
    if (state.phase == HlPhase.submitting || state.phase == HlPhase.loading) {
      return;
    }
    final before = state.run;
    final owner = ref.read(footyAccountProvider).owner;
    final generation = ++_generation;
    _timer?.cancel();
    state = HlDuelState(phase: HlPhase.loading, run: before);
    try {
      final repository = ref.read(hlRepositoryProvider);
      final run = owner == 'guest'
          ? await repository.prepareGuest(category, restart: true)
          : await repository.restartCloud(
              owner,
              before ?? await repository.resumeCloud(owner, category),
            );
      if (_active(generation)) _ready(run);
    } on HlCloudConflict catch (conflict) {
      if (_active(generation)) {
        _ready(
          conflict.run,
          message: 'Your account streak changed elsewhere. The saved run has been restored.',
        );
      }
    } catch (error) {
      if (_active(generation)) {
        state = HlDuelState(
          phase: HlPhase.error,
          run: before,
          message: hlErrorMessage(error),
        );
      }
    }
  }

  void pause() {
    _timer?.cancel();
    if (state.phase == HlPhase.revealing && state.run != null) {
      _ready(state.run!);
    }
  }
}

import 'dart:async';
import 'dart:math';

import 'package:uuid/uuid.dart';

import '../domain/higher_lower_engine.dart';
import '../domain/higher_lower_models.dart';
import 'higher_lower_api.dart';
import 'higher_lower_snapshots.dart';
import 'higher_lower_store.dart';

class HlCloudConflict implements Exception {
  const HlCloudConflict(this.run);
  final HlRun run;
}

class HlGameRepository {
  HlGameRepository({
    required this.store,
    required this.snapshots,
    required this.api,
    Random? random,
  }) : random = random ?? Random();
  final HlStore store;
  final HlSnapshots snapshots;
  final HlApi api;
  final Random random;
  final _uuid = const Uuid();
  Future<Map<String, dynamic>>? _guest;
  Future<void> _guestQueue = Future.value();
  final Map<String, Future<void>> _cloudQueues = {};
  final Map<String, Map<String, dynamic>> _cloud = {};
  bool storageWarning = false;

  Future<Map<String, dynamic>> _guestData() => _guest ??= () async {
    try {
      final raw = await store.read('guest');
      if (raw != null &&
          raw['version'] == 1 &&
          raw['runs'] is Map &&
          raw['bests'] is Map &&
          raw['xp'] is int &&
          (raw['xp'] as int) >= 0) {
        return raw;
      }
      if (raw != null) storageWarning = true;
    } catch (_) {
      storageWarning = true;
    }
    return <String, dynamic>{
      'version': 1,
      'xp': 0,
      'runs': <String, dynamic>{},
      'bests': <String, dynamic>{},
    };
  }();
  Future<T> _guestTransaction<T>(Future<T> Function() operation) {
    final result = _guestQueue.then((_) => operation());
    _guestQueue = result.then<void>(
      (_) {},
      onError: (Object _, StackTrace _) {},
    );
    return result;
  }

  Future<void> _saveGuest(Map<String, dynamic> document) async {
    try {
      await store.write('guest', document);
    } catch (_) {
      storageWarning = true;
    }
  }

  Future<int> guestXp() async => (await _guestData())['xp'] as int;
  Future<int> guestBest(HlCategory category) async =>
      hlInt(hlMap((await _guestData())['bests'])[category.name] ?? 0);
  Future<HlRun?> guestRun(HlCategory category) async {
    final raw = hlMap((await _guestData())['runs'])[category.name];
    if (raw == null) return null;
    try {
      final run = HlRun.fromJson(hlMap(raw));
      if (run.category != category) throw const FormatException();
      return run;
    } catch (_) {
      storageWarning = true;
      return null;
    }
  }

  Future<HlRun> prepareGuest(HlCategory category, {bool restart = false}) =>
      _guestTransaction(() async {
        final saved = await guestRun(category);
        if (saved != null && !restart) return saved;
        final snapshot = await snapshots.current();
        await snapshots.pin(snapshot);
        final run = HlEngine.create(
          snapshot,
          snapshots.media.players(snapshot),
          category,
          _uuid.v4(),
          random,
          best: await guestBest(category),
        );
        final document = await _guestData();
        hlMap(document['runs']);
        (document['runs'] as Map)[category.name] = run.toJson();
        await _saveGuest(document);
        return run;
      });
  Future<HlPick> pickGuest(HlRun expected, HlSide side) =>
      _guestTransaction(() async {
        final saved = await guestRun(expected.category);
        if (saved == null ||
            saved.id != expected.id ||
            saved.revision != expected.revision) {
          throw StateError(
            'This streak changed. Reload it before choosing again.',
          );
        }
        final snapshot = await snapshots.version(saved.version);
        final pick = HlEngine.pick(
          saved,
          side,
          snapshots.media.players(snapshot),
          random,
        );
        final document = await _guestData();
        (document['runs'] as Map)[saved.category.name] = pick.after.toJson();
        (document['bests'] as Map)[saved.category.name] = pick.after.best;
        document['xp'] = (document['xp'] as int) + (pick.correct ? 15 : 0);
        await _saveGuest(document);
        return pick;
      });

  String _key(String owner, HlCategory category) => '$owner:${category.name}';
  Future<T> _cloudTransaction<T>(
    String owner,
    HlCategory category,
    Future<T> Function() operation,
  ) {
    final key = _key(owner, category);
    final result = (_cloudQueues[key] ?? Future.value()).then(
      (_) => operation(),
    );
    _cloudQueues[key] = result.then<void>(
      (_) {},
      onError: (Object _, StackTrace _) {},
    );
    return result;
  }

  Future<Map<String, dynamic>> _cloudData(
    String owner,
    HlCategory category,
  ) async {
    final key = _key(owner, category);
    if (_cloud.containsKey(key)) return _cloud[key]!;
    Map<String, dynamic>? saved;
    try {
      saved = await store.read(key);
    } catch (_) {
      storageWarning = true;
    }
    return _cloud[key] = saved ?? <String, dynamic>{};
  }

  Future<void> _saveCloud(
    String owner,
    HlCategory category,
    Map<String, dynamic> document, {
    bool required = false,
  }) async {
    try {
      await store.write(_key(owner, category), document);
    } catch (_) {
      storageWarning = true;
      if (required) {
        throw StateError(
          'Your device could not save this action. Please retry before continuing.',
        );
      }
    }
  }

  Future<HlRun?> cachedCloud(String owner, HlCategory category) async {
    final data = await _cloudData(owner, category);
    try {
      return data['run'] == null ? null : HlRun.fromJson(hlMap(data['run']));
    } catch (_) {
      storageWarning = true;
      return null;
    }
  }

  Map<String, dynamic> _body(
    HlCategory category,
    String action, {
    HlRun? before,
    HlSide? side,
  }) => {
    'mode': 'higher-lower',
    'variant': category.name,
    'action': action,
    'requestId': _uuid.v4(),
    if (before != null) ...{'runId': before.id, 'revision': before.revision},
    if (side != null) 'side': side.name,
  };
  Future<HlRun> _sendPending(
    String owner,
    HlCategory category,
    Map<String, dynamic> document,
  ) async {
    final pending = hlMap(document['pending']);
    HlRun result;
    try {
      result = await api.send(pending, owner: owner);
    } on HlApiException catch (error) {
      if (error.status != 409) rethrow;
      // A conflict definitively rejected this action. Reload; never apply it to the new pair.
      document.remove('pending');
      await _saveCloud(owner, category, document);
      result = await api.send(_body(category, 'resume'), owner: owner);
      document['run'] = result.toJson();
      await _saveCloud(owner, category, document);
      throw HlCloudConflict(result);
    }
    document['run'] = result.toJson();
    document.remove('pending');
    await _saveCloud(owner, category, document);
    return result;
  }

  Future<HlRun> resumeCloud(String owner, HlCategory category) =>
      _cloudTransaction(owner, category, () async {
        final document = await _cloudData(owner, category);
        if (document['pending'] != null) {
          try {
            return await _sendPending(owner, category, document);
          } on HlCloudConflict catch (conflict) {
            return conflict.run;
          }
        }
        final run = await api.send(_body(category, 'resume'), owner: owner);
        document['run'] = run.toJson();
        await _saveCloud(owner, category, document);
        return run;
      });
  Future<HlRun> _cloudAction(
    String owner,
    HlRun before,
    String action, {
    HlSide? side,
  }) => _cloudTransaction(owner, before.category, () async {
    final document = await _cloudData(owner, before.category);
    // A timed-out action is retried first, using its original identifier and payload.
    if (document['pending'] != null) {
      return _sendPending(owner, before.category, document);
    }
    final pending = _body(before.category, action, before: before, side: side);
    document['pending'] = pending;
    try {
      await _saveCloud(owner, before.category, document, required: true);
    } catch (_) {
      document.remove('pending');
      rethrow;
    }
    return _sendPending(owner, before.category, document);
  });
  Future<HlRun> restartCloud(String owner, HlRun before) =>
      _cloudTransaction(owner, before.category, () async {
        final document = await _cloudData(owner, before.category);
        final previousPending = document['pending'];
        if (previousPending != null &&
            hlMap(previousPending)['action'] == 'restart') {
          return _sendPending(owner, before.category, document);
        }
        // An explicit restart first checks authoritative progress. This also
        // allows recovery from a permanently rejected old dataset/pick.
        final saved = await api.send(
          _body(before.category, 'resume'),
          owner: owner,
        );
        document['run'] = saved.toJson();
        document['pending'] = _body(before.category, 'restart', before: saved);
        try {
          await _saveCloud(owner, before.category, document, required: true);
        } catch (_) {
          if (previousPending == null) {
            document.remove('pending');
          } else {
            document['pending'] = previousPending;
          }
          rethrow;
        }
        return _sendPending(owner, before.category, document);
      });
  Future<HlRun> pickCloud(String owner, HlRun before, HlSide side) =>
      _cloudAction(owner, before, 'pick', side: side);
}

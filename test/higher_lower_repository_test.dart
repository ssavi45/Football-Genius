import 'dart:convert';
import 'dart:io';
import 'dart:math';

import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:football_genius/features/games/higher_lower/data/higher_lower_api.dart';
import 'package:football_genius/features/games/higher_lower/data/higher_lower_repository.dart';
import 'package:football_genius/features/games/higher_lower/data/higher_lower_snapshots.dart';
import 'package:football_genius/features/games/higher_lower/data/higher_lower_store.dart';
import 'package:football_genius/features/games/higher_lower/data/higher_lower_store_native.dart';
import 'package:football_genius/features/games/higher_lower/domain/higher_lower_engine.dart';
import 'package:football_genius/features/games/higher_lower/domain/higher_lower_models.dart';

class _FailingStore extends HlMemoryStore {
  @override
  Future<void> write(String key, Map<String, dynamic> value) async =>
      throw const FileSystemException('Full disk');
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  final origin = Uri.parse('https://www.footygen.online');
  late HlStore store;
  late HlSnapshots snapshots;
  late HlRun fixture;
  setUp(() async {
    store = HlMemoryStore();
    snapshots = HlSnapshots(
      store: store,
      client: MockClient((_) async => http.Response('{}', 503)),
      origin: origin,
    );
    final seed = await snapshots.load();
    fixture = HlEngine.create(
      seed,
      snapshots.media.players(seed),
      HlCategory.marketValue,
      'server-run',
      Random(5),
    );
  });
  HlGameRepository repository(
    http.Client client, {
    HlStore? disk,
    HlSnapshots? data,
  }) => HlGameRepository(
    store: disk ?? store,
    snapshots: data ?? snapshots,
    api: HlApi(
      client: client,
      origin: origin,
      token: (_) async => 'test-token',
    ),
    random: Random(11),
  );
  http.Response reply(HlRun run) => http.Response.bytes(
    utf8.encode(
      jsonEncode({
        'runId': run.id,
        'revision': run.revision,
        'state': Map<String, dynamic>.from(run.toJson())
          ..remove('id')
          ..remove('revision'),
      }),
    ),
    200,
  );
  HlSide winner(HlRun run) =>
      run.left.value(run.category)! >= run.right.value(run.category)!
      ? HlSide.left
      : HlSide.right;

  test('guest saves survive new repository instances and duplicate picks cannot earn twice', () async {
    final repo = repository(
      MockClient((_) async => throw StateError('Guest must not call cloud')),
    );
    final initial = await repo.prepareGuest(HlCategory.marketValue);
    final pick = await repo.pickGuest(initial, winner(initial));
    expect(pick.after.xp, 15);
    expect(await repo.guestXp(), 15);
    await expectLater(
      repo.pickGuest(initial, winner(initial)),
      throwsStateError,
    );
    expect(await repo.guestXp(), 15);
    final restored = repository(
      MockClient((_) async => http.Response('{}', 500)),
    );
    expect(
      (await restored.prepareGuest(HlCategory.marketValue)).toJson(),
      pick.after.toJson(),
    );
    await restored.prepareGuest(HlCategory.goals);
    expect((await restored.prepareGuest(HlCategory.marketValue)).score, 1);
    expect(
      (await restored.prepareGuest(HlCategory.marketValue, restart: true)).best,
      1,
    );
  });
  test(
    'native file storage atomically replaces and restores complete JSON',
    () async {
      final directory = await Directory.systemTemp.createTemp(
        'footygen-hl-test-',
      );
      addTearDown(() => directory.delete(recursive: true));
      final disk = HlFileStore(directory: directory);
      await disk.write('guest', {'version': 1});
      await disk.write('guest', {'version': 2, 'name': 'Mbappé'});
      expect(await HlFileStore(directory: directory).read('guest'), {
        'version': 2,
        'name': 'Mbappé',
      });
      expect(directory.listSync().whereType<File>().length, 1);
    },
  );
  test('invalid refresh keeps the playable snapshot; active guest version stays pinned', () async {
    final seed = await snapshots.current();
    final raw = jsonDecode(jsonEncode(seed.raw)) as Map<String, dynamic>;
    final client = MockClient(
      (_) async => http.Response.bytes(utf8.encode(jsonEncode(raw)), 200),
    );
    final data = HlSnapshots(store: store, client: client, origin: origin);
    final repo = repository(client, data: data);
    final run = await repo.prepareGuest(HlCategory.assists);
    raw['version'] = 'new-publication';
    raw['createdAt'] = seed.createdAt
        .add(const Duration(days: 1))
        .toIso8601String();
    expect((await data.refresh(force: true)).version, 'new-publication');
    final publishedAt = (await data.current()).createdAt;
    raw['createdAt'] = publishedAt
        .add(const Duration(days: 1))
        .toIso8601String();
    expect((await data.refresh(force: true)).createdAt, publishedAt);
    expect(data.refreshFailed, isTrue);
    final pick = await repo.pickGuest(run, winner(run));
    expect(pick.after.version, seed.version);
    raw['playerCount'] = 3;
    expect((await data.refresh(force: true)).version, 'new-publication');
    expect(data.refreshFailed, isTrue);
  });
  test('media mapping selects a published optimized identity path', () async {
    expect(
      snapshots.media.image(
        '/img/higher-lower/players/aguero.png?v=old',
        width: 256,
      ),
      contains('/img/optimized/'),
    );
    expect(snapshots.media.image('javascript:bad'), isNull);
    expect(snapshots.media.image(null), isNull);
    final alternateApi = HlSnapshots(
      store: HlMemoryStore(),
      client: MockClient((_) async => http.Response('{}', 503)),
      origin: Uri.parse('https://api.example.test'),
    );
    await alternateApi.load();
    expect(
      Uri.parse(
        alternateApi.media.image('/img/higher-lower/players/aguero.png')!,
      ).host,
      'www.footygen.online',
    );
  });
  test(
    'API sends the existing bearer, mode, category and side contract',
    () async {
      final client = MockClient((request) async {
        expect(request.url.path, '/api/game-progress');
        expect(request.headers['Authorization'], 'Bearer test-token');
        final body = jsonDecode(request.body) as Map<String, dynamic>;
        expect(body['mode'], 'higher-lower');
        expect(body['variant'], 'marketValue');
        expect(body['action'], 'pick');
        expect(body['side'], 'right');
        expect(body['revision'], 0);
        expect(body['runId'], fixture.id);
        expect(body['requestId'], matches(RegExp(r'^[a-f0-9-]{36}$')));
        return reply(
          HlRun.fromJson({
            ...fixture.toJson(),
            'gameOver': true,
            'revision': 1,
            'lastPick': 'right',
          }),
        );
      });
      await repository(client).pickCloud('account:one', fixture, HlSide.right);
      expect(await repository(client).guestXp(), 0);
    },
  );
  test(
    'an expired token refreshes once with an identical request body',
    () async {
      final bodies = <String>[], tokens = <bool>[];
      final api = HlApi(
        origin: origin,
        token: (refresh) async {
          tokens.add(refresh);
          return refresh ? 'new' : 'expired';
        },
        client: MockClient((request) async {
          bodies.add(request.body);
          return bodies.length == 1
              ? http.Response('{"error":"expired"}', 401)
              : reply(fixture);
        }),
      );
      await api.send({
        'mode': 'higher-lower',
        'variant': 'marketValue',
        'action': 'resume',
        'requestId': 'same-id',
      });
      expect(tokens, [false, true]);
      expect(bodies.first, bodies.last);
    },
  );
  test(
    'a lost response persists its request; app restart retries that exact UUID',
    () async {
      final sent = <Map<String, dynamic>>[];
      final accepted = HlRun.fromJson({
        ...fixture.toJson(),
        'score': 1,
        'best': 1,
        'revision': 1,
      });
      final client = MockClient((request) async {
        sent.add(jsonDecode(request.body) as Map<String, dynamic>);
        if (sent.length == 1) {
          throw http.ClientException('Lost connection after commit');
        }
        return reply(accepted);
      });
      await expectLater(
        repository(client).pickCloud('account:one', fixture, HlSide.left),
        throwsA(isA<HlApiException>()),
      );
      final restored = await repository(client)
          .resumeCloud('account:one', HlCategory.marketValue);
      expect(sent, hasLength(2));
      expect(sent[0], sent[1]);
      expect(restored.score, 1);
      expect((await store.read('account:one:marketValue'))!['pending'], isNull);
      expect(await repository(client).guestXp(), 0);
    },
  );
  test(
    '409 restores the account run without replaying the old choice',
    () async {
      final actions = <String>[];
      final newer = HlRun.fromJson({
        ...fixture.toJson(),
        'score': 4,
        'best': 4,
        'revision': 8,
      });
      final client = MockClient((request) async {
        final action = (jsonDecode(request.body) as Map)['action'] as String;
        actions.add(action);
        return action == 'pick'
            ? http.Response('{"error":"changed elsewhere"}', 409)
            : reply(newer);
      });
      await expectLater(
        repository(client).pickCloud('account:one', fixture, HlSide.left),
        throwsA(isA<HlCloudConflict>()),
      );
      expect(actions, ['pick', 'resume']);
      expect(
        (await repository(
          client,
        ).cachedCloud('account:one', HlCategory.marketValue))!.revision,
        8,
      );
    },
  );
  test(
    'an account switch during token refresh cannot send the old owner action',
    () async {
      var owner = 'one';
      var calls = 0;
      final api = HlApi(
        origin: origin,
        userId: () => owner,
        token: (refresh) async {
          if (refresh) owner = 'two';
          return refresh ? 'other-account' : 'expired';
        },
        client: MockClient((request) async {
          calls++;
          return http.Response('{"error":"expired"}', 401);
        }),
      );
      await expectLater(
        api.send({
          'variant': 'marketValue',
          'action': 'pick',
        }, owner: 'account:one'),
        throwsA(isA<HlApiException>().having((e) => e.status, 'status', 401)),
      );
      expect(calls, 1);
    },
  );
  test('explicit cloud restart uses authoritative revision after an uncertain pick', () async {
    final bodies = <Map<String, dynamic>>[];
    final saved = HlRun.fromJson({
      ...fixture.toJson(),
      'revision': 5,
      'score': 2,
      'best': 2,
    });
    final restarted = HlRun.fromJson({
      ...fixture.toJson(),
      'id': 'restarted',
      'best': 2,
    });
    final client = MockClient((request) async {
      final body = jsonDecode(request.body) as Map<String, dynamic>;
      bodies.add(body);
      if (body['action'] == 'pick') throw http.ClientException('Response lost');
      return reply(body['action'] == 'resume' ? saved : restarted);
    });
    final repo = repository(client);
    await expectLater(
      repo.pickCloud('account:one', fixture, HlSide.left),
      throwsA(isA<HlApiException>()),
    );
    final run = await repo.restartCloud('account:one', fixture);
    expect(bodies.map((body) => body['action']), ['pick', 'resume', 'restart']);
    expect(bodies.last['revision'], 5);
    expect(bodies.last['runId'], saved.id);
    expect(run.id, 'restarted');
    expect(run.best, 2);
    expect(await repo.guestXp(), 0);
  });
  test('an uncertain restart retries its original request after reopening the repository', () async {
    final bodies = <Map<String, dynamic>>[];
    final client = MockClient((request) async {
      final body = jsonDecode(request.body) as Map<String, dynamic>;
      bodies.add(body);
      if (body['action'] == 'resume') return reply(fixture);
      if (bodies.length == 2) {
        throw http.ClientException('Restart response lost');
      }
      return reply(
        HlRun.fromJson({...fixture.toJson(), 'id': 'next-run', 'revision': 1}),
      );
    });
    await expectLater(
      repository(client).restartCloud('account:one', fixture),
      throwsA(isA<HlApiException>()),
    );
    final restored = await repository(client)
        .restartCloud('account:one', fixture);
    expect(bodies.map((body) => body['action']), [
      'resume',
      'restart',
      'restart',
    ]);
    expect(bodies[1], bodies[2]);
    expect(restored.id, 'next-run');
  });
  test('account storage failure prevents sending a mutation without durable retry data', () async {
    var calls = 0;
    final client = MockClient((_) async {
      calls++;
      return reply(fixture);
    });
    await expectLater(
      repository(
        client,
        disk: _FailingStore(),
      ).pickCloud('account:one', fixture, HlSide.left),
      throwsStateError,
    );
    expect(calls, 0);
  });
  test('guest remains playable in memory when local storage fails', () async {
    final repo = repository(
      MockClient((_) async => http.Response('{}', 503)),
      disk: _FailingStore(),
    );
    final run = await repo.prepareGuest(HlCategory.goals);
    await repo.pickGuest(run, winner(run));
    expect(await repo.guestXp(), 15);
    expect(repo.storageWarning, isTrue);
  });
}

import 'dart:async';
import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:football_genius/core/auth/footy_account.dart';
import 'package:football_genius/features/games/higher_lower/domain/higher_lower_models.dart';
import 'package:football_genius/features/games/higher_lower/presentation/controllers/higher_lower_providers.dart';

import 'support/higher_lower_harness.dart';

Future<void> until(bool Function() condition) async {
  for (var i = 0; i < 200 && !condition(); i++) {
    await Future<void>.delayed(const Duration(milliseconds: 5));
  }
  expect(
    condition(),
    isTrue,
    reason: 'Controller did not reach its expected state',
  );
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  late HlHarness harness;
  late ProviderContainer container;
  setUp(() async {
    harness = await HlHarness.create();
    container = harness.container();
  });
  tearDown(() async {
    container.dispose();
    await harness.dispose();
  });
  test('double taps commit once and an interrupted reveal resumes the committed pair', () async {
    final provider = hlDuelProvider(HlCategory.marketValue);
    final sub = container.listen(provider, (_, _) {});
    addTearDown(sub.close);
    await until(() => container.read(provider).phase == HlPhase.ready);
    final run = container.read(provider).run!;
    final winner =
        run.left.value(run.category)! >= run.right.value(run.category)!
        ? HlSide.left
        : HlSide.right;
    final controller = container.read(provider.notifier);
    await Future.wait([controller.pick(winner), controller.pick(winner)]);
    expect(container.read(provider).phase, HlPhase.revealing);
    expect(container.read(provider).run!.score, 1);
    expect(await harness.repository.guestXp(), 15);
    controller.pause();
    expect(container.read(provider).phase, HlPhase.ready);
    await controller.recover();
    expect(container.read(provider).run!.score, 1);
    expect(await harness.repository.guestXp(), 15);
  });
  test('wrong picks finish, and restart keeps the personal best with hidden opening values', () async {
    final provider = hlDuelProvider(HlCategory.goals);
    final sub = container.listen(provider, (_, _) {});
    addTearDown(sub.close);
    await until(() => container.read(provider).phase == HlPhase.ready);
    var run = container.read(provider).run!;
    final winner =
        run.left.value(run.category)! >= run.right.value(run.category)!
        ? HlSide.left
        : HlSide.right;
    await container.read(provider.notifier).pick(winner);
    container.read(provider.notifier).pause();
    run = container.read(provider).run!;
    final loser = run.left.value(run.category)! > run.right.value(run.category)!
        ? HlSide.right
        : HlSide.left;
    expect(run.left.value(run.category), isNot(run.right.value(run.category)));
    await container.read(provider.notifier).pick(loser);
    container.read(provider.notifier).pause();
    expect(container.read(provider).phase, HlPhase.finished);
    await container.read(provider.notifier).restart();
    run = container.read(provider).run!;
    expect(run.score, 0);
    expect(run.best, 1);
    expect(run.currentSide, isNull);
  });
  test('sign-in, guest practice and sign-out never migrate guest XP', () async {
    final local = await harness.repository.prepareGuest(HlCategory.marketValue);
    final side =
        local.left.value(local.category)! >= local.right.value(local.category)!
        ? HlSide.left
        : HlSide.right;
    await harness.repository.pickGuest(local, side);
    final sub = container.listen(footyAccountProvider, (_, _) {});
    addTearDown(sub.close);
    await container.read(footyAccountProvider.notifier).signIn();
    await until(
      () =>
          container.read(footyAccountProvider).owner == 'account:test-account',
    );
    expect(await harness.repository.guestXp(), 15);
    container.read(footyAccountProvider.notifier).useGuest();
    expect(container.read(footyAccountProvider).owner, 'guest');
    expect(
      (await harness.repository.guestRun(HlCategory.marketValue))!.score,
      1,
    );
    container.read(footyAccountProvider.notifier).useAccount();
    await container.read(footyAccountProvider.notifier).signOut();
    await until(() => container.read(footyAccountProvider).userId == null);
  });
  test('account lobby resumes all four API slots and keeps unknown records nullable', () async {
    final requested = <String>[];
    late HlHarness other;
    other = await HlHarness.create(
      client: MockClient((request) async {
        if (request.method == 'GET') return http.Response('{}', 503);
        final body = jsonDecode(request.body) as Map<String, dynamic>;
        expect(body['mode'], 'higher-lower');
        expect(body['action'], 'resume');
        expect(request.headers['Authorization'], 'Bearer fixture-bearer');
        requested.add(body['variant'] as String);
        if (body['variant'] == 'assists') {
          return http.Response('{"error":"offline"}', 503);
        }
        final run = await other.repository.prepareGuest(
          HlCategory.parse(body['variant'] as String),
        );
        return http.Response.bytes(
          utf8.encode(
            jsonEncode({'runId': run.id, 'revision': 0, 'state': run.toJson()}),
          ),
          200,
        );
      }),
    );
    other.account.id = 'test-account';
    final scope = other.container();
    addTearDown(() async {
      scope.dispose();
      await other.dispose();
    });
    final sub = scope.listen(hlLobbyProvider, (_, _) {});
    addTearDown(sub.close);
    final lobby = await scope.read(hlLobbyProvider.future);
    expect(
      requested,
      unorderedEquals(['marketValue', 'goals', 'assists', 'transfer']),
    );
    expect(lobby.bests[HlCategory.assists], isNull);
    expect(lobby.errors.keys, [HlCategory.assists]);
    expect(lobby.bests[HlCategory.goals], 0);
    expect(await other.repository.guestXp(), 0);
  });
  test(
    'a late account profile cannot switch guest practice back to account play',
    () async {
      final profile = Completer<FootyProfile?>();
      harness.account.id = 'test-account';
      harness.account.pendingProfile = profile.future;
      final sub = container.listen(footyAccountProvider, (_, _) {});
      addTearDown(sub.close);
      await Future<void>.delayed(const Duration(milliseconds: 10));
      container.read(footyAccountProvider.notifier).useGuest();
      profile.complete(
        const FootyProfile(id: 'test-account', name: 'Late profile', xp: 300),
      );
      await Future<void>.delayed(const Duration(milliseconds: 10));
      expect(container.read(footyAccountProvider).owner, 'guest');
      expect(container.read(footyAccountProvider).busy, isFalse);
    },
  );
  test(
    'authentication callback errors leave guest gameplay available',
    () async {
      final sub = container.listen(footyAccountProvider, (_, _) {});
      addTearDown(sub.close);
      await Future<void>.delayed(const Duration(milliseconds: 10));
      harness.account.events.addError(StateError('Cancelled OAuth callback'));
      await until(() => container.read(footyAccountProvider).error != null);
      expect(container.read(footyAccountProvider).owner, 'guest');
      expect(container.read(footyAccountProvider).busy, isFalse);
      expect(
        (await harness.repository.prepareGuest(HlCategory.goals)).score,
        0,
      );
    },
  );
  test(
    'disposing during an account request does not apply late UI state',
    () async {
      final response = Completer<http.Response>();
      final other = await HlHarness.create(
        client: MockClient((request) async {
          if (request.method == 'GET') return http.Response('{}', 503);
          return response.future;
        }),
      );
      other.account.id = 'test-account';
      final scope = other.container();
      final provider = hlDuelProvider(HlCategory.assists);
      final sub = scope.listen(provider, (_, _) {});
      await Future<void>.delayed(const Duration(milliseconds: 20));
      sub.close();
      scope.dispose();
      final run = await other.repository.prepareGuest(HlCategory.assists);
      response.complete(
        http.Response.bytes(
          utf8.encode(
            jsonEncode({'runId': run.id, 'revision': 0, 'state': run.toJson()}),
          ),
          200,
        ),
      );
      await Future<void>.delayed(const Duration(milliseconds: 40));
      await other.dispose();
    },
  );
}

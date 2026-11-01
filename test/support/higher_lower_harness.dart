import 'dart:async';
import 'dart:math';

import 'package:flutter/painting.dart';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:football_genius/core/auth/footy_account.dart';
import 'package:football_genius/features/games/higher_lower/data/higher_lower_api.dart';
import 'package:football_genius/features/games/higher_lower/data/higher_lower_repository.dart';
import 'package:football_genius/features/games/higher_lower/data/higher_lower_snapshots.dart';
import 'package:football_genius/features/games/higher_lower/data/higher_lower_store.dart';
import 'package:football_genius/features/games/higher_lower/presentation/controllers/higher_lower_providers.dart';
import 'package:football_genius/features/games/higher_lower/presentation/widgets/higher_lower_widgets.dart';

class FakeFootyAccount implements FootyAccountGateway {
  final events = StreamController<void>.broadcast();
  String? id;
  Future<FootyProfile?>? pendingProfile;
  @override
  bool get configured => true;
  @override
  String? get userId => id;
  @override
  Stream<void> get changes => events.stream;
  @override
  Future<FootyProfile?> profile() async =>
      pendingProfile ??
      (id == null ? null : FootyProfile(id: id!, name: 'Test scout', xp: 150));
  @override
  Future<String?> accessToken({bool refresh = false}) async =>
      id == null ? null : 'fixture-bearer';
  @override
  Future<void> signIn() async {
    id = 'test-account';
    events.add(null);
  }

  @override
  Future<void> signOut() async {
    id = null;
    events.add(null);
  }

  Future<void> dispose() => events.close();
}

class HlHarness {
  HlHarness._(
    this.store,
    this.client,
    this.snapshots,
    this.repository,
    this.account,
  );
  final HlMemoryStore store;
  final http.Client client;
  final HlSnapshots snapshots;
  final HlGameRepository repository;
  final FakeFootyAccount account;
  static Future<HlHarness> create({
    HlMemoryStore? store,
    http.Client? client,
  }) async {
    final disk = store ?? HlMemoryStore();
    final transport =
        client ?? MockClient((_) async => http.Response('{}', 503));
    final origin = Uri.parse('https://www.footygen.online');
    final snapshots = HlSnapshots(
      store: disk,
      client: transport,
      origin: origin,
    );
    await snapshots.load();
    final account = FakeFootyAccount();
    final repository = HlGameRepository(
      store: disk,
      snapshots: snapshots,
      random: Random(41),
      api: HlApi(
        client: transport,
        origin: origin,
        token: (refresh) => account.accessToken(refresh: refresh),
        userId: () => account.userId,
      ),
    );
    return HlHarness._(disk, transport, snapshots, repository, account);
  }

  ProviderContainer container({
    Map<String, ImageProvider<Object>> imageOverrides = const {},
  }) => ProviderContainer(
    overrides: [
      hlStoreProvider.overrideWithValue(store),
      hlHttpProvider.overrideWithValue(client),
      hlSnapshotsProvider.overrideWithValue(snapshots),
      hlRepositoryProvider.overrideWithValue(repository),
      footyAccountGatewayProvider.overrideWithValue(account),
      hlImagesEnabledProvider.overrideWithValue(false),
      hlIdentityImageOverridesProvider.overrideWithValue(imageOverrides),
    ],
  );
  Future<void> dispose() async {
    client.close();
    await account.dispose();
  }
}

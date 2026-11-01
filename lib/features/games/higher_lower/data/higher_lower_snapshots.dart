import 'dart:convert';

import 'package:flutter/services.dart';
import 'package:http/http.dart' as http;
import 'package:football_genius/core/network/footygen_api_config.dart';

import '../domain/higher_lower_models.dart';
import 'higher_lower_media.dart';
import 'higher_lower_store.dart';

class HlSnapshots {
  HlSnapshots({
    required this.store,
    required this.client,
    required this.origin,
    AssetBundle? bundle,
  }) : bundle = bundle ?? rootBundle;
  final HlStore store;
  final http.Client client;
  final Uri origin;
  final AssetBundle bundle;
  final Map<String, HlSnapshot> _versions = {};
  HlSnapshot? _current;
  HlMedia? _media;
  Future<HlSnapshot>? _initial;
  Future<HlSnapshot>? _refresh;
  DateTime? _checked;
  bool storageWarning = false;
  bool refreshFailed = false;
  HlMedia get media => _media!;
  Future<HlSnapshot> load() => _initial ??= _load();
  Future<HlSnapshot> _load() async {
    final seed = HlSnapshot.fromJson(
      hlMap(
        jsonDecode(
          await bundle.loadString('assets/data/higher_lower_snapshot.json'),
        ),
      ),
    );
    _media = HlMedia(
      hlMap(
        jsonDecode(
          await bundle.loadString('assets/data/higher_lower_media.json'),
        ),
      ),
      FootygenApiConfig.websiteOrigin,
    );
    _versions[seed.version] = seed;
    _current = seed;
    try {
      final cached = await store.read('snapshot.current');
      if (cached != null) {
        final snapshot = HlSnapshot.fromJson(cached);
        if (!snapshot.createdAt.isBefore(seed.createdAt)) {
          _current = snapshot;
          _versions[snapshot.version] = snapshot;
        }
      }
    } catch (_) {
      storageWarning = true;
    }
    return _current!;
  }

  Future<void> pin(HlSnapshot snapshot) async {
    _versions[snapshot.version] = snapshot;
    try {
      await store.write('snapshot:${snapshot.version}', snapshot.raw);
    } catch (_) {
      storageWarning = true;
    }
  }

  Future<HlSnapshot> version(String version) async {
    await load();
    if (_versions.containsKey(version)) return _versions[version]!;
    try {
      final raw = await store.read('snapshot:$version');
      if (raw != null) {
        final saved = HlSnapshot.fromJson(raw);
        if (saved.version == version) {
          _versions[version] = saved;
          return saved;
        }
      }
    } catch (_) {
      storageWarning = true;
    }
    throw StateError(
      'The data for this saved streak is unavailable. Start a new streak to continue.',
    );
  }

  Future<HlSnapshot> current() async {
    await load();
    return _current!;
  }

  Future<HlSnapshot> refresh({bool force = false}) async {
    await load();
    if (_refresh != null) return _refresh!;
    if (!force &&
        _checked != null &&
        DateTime.now().difference(_checked!) < const Duration(minutes: 1)) {
      return _current!;
    }
    _refresh = _fetch();
    try {
      return await _refresh!;
    } finally {
      _refresh = null;
    }
  }

  Future<HlSnapshot> _fetch() async {
    _checked = DateTime.now();
    try {
      final response = await client
          .get(origin.resolve('/api/higher-lower/snapshot'))
          .timeout(const Duration(seconds: 8));
      if (response.statusCode != 200) throw StateError('Snapshot unavailable');
      final candidate = HlSnapshot.fromJson(
        hlMap(jsonDecode(utf8.decode(response.bodyBytes))),
      );
      if (candidate.createdAt.isBefore(_current!.createdAt)) {
        throw const FormatException('Older publication');
      }
      final known = _versions[candidate.version];
      if (known != null) {
        if (known.createdAt != candidate.createdAt) {
          throw const FormatException('A publication version cannot be reused');
        }
        // Published versions are immutable, including versions pinned by runs.
        _current = known;
        refreshFailed = false;
        return known;
      }
      if (media
              .players(candidate)
              .where((p) => p.eligible(HlCategory.marketValue))
              .length <
          3) {
        throw const FormatException('Missing identity mappings');
      }
      await pin(candidate);
      _current = candidate;
      try {
        await store.write('snapshot.current', candidate.raw);
      } catch (_) {
        storageWarning = true;
      }
      refreshFailed = false;
    } catch (_) {
      refreshFailed = true;
    }
    return _current!;
  }
}

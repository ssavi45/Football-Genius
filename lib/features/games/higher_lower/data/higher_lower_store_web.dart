import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import 'higher_lower_store_base.dart';

HlStore createStore() => _PreferenceStore();

class _PreferenceStore implements HlStore {
  @override
  Future<Map<String, dynamic>?> read(String key) async {
    final text = (await SharedPreferences.getInstance()).getString(
      'hl_v1:$key',
    );
    return text == null ? null : jsonDecode(text) as Map<String, dynamic>;
  }

  @override
  Future<void> write(String key, Map<String, dynamic> value) async {
    if (!await (await SharedPreferences.getInstance()).setString(
      'hl_v1:$key',
      jsonEncode(value),
    )) {
      throw StateError('Device storage is unavailable.');
    }
  }
}

import 'dart:convert';

abstract class HlStore {
  Future<Map<String, dynamic>?> read(String key);
  Future<void> write(String key, Map<String, dynamic> value);
}

class HlMemoryStore implements HlStore {
  final Map<String, String> entries = {};
  @override
  Future<Map<String, dynamic>?> read(String key) async => entries[key] == null
      ? null
      : jsonDecode(entries[key]!) as Map<String, dynamic>;
  @override
  Future<void> write(String key, Map<String, dynamic> value) async {
    entries[key] = jsonEncode(value);
  }
}

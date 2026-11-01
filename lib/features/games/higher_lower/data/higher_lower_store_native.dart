import 'dart:convert';
import 'dart:io';

import 'package:path_provider/path_provider.dart';
import 'package:uuid/uuid.dart';

import 'higher_lower_store_base.dart';

HlStore createStore() => HlFileStore();

class HlFileStore implements HlStore {
  HlFileStore({Directory? directory}) : _providedDirectory = directory;
  final Directory? _providedDirectory;
  Future<Directory>? _directory;
  Future<void> _writes = Future.value();
  Future<Directory> _root() => _directory ??= () async {
    final base =
        _providedDirectory ??
        Directory(
          '${(await getApplicationSupportDirectory()).path}/higher_lower_v1',
        );
    await base.create(recursive: true);
    return base;
  }();
  Future<File> _file(String key) async => File(
    '${(await _root()).path}/${base64Url.encode(utf8.encode(key)).replaceAll('=', '')}.json',
  );
  @override
  Future<Map<String, dynamic>?> read(String key) async {
    await _writes.catchError((Object _) {});
    final file = await _file(key);
    if (!await file.exists()) return null;
    return jsonDecode(await file.readAsString()) as Map<String, dynamic>;
  }

  @override
  Future<void> write(String key, Map<String, dynamic> value) {
    final encoded = jsonEncode(value);
    final result = _writes.catchError((Object _) {}).then((_) async {
      final file = await _file(key);
      final temporary = File('${file.path}.${const Uuid().v4()}.tmp');
      try {
        await temporary.writeAsString(encoded, flush: true);
        await temporary.rename(file.path);
      } finally {
        if (await temporary.exists()) await temporary.delete();
      }
    });
    _writes = result;
    return result;
  }
}

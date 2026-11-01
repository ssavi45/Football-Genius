import 'higher_lower_store_base.dart';
import 'higher_lower_store_native.dart'
    if (dart.library.js_interop) 'higher_lower_store_web.dart'
    as platform;
export 'higher_lower_store_base.dart';

HlStore createHlStore() => platform.createStore();

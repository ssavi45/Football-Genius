import 'package:supabase_flutter/supabase_flutter.dart';

import 'footygen_api_config.dart';

class SupabaseConfig {
  SupabaseConfig._();

  static const String url = String.fromEnvironment('SUPABASE_URL');
  static const String anonKey = String.fromEnvironment(
    'SUPABASE_PUBLISHABLE_KEY',
    defaultValue: String.fromEnvironment('SUPABASE_ANON_KEY'),
  );

  static bool get isConfigured => url.isNotEmpty && anonKey.isNotEmpty;
  static bool _initialized = false;
  static bool get isInitialized => _initialized;

  static Future<void> initialize() async {
    // Gameplay uses bundled match data, so a backend is optional.
    if (url.isEmpty && anonKey.isEmpty) return;
    if (!isConfigured) {
      throw StateError(
        'Set both SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY '
        '(or SUPABASE_ANON_KEY) using --dart-define-from-file.',
      );
    }

    await Supabase.initialize(
      url: url,
      publishableKey: anonKey,
      authOptions: FlutterAuthClientOptions(
        authFlowType: AuthFlowType.pkce,
        detectSessionInUriPredicate: (uri) =>
            uri.scheme == Uri.parse(FootygenApiConfig.authRedirect).scheme &&
            uri.host == 'login-callback' &&
            uri.path == '/',
      ),
    );
    _initialized = true;
  }

  static SupabaseClient get client {
    if (!isConfigured) {
      throw StateError(
        'Supabase is not configured. Run with '
        '--dart-define-from-file=config/dev.json to enable backend features.',
      );
    }
    return Supabase.instance.client;
  }
}

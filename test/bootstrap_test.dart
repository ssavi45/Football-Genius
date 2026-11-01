import 'package:flutter_test/flutter_test.dart';
import 'package:football_genius/bootstrap.dart';
import 'package:football_genius/core/network/supabase_config.dart';
import 'package:football_genius/core/router/app_router.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  test('app bootstraps without a backend for offline development', () async {
    await bootstrap();
    addTearDown(AppRouter.router.dispose);

    expect(AppRouter.router, isNotNull);
    expect(SupabaseConfig.isConfigured, isFalse);
    expect(() => SupabaseConfig.client, throwsStateError);
  }, skip: SupabaseConfig.url.isNotEmpty || SupabaseConfig.anonKey.isNotEmpty);
}

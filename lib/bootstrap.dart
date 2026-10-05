import 'package:flutter/material.dart';
import 'app.dart';
import 'core/network/supabase_config.dart';
import 'core/router/app_router.dart';

/// Initializes application services and configurations prior to UI render.
Future<void> bootstrap() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize router with app feature routes
  AppRouter.initialize(routes: FootballGeniusApp.appRoutes);

  // Initialize Supabase client
  try {
    await SupabaseConfig.initialize();
  } catch (e) {
    debugPrint('Supabase initialization warning: $e');
  }
}


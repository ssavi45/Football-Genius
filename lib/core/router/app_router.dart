import 'package:go_router/go_router.dart';

/// Application router manager in core infrastructure.
/// Pure infrastructure: Does not depend on features/.
class AppRouter {
  AppRouter._();

  static GoRouter? _router;

  static GoRouter get router {
    assert(
      _router != null,
      'AppRouter has not been initialized. Call AppRouter.initialize() before accessing router.',
    );
    return _router!;
  }

  static void initialize({
    required List<RouteBase> routes,
    String initialLocation = '/',
  }) {
    _router = GoRouter(
      initialLocation: initialLocation,
      routes: routes,
    );
  }
}

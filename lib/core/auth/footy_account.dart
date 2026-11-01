import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../network/footygen_api_config.dart';
import '../network/supabase_config.dart';

class FootyProfile {
  const FootyProfile({
    required this.id,
    required this.name,
    required this.xp,
    this.avatar,
  });
  final String id;
  final String name;
  final int xp;
  final String? avatar;
}

abstract class FootyAccountGateway {
  bool get configured;
  String? get userId;
  Stream<void> get changes;
  Future<FootyProfile?> profile();
  Future<String?> accessToken({bool refresh = false});
  Future<void> signIn();
  Future<void> signOut();
}

class SupabaseAccountGateway implements FootyAccountGateway {
  SupabaseAccountGateway(this.client);
  final SupabaseClient? client;
  @override
  bool get configured => client != null;
  @override
  String? get userId => client?.auth.currentUser?.id;
  @override
  Stream<void> get changes =>
      client?.auth.onAuthStateChange.map((_) {}) ?? const Stream.empty();
  @override
  Future<FootyProfile?> profile() async {
    final id = userId;
    if (id == null) return null;
    final row = await client!
        .from('profiles')
        .select('id,username,avatar_url,total_xp')
        .eq('id', id)
        .single();
    return FootyProfile(
      id: id,
      name: row['username'] as String? ?? 'Football fan',
      xp: (row['total_xp'] as num).toInt(),
      avatar: row['avatar_url'] as String?,
    );
  }

  @override
  Future<String?> accessToken({bool refresh = false}) async {
    if (client == null) return null;
    var session = client!.auth.currentSession;
    if (session != null && (refresh || session.isExpired)) {
      session = (await client!.auth.refreshSession()).session;
    }
    return session?.accessToken;
  }

  @override
  Future<void> signIn() async {
    if (client == null) {
      throw StateError(
        'Sign-in is unavailable. You can still play as a guest.',
      );
    }
    final launched = await client!.auth.signInWithOAuth(
      OAuthProvider.google,
      redirectTo: FootygenApiConfig.authRedirect,
      authScreenLaunchMode: LaunchMode.externalApplication,
    );
    if (!launched) {
      throw StateError('Could not open Google sign-in. Please try again.');
    }
  }

  @override
  Future<void> signOut() async =>
      client?.auth.signOut(scope: SignOutScope.local);
}

final footyAccountGatewayProvider = Provider<FootyAccountGateway>((ref) {
  SupabaseClient? client;
  if (SupabaseConfig.isInitialized) client = SupabaseConfig.client;
  return SupabaseAccountGateway(client);
});

class FootyAccountState {
  const FootyAccountState({
    this.userId,
    this.profile,
    this.busy = false,
    this.practice = false,
    this.error,
  });
  final String? userId;
  final FootyProfile? profile;
  final bool busy;
  final bool practice;
  final String? error;
  bool get isGuest => userId == null || practice;
  String get owner => isGuest ? 'guest' : 'account:$userId';
}

final footyAccountProvider =
    NotifierProvider<FootyAccountController, FootyAccountState>(
      FootyAccountController.new,
    );

class FootyAccountController extends Notifier<FootyAccountState> {
  int _generation = 0;
  @override
  FootyAccountState build() {
    final gateway = ref.watch(footyAccountGatewayProvider);
    final subscription = gateway.changes.listen(
      (_) => unawaited(refresh()),
      onError: (Object _, StackTrace _) {
        if (!ref.mounted) return;
        _generation++;
        state = FootyAccountState(
          userId: state.userId,
          profile: state.profile,
          practice: state.practice,
          error: 'Your account connection could not be completed. Please retry or play as a guest.',
        );
      },
    );
    ref.onDispose(() {
      _generation++;
      unawaited(subscription.cancel());
    });
    Future.microtask(refresh);
    return FootyAccountState(
      userId: gateway.userId,
      busy: gateway.userId != null,
    );
  }

  Future<void> refresh() async {
    final generation = ++_generation;
    final gateway = ref.read(footyAccountGatewayProvider);
    final id = gateway.userId;
    final practice = id == state.userId && state.practice;
    state = FootyAccountState(
      userId: id,
      profile: id == state.userId ? state.profile : null,
      busy: id != null,
      practice: practice,
    );
    if (id == null) return;
    try {
      final profile = await gateway.profile();
      if (ref.mounted && generation == _generation) {
        state = FootyAccountState(
          userId: id,
          profile: profile,
          practice: practice,
        );
      }
    } catch (_) {
      if (ref.mounted && generation == _generation) {
        state = FootyAccountState(
          userId: id,
          profile: state.profile,
          practice: practice,
          error: 'Your account details could not be refreshed. Please retry.',
        );
      }
    }
  }

  Future<void> signIn() async {
    state = FootyAccountState(
      userId: state.userId,
      profile: state.profile,
      practice: state.practice,
      busy: true,
    );
    try {
      await ref.read(footyAccountGatewayProvider).signIn();
      if (ref.mounted) {
        state = FootyAccountState(
          userId: state.userId,
          profile: state.profile,
          practice: state.practice,
        );
      }
    } catch (_) {
      if (ref.mounted) {
        state = FootyAccountState(
          userId: state.userId,
          profile: state.profile,
          practice: state.practice,
          error: 'Google sign-in could not be opened. You can keep playing as a guest.',
        );
      }
    }
  }

  Future<void> signOut() async {
    try {
      await ref.read(footyAccountGatewayProvider).signOut();
      if (ref.mounted) {
        _generation++;
        state = const FootyAccountState();
      }
    } catch (_) {
      if (ref.mounted) {
        state = FootyAccountState(
          userId: state.userId,
          profile: state.profile,
          practice: state.practice,
          error: 'Could not sign out. Please retry.',
        );
      }
    }
  }

  void useGuest() {
    _generation++;
    state = FootyAccountState(
      userId: state.userId,
      profile: state.profile,
      practice: true,
    );
  }

  void useAccount() {
    _generation++;
    state = FootyAccountState(userId: state.userId, profile: state.profile);
    unawaited(refresh());
  }
}

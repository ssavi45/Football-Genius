import 'dart:async';
import 'dart:convert';

import 'package:http/http.dart' as http;

import '../domain/higher_lower_models.dart';

class HlApiException implements Exception {
  const HlApiException(this.status, this.message);
  final int status;
  final String message;
  @override
  String toString() => message;
}

class HlApi {
  HlApi({
    required this.client,
    required this.origin,
    required this.token,
    this.userId,
  });
  final http.Client client;
  final Uri origin;
  final Future<String?> Function(bool refresh) token;
  final String? Function()? userId;
  Future<HlRun> send(Map<String, dynamic> body, {String? owner}) async {
    for (var attempt = 0; attempt < 2; attempt++) {
      String? bearer;
      try {
        bearer = await token(attempt == 1);
      } catch (_) {
        throw const HlApiException(
          401,
          'Please sign in again to reconnect your saved streak.',
        );
      }
      if (bearer == null) {
        throw const HlApiException(
          401,
          'Please sign in to sync your progress.',
        );
      }
      if (owner != null && userId != null && owner != 'account:${userId!()}') {
        throw const HlApiException(
          401,
          'The signed-in account changed. Reopen this streak to reconnect.',
        );
      }
      http.Response response;
      try {
        response = await client
            .post(
              origin.resolve('/api/game-progress'),
              headers: {
                'Authorization': 'Bearer $bearer',
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              },
              body: jsonEncode(body),
            )
            .timeout(const Duration(seconds: 12));
      } on TimeoutException {
        throw const HlApiException(
          0,
          'The connection timed out. Reconnect to check your saved pick.',
        );
      } catch (_) {
        throw const HlApiException(
          0,
          'You are offline. Reconnect to continue your account streak.',
        );
      }
      if (response.statusCode == 401 && attempt == 0) continue;
      Map<String, dynamic> data;
      try {
        data = hlMap(jsonDecode(utf8.decode(response.bodyBytes)));
      } catch (_) {
        throw const HlApiException(
          502,
          'The game service returned an unreadable response. Please retry.',
        );
      }
      if (response.statusCode != 200) {
        throw HlApiException(
          response.statusCode,
          data['error'] as String? ??
              'Your progress could not be synced. Please retry.',
        );
      }
      try {
        final run = HlRun.fromCloud(data);
        if (run.category.name != body['variant']) {
          throw const FormatException('Wrong category');
        }
        return run;
      } catch (_) {
        throw const HlApiException(
          502,
          'The saved comparison could not be loaded. Please retry.',
        );
      }
    }
    throw const HlApiException(401, 'Please sign in again.');
  }
}

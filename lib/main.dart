import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'app.dart';
import 'bootstrap.dart';

void main() async {
  await bootstrap();

  runApp(
    const ProviderScope(
      child: FootballGeniusApp(),
    ),
  );
}


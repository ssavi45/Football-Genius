import 'package:flutter/material.dart';

/// Design tokens matching the Football Genius night stadium aesthetic.
class AppColors {
  AppColors._();

  // Backgrounds
  static const Color pitchBlack = Color(0xFF060E08);
  static const Color pitchDark = Color(0xFF0C1F12);
  static const Color pitchCard = Color(0xFF0E1E12);
  static const Color surface = Color(0x0DFFFFFF); // ~5% white
  static const Color surfaceGlass = Color(0x12FFFFFF); // ~7% white

  // Accents
  static const Color neonGreen = Color(0xFF2ECC71);
  static const Color trophyGold = Color(0xFFD4AF37);
  static const Color errorRed = Color(0xFFEF4444);

  // Typography
  static const Color textPrimary = Color(0xFFEAF0EA);
  static const Color textSecondary = Color(0xFF9EAFA1);
  static const Color textMuted = Color(0x66FFFFFF);

  // Borders & Glows
  static const Color borderLight = Color(0x1AFFFFFF);
  static const Color glowGreen = Color(0x332ECC71);
  static const Color glowGold = Color(0x33D4AF37);
}

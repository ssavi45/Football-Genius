import 'package:flutter/material.dart';

/// Design tokens matching the FootyGen / Football Genius night stadium aesthetic.
class AppColors {
  AppColors._();

  // Backgrounds
  static const Color pitchBlack = Color(0xFF050B07);
  static const Color pitchDark = Color(0xFF08140B);
  static const Color pitchCard = Color(0xFF0A160E);
  static const Color darkPill = Color(0xFF0A150E);
  static const Color surface = Color(0x0DFFFFFF); // ~5% white
  static const Color surfaceGlass = Color(0x14FFFFFF); // ~8% white
  static const Color surfaceSubtle = Color(0x1AFFFFFF); // ~10% white

  // Accents
  static const Color neonGreen = Color(0xFF2EFD72);
  static const Color neonGreenGlow = Color(0x552EFD72);
  static const Color trophyGold = Color(0xFFFFC72C);
  static const Color flameOrange = Color(0xFFFF7A00);
  static const Color errorRed = Color(0xFFEF4444);

  // Typography
  static const Color textPrimary = Color(0xFFFFFFFF);
  static const Color textSecondary = Color(0xFF8E9F92);
  static const Color textMuted = Color(0x80FFFFFF);

  // Borders & Glows
  static const Color borderLight = Color(0x1AFFFFFF);
  static const Color borderSubtle = Color(0x14FFFFFF);
  static const Color glowGreen = Color(0x332EFD72);
  static const Color glowGold = Color(0x33FFC72C);

  // Grid Cell Colors
  static const Color gridSilhouette = Color(0xFF0F1E13);
  static const Color gridSilhouetteIcon = Color(0xFF253B2B);
}

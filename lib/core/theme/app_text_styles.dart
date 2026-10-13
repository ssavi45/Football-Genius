import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../constants/app_colors.dart';

/// Centralized text styles for the FootyGen app.
/// Uses Outfit for body/UI text and Orbitron for game/display headings.
class AppTextStyles {
  AppTextStyles._();

  // === Display / Game Title Styles (Orbitron) ===
  
  /// Large game title like "Football Matrix", "Pixel Pitch"
  static TextStyle get gameTitle => GoogleFonts.orbitron(
    fontSize: 24,
    fontWeight: FontWeight.w800,
    color: AppColors.textPrimary,
    letterSpacing: -0.5,
    height: 1.1,
  );

  /// Smaller game title for cards
  static TextStyle get gameTitleSmall => GoogleFonts.orbitron(
    fontSize: 14,
    fontWeight: FontWeight.w700,
    color: AppColors.textPrimary,
    height: 1.15,
  );

  /// Section headers like "Quick Play", "Game Modes"
  static TextStyle get sectionTitle => GoogleFonts.outfit(
    fontSize: 18,
    fontWeight: FontWeight.w800,
    color: AppColors.textPrimary,
    letterSpacing: -0.3,
  );

  /// Brand name style
  static TextStyle get brandName => GoogleFonts.outfit(
    fontSize: 24,
    fontWeight: FontWeight.w900,
    letterSpacing: -0.5,
    color: AppColors.textPrimary,
  );

  // === Kicker / Label Styles ===
  
  /// Kicker tag like "TODAY'S CHALLENGE"
  static TextStyle get kicker => GoogleFonts.outfit(
    fontSize: 11,
    fontWeight: FontWeight.w900,
    letterSpacing: 1.4,
    color: AppColors.neonGreen,
  );

  /// Category badge labels
  static TextStyle get badge => GoogleFonts.outfit(
    fontSize: 10,
    fontWeight: FontWeight.w700,
    letterSpacing: 0.5,
  );

  // === Body Styles ===
  
  /// Primary body text
  static TextStyle get bodyPrimary => GoogleFonts.outfit(
    fontSize: 13,
    fontWeight: FontWeight.w500,
    color: AppColors.textPrimary,
  );

  /// Secondary/subtitle body text
  static TextStyle get bodySecondary => GoogleFonts.outfit(
    fontSize: 12,
    fontWeight: FontWeight.w500,
    color: AppColors.textSecondary,
  );

  /// Small caption text
  static TextStyle get caption => GoogleFonts.outfit(
    fontSize: 11,
    fontWeight: FontWeight.w500,
    color: AppColors.textSecondary,
  );

  // === Button Styles ===
  
  /// CTA button text
  static TextStyle get buttonPrimary => GoogleFonts.outfit(
    fontSize: 15,
    fontWeight: FontWeight.w800,
    color: Colors.black,
  );

  /// Small pill button text
  static TextStyle get buttonSmall => GoogleFonts.outfit(
    fontSize: 12,
    fontWeight: FontWeight.w800,
    color: AppColors.textPrimary,
  );

  // === Stat / Data Styles ===
  
  /// Large stat number
  static TextStyle get statValue => GoogleFonts.outfit(
    fontSize: 13,
    fontWeight: FontWeight.w800,
    color: AppColors.textPrimary,
    height: 1.1,
  );

  /// Stat label
  static TextStyle get statLabel => GoogleFonts.outfit(
    fontSize: 11,
    fontWeight: FontWeight.w500,
    color: AppColors.textSecondary,
  );
}

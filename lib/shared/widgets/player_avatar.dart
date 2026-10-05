import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';

/// Reusable player or user avatar widget.
class PlayerAvatar extends StatelessWidget {
  final String? imagePath;
  final String? initials;
  final double radius;
  final Color borderColor;
  final double borderWidth;

  const PlayerAvatar({
    super.key,
    this.imagePath,
    this.initials,
    this.radius = 20,
    this.borderColor = AppColors.borderSubtle,
    this.borderWidth = 1.5,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: radius * 2,
      height: radius * 2,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(color: borderColor, width: borderWidth),
        color: AppColors.pitchCard,
      ),
      child: ClipOval(
        child: imagePath != null && imagePath!.isNotEmpty
            ? Image.asset(
                imagePath!,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) => _buildPlaceholder(),
              )
            : _buildPlaceholder(),
      ),
    );
  }

  Widget _buildPlaceholder() {
    return Center(
      child: initials != null && initials!.isNotEmpty
          ? Text(
              initials!,
              style: TextStyle(
                color: AppColors.textPrimary,
                fontSize: radius * 0.7,
                fontWeight: FontWeight.bold,
              ),
            )
          : Icon(
              Icons.person,
              size: radius,
              color: AppColors.textSecondary,
            ),
    );
  }
}

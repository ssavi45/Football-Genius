import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';

enum FGButtonVariant {
  primary,
  secondary,
  outline,
}

/// A branded, reusable button component following FootyGen visual language.
class FGButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final IconData? icon;
  final IconData? trailingIcon;
  final FGButtonVariant variant;
  final double height;
  final bool isFullWidth;
  final bool isLoading;

  const FGButton({
    super.key,
    required this.label,
    this.onPressed,
    this.icon,
    this.trailingIcon,
    this.variant = FGButtonVariant.primary,
    this.height = 48,
    this.isFullWidth = true,
    this.isLoading = false,
  });

  @override
  Widget build(BuildContext context) {
    Color backgroundColor;
    Color foregroundColor;
    BorderSide borderSide;

    switch (variant) {
      case FGButtonVariant.primary:
        backgroundColor = AppColors.neonGreen;
        foregroundColor = Colors.black;
        borderSide = BorderSide.none;
        break;
      case FGButtonVariant.secondary:
        backgroundColor = AppColors.surfaceSubtle;
        foregroundColor = AppColors.textPrimary;
        borderSide = BorderSide.none;
        break;
      case FGButtonVariant.outline:
        backgroundColor = Colors.transparent;
        foregroundColor = AppColors.neonGreen;
        borderSide = const BorderSide(color: AppColors.neonGreen, width: 1.5);
        break;
    }

    Widget content = Row(
      mainAxisAlignment: MainAxisAlignment.center,
      mainAxisSize: isFullWidth ? MainAxisSize.max : MainAxisSize.min,
      children: [
        if (isLoading)
          SizedBox(
            width: 20,
            height: 20,
            child: CircularProgressIndicator(
              strokeWidth: 2,
              valueColor: AlwaysStoppedAnimation<Color>(foregroundColor),
            ),
          )
        else ...[
          if (icon != null) ...[
            Icon(icon, size: 20, color: foregroundColor),
            const SizedBox(width: 8),
          ],
          Text(
            label,
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w800,
              color: foregroundColor,
              letterSpacing: 0.2,
            ),
          ),
          if (trailingIcon != null) ...[
            const Spacer(),
            Icon(trailingIcon, size: 16, color: foregroundColor),
          ],
        ],
      ],
    );

    return SizedBox(
      height: height,
      width: isFullWidth ? double.infinity : null,
      child: ElevatedButton(
        onPressed: isLoading ? null : onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: backgroundColor,
          foregroundColor: foregroundColor,
          side: borderSide,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(height / 2),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 20),
        ),
        child: content,
      ),
    );
  }
}


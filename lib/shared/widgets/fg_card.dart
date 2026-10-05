import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';

/// A glowing glassmorphic card container following FootyGen dark-pitch aesthetic.
class FGCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry padding;
  final EdgeInsetsGeometry margin;
  final Color? borderColor;
  final Color? glowColor;
  final double borderRadius;
  final VoidCallback? onTap;

  const FGCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(16),
    this.margin = EdgeInsets.zero,
    this.borderColor,
    this.glowColor,
    this.borderRadius = 20,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final border = borderColor ?? AppColors.borderSubtle;
    final glow = glowColor ?? Colors.transparent;

    Widget cardBody = Container(
      margin: margin,
      decoration: BoxDecoration(
        color: AppColors.pitchCard,
        borderRadius: BorderRadius.circular(borderRadius),
        border: Border.all(color: border),
        boxShadow: glow != Colors.transparent
            ? [
                BoxShadow(
                  color: glow.withAlpha(30),
                  blurRadius: 16,
                  spreadRadius: 1,
                ),
              ]
            : null,
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(borderRadius - 1),
        child: Padding(
          padding: padding,
          child: child,
        ),
      ),
    );

    if (onTap != null) {
      return GestureDetector(
        onTap: onTap,
        child: cardBody,
      );
    }

    return cardBody;
  }
}

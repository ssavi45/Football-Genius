import 'package:flutter/material.dart';
import '../../../../shared/widgets/fg_bottom_nav_bar.dart';

/// Home presentation layer alias for the shared navigation bar.
class HomeBottomNavBar extends StatelessWidget {
  final int selectedIndex;
  final ValueChanged<int> onItemSelected;

  const HomeBottomNavBar({
    super.key,
    required this.selectedIndex,
    required this.onItemSelected,
  });

  @override
  Widget build(BuildContext context) {
    return FGBottomNavBar(
      selectedIndex: selectedIndex,
      onItemSelected: onItemSelected,
    );
  }
}


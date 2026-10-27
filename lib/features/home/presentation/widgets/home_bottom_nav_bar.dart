import 'package:flutter/material.dart';

import '../home_style.dart';

/// Shared light dock for Home and Game Modes. Callback interface is unchanged.
class HomeBottomNavBar extends StatelessWidget {
  const HomeBottomNavBar({
    super.key,
    required this.selectedIndex,
    required this.onItemSelected,
  });
  final int selectedIndex;
  final ValueChanged<int> onItemSelected;
  @override
  Widget build(BuildContext context) {
    final u = HomeStyle.unit(context);
    final large = HomeStyle.largeText(context);
    const icons = [
      Icons.home_rounded,
      Icons.sports_esports_rounded,
      Icons.emoji_events_rounded,
      Icons.person_rounded,
    ];
    const labels = ['Home', 'Games', 'Rank', 'Profile'];
    return DecoratedBox(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(17 * u)),
        boxShadow: const [
          BoxShadow(
            color: Color(0x06000000),
            blurRadius: 18,
            offset: Offset(0, -4),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Center(
          heightFactor: 1,
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: HomeStyle.maxWidth),
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: 9 * u, vertical: u),
              child: Row(
                children: [
                  for (var i = 0; i < labels.length; i++)
                    Expanded(
                      child: Semantics(
                        selected: selectedIndex == i,
                        button: true,
                        child: InkWell(
                          onTap: () => onItemSelected(i),
                          borderRadius: BorderRadius.circular(12),
                          child: ConstrainedBox(
                            constraints: const BoxConstraints(minHeight: 48),
                            child: Padding(
                              padding: EdgeInsets.symmetric(vertical: u),
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(
                                    icons[i],
                                    size: 24 * u,
                                    color: selectedIndex == i
                                        ? HomeStyle.teal
                                        : const Color(0xFF888E98),
                                  ),
                                  SizedBox(height: 2 * u),
                                  Text(
                                    labels[i],
                                    style: HomeStyle.text(
                                      (large ? 10 : 11.5) * u,
                                      color: selectedIndex == i
                                          ? HomeStyle.teal
                                          : const Color(0xFF888E98),
                                      weight: FontWeight.w600,
                                    ),
                                  ),
                                  SizedBox(height: 3 * u),
                                  Container(
                                    width: 23 * u,
                                    height: 2.5 * u,
                                    decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(3),
                                      color: selectedIndex == i
                                          ? const Color(0xFF008C62)
                                          : Colors.transparent,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

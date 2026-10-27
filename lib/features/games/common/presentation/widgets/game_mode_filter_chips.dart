import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../home/presentation/home_style.dart';
import '../controllers/games_controller.dart';

class GameModeFilterChips extends ConsumerWidget {
  const GameModeFilterChips({super.key});
  static const categories = ['All', 'Daily', 'Quick Play', 'Duel', 'Trivia'];
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final selected = ref.watch(selectedGameCategoryProvider);
    final u = HomeStyle.unit(context);
    final textHeight = MediaQuery.textScalerOf(context).scale(12 * u);
    return SizedBox(
      height: (textHeight + 28).clamp(48, double.infinity),
      child: ListView.separated(
        padding: EdgeInsets.symmetric(horizontal: 15 * u),
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        itemCount: categories.length,
        separatorBuilder: (_, _) => SizedBox(width: 8 * u),
        itemBuilder: (_, i) {
          final category = categories[i];
          final active = category == selected;
          return Semantics(
            selected: active,
            button: true,
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                borderRadius: BorderRadius.circular(26),
                onTap: () => ref
                    .read(selectedGameCategoryProvider.notifier)
                    .setCategory(category),
                child: Center(
                  child: Ink(
                    padding: EdgeInsets.symmetric(
                      horizontal: 18 * u,
                      vertical: 10 * u,
                    ),
                    decoration: BoxDecoration(
                      color: active ? null : Colors.white,
                      gradient: active ? HomeStyle.goldGradient : null,
                      borderRadius: BorderRadius.circular(26),
                      border: Border.all(
                        color: active
                            ? const Color(0xFFF2CD63)
                            : const Color(0xFFE9E7E0),
                      ),
                    ),
                    child: Text(
                      category,
                      style: HomeStyle.text(
                        12 * u,
                        color: active ? HomeStyle.ink : const Color(0xFF747C82),
                        weight: active ? FontWeight.w700 : FontWeight.w500,
                      ),
                    ),
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

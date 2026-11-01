import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../domain/higher_lower_models.dart';
import '../controllers/higher_lower_providers.dart';
import '../higher_lower_style.dart';
import 'higher_lower_widgets.dart';

void showHlRecords(BuildContext context, {HlLobbyData? lobby}) =>
    hlSheet(context, HlRecordsSheet(lobby: lobby));

class HlRecordsSheet extends ConsumerWidget {
  const HlRecordsSheet({super.key, this.lobby});
  final HlLobbyData? lobby;
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final data = lobby == null ? ref.watch(hlLobbyProvider) : AsyncData(lobby!);
    return data.when(
      loading: () => const Padding(
        padding: EdgeInsets.all(32),
        child: Center(child: CircularProgressIndicator()),
      ),
      error: (error, _) => Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          HlNotice(hlErrorMessage(error), error: true),
          HlButton(
            label: 'Try again',
            onPressed: () => ref.invalidate(hlLobbyProvider),
          ),
        ],
      ),
      data: (value) => Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Your personal records',
            style: HlStyle.text(25, weight: FontWeight.w800),
          ),
          const SizedBox(height: 8),
          Text(
            'A best streak for every challenge.',
            style: HlStyle.text(14, color: HlStyle.muted),
          ),
          const SizedBox(height: 20),
          for (final category in HlCategory.values)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 12),
              child: Row(
                children: [
                  Icon(HlStyle.icon(category), color: HlStyle.teal),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      category.label,
                      style: HlStyle.text(16, weight: FontWeight.w600),
                    ),
                  ),
                  Text(
                    value.bests[category]?.toString() ?? 'Unavailable',
                    style: HlStyle.text(20, weight: FontWeight.w800),
                  ),
                ],
              ),
            ),
          const SizedBox(height: 18),
          HlButton(
            label: 'Back to challenges',
            onPressed: () => Navigator.pop(context),
          ),
        ],
      ),
    );
  }
}

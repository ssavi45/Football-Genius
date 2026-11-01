import 'dart:math' as math;

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:football_genius/core/auth/footy_account.dart';
import 'package:football_genius/core/router/app_routes.dart';

import '../../domain/higher_lower_models.dart';
import '../controllers/higher_lower_providers.dart';
import '../higher_lower_style.dart';

void hlBack(BuildContext context) {
  if (context.canPop()) {
    context.pop();
  } else {
    context.go(AppRoutes.games);
  }
}

class HlScaffold extends StatelessWidget {
  const HlScaffold({
    super.key,
    required this.title,
    required this.body,
    this.actions = const [],
    this.onBack,
  });
  final String title;
  final Widget body;
  final List<Widget> actions;
  final VoidCallback? onBack;
  @override
  Widget build(BuildContext context) => AnnotatedRegion<SystemUiOverlayStyle>(
    value: HlStyle.systemBars,
    child: Theme(
      data: HlStyle.theme,
      child: Scaffold(
        appBar: AppBar(
          toolbarHeight: 64,
          leading: IconButton(
            tooltip: 'Back',
            onPressed: onBack ?? () => hlBack(context),
            icon: const Icon(Icons.arrow_back_rounded),
          ),
          title: Text(
            title,
            maxLines: 2,
            style: HlStyle.text(21, weight: FontWeight.w800),
          ),
          actions: actions,
        ),
        body: SafeArea(top: false, child: body),
      ),
    ),
  );
}

class HlButton extends StatelessWidget {
  const HlButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.secondary = false,
    this.icon,
    this.busy = false,
  });
  final String label;
  final VoidCallback? onPressed;
  final bool secondary;
  final IconData? icon;
  final bool busy;
  @override
  Widget build(BuildContext context) => SizedBox(
    width: double.infinity,
    child: FilledButton(
      onPressed: busy ? null : onPressed,
      style: FilledButton.styleFrom(
        minimumSize: const Size(48, 52),
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
        backgroundColor: secondary ? Colors.white : HlStyle.teal,
        foregroundColor: secondary ? HlStyle.ink : Colors.white,
        side: secondary ? const BorderSide(color: HlStyle.line) : null,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          if (busy) ...[
            const SizedBox.square(
              dimension: 18,
              child: CircularProgressIndicator(strokeWidth: 2),
            ),
            const SizedBox(width: 10),
          ] else if (icon != null) ...[
            Icon(icon, size: 20),
            const SizedBox(width: 9),
          ],
          Flexible(
            child: Text(
              label,
              textAlign: TextAlign.center,
              style: HlStyle.text(
                15,
                weight: FontWeight.w700,
                color: secondary ? HlStyle.ink : Colors.white,
              ),
            ),
          ),
        ],
      ),
    ),
  );
}

class HlNotice extends StatelessWidget {
  const HlNotice(this.message, {super.key, this.error = false});
  final String message;
  final bool error;
  @override
  Widget build(BuildContext context) => Container(
    width: double.infinity,
    padding: const EdgeInsets.all(14),
    margin: const EdgeInsets.only(bottom: 12),
    decoration: BoxDecoration(
      color: error ? const Color(0xFFFFECE5) : HlStyle.mint,
      borderRadius: BorderRadius.circular(16),
    ),
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(
          error ? Icons.wifi_off_rounded : Icons.info_outline_rounded,
          size: 19,
          color: HlStyle.ink,
        ),
        const SizedBox(width: 9),
        Expanded(child: Text(message, style: HlStyle.text(13, height: 1.4))),
      ],
    ),
  );
}

final hlIdentityImageOverridesProvider =
    Provider<Map<String, ImageProvider<Object>>>((ref) => const {});

class HlIdentityImage extends ConsumerWidget {
  const HlIdentityImage({
    super.key,
    required this.source,
    required this.name,
    this.width = 80,
    this.height = 100,
    this.portrait = true,
    this.fit = BoxFit.contain,
    this.alignment = Alignment.center,
    this.placeholder,
  });
  final String? source;
  final String name;
  final double width;
  final double height;
  final bool portrait;
  final BoxFit fit;
  final Alignment alignment;
  final Widget? placeholder;
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final initials = name
        .trim()
        .split(RegExp(r'\s+'))
        .where((part) => part.isNotEmpty)
        .take(2)
        .map((part) => part[0])
        .join()
        .toUpperCase();
    final fallback =
        placeholder ??
        ColoredBox(
          color: portrait
              ? HlStyle.mint.withValues(alpha: .7)
              : Colors.transparent,
          child: Center(
            child: Text(
              portrait ? initials : '',
              style: HlStyle.text(
                portrait ? 24 : 10,
                weight: FontWeight.w800,
                color: HlStyle.teal,
              ),
            ),
          ),
        );
    final pixels =
        ((portrait && fit == BoxFit.cover ? math.max(width, height) : width) *
                MediaQuery.devicePixelRatioOf(context))
            .ceil();
    final fixture = ref.watch(
      hlIdentityImageOverridesProvider,
    )[source?.split('?').first];
    if (fixture != null) {
      return ExcludeSemantics(
        child: SizedBox(
          width: width,
          height: height,
          child: Image(
            image: fixture,
            fit: fit,
            alignment: alignment,
            errorBuilder: (_, _, _) => fallback,
          ),
        ),
      );
    }
    final url = ref
        .read(hlSnapshotsProvider)
        .media
        .image(source, width: pixels);
    if (!ref.watch(hlImagesEnabledProvider) || url == null) {
      return SizedBox(width: width, height: height, child: fallback);
    }
    return ExcludeSemantics(
      child: SizedBox(
        width: width,
        height: height,
        child: CachedNetworkImage(
          imageUrl: url,
          fit: fit,
          alignment: alignment,
          memCacheWidth: pixels,
          fadeInDuration: MediaQuery.disableAnimationsOf(context)
              ? Duration.zero
              : const Duration(milliseconds: 120),
          placeholder: (_, _) => fallback,
          errorWidget: (_, _, _) => fallback,
        ),
      ),
    );
  }
}

Future<void> hlSheet(BuildContext context, Widget child) =>
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      sheetAnimationStyle: MediaQuery.disableAnimationsOf(context)
          ? AnimationStyle.noAnimation
          : null,
      useSafeArea: true,
      backgroundColor: HlStyle.background,
      showDragHandle: true,
      constraints: BoxConstraints(
        maxWidth: 560,
        maxHeight: MediaQuery.sizeOf(context).height * .9,
      ),
      builder: (context) => Theme(
        data: HlStyle.theme,
        child: SingleChildScrollView(
          child: Padding(
            padding: EdgeInsets.fromLTRB(
              24,
              0,
              24,
              24 + MediaQuery.viewInsetsOf(context).bottom,
            ),
            child: child,
          ),
        ),
      ),
    );

void showHlHelp(BuildContext context, {HlCategory? category}) {
  hlSheet(
    context,
    Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          'A little instinct. A longer streak.',
          style: HlStyle.text(25, weight: FontWeight.w800),
        ),
        const SizedBox(height: 18),
        for (final (index, text) in [
          'Tap the player with the higher value. Both values start hidden; a retained card stays revealed.',
          'Every correct pick earns 15 XP. Equal values? Either player is correct.',
          'A card stays for at most two matchups, even if it keeps winning.',
          'One wrong pick ends the streak. Your personal best stays saved.',
        ].indexed)
          Padding(
            padding: const EdgeInsets.only(bottom: 16),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                CircleAvatar(
                  radius: 14,
                  backgroundColor: HlStyle.mint,
                  child: Text(
                    '${index + 1}',
                    style: HlStyle.text(12, weight: FontWeight.w800),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(text, style: HlStyle.text(15, height: 1.4)),
                ),
              ],
            ),
          ),
        for (final definition
            in category == null ? HlCategory.values : [category]) ...[
          const Divider(),
          const SizedBox(height: 12),
          Text(
            definition.label,
            style: HlStyle.text(18, weight: FontWeight.w800),
          ),
          const SizedBox(height: 8),
          Text(
            definition.description,
            style: HlStyle.text(14, color: HlStyle.muted, height: 1.5),
          ),
        ],
        const SizedBox(height: 14),
        HlButton(label: 'Got it', onPressed: () => Navigator.pop(context)),
      ],
    ),
  );
}

class HlAccountSheet extends ConsumerWidget {
  const HlAccountSheet({super.key});
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final account = ref.watch(footyAccountProvider);
    final controller = ref.read(footyAccountProvider.notifier);
    final configured = ref.watch(footyAccountGatewayProvider).configured;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (account.profile?.avatar case final String avatar
            when avatar.isNotEmpty)
          ClipOval(
            child: CachedNetworkImage(
              imageUrl: avatar,
              width: 48,
              height: 48,
              fit: BoxFit.cover,
              placeholder: (_, _) => const Icon(
                Icons.person_outline_rounded,
                color: HlStyle.teal,
                size: 38,
              ),
              errorWidget: (_, _, _) => const Icon(
                Icons.person_outline_rounded,
                color: HlStyle.teal,
                size: 38,
              ),
            ),
          )
        else
          const Icon(
            Icons.person_outline_rounded,
            color: HlStyle.teal,
            size: 38,
          ),
        const SizedBox(height: 14),
        Text(
          'Your FootyGen account',
          style: HlStyle.text(25, weight: FontWeight.w800),
        ),
        const SizedBox(height: 12),
        if (account.userId != null) ...[
          Text(
            account.profile?.name ?? 'Signed in',
            style: HlStyle.text(18, weight: FontWeight.w700),
          ),
          const SizedBox(height: 6),
          Text(
            account.profile == null
                ? 'Account details are loading.'
                : '${account.profile!.xp} total FootyGen XP',
            style: HlStyle.text(14, color: HlStyle.muted),
          ),
          if (account.practice) ...[
            const SizedBox(height: 14),
            const HlNotice(
              'You are playing as a guest. Your account streaks are kept separate.',
            ),
            HlButton(
              label: 'Resume account play',
              onPressed: controller.useAccount,
            ),
          ],
          const SizedBox(height: 16),
          HlButton(
            label: 'Sign out on this device',
            secondary: true,
            onPressed: account.busy ? null : controller.signOut,
          ),
        ] else ...[
          Text(
            'Take your streaks with you.',
            style: HlStyle.text(18, weight: FontWeight.w700),
          ),
          const SizedBox(height: 8),
          Text(
            'Sign in with the same Google account you use on FootyGen. Guest progress stays on this device and is not added to your account.',
            style: HlStyle.text(14, color: HlStyle.muted, height: 1.5),
          ),
          const SizedBox(height: 20),
          HlButton(
            label: 'Continue with Google',
            icon: Icons.login_rounded,
            busy: account.busy,
            onPressed: configured ? controller.signIn : null,
          ),
          if (!configured) ...[
            const SizedBox(height: 12),
            Text(
              'Sign-in is unavailable in this build. Guest play is ready.',
              style: HlStyle.text(13, color: HlStyle.muted),
            ),
          ],
        ],
        if (account.error != null) ...[
          const SizedBox(height: 14),
          HlNotice(account.error!, error: true),
        ],
        if (account.userId != null && account.error != null)
          HlButton(
            label: 'Refresh account details',
            onPressed: controller.refresh,
            secondary: true,
          ),
        const SizedBox(height: 18),
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Back to the game'),
        ),
      ],
    );
  }
}

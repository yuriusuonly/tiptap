import 'package:animate_do/animate_do.dart';
import 'package:animations/animations.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/svg.dart';
import 'package:go_router/go_router.dart';
import 'package:tiptap/discover/monetize.dart';
import 'package:tiptap/shared/ai.dart';
import 'package:tiptap/shared/premium.dart';
import 'package:tiptap/shared/root.dart';

class FactDetailsRoute extends GoRoute {
  FactDetailsRoute()
    : super(
        parentNavigatorKey: rootNavigatorKey,
        name: 'fact',
        path: 'fact',
        pageBuilder: (context, state) {
          final data = state.extra as Map<String, dynamic>;
          return CustomTransitionPage(
            key: state.pageKey,
            transitionDuration: Duration(milliseconds: 500),
            reverseTransitionDuration: const Duration(milliseconds: 500),
            transitionsBuilder: (context, animation, secondaryAnimation, child) {
              return SharedAxisTransition(
                animation: animation,
                secondaryAnimation: secondaryAnimation,
                transitionType: SharedAxisTransitionType.scaled,
                child: child
              );
            },
            child: FactDetailsPage(data: data)
          );
        },
        routes: [
          MonetizeRoute()
        ]
      );
}

class FactDetailsPage extends StatelessWidget {
  final Map<String, dynamic> data;

  const FactDetailsPage({
    super.key,
    required this.data
  });

  @override
  Widget build(BuildContext context) {
    final premium = context.watch<PremiumService>();
    context.watch<AIService>();

    final isBookmarked = data['bookmarked'] as bool? ?? false;
    final isRewarded = data['rewarded'] as bool? ?? false;

    return PopScope(
      canPop: true,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return;
      },
      child: Actions(
        actions: {
          DismissIntent: CallbackAction<DismissIntent>(
            onInvoke: (intent) => {
              if (context.mounted) context.pop()
            },
          ),
        },
        child: Shortcuts(
          shortcuts: {
            SingleActivator(LogicalKeyboardKey.escape): const DismissIntent(),
          },
          child: Focus(
            autofocus: true,
            child: Scaffold(
              appBar: AppBar(
                automaticallyImplyLeading: false,
                centerTitle: true,
                actions: [
                  ZoomIn(
                    duration: Duration(milliseconds: 1000),
                    delay: Duration(milliseconds: 1000),
                    child: IconButton(
                      onPressed: () {
                        final isPremium = premium.state == true;
                        if (isRewarded || isPremium) {
                          context.read<AIService>().toggleBookmark(data);
                        } else {
                          context.pushNamed(
                            'monetize',
                            extra: data
                          );
                        }
                      },
                      icon: SvgPicture.asset(
                        isBookmarked ? 'icons/bookmark_filled.svg' : 'icons/bookmark.svg',
                        colorFilter: ColorFilter.mode(
                          isBookmarked
                            ? Theme.of(context).colorScheme.primary
                            : Theme.of(context).colorScheme.onSurfaceVariant,
                          BlendMode.srcIn
                        ),
                        width: 24,
                        height: 24
                      )
                    ),
                  ),
                  const SizedBox(width: 8)
                ],
              ),
              body: Center(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 88),
                  child: Column(
                    spacing: 16,
                    children: [
                      FadeIn(
                        duration: Duration(milliseconds: 1000),
                        delay: Duration(milliseconds: 600),
                        child: Text(
                          '${data['title']}',
                          style: Theme.of(context).textTheme.titleLarge,
                          textAlign: TextAlign.center,
                        ),
                      ),
                      FadeIn(
                        duration: Duration(milliseconds: 1000),
                        delay: Duration(milliseconds: 800),
                        child: Text(
                          '${data['body']}',
                          style: Theme.of(context).textTheme.bodyLarge,
                          textAlign: TextAlign.center
                        ),
                      ),
                    ]
                  )
                )
              ),
              floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
              floatingActionButton: ZoomIn(
                duration: Duration(milliseconds: 1000),
                delay: Duration(milliseconds: 1000),
                child: IconButton.filled(
                  onPressed: () {
                    if (context.mounted) context.pop();
                  },
                  icon: SvgPicture.asset(
                    'icons/close.svg',
                    colorFilter: ColorFilter.mode(
                      Theme.of(context).colorScheme.onPrimary,
                      BlendMode.srcIn
                    ),
                    width: 24,
                    height: 24,
                  ),
                ),
              ),
            )
          )
        )
      )
    );
  }
}

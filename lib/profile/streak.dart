import 'package:animate_do/animate_do.dart';
import 'package:animations/animations.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_svg/svg.dart';
import 'package:go_router/go_router.dart';
import 'package:tiptap/shared/root.dart';

class StreakStatRoute extends GoRoute {
  StreakStatRoute()
    : super(
        parentNavigatorKey: rootNavigatorKey,
        name: 'streak-stat',
        path: 'streak-stat',
        pageBuilder: (context, state) => CustomTransitionPage(
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
          child: StreakStatPage()
        )
      );
}

class StreakStatPage extends StatelessWidget {
  const StreakStatPage({super.key});

  @override
  Widget build(BuildContext context) {
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
              body: Center(
                child: SingleChildScrollView(
                  padding: EdgeInsets.fromLTRB(16, 16, 16, 88),
                  child: Column(
                    spacing: 16,
                    children: [
                      Hero(
                        tag: 'tag-streak-stat',
                        child: SvgPicture.asset(
                          'icons/mode_heat_filled.svg',
                          colorFilter: ColorFilter.mode(
                            Theme.of(context).colorScheme.primary,
                            BlendMode.srcIn
                          ),
                          width: 56,
                          height: 56
                        )
                      ),
                      Column(
                        spacing: 8,
                        children: [
                          FadeIn(
                            duration: Duration(milliseconds: 1000),
                            delay: Duration(milliseconds: 500),
                            child: Text(
                              'Streak',
                              style: Theme.of(context).textTheme.titleLarge,
                            ),
                          ),
                          FadeIn(
                            duration: Duration(milliseconds: 1000),
                            delay: Duration(milliseconds: 700),
                            child: Text(
                              "Your streak shows how many days in a row you've unlocked at least one fact—don't miss a day to keep it going!",
                              style: Theme.of(context).textTheme.bodyLarge,
                              textAlign: TextAlign.center
                            ),
                          )
                        ]
                      )
                    ],
                  ),
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
            ),
          ),
        ),
      ),
    );
  }
}

import 'package:animate_do/animate_do.dart';
import 'package:animations/animations.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_svg/svg.dart';
import 'package:go_router/go_router.dart';
import 'package:tiptap/shared/root.dart';

class GemsStatRoute extends GoRoute {
  GemsStatRoute()
    : super(
        parentNavigatorKey: rootNavigatorKey,
        name: 'gems-stat',
        path: 'gems-stat',
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
          child: GemsStatPage()
        )
      );
}

class GemsStatPage extends StatelessWidget {
  const GemsStatPage({super.key});

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
                        tag: 'tag-gems-stat',
                        child: SvgPicture.asset(
                          'icons/diamond_filled.svg',
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
                              'Gems',
                              style: Theme.of(context).textTheme.titleLarge,
                            ),
                          ),
                          FadeIn(
                            duration: Duration(milliseconds: 1000),
                            delay: Duration(milliseconds: 700),
                            child: Text(
                              "1 Ad = 1 Gem\n"
                              "Use gems to instantly unlock new facts without ads.",
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

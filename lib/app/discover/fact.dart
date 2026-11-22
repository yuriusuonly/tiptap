import 'package:animate_do/animate_do.dart';
import 'package:animations/animations.dart';
import 'package:material_ui/material_ui.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/svg.dart';
import 'package:go_router/go_router.dart';
import 'package:tiptap/app/discover/monetize.dart';
import 'package:tiptap/app/services/bookmark.dart';
import 'package:tiptap/app/services/premium.dart';
import 'package:tiptap/app/shared/root.dart';
import 'package:tiptap/app/shared/route_args.dart';

class FactDetailsRoute extends GoRoute {
  FactDetailsRoute()
    : super(
        parentNavigatorKey: rootNavigatorKey,
        name: 'fact',
        path: 'fact',
        pageBuilder: (context, state) {
          final data = factFromExtra(state.extra);
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
            child: data == null
                ? const InvalidRouteArgumentPage()
                : FactDetailsPage(data: data)
          );
        },
        routes: [
          MonetizeRoute()
        ]
      );
}

class FactDetailsPage extends StatefulWidget {
  final Map<String, dynamic> data;

  const FactDetailsPage({
    super.key,
    required this.data
  });

  @override
  State<FactDetailsPage> createState() => _FactDetailsPageState();
}

class _FactDetailsPageState extends State<FactDetailsPage> {
  late bool _isRewarded;

  @override
  void initState() {
    super.initState();
    _isRewarded = widget.data['rewarded'] as bool? ?? false;
  }

  @override
  Widget build(BuildContext context) {
    final premium = context.watch<PremiumService>();
    final bookmarks = context.watch<BookmarkService>();
    final data = widget.data;
    final isBookmarked = bookmarks.isBookmarked(data);
    final isRewarded = _isRewarded;

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
                      onPressed: () async {
                        final isPremium = await premium.checkPremium();
                        if (!context.mounted) return;
                        if (isRewarded || isPremium) {
                          bookmarks.toggleBookmark(data);
                        } else {
                          await context.pushNamed(
                            'monetize',
                            extra: data
                          );
                          if (!mounted) return;
                          setState(() {
                            _isRewarded = data['rewarded'] as bool? ?? false;
                          });
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

import 'package:animate_do/animate_do.dart';
import 'package:animations/animations.dart';
import 'package:material_ui/material_ui.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/svg.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:tiptap/app/services/ad.dart';
import 'package:tiptap/app/services/bookmark.dart';
import 'package:tiptap/app/services/content.dart';
import 'package:tiptap/app/shared/root.dart';
import 'package:tiptap/app/shared/route_args.dart';
import 'package:tiptap/app/shared/toast.dart';

class MonetizeRoute extends GoRoute {
  MonetizeRoute()
    : super(
        parentNavigatorKey: rootNavigatorKey,
        name: 'monetize',
        path: 'monetize',
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
                : MonetizePage(data: data)
          );
        }
      );
}

class MonetizePage extends StatefulWidget {
  final Map<String, dynamic> data;

  const MonetizePage({
    super.key,
    required this.data
  });

  @override
  State<MonetizePage> createState() => _MonetizePageState();
}

class _MonetizePageState extends State<MonetizePage> {
  bool isAdLoading = false;

  void _showMessage(String text) {
    activeScaffoldMessengerKey.currentState?.showSnackBar(
      SnackBar(content: Text(text)),
    );
  }

  Future<void> handleComplete(bool isRewarded) async {
    final ads = context.read<AdService>();
    final bookmarks = context.read<BookmarkService>();
    final content = context.read<ContentService>();

    if (isRewarded && mounted) setState(() => isAdLoading = true);

    try {
      if (isRewarded) {
        // Only unlock a fact when the ad actually awarded its reward.
        final earned = await ads.showRewardedAd();
        if (!earned) {
          _showMessage('Ad not completed. Please try again.');
          return;
        }
        ads.increaseRewardedAdCount();
      } else {
        if (ads.state < 1) {
          _showMessage('Not enough gems. Watch an ad to earn one.');
          return;
        }
        ads.decreaseRewardedAdCount();
      }

      widget.data['rewarded'] = true;
      content.markAsRewarded(widget.data['title'].toString());
      bookmarks.markBookmarked(widget.data);
      _showMessage('Fact unlocked');
      if (mounted) context.pop();
    } catch (error, stack) {
      reportError(error, stack, context: 'monetize');
      _showMessage('Something went wrong');
    } finally {
      if (mounted) setState(() => isAdLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final ads = context.watch<AdService>();
    final gems = ads.state;

    return PopScope(
      canPop: true,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return;
      },
      child: Actions(
        actions: {
          DismissIntent: CallbackAction<DismissIntent>(
            onInvoke: (intent) => context.mounted ? context.pop() : null,
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
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    spacing: 16,
                    children: [
                      FadeInUp(
                        duration: const Duration(milliseconds: 800),
                        delay: const Duration(milliseconds: 200),
                        child: Badge(
                          label: Text('Gems: ${NumberFormat.compact().format(gems)}'),
                          textColor: Theme.of(context).colorScheme.onPrimary,
                          offset: const Offset(-56, -4),
                          backgroundColor: Theme.of(context).colorScheme.primary,
                          isLabelVisible: true,
                          child: Card(
                            elevation: 0,
                            clipBehavior: Clip.antiAlias,
                            child: InkWell(
                              onTap: gems >= 1 && !isAdLoading
                                ? () async {
                                    await handleComplete(false);
                                  }
                                : null,
                              child: Padding(
                                padding: const EdgeInsets.all(20),
                                child: Row(
                                  children: [
                                    SvgPicture.asset(
                                      'icons/diamond.svg',
                                      colorFilter: ColorFilter.mode(
                                        Theme.of(context).colorScheme.onSurfaceVariant,
                                        BlendMode.srcIn
                                      ),
                                      width: 32,
                                      height: 32
                                    ),
                                    const SizedBox(width: 20),
                                    Expanded(
                                      child: Opacity(
                                        opacity: isAdLoading ? 0.5 : 1.0,
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text('Use Gems', style: Theme.of(context).textTheme.titleMedium),
                                            Text('Spend 1 Gem to save the fact without watching an ad'),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                      FadeInUp(
                        duration: const Duration(milliseconds: 800),
                        delay: const Duration(milliseconds: 300),
                        child: Card(
                          elevation: 0,
                          clipBehavior: Clip.antiAlias,
                          child: InkWell(
                            onTap: !isAdLoading
                              ? () async {
                                  await handleComplete(true);
                                }
                              : null,
                            child: Padding(
                              padding: const EdgeInsets.all(20),
                              child: Row(
                                children: [
                                  if (isAdLoading)
                                    const CircularProgressIndicator()
                                  else
                                    SvgPicture.asset(
                                      'icons/ad.svg',
                                      colorFilter: ColorFilter.mode(
                                        Theme.of(context).colorScheme.onSurfaceVariant,
                                        BlendMode.srcIn
                                      ),
                                      width: 32,
                                      height: 32
                                    ),
                                  const SizedBox(width: 20),
                                  Expanded(
                                    child: Opacity(
                                      opacity: isAdLoading ? 0.5 : 1.0,
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text('Watch Ad', style: Theme.of(context).textTheme.titleMedium),
                                          const Text("Earn 1 Gem and save the fact for offline viewing"),
                                        ],
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
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
          )
        )
      )
    );
  }
}

import 'package:animate_do/animate_do.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/svg.dart';
import 'package:go_router/go_router.dart';
import 'package:tiptap/discover/fact.dart';
import 'package:tiptap/shared/ai.dart';
import 'package:tiptap/shared/authentication.dart';
import 'package:tiptap/shared/root.dart';
import 'package:tiptap/shared/streak.dart';
import 'package:tiptap/shared/theme.dart';

class DiscoverRoute extends StatefulShellBranch implements RootNavigationShellBranch {
  DiscoverRoute({required GlobalKey<NavigatorState> navigatorKey})
    : super(
        navigatorKey: navigatorKey,
        routes: [
          GoRoute(
            path: '/',
            builder: (context, state) => DiscoverPage(),
            routes: [
              FactDetailsRoute()
            ]
          )
        ]
      );

  @override
  BottomNavigationBarItem bottomNavigationBarItem(BuildContext context) {
    return BottomNavigationBarItem(
      icon: SvgPicture.asset(
        'icons/planet.svg',
        colorFilter: ColorFilter.mode(
          Theme.of(context).colorScheme.onSurfaceVariant,
          BlendMode.srcIn
        ),
        width: 24,
        height: 24
      ),
      activeIcon: SvgPicture.asset(
        'icons/planet_filled.svg',
        colorFilter: ColorFilter.mode(
          Theme.of(context).colorScheme.primary,
          BlendMode.srcIn
        ),
        width: 24,
        height: 24
      ),
      label: 'Discover'
    );
  }
}

class DiscoverPage extends StatefulWidget {
  const DiscoverPage({super.key});

  @override
  State<DiscoverPage> createState() => _DiscoverPageState();
}

class _DiscoverPageState extends State<DiscoverPage> {
  final List<int> _history = [];
  Object? _error;

  Future<void> _refresh() async {
    if (mounted) setState(() => _error = null);
    try {
      final ai = context.read<AIService>();
      final result = await ai.askAI();
      if (result != null) {
        if (mounted) setState(() => _history.add(result));
      }
    } catch (error) {
      if (mounted) setState(() => _error = error);
    }
  }

  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    final ai = context.watch<AIService>();
    context.watch<ThemeService>();

    return Scaffold(
      body: BlocListener<AuthenticationService, dynamic>(
        listener: (context, state) async {
          setState(() {
            _history.clear();
          });
          await _refresh();
        },
        child: PageView.builder(
          key: ValueKey(Theme.of(context).brightness),
          scrollDirection: Axis.vertical,
          onPageChanged: (index) async {
            if (index == _history.length) {
              await _refresh();
            }
          },
          itemCount: _history.length + 1,
          itemBuilder: (context, index) {
            if (_error != null && index == _history.length) {
              return SizedBox(
                width: double.infinity,
                height: double.infinity,
                child: InkWell(
                  onTap: () async {
                    await _refresh();
                  },
                  child: Center(
                    child: SingleChildScrollView(
                      padding: EdgeInsets.all(16),
                      child: FadeIn(
                        duration: Duration(milliseconds: 1000),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            Text(
                              '(= ФェФ=)',
                              //'( ❍ᴥ❍ )',
                              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                                color: Theme.of(context).colorScheme.onSurfaceVariant
                              ),
                              textAlign: TextAlign.center
                            ),
                            const SizedBox(height: 8),
                            Column(
                              children: [
                                Text(
                                  'Something went wrong',
                                  style: Theme.of(context).textTheme.titleLarge,
                                  textAlign: TextAlign.center
                                ),
                                Text(
                                  'Come back later for more interesting facts.',
                                  style: Theme.of(context).textTheme.bodyLarge,
                                  textAlign: TextAlign.center
                                )
                              ],
                            ),
                          ],
                        ),
                      )
                    ),
                  ),
                )
              );
            }

            if (index < _history.length) {
              final data = ai.getByIndex(_history[index]);

              return SizedBox(
                width: double.infinity,
                height: double.infinity,
                child: InkWell(
                  onTap: () {
                    final streak = context.read<StreakService>();
                    streak.recordActivity();
                    context.goNamed(
                      'fact',
                      pathParameters: {
                        'id': _history[index].toString()
                      }
                    );
                  },
                  child: Center(
                    child: SingleChildScrollView(
                      padding: EdgeInsets.all(16),
                      child: FadeIn(
                        duration: Duration(milliseconds: 1000),
                        child: Text(
                          data!['summary'],
                          style: Theme.of(context).textTheme.bodyLarge,
                          textAlign: TextAlign.center
                        ),
                      )
                    ),
                  ),
                )
              );
            }

            return const Center(
              child: CircularProgressIndicator()
            );
          }
        ),
      )
    );
  }
}

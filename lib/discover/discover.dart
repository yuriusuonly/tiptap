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
  Object? _error;
  late final PageController _pageController;

  Future<void> _refresh() async {
    if (mounted) setState(() => _error = null);
    try {
      final ai = context.read<AIService>();
      await ai.askAI();
      if (mounted) {
        // Ensure the PageView has rebuilt with the new item before animating
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (_pageController.hasClients && ai.state.isNotEmpty) {
            _pageController.animateToPage(
              ai.state.length - 1,
              duration: const Duration(milliseconds: 600),
              curve: Curves.easeInOut,
            );
          }
        });
      }
    } catch (error) {
      if (mounted) setState(() => _error = error);
    }
  }

  @override 
  void initState() {
    super.initState();
    _pageController = PageController();
    WidgetsBinding.instance.addPostFrameCallback((_) => _refresh());
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final ai = context.watch<AIService>();
    context.watch<AuthenticationService>();

    return Scaffold(
      body: PageView.builder(
        controller: _pageController,
        scrollDirection: Axis.vertical,
        itemCount: ai.state.length + 1,
        itemBuilder: (context, index) {
          if (index == ai.state.length) {
            if (_error != null) {
              return _errorContent();
            }
            return const Center(
              child: CircularProgressIndicator(),
            );
          }
          final data = ai.state[index];
          return _dataContent(data);
        }
      ),
    );
  }

  Widget _errorContent() {
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
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant
                    ),
                    textAlign: TextAlign.center
                  ),
                  const SizedBox(height: 16),
                  Column(
                    spacing: 4,
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

  Widget _dataContent(Map<String, dynamic> data) {
    return SizedBox(
      width: double.infinity,
      height: double.infinity,
      child: InkWell(
        onTap: () {
          final streak = context.read<StreakService>();
          streak.recordActivity();
          context.goNamed(
            'fact',
            extra: data
          );
        },
        child: Center(
          child: SingleChildScrollView(
            padding: EdgeInsets.all(16),
            child: FadeIn(
              duration: Duration(milliseconds: 1000),
              child: Text(
                data['summary'],
                style: Theme.of(context).textTheme.bodyLarge,
                textAlign: TextAlign.center
              ),
            )
          ),
        ),
      )
    );
  }
}

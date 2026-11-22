import 'package:animate_do/animate_do.dart';
import 'package:material_ui/material_ui.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/svg.dart';
import 'package:go_router/go_router.dart';
import 'package:tiptap/app/discover/fact.dart';
import 'package:tiptap/app/shared/root.dart';
import 'package:tiptap/app/services/authentication.dart';
import 'package:tiptap/app/services/bookmark.dart';
import 'package:tiptap/app/services/content.dart';
import 'package:tiptap/app/services/streak.dart';

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
  late final PageController _pageController;

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      context.read<ContentService>().loadMore(skip: context.read<BookmarkService>().state);
    });
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    context.watch<AuthenticationService>();
    final content = context.watch<ContentService>();
    final bookmarks = context.watch<BookmarkService>();
    final facts = content.state
        .where((e) => !bookmarks.state.contains(e['title'].toString()))
        .toList();

    return Scaffold(
      body: facts.isEmpty
        ? const Center(child: CircularProgressIndicator())
        : PageView.builder(
            controller: _pageController,
            scrollDirection: Axis.vertical,
            itemCount: facts.length,
            itemBuilder: (context, index) {
              if (index >= facts.length - 2) {
                WidgetsBinding.instance.addPostFrameCallback((_) {
                  if (mounted) content.loadMore(skip: bookmarks.state);
                });
              }
              final data = facts[index];
              return _dataContent(data);
            },
          ),
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

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:tiptap/app/discover/discover.dart';
import 'package:tiptap/app/introduction/introduction.dart';
import 'package:tiptap/app/profile/profile.dart';
import 'package:tiptap/app/services/ad.dart';
import 'package:tiptap/app/services/bookmark.dart';
import 'package:tiptap/app/services/content.dart';
import 'package:tiptap/app/services/authentication.dart';
import 'package:tiptap/app/services/first_launch.dart';
import 'package:tiptap/app/services/photo.dart';
import 'package:tiptap/app/services/premium.dart';
import 'package:tiptap/app/services/streak.dart';
import 'package:tiptap/app/services/theme.dart';
import 'package:tiptap/app/shared/toast.dart';

final rootNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'RootNavigatorKey');
final discoverNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'DiscoverNavigatorKey');
final profileNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'ProfileNavigatorKey');

class Root extends StatefulWidget {
  const Root({super.key});

  @override
  State<Root> createState() => _RootState();
}

class _RootState extends State<Root> {
  late final AuthenticationService _authentication;
  late final ThemeService _theme;
  late final StreakService _streak;
  late final AdService _ad;
  late final BookmarkService _bookmark;
  late final ContentService _content;
  late final FirstLaunchService _firstLaunch;
  late final PhotoService _photo;
  late final PremiumService _premium;

  final _router = GoRouter(
    navigatorKey: rootNavigatorKey,
    routes: [
      RootNavigationShellRoute()
    ]
  );

  @override
  void initState() {
    super.initState();
    _authentication = AuthenticationService();
    _theme = ThemeService();
    _streak = StreakService();
    _ad = AdService();
    _bookmark = BookmarkService();
    _content = ContentService();
    _firstLaunch = FirstLaunchService();
    _photo = PhotoService();
    _premium = PremiumService();
  }

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(create: (_) => _authentication),
        BlocProvider(create: (_) => _theme),
        BlocProvider(create: (_) => _streak),
        BlocProvider(create: (_) => _ad),
        BlocProvider(create: (_) => _bookmark),
        BlocProvider(create: (_) => _content),
        BlocProvider(create: (_) => _firstLaunch),
        BlocProvider(create: (_) => _photo),
        BlocProvider(create: (_) => _premium)
      ],
      child: Builder(
        builder: (context) {
          final theme = context.watch<ThemeService>();
          return MaterialApp.router(
            scaffoldMessengerKey: appScaffoldMessengerKey,
            debugShowCheckedModeBanner: false,
            themeMode: theme.themeMode,
            theme: theme.lightTheme,
            darkTheme: theme.darkTheme,
            routerConfig: _router
          );
        },
      )
    );
  }

  @override
  void dispose() {
    _premium.close();
    _photo.close();
    _firstLaunch.close();
    _content.close();
    _bookmark.close();
    _ad.close();
    _streak.close();
    _theme.close();
    _authentication.close();
    super.dispose();
  }
}

class RootNavigationShellRoute extends StatefulShellRoute {
  RootNavigationShellRoute()
    : super.indexedStack(
        branches: [
          DiscoverRoute(navigatorKey: discoverNavigatorKey),
          ProfileRoute(navigatorKey: profileNavigatorKey)
        ],
        builder: (context, state, navigationShell) {
          return RootNavigationShell(navigationShell: navigationShell);
        },
        /* navigatorContainerBuilder: (context, navigationShell, children) {
          return NavigationTransitionSwitcher(
            key: ValueKey(navigationShell.currentIndex),
            currentIndex: navigationShell.currentIndex,
            transitionBuilder: (child, animation, secondaryAnimation) {
              return SharedAxisTransition(
                animation: animation,
                secondaryAnimation: secondaryAnimation,
                transitionType: SharedAxisTransitionType.horizontal,
                child: child,
              );
            },
            child: children[navigationShell.currentIndex],
          );
        }, */
      );
}

class RootNavigationShell extends StatelessWidget {
  final StatefulNavigationShell navigationShell;

  const RootNavigationShell({
    super.key,
    required this.navigationShell
  });

  @override
  Widget build(BuildContext context) {
    final isDarkTheme = Theme.of(context).brightness == Brightness.dark;
    final firstLaunch = context.watch<FirstLaunchService>();

    return Stack(
      children: [
        AnnotatedRegion<SystemUiOverlayStyle>(
          value: SystemUiOverlayStyle(
            // Status bar (Top)
            statusBarColor: Theme.of(context).colorScheme.surface.withValues(alpha: 0.1),
            statusBarIconBrightness: isDarkTheme ? Brightness.light : Brightness.dark,
            // Navigation bar (Bottom)
            systemNavigationBarColor: Theme.of(context).colorScheme.surface.withValues(alpha: 0.1),
            systemNavigationBarIconBrightness: isDarkTheme ? Brightness.light : Brightness.dark,
          ),
          child: Scaffold(
            body: navigationShell,
            bottomNavigationBar: BottomNavigationBar(
              currentIndex: navigationShell.currentIndex,
              onTap: (index) {
                navigationShell.goBranch(index);
              },
              selectedLabelStyle: TextStyle(
                color: Theme.of(context).colorScheme.primary
              ),
              unselectedLabelStyle: TextStyle(
                color: Theme.of(context).colorScheme.onSurfaceVariant
              ),
              type: BottomNavigationBarType.fixed,
              items: navigationShell.route.branches.map(
                (branch) {
                  return (branch as RootNavigationShellBranch).bottomNavigationBarItem(context);
                }
              ).toList()
            ),
          ),
        ),
        if (firstLaunch.state)
          Positioned.fill(
            child: const IntroductionPage(),
          ),
      ],
    );
  }
}

abstract class RootNavigationShellBranch {
  BottomNavigationBarItem bottomNavigationBarItem(BuildContext context);
}

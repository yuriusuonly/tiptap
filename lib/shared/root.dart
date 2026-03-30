import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:tiptap/shared/ad.dart';
import 'package:tiptap/shared/ai.dart';
import 'package:tiptap/shared/animations.dart';
import 'package:tiptap/shared/authentication.dart';
import 'package:tiptap/shared/database.dart';
import 'package:tiptap/shared/first_launch.dart';
import 'package:tiptap/shared/photo.dart';
import 'package:tiptap/shared/streak.dart';
import 'package:tiptap/shared/theme.dart';
import 'package:tiptap/discover/discover.dart';
import 'package:tiptap/profile/profile.dart';

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
  late final DatabaseService _database;
  late final ThemeService _theme;
  late final AIService _ai;
  late final StreakService _streak;
  late final AdService _ad;
  late final FirstLaunchService _firstLaunch;
  late final PhotoService _photo;

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
    _database = DatabaseService(_authentication);
    _theme = ThemeService(_database);
    _ai = AIService(_database);
    _streak = StreakService(_database);
    _ad = AdService(_database);
    _firstLaunch = FirstLaunchService(_database);
    _photo = PhotoService(_authentication);
  }

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(create: (_) => _authentication),
        BlocProvider(create: (_) => _database),
        BlocProvider(create: (_) => _theme),
        BlocProvider(create: (_) => _ai),
        BlocProvider(create: (_) => _streak),
        BlocProvider(create: (_) => _ad),
        BlocProvider(create: (_) => _firstLaunch),
        BlocProvider(create: (_) => _photo)
      ],
      child: Builder(
        builder: (context) {
          final theme = context.watch<ThemeService>();
          return MaterialApp.router(
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
    _photo.close();
    _firstLaunch.close();
    _ad.close();
    _streak.close();
    _ai.close();
    _theme.close();
    _database.close();
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
          return RootNavigationShell(
            navigationShell: navigationShell,
          );
        },
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
            child: GestureDetector(
              onTap: () {
                final firstLaunch = context.read<FirstLaunchService>();
                firstLaunch.dismissIntro();
              },
              child: Container(
                color: Colors.black.withValues(alpha: 0.8),
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    Positioned.fill(
                      child: ColorFiltered(
                        colorFilter: ColorFilter.mode(
                          Colors.white.withValues(alpha: 0.5),
                          BlendMode.srcIn
                        ),
                        child: IntervalLottie(
                          asset: 'animations/tap.json',
                          interval: Duration(milliseconds: 2000),
                        ),
                      ),
                    ),
                    Column(
                      spacing: 8,
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Text(
                          'Welcome',
                          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            color: Colors.white
                          )
                        ),
                        PulseTransition(
                          duration: Duration(milliseconds: 1500),
                          child: Text(
                            'Tap to learn more',
                            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                              color: Colors.white
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
      ],
    );
  }
}

abstract class RootNavigationShellBranch {
  BottomNavigationBarItem bottomNavigationBarItem(BuildContext context);
}

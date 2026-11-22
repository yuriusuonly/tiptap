import 'package:material_ui/material_ui.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:tiptap/site/home.dart';

final rootNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'RootNavigatorKey');

class Root extends StatefulWidget {
  const Root({super.key});

  @override
  State<Root> createState() => _RootState();
}

class _RootState extends State<Root> {
  late final GoRouter _router;

  // Built once, not on every MaterialApp rebuild.
  late final ThemeData _lightTheme = _buildTheme(Brightness.light);
  late final ThemeData _darkTheme = _buildTheme(Brightness.dark);

  ThemeData _buildTheme(Brightness brightness) {
    final base = brightness == Brightness.light ? ThemeData.light() : ThemeData.dark();
    return ThemeData.from(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        brightness: brightness,
        seedColor: Colors.blueGrey,
        primary: Colors.blueGrey,
        onPrimary: Colors.white,
      ),
      textTheme: GoogleFonts.outfitTextTheme(base.textTheme),
    );
  }

  @override
  void initState() {
    super.initState();
    _router = GoRouter(
      navigatorKey: rootNavigatorKey,
      routes: [
        HomeRoute()
      ]
    );
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      debugShowCheckedModeBanner: false,
      routerConfig: _router,
      themeMode: ThemeMode.system,
      theme: _lightTheme,
      darkTheme: _darkTheme,
    );
  }
}

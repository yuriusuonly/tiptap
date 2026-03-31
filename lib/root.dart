import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:tiptap/home.dart';

final rootNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'RootNavigatorKey');

class Root extends StatefulWidget {
  const Root({super.key});

  @override
  State<Root> createState() => _RootState();
}

class _RootState extends State<Root> {
  late final GoRouter _router;

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
  void dispose() {
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      debugShowCheckedModeBanner: false,
      routerConfig: _router,
      themeMode: ThemeMode.system,
      theme: ThemeData.from(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          brightness: Brightness.light,
          seedColor: Colors.blueGrey,
          primary: Colors.blueGrey,
          onPrimary: Colors.white,
        ),
        textTheme: GoogleFonts.outfitTextTheme(
          ThemeData.light().textTheme
        )
      ),
      darkTheme: ThemeData.from(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          brightness: Brightness.dark,
          seedColor: Colors.blueGrey,
          primary: Colors.blueGrey,
          onPrimary: Colors.white
        ),
        textTheme: GoogleFonts.outfitTextTheme(
          ThemeData.dark().textTheme
        )
      ),
    );
  }
}

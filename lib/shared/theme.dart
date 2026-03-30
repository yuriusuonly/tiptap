import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:tiptap/shared/database.dart';

class ThemeService extends Cubit<ThemeMode> {
  final DatabaseService _databaseService;
  StreamSubscription? _databaseSubscription;

  ThemeService(this._databaseService)
      : super(_parseThemeMode(_databaseService.get('theme'))) {
    _databaseSubscription = _databaseService.stream
      .listen(
        (data) {
          emit(_parseThemeMode(data['theme']));
        }
      );
  }

  ThemeData get lightTheme => ThemeData.from(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      brightness: Brightness.light,
      seedColor: Colors.blueGrey,
      primary: Colors.blueGrey,
      onPrimary: Colors.white
    ),
    textTheme: GoogleFonts.outfitTextTheme(
      ThemeData.light().textTheme
    )
  );

  ThemeData get darkTheme => ThemeData.from(
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
  );

  static ThemeMode _parseThemeMode(dynamic value) {
    try {
      return ThemeMode.values.byName(value as String? ?? 'system');
    } catch (_) {
      return ThemeMode.system;
    }
  }

  ThemeMode get themeMode => state;

  set themeMode(ThemeMode value) => _databaseService.set({'theme': value.name});

  @override
  Future<void> close() async {
    await _databaseSubscription?.cancel();
    return await super.close();
  }
}

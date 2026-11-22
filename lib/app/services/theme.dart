import 'dart:async';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:hydrated_bloc/hydrated_bloc.dart';
import 'package:material_ui/material_ui.dart';
import 'package:tiptap/app/shared/toast.dart';

class ThemeService extends HydratedCubit<ThemeMode> {
  StreamSubscription? _authenticationSubscription;
  StreamSubscription? _firestoreSubscription;
  int _syncGeneration = 0;

  ThemeService() : super(ThemeMode.system) {
    _authenticationSubscription = FirebaseAuth.instance.authStateChanges().listen(
      (user) {
        _syncGeneration++;
        _firestoreSubscription?.cancel();
        _firestoreSubscription = null;
        if (user != null) _syncToFirestore(user.uid);
        // Theme stays whatever it currently is, even on sign-out/deletion.
      },
      onError: (error, stack) {
        showSomethingWentWrong(error: error, stack: stack, context: 'theme:auth');
      },
    );
    final currentUser = FirebaseAuth.instance.currentUser;
    if (currentUser != null) _syncToFirestore(currentUser.uid);
  }

  ThemeMode _parseThemeMode(String? value) {
    if (value == null) return ThemeMode.system;
    try {
      return ThemeMode.values.byName(value);
    } catch (_) {
      return ThemeMode.system;
    }
  }

  Future<void> _syncToFirestore(String userID) async {
    final generation = _syncGeneration;
    try {
      final document = FirebaseFirestore.instance.collection('users').doc(userID);
      final snapshot = await document.get();
      if (isClosed || generation != _syncGeneration) return;

      ThemeMode mergedTheme = state;
      bool needsUpdate = false;
      if (snapshot.exists) {
        final remoteThemeStr = snapshot.data()?['theme_mode'] as String?;
        if (remoteThemeStr != null) {
          mergedTheme = _parseThemeMode(remoteThemeStr);
        } else {
          needsUpdate = true;
        }
      } else {
        needsUpdate = true;
      }

      if (needsUpdate) {
        await document.set({'theme_mode': mergedTheme.name}, SetOptions(merge: true));
      }
      if (isClosed || generation != _syncGeneration) return;
      super.emit(mergedTheme);

      _firestoreSubscription = document.snapshots().listen((snapshot) {
        if (isClosed || generation != _syncGeneration) return;
        if (snapshot.exists) {
          final incomingTheme = _parseThemeMode(
            snapshot.data()?['theme_mode'] as String? ?? ThemeMode.system.name,
          );
          if (incomingTheme != state) super.emit(incomingTheme);
        }
      }, onError: (error, stack) {
        showSomethingWentWrong(error: error, stack: stack, context: 'theme:sync');
      });
    } catch (e, stack) {
      showSomethingWentWrong(error: e, stack: stack, context: 'theme:sync');
    }
  }

  @override
  void emit(ThemeMode state) {
    if (isClosed || state == this.state) return;
    super.emit(state);
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;
    FirebaseFirestore.instance
        .collection('users')
        .doc(user.uid)
        .set({'theme_mode': state.name}, SetOptions(merge: true))
        .catchError((Object error, StackTrace stack) {
      showSomethingWentWrong(error: error, stack: stack, context: 'theme:write');
    });
  }

  // Text themes are expensive to build; compute them once instead of on every
  // rebuild (these getters are read on each MaterialApp build).
  late final ThemeData lightTheme = ThemeData.from(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      brightness: Brightness.light,
      seedColor: Colors.blueGrey,
      primary: Colors.blueGrey,
      onPrimary: Colors.white,
    ),
    textTheme: GoogleFonts.outfitTextTheme(ThemeData.light().textTheme),
  );

  late final ThemeData darkTheme = ThemeData.from(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      brightness: Brightness.dark,
      seedColor: Colors.blueGrey,
      primary: Colors.blueGrey,
      onPrimary: Colors.white,
    ),
    textTheme: GoogleFonts.outfitTextTheme(ThemeData.dark().textTheme),
  );

  ThemeMode get themeMode => state;

  set themeMode(ThemeMode value) => emit(value);

  @override
  Future<void> close() async {
    await _authenticationSubscription?.cancel();
    await _firestoreSubscription?.cancel();
    return super.close();
  }

  @override
  ThemeMode? fromJson(Map<String, dynamic> json) {
    return _parseThemeMode(json['theme_mode'] as String?);
  }

  @override
  Map<String, dynamic>? toJson(ThemeMode state) {
    return {'theme_mode': state.name};
  }
}

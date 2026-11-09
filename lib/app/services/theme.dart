import 'dart:async';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:hydrated_bloc/hydrated_bloc.dart';
import 'package:tiptap/app/shared/toast.dart';

class ThemeService extends HydratedCubit<ThemeMode> {
  StreamSubscription? _authenticationSubscription;
  StreamSubscription? _firestoreSubscription;

  ThemeService() : super(ThemeMode.system) {
    _authenticationSubscription = FirebaseAuth.instance.authStateChanges().listen(
      (user) {
        _firestoreSubscription?.cancel();
        if (user != null) {
          _syncToFirestore(user.uid).catchError((_) { showSomethingWentWrong(); });
        }
        // Theme stays whatever it currently is, even on sign-out/deletion.
      },
      onError: (_) { showSomethingWentWrong(); },
    );
    final currentUser = FirebaseAuth.instance.currentUser;
    if (currentUser != null) {
      _syncToFirestore(currentUser.uid).catchError((_) { showSomethingWentWrong(); });
    }
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
    try {
      final document = FirebaseFirestore.instance.collection('users').doc(userID);
      final snapshot = await document.get();

      ThemeMode mergedTheme = state;
      bool needsUpdate = false;

      if (snapshot.exists) {
        final remoteThemeStr = snapshot.data()?['theme_mode'] as String?;
        if (remoteThemeStr != null) {
          mergedTheme = _parseThemeMode(remoteThemeStr);
        } else {
          // Existing profile without the field — push the current local setting.
          needsUpdate = true;
        }
      } else {
        needsUpdate = true;
      }

      if (needsUpdate) {
        await document.set({'theme_mode': mergedTheme.name}, SetOptions(merge: true));
      }
      if (isClosed) return;
      super.emit(mergedTheme);

      _firestoreSubscription = document.snapshots().listen((snapshot) {
        if (isClosed) return;
        if (snapshot.exists) {
          final remoteThemeStr = snapshot.data()?['theme_mode'] as String? ?? ThemeMode.system.name;
          final incomingTheme = _parseThemeMode(remoteThemeStr);
          if (incomingTheme != state) {
            super.emit(incomingTheme);
          }
        }
      }, onError: (_) { showSomethingWentWrong(); });
    } catch (_) {
      showSomethingWentWrong();
      // Offline — keep local value.
    }
  }

  @override
  void emit(ThemeMode state) {
    if (isClosed) return;
    super.emit(state);
    final user = FirebaseAuth.instance.currentUser;
    if (user != null) {
      FirebaseFirestore.instance
        .collection('users')
        .doc(user.uid)
        .set({'theme_mode': state.name}, SetOptions(merge: true))
        .catchError((_) { showSomethingWentWrong(); });
    }
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

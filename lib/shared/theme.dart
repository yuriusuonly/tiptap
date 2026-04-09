import 'dart:async';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:hydrated_bloc/hydrated_bloc.dart';

class ThemeService extends HydratedCubit<ThemeMode> {
  StreamSubscription? _authenticationSubscription;
  StreamSubscription? _firestoreSubscription;

  ThemeService() : super(ThemeMode.system) {
    _authenticationSubscription = FirebaseAuth.instance.authStateChanges().listen(
      (user) {
        _firestoreSubscription?.cancel();
        if (user != null) {
          _syncToFirestore(user.uid);
        } else {
          _reset();
        }
      }
    );
  }

  Future<void> _syncToFirestore(String userID) async {
    final document = FirebaseFirestore.instance.collection('users').doc(userID);
    final snapshot = await document.get();

    ThemeMode mergedTheme = state;
    bool needsUpdate = false;

    if (snapshot.exists) {
      final remoteThemeStr = snapshot.data()?['theme_mode'] as String?;
      if (remoteThemeStr != null) {
        mergedTheme = ThemeMode.values.byName(remoteThemeStr);
      }
    } else {
      needsUpdate = true;
    }

    if (needsUpdate) {
      await document.set({'theme_mode': mergedTheme.name}, SetOptions(merge: true));
    }
    super.emit(mergedTheme);

    _firestoreSubscription = document.snapshots().listen((snapshot) {
      if (snapshot.exists) {
        final remoteThemeStr = snapshot.data()?['theme_mode'] as String? ?? ThemeMode.system.name;
        final incomingTheme = ThemeMode.values.byName(remoteThemeStr);
        if (incomingTheme != state) {
          super.emit(incomingTheme);
        }
      }
    });
  }

  void _reset() {
    emit(ThemeMode.system);
  }

  @override
  void emit(ThemeMode state) {
    super.emit(state);
    final user = FirebaseAuth.instance.currentUser;
    if (user != null) {
      FirebaseFirestore.instance
        .collection('users')
        .doc(user.uid)
        .set({'theme_mode': state.name}, SetOptions(merge: true));
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
  Future<void> close() {
    _authenticationSubscription?.cancel();
    _firestoreSubscription?.cancel();
    return super.close();
  }

  @override
  ThemeMode? fromJson(Map<String, dynamic> json) {
    return ThemeMode.values.byName(json['theme_mode'] as String);
  }

  @override
  Map<String, dynamic>? toJson(ThemeMode state) {
    return {'theme_mode': state.name};
  }
}

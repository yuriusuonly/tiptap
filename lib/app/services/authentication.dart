import 'dart:async';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_analytics/firebase_analytics.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'package:flutter/foundation.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:hydrated_bloc/hydrated_bloc.dart';
import 'package:tiptap/app/shared/toast.dart';

class AuthenticationService extends Cubit<User?> {
  StreamSubscription<User?>? _userSubscription;
  bool _isSigningIn = false;

  AuthenticationService() : super(FirebaseAuth.instance.currentUser) {
    _userSubscription = FirebaseAuth.instance.authStateChanges().listen(
      (User? user) {
        if (isClosed) return;
        emit(user);
        _updateDiagnostics(user);
      },
      onError: (error, stack) {
        showSomethingWentWrong(
          error: error,
          stack: stack,
          context: 'auth:state',
        );
      },
    );
    _updateDiagnostics(state);
  }

  void _updateDiagnostics(User? user) {
    if (kDebugMode) return;
    FirebaseCrashlytics.instance
        .setUserIdentifier(user?.uid ?? '')
        .catchError((_) {});
  }

  @override
  Future<void> close() async {
    await _userSubscription?.cancel();
    return super.close();
  }

  Future<OAuthCredential?> _googleCredential() async {
    final googleUser = await GoogleSignIn.instance.authenticate();
    final googleAuth = googleUser.authentication;
    if (googleAuth.idToken == null) return null;
    return GoogleAuthProvider.credential(idToken: googleAuth.idToken);
  }

  Future<bool> signInWithGoogle() async {
    if (_isSigningIn) return false;
    _isSigningIn = true;
    try {
      final current = FirebaseAuth.instance.currentUser;
      if (current != null) {
        if (!isClosed) emit(current);
        return true;
      }
      final credential = await _googleCredential();
      if (credential == null) {
        showSomethingWentWrong(context: 'auth:missing-id-token');
        return false;
      }
      final result = await FirebaseAuth.instance.signInWithCredential(credential);
      final user = result.user;
      if (user == null) return false;

      if (!isClosed) emit(user);
      await _saveProfile(user);
      if (!kDebugMode) {
        FirebaseAnalytics.instance.logLogin(loginMethod: 'google');
      }
      return true;
    } on GoogleSignInException catch (e, stack) {
      if (e.code == GoogleSignInExceptionCode.canceled) return false;
      showSomethingWentWrong(error: e, stack: stack, context: 'auth:google');
      return false;
    } on FirebaseAuthException catch (e, stack) {
      showSomethingWentWrong(error: e, stack: stack, context: 'auth:sign-in');
      return false;
    } catch (e, stack) {
      showSomethingWentWrong(error: e, stack: stack, context: 'auth:sign-in');
      return false;
    } finally {
      _isSigningIn = false;
    }
  }

  Future<void> _saveProfile(User user) async {
    try {
      await FirebaseFirestore.instance
          .collection('users')
          .doc(user.uid)
          .set({
            'displayName': user.displayName,
            'email': user.email,
            'photoURL': user.photoURL,
          }, SetOptions(merge: true))
          .timeout(const Duration(seconds: 15));
    } catch (e, stack) {
      showSomethingWentWrong(error: e, stack: stack, context: 'auth:save-profile');
    }
  }

  Future<void> signOut() async {
    try {
      await GoogleSignIn.instance.signOut();
    } catch (e, stack) {
      showSomethingWentWrong(error: e, stack: stack, context: 'auth:google-sign-out');
    }
    try {
      await FirebaseAuth.instance.signOut();
    } catch (e, stack) {
      showSomethingWentWrong(error: e, stack: stack, context: 'auth:sign-out');
    }
    _updateDiagnostics(null);
  }

  /// Deletes all user-owned data before the Auth account. Returns `true` only
  /// when the whole flow succeeded, so callers can keep the confirmation open
  /// on failure instead of leaving orphaned data or a half-deleted account.
  Future<bool> deleteUser({bool retriedAfterReauth = false}) async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return false;
    final uid = user.uid;

    try {
      // Firestore has no server-side cascade delete; walk the subcollection in
      // bounded pages so accounts with many bookmarks can still be removed.
      while (true) {
        final snapshot = await FirebaseFirestore.instance
            .collection('users')
            .doc(uid)
            .collection('bookmarks')
            .limit(500)
            .get();
        if (snapshot.docs.isEmpty) break;
        final batch = FirebaseFirestore.instance.batch();
        for (final doc in snapshot.docs) {
          batch.delete(doc.reference);
        }
        await batch.commit();
      }
      await FirebaseFirestore.instance.collection('users').doc(uid).delete();
      await user.delete();
      _updateDiagnostics(null);
      if (!isClosed) emit(null);
      return true;
    } on FirebaseAuthException catch (e, stack) {
      if (e.code == 'requires-recent-login' && !retriedAfterReauth) {
        if (await reauthenticate()) {
          return deleteUser(retriedAfterReauth: true);
        }
        return false;
      }
      showSomethingWentWrong(error: e, stack: stack, context: 'auth:delete');
      return false;
    } catch (e, stack) {
      showSomethingWentWrong(error: e, stack: stack, context: 'auth:delete');
      return false;
    }
  }

  Future<bool> reauthenticate() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return false;
    try {
      final credential = await _googleCredential();
      if (credential == null) return false;
      await user.reauthenticateWithCredential(credential);
      return true;
    } on GoogleSignInException catch (e, stack) {
      if (e.code == GoogleSignInExceptionCode.canceled) return false;
      showSomethingWentWrong(error: e, stack: stack, context: 'auth:reauth');
      return false;
    } catch (e, stack) {
      showSomethingWentWrong(error: e, stack: stack, context: 'auth:reauth');
      return false;
    }
  }
}

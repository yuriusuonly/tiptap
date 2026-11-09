import 'dart:async';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:hydrated_bloc/hydrated_bloc.dart';
import 'package:tiptap/app/shared/toast.dart';
import 'package:google_sign_in/google_sign_in.dart';

class AuthenticationService extends Cubit<User?> {
  late final StreamSubscription<User?> _userSubscription;

  AuthenticationService() : super(FirebaseAuth.instance.currentUser) {
    _userSubscription = FirebaseAuth.instance
      .authStateChanges()
      .listen(
        (User? user) {
          if (isClosed) return;
          emit(user);
        },
        onError: (_) { showSomethingWentWrong(); },
      );
  }

  @override
  Future<void> close() async {
    await _userSubscription.cancel();
    return await super.close();
  }

  Future<bool> signInWithGoogle() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user != null) {
      if (!isClosed) emit(user);
      return true;
    }
    try {
      final GoogleSignInAccount googleUser = await GoogleSignIn.instance.authenticate();
      final GoogleSignInAuthentication googleAuth = googleUser.authentication;
      final OAuthCredential credential = GoogleAuthProvider.credential(idToken: googleAuth.idToken);
      final credentialResult = await FirebaseAuth.instance.signInWithCredential(credential);
      final signedInUser = credentialResult.user;
      if (signedInUser != null && !isClosed) {
        emit(signedInUser);
        await FirebaseFirestore.instance
            .collection('users')
            .doc(signedInUser.uid)
            .set({
              'displayName': signedInUser.displayName,
              'email': signedInUser.email,
              'photoURL': signedInUser.photoURL,
            }, SetOptions(merge: true))
            .catchError((_) { showSomethingWentWrong(); });
      }
      return signedInUser != null;
    } on GoogleSignInException catch (e) {
      if (e.code == GoogleSignInExceptionCode.canceled) {
        return false;
      }
      showSomethingWentWrong();
      return false;
    } on FirebaseAuthException {
      showSomethingWentWrong();
      return false;
    }
  }

  Future<void> signOut() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user != null) {
      try {
        await GoogleSignIn.instance.signOut();
      } catch (_) { showSomethingWentWrong(); }
      try {
        await FirebaseAuth.instance.signOut();
      } catch (_) { showSomethingWentWrong(); }
    }
  }

  Future<void> deleteUser() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user != null) {
      final uid = user.uid;
      try {
        final bookmarks = await FirebaseFirestore.instance
            .collection('users')
            .doc(uid)
            .collection('bookmarks')
            .get();
        final batch = FirebaseFirestore.instance.batch();
        for (final doc in bookmarks.docs) {
          batch.delete(doc.reference);
        }
        await batch.commit();
      } catch (_) { showSomethingWentWrong(); }
      try {
        await FirebaseFirestore.instance.collection('users').doc(uid).delete();
      } catch (_) { showSomethingWentWrong(); }
      try {
        await user.delete();
      } catch (_) { showSomethingWentWrong(); }
    }
  }

  Future<bool> reauthenticate() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user != null) {
      try {
        final GoogleSignInAccount googleUser = await GoogleSignIn.instance.authenticate();
        final GoogleSignInAuthentication googleAuth = googleUser.authentication;
        final OAuthCredential credential = GoogleAuthProvider.credential(idToken: googleAuth.idToken);
        await user.reauthenticateWithCredential(credential);
        return true;
      } on GoogleSignInException catch (e) {
        if (e.code == GoogleSignInExceptionCode.canceled) {
          return false;
        }
        showSomethingWentWrong();
        return false;
      } on FirebaseAuthException {
        showSomethingWentWrong();
        return false;
      }
    }
    return false;
  }
}

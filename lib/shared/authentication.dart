import 'dart:async';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:hydrated_bloc/hydrated_bloc.dart';
import 'package:google_sign_in/google_sign_in.dart';

class AuthenticationService extends Cubit<User?> {
  late final StreamSubscription<User?> _userSubscription;

  AuthenticationService() : super(null) {
    _userSubscription = FirebaseAuth.instance
      .authStateChanges()
      .listen(
        (User? user) async {
          emit(user);
        }
      );
  }

  @override
  Future<void> close() async {
    await _userSubscription.cancel();
    return await super.close();
  }

  Future<void> signInWithGoogle() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) {
      final GoogleSignInAccount googleUser = await GoogleSignIn.instance.authenticate();
      final GoogleSignInAuthentication googleAuth = googleUser.authentication;
      final OAuthCredential credential = GoogleAuthProvider.credential(idToken: googleAuth.idToken);
      await FirebaseAuth.instance.signInWithCredential(credential);
    }
  }

  Future<void> signOut() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user != null) {
      await GoogleSignIn.instance.signOut();
      await FirebaseAuth.instance.signOut();
    }
  }

  Future<void> deleteUser() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user != null) {
      await FirebaseFirestore.instance.collection('users').doc(user.uid).delete();
      await user.delete();
    }
  }

  Future<void> reauthenticate() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user != null) {
      final GoogleSignInAccount googleUser = await GoogleSignIn.instance.authenticate();
      final GoogleSignInAuthentication googleAuth = googleUser.authentication;
      final OAuthCredential credential = GoogleAuthProvider.credential(idToken: googleAuth.idToken);
      await user.reauthenticateWithCredential(credential);
    }
  }
}

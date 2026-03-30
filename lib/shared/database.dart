import 'dart:async';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:hydrated_bloc/hydrated_bloc.dart';
import 'package:tiptap/shared/authentication.dart';

class DatabaseService extends HydratedCubit<Map<String, dynamic>> {
  final AuthenticationService _authenticationService;
  StreamSubscription? _userSubscription;
  StreamSubscription? _snapshotSubscription;

  DatabaseService(this._authenticationService) : super({}) {
    _userSubscription = _authenticationService.stream
      .listen(
        (User? user) async {
          await _snapshotSubscription?.cancel();
          if (user != null) {
            final userDocRef = FirebaseFirestore.instance.collection('users').doc(user.uid);

            // Fetch the document once to check for existence and initial data
            final docSnapshot = await userDocRef.get();

            if (docSnapshot.exists && docSnapshot.data() != null) {
              // Document exists, load remote data
              emit(docSnapshot.data()!);
            } else {
              // First sign-in or document doesn't exist.
              // Sync current local hydrated state to Firestore.
              await userDocRef.set(state, SetOptions(merge: true));
            }

            // Now, start listening for real-time updates
            _snapshotSubscription = userDocRef.snapshots().listen(
                (DocumentSnapshot<Map<String, dynamic>> snapshot) {
                  if (snapshot.exists) {
                    emit(snapshot.data()!);
                  }
                }
              );
          }
        }
      );
  }

  dynamic get(String key) => state[key];

  Future<void> set(Map<String, dynamic> value) async {
    final data = Map<String, dynamic>.from(state);
    data.addAll(value);
    emit(data);
    await updateRemote(data);
  }

  Future<void> updateRemote(Map<String, dynamic> data) async {
    final user = _authenticationService.state;
    if (user != null) {
      await FirebaseFirestore.instance
        .collection('users')
        .doc(user.uid)
        .set(data, SetOptions(merge: true));
    }
  }

  Future<void> deleteRemote() async {
    final user = _authenticationService.state;
    if (user != null) {
      await _snapshotSubscription?.cancel();
      await FirebaseFirestore.instance
        .collection('users')
        .doc(user.uid)
        .delete();
    }
  }

  void deleteLocal() {
    emit({'first_launch': false});
  }

  @override
  Future<void> close() async {
    await _snapshotSubscription?.cancel();
    await _userSubscription?.cancel();
    return await super.close();
  }

  @override
  Map<String, dynamic>? fromJson(Map<String, dynamic> json) => json;

  @override
  Map<String, dynamic>? toJson(Map<String, dynamic> state) => state;
}

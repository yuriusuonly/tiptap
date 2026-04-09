import 'dart:async';
import 'dart:convert';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:hydrated_bloc/hydrated_bloc.dart';

class StreakService extends HydratedCubit<Map<String, dynamic>> {
  StreamSubscription? _authenticationSubscription;
  StreamSubscription? _firestoreSubscription;

  StreakService() : super({'count': 0, 'last_activity': null}) {
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

    Map<String, dynamic> remoteData = {'count': 0, 'last_activity': null};
    if (snapshot.exists) {
      final raw = snapshot.data()?['streak'];
      if (raw is int) {
        remoteData = {'count': raw, 'last_activity': null};
      } else if (raw is Map) {
        remoteData = Map<String, dynamic>.from(raw);
      }
    }

    int remoteCount = remoteData['count'] as int? ?? 0;
    int localCount = state['count'] as int? ?? 0;

    // Merge logic: Take the state with the higher streak count
    Map<String, dynamic> mergedData = localCount >= remoteCount ? state : remoteData;

    if (!snapshot.exists || mergedData['count'] > remoteCount) {
      await document.set({'streak': mergedData}, SetOptions(merge: true));
    }
    super.emit(mergedData);

    _firestoreSubscription = document.snapshots().listen((snapshot) {
      if (snapshot.exists) {
        final raw = snapshot.data()?['streak'];
        Map<String, dynamic> incoming;
        if (raw is int) {
          incoming = {'count': raw, 'last_activity': null};
        } else {
          incoming = Map<String, dynamic>.from(raw ?? {'count': 0, 'last_activity': null});
        }

        if (jsonEncode(incoming) != jsonEncode(state)) {
          super.emit(incoming);
        }
      }
    });
  }

  void _reset() {
    emit({'count': 0, 'last_activity': null});
  }

  @override
  void emit(Map<String, dynamic> state) {
    super.emit(state);
    final user = FirebaseAuth.instance.currentUser;
    if (user != null) {
      FirebaseFirestore.instance
        .collection('users')
        .doc(user.uid)
        .set({'streak': state}, SetOptions(merge: true));
    }
  }

  void recordActivity() {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);

    final int count = state['count'] as int? ?? 0;
    final String? lastActivityStr = state['last_activity'] as String?;

    if (lastActivityStr == null) {
      emit({'count': 1, 'last_activity': now.toIso8601String()});
      return;
    }

    final lastActivity = DateTime.parse(lastActivityStr);
    final lastCheckIn = DateTime(lastActivity.year, lastActivity.month, lastActivity.day);
    final difference = today.difference(lastCheckIn).inDays;

    if (difference == 1) {
      emit({'count': count + 1, 'last_activity': now.toIso8601String()});
    } else if (difference > 1) {
      emit({'count': 1, 'last_activity': now.toIso8601String()});
    } else if (difference == 0) {
      emit({'count': count, 'last_activity': now.toIso8601String()});
    }
  }

  @override
  Future<void> close() {
    _authenticationSubscription?.cancel();
    _firestoreSubscription?.cancel();
    return super.close();
  }

  @override
  Map<String, dynamic>? fromJson(Map<String, dynamic> json) {
    return json['streak'];
  }

  @override
  Map<String, dynamic>? toJson(Map<String, dynamic> state) {
    return {'streak': state};
  }
}

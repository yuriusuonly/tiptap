import 'dart:async';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:hydrated_bloc/hydrated_bloc.dart';
import 'package:tiptap/app/shared/toast.dart';

class StreakService extends HydratedCubit<Map<String, dynamic>> {
  StreamSubscription? _authenticationSubscription;
  StreamSubscription? _firestoreSubscription;
  int _syncGeneration = 0;

  StreakService() : super(_emptyStreak()) {
    _authenticationSubscription = FirebaseAuth.instance.authStateChanges().listen(
      (user) {
        _syncGeneration++;
        _firestoreSubscription?.cancel();
        _firestoreSubscription = null;
        if (user != null) {
          _syncToFirestore(user.uid);
        } else {
          _reset();
        }
      },
      onError: (error, stack) {
        showSomethingWentWrong(error: error, stack: stack, context: 'streak:auth');
      },
    );
  }

  static Map<String, dynamic> _emptyStreak() =>
      <String, dynamic>{'count': 0, 'last_activity': null};

  /// Normalizes both the legacy integer format and the current map format, and
  /// clamps values so corrupt/remote data cannot poison the local state.
  static Map<String, dynamic> _normalize(dynamic raw) {
    if (raw is int) {
      return <String, dynamic>{
        'count': raw.clamp(0, 1 << 30),
        'last_activity': null,
      };
    }
    if (raw is Map) {
      final map = Map<String, dynamic>.from(raw);
      final count = map['count'];
      final last = map['last_activity'];
      return <String, dynamic>{
        'count': count is int ? count.clamp(0, 1 << 30) : 0,
        'last_activity': last is String ? last : null,
      };
    }
    return _emptyStreak();
  }

  bool _same(Map<String, dynamic> a, Map<String, dynamic> b) =>
      a['count'] == b['count'] && a['last_activity'] == b['last_activity'];

  Future<void> _syncToFirestore(String userID) async {
    final generation = _syncGeneration;
    try {
      final document = FirebaseFirestore.instance.collection('users').doc(userID);
      final snapshot = await document.get();
      if (isClosed || generation != _syncGeneration) return;

      final remoteData = snapshot.exists ? _normalize(snapshot.data()?['streak']) : _emptyStreak();
      final localData = _normalize(state);
      final remoteCount = remoteData['count'] as int;
      final localCount = localData['count'] as int;

      // Take the higher streak count; tie-break against a fresher local check-in.
      final mergedData = localCount > remoteCount ||
              (localCount == remoteCount &&
                  (localData['last_activity'] as String?) != null &&
                  (remoteData['last_activity'] as String?) == null)
          ? localData
          : remoteData;

      if (!snapshot.exists || (mergedData['count'] as int) > remoteCount) {
        await document.set({'streak': mergedData}, SetOptions(merge: true));
      }
      if (isClosed || generation != _syncGeneration) return;
      super.emit(mergedData);

      _firestoreSubscription = document.snapshots().listen((snapshot) {
        if (isClosed || generation != _syncGeneration) return;
        if (!snapshot.exists) return;
        final incoming = _normalize(snapshot.data()?['streak']);
        if (!_same(incoming, state)) super.emit(incoming);
      }, onError: (error, stack) {
        showSomethingWentWrong(error: error, stack: stack, context: 'streak:sync');
      });
    } catch (e, stack) {
      showSomethingWentWrong(error: e, stack: stack, context: 'streak:sync');
    }
  }

  void _reset() {
    if (!isClosed) emit(_emptyStreak());
  }

  @override
  void emit(Map<String, dynamic> state) {
    if (isClosed || _same(state, this.state)) return;
    super.emit(state);
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;
    FirebaseFirestore.instance
        .collection('users')
        .doc(user.uid)
        .set({'streak': state}, SetOptions(merge: true))
        .catchError((Object error, StackTrace stack) {
      showSomethingWentWrong(error: error, stack: stack, context: 'streak:write');
    });
  }

  void recordActivity() {
    if (isClosed) return;
    // UTC keeps day boundaries stable regardless of device timezone changes.
    final now = DateTime.now().toUtc();
    final today = DateTime.utc(now.year, now.month, now.day);

    final data = _normalize(state);
    final int count = data['count'] as int;
    DateTime? lastActivity = DateTime.tryParse(data['last_activity'] as String? ?? '')?.toUtc();
    // A future timestamp (clock change or tampering) restarts the streak.
    if (lastActivity != null && lastActivity.isAfter(now)) lastActivity = null;

    int nextCount;
    if (lastActivity == null) {
      nextCount = 1;
    } else {
      final lastDay = DateTime.utc(
        lastActivity.year,
        lastActivity.month,
        lastActivity.day,
      );
      final difference = today.difference(lastDay).inDays;
      if (difference == 1) {
        nextCount = count + 1;
      } else if (difference > 1 || difference < 0) {
        nextCount = 1;
      } else {
        nextCount = count;
      }
    }

    emit(<String, dynamic>{
      'count': nextCount.clamp(0, 1 << 30),
      'last_activity': now.toIso8601String(),
    });
  }

  @override
  Future<void> close() async {
    await _authenticationSubscription?.cancel();
    await _firestoreSubscription?.cancel();
    return super.close();
  }

  @override
  Map<String, dynamic>? fromJson(Map<String, dynamic> json) {
    return _normalize(json['streak']);
  }

  @override
  Map<String, dynamic>? toJson(Map<String, dynamic> state) {
    return {'streak': _normalize(state)};
  }
}

import 'dart:async';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:hydrated_bloc/hydrated_bloc.dart';
import 'package:tiptap/app/shared/toast.dart';

class BookmarkService extends HydratedCubit<Set<String>> {
  StreamSubscription? _authenticationSubscription;
  StreamSubscription? _firestoreSubscription;
  int _syncGeneration = 0;

  // Locally changed IDs that the server snapshot has not acknowledged yet.
  // Keeping them lets remote snapshots merge without resurrecting deletions
  // or dropping unsynced additions.
  final Set<String> _pendingAdds = <String>{};
  final Set<String> _pendingDeletes = <String>{};

  BookmarkService() : super(<String>{}) {
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
        showSomethingWentWrong(error: error, stack: stack, context: 'bookmarks:auth');
      },
    );
    final currentUser = FirebaseAuth.instance.currentUser;
    if (currentUser != null) _syncToFirestore(currentUser.uid);
  }

  CollectionReference<Map<String, dynamic>> _bookmarksCollection(String userID) {
    return FirebaseFirestore.instance
        .collection('users')
        .doc(userID)
        .collection('bookmarks');
  }

  Set<String> _orderedIds(QuerySnapshot<Map<String, dynamic>> snapshot) {
    final docs = snapshot.docs.toList();
    docs.sort((a, b) {
      final aTime = a.data()['bookmarkedAt'] as Timestamp?;
      final bTime = b.data()['bookmarkedAt'] as Timestamp?;
      if (aTime == null && bTime == null) return 0;
      if (aTime == null) return -1;
      if (bTime == null) return 1;
      return bTime.compareTo(aTime);
    });
    return docs.map((doc) => doc.id).toSet();
  }

  bool _sameIds(Set<String> a, Set<String> b) =>
      a.length == b.length && a.containsAll(b);

  Future<void> _syncToFirestore(String userID) async {
    final generation = _syncGeneration;
    final collection = _bookmarksCollection(userID);
    try {
      final snapshot = await collection.get();
      if (isClosed || generation != _syncGeneration) return;
      final remoteIds = _orderedIds(snapshot);

      final merged = <String>{...state, ...remoteIds};
      if (!_sameIds(merged, state)) super.emit(merged);

      // Replay any local changes that were never acknowledged.
      final missing = state.difference(remoteIds);
      if (missing.isNotEmpty) {
        final batch = FirebaseFirestore.instance.batch();
        for (final id in missing) {
          batch.set(collection.doc(id), {'bookmarkedAt': FieldValue.serverTimestamp()});
        }
        await batch.commit();
      }
      if (isClosed || generation != _syncGeneration) return;
      _pendingAdds.clear();

      _firestoreSubscription = collection.snapshots().listen((snapshot) {
        if (isClosed || generation != _syncGeneration) return;
        final incoming = _orderedIds(snapshot);
        final merged = <String>{..._pendingAdds, ...incoming}..removeWhere(_pendingDeletes.contains);
        if (!_sameIds(merged, state)) super.emit(merged);
      }, onError: (error, stack) {
        showSomethingWentWrong(error: error, stack: stack, context: 'bookmarks:sync');
      });
    } catch (e, stack) {
      showSomethingWentWrong(error: e, stack: stack, context: 'bookmarks:sync');
    }
  }

  void _reset() {
    _pendingAdds.clear();
    _pendingDeletes.clear();
    if (!isClosed) emit(<String>{});
  }

  @override
  void emit(Set<String> state) {
    if (isClosed || _sameIds(state, this.state)) return;
    final old = this.state;
    super.emit(state);

    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;
    final collection = _bookmarksCollection(user.uid);

    for (final id in state.difference(old)) {
      _pendingDeletes.remove(id);
      _pendingAdds.add(id);
      collection.doc(id).set({'bookmarkedAt': FieldValue.serverTimestamp()})
          .then((_) {
            _pendingAdds.remove(id);
          })
          .catchError((Object error, StackTrace stack) {
        showSomethingWentWrong(error: error, stack: stack, context: 'bookmarks:add');
      });
    }
    for (final id in old.difference(state)) {
      _pendingAdds.remove(id);
      _pendingDeletes.add(id);
      collection.doc(id).delete()
          .then((_) {
            _pendingDeletes.remove(id);
          })
          .catchError((Object error, StackTrace stack) {
        showSomethingWentWrong(error: error, stack: stack, context: 'bookmarks:remove');
      });
    }
  }

  bool isBookmarked(Map<String, dynamic> data) {
    return state.contains(data['title'].toString());
  }

  void toggleBookmark(Map<String, dynamic> data) {
    final id = data['title'].toString();
    if (id.isEmpty) return;
    final next = <String>{...state};
    if (!next.remove(id)) {
      next.add(id);
      data['bookmarked'] = true;
    } else {
      data['bookmarked'] = false;
    }
    emit(next);
  }

  void markBookmarked(Map<String, dynamic> data) {
    final id = data['title'].toString();
    if (id.isEmpty) return;
    if (!state.contains(id)) emit(<String>{id, ...state});
    data['bookmarked'] = true;
  }

  List<Map<String, dynamic>> bookmarkedFacts(List<Map<String, dynamic>> facts) {
    final byTitle = <String, Map<String, dynamic>>{};
    for (final fact in facts) {
      byTitle[fact['title'].toString()] = fact;
    }
    return state
        .map((id) => byTitle[id])
        .whereType<Map<String, dynamic>>()
        .toList();
  }

  @override
  Future<void> close() async {
    await _authenticationSubscription?.cancel();
    await _firestoreSubscription?.cancel();
    return super.close();
  }

  @override
  Set<String>? fromJson(Map<String, dynamic> json) {
    final raw = json['bookmarks'];
    if (raw is! List) return <String>{};
    return raw.whereType<String>().toSet();
  }

  @override
  Map<String, dynamic>? toJson(Set<String> state) {
    return {'bookmarks': state.toList()};
  }
}

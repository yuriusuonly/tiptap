import 'dart:async';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:hydrated_bloc/hydrated_bloc.dart';
import 'package:tiptap/app/shared/toast.dart';

class BookmarkService extends HydratedCubit<Set<String>> {
  StreamSubscription? _authenticationSubscription;
  StreamSubscription? _firestoreSubscription;

  BookmarkService() : super(<String>{}) {
    _authenticationSubscription = FirebaseAuth.instance.authStateChanges().listen(
      (user) {
        _firestoreSubscription?.cancel();
        if (user != null) {
          _syncToFirestore(user.uid).catchError((_) { showSomethingWentWrong(); });
        } else {
          _reset();
        }
      },
      onError: (_) { showSomethingWentWrong(); },
    );
    final currentUser = FirebaseAuth.instance.currentUser;
    if (currentUser != null) {
      _syncToFirestore(currentUser.uid).catchError((_) { showSomethingWentWrong(); });
    }
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

  Future<void> _syncToFirestore(String userID) async {
    final collection = _bookmarksCollection(userID);
    try {
      final snapshot = await collection.get();
      final remoteIds = _orderedIds(snapshot);

      // Union merge — never lose local unsynced toggles, never lose remote adds.
      final merged = <String>{...state, ...remoteIds};
      if (isClosed) return;
      super.emit(merged);

      // Upload any local bookmarks not yet on the server.
      final missing = state.difference(remoteIds);
      if (missing.isNotEmpty) {
        final batch = FirebaseFirestore.instance.batch();
        for (final id in missing) {
          batch.set(collection.doc(id), {'bookmarkedAt': FieldValue.serverTimestamp()});
        }
        await batch.commit();
      }

      _firestoreSubscription = collection.snapshots().listen((snapshot) {
        if (isClosed) return;
        final incoming = _orderedIds(snapshot);
        if (incoming.length != state.length || !incoming.containsAll(state)) {
          super.emit(incoming);
        }
      }, onError: (_) { showSomethingWentWrong(); });
    } catch (_) {
      showSomethingWentWrong();
      // Offline — writes stay queued in the SDK; next auth change retries.
    }
  }

  void _reset() {
    if (isClosed) return;
    emit(<String>{});
  }

  @override
  void emit(Set<String> state) {
    if (isClosed) return;
    final old = this.state;
    super.emit(state);
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;
    final collection = _bookmarksCollection(user.uid);
    for (final id in state.difference(old)) {
      collection.doc(id).set({'bookmarkedAt': FieldValue.serverTimestamp()}).catchError((_) { showSomethingWentWrong(); });
    }
    for (final id in old.difference(state)) {
      collection.doc(id).delete().catchError((_) { showSomethingWentWrong(); });
    }
  }

  bool isBookmarked(Map<String, dynamic> data) {
    return state.contains(data['title'].toString());
  }

  void toggleBookmark(Map<String, dynamic> data) {
    final id = data['title'].toString();
    final next = <String>{...state};
    if (next.contains(id)) {
      next.remove(id);
      data['bookmarked'] = false;
    } else {
      // Newest bookmark first so the section stays sorted by date added.
      next.remove(id);
      final toggled = <String>{id, ...next};
      data['bookmarked'] = true;
      emit(toggled);
      return;
    }
    emit(next);
  }

  void markBookmarked(Map<String, dynamic> data) {
    final id = data['title'].toString();
    if (!state.contains(id)) {
      emit(<String>{id, ...state});
    }
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
  Future<void> close() {
    _authenticationSubscription?.cancel();
    _firestoreSubscription?.cancel();
    return super.close();
  }

  @override
  Set<String>? fromJson(Map<String, dynamic> json) {
    return Set<String>.from((json['bookmarks'] as List<dynamic>?) ?? const []);
  }

  @override
  Map<String, dynamic>? toJson(Set<String> state) {
    return {'bookmarks': state.toList()};
  }
}

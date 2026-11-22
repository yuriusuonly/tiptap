import 'dart:async';
import 'dart:math';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:tiptap/app/shared/toast.dart';

class ContentService extends Cubit<List<Map<String, dynamic>>> {
  static const int _batchSize = 5;
  // Prevents the de-duplication set from growing forever in an endless feed.
  static const int _maxSeenTitles = 500;

  final Random _random = Random();
  bool _isLoadingMore = false;
  final Set<String> _seenTitles = <String>{};
  StreamSubscription? _authenticationSubscription;
  String? _lastUserId;

  ContentService() : super([]) {
    _authenticationSubscription = FirebaseAuth.instance.authStateChanges().listen(
      (user) {
        if (isClosed) return;
        final uid = user?.uid;
        if (uid == _lastUserId) return;
        _lastUserId = uid;
        // Unlocked/rewarded state belongs to a session, not the previous user.
        if (state.isNotEmpty) {
          emit(state
              .map((e) => <String, dynamic>{...e, 'rewarded': false})
              .toList());
        }
      },
      onError: (error, stack) {
        showSomethingWentWrong(error: error, stack: stack, context: 'content:auth');
      },
    );
  }

  CollectionReference<Map<String, dynamic>> get _collection {
    return FirebaseFirestore.instance.collection('content');
  }

  static String slug(String title) {
    return title
        .toLowerCase()
        .replaceAll(RegExp(r'[^a-z0-9]+'), '-')
        .replaceAll(RegExp(r'^-|-$'), '');
  }

  String _randomToken() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    return String.fromCharCodes(
      List.generate(2, (_) => chars.codeUnitAt(_random.nextInt(chars.length))),
    );
  }

  List<Map<String, dynamic>> _toFacts(
    List<QueryDocumentSnapshot<Map<String, dynamic>>> docs,
  ) {
    final rewardedTitles = state
        .where((e) => e['rewarded'] == true)
        .map((e) => e['title'].toString())
        .toSet();
    final facts = <Map<String, dynamic>>[];
    for (final doc in docs) {
      final data = doc.data();
      final title = data['title']?.toString() ?? '';
      if (title.isEmpty) continue;
      facts.add(<String, dynamic>{
        'title': title,
        'body': data['body']?.toString() ?? '',
        'summary': data['summary']?.toString() ?? '',
        'rewarded': rewardedTitles.contains(title),
      });
    }
    facts.shuffle(_random);
    return facts;
  }

  Future<void> loadMore({Set<String> skip = const {}}) async {
    if (isClosed || _isLoadingMore) return;
    _isLoadingMore = true;
    try {
      final token = _randomToken();
      var snapshot = await _collection
          .where(FieldPath.documentId, isGreaterThanOrEqualTo: token)
          .limit(_batchSize)
          .get()
          .timeout(const Duration(seconds: 15));
      var docs = snapshot.docs;
      if (docs.length < _batchSize) {
        // Wrap around from the beginning to fill the batch.
        final wrap = await _collection
            .limit(_batchSize - docs.length)
            .get()
            .timeout(const Duration(seconds: 15));
        final seenIds = docs.map((d) => d.id).toSet();
        docs = [...docs, ...wrap.docs.where((d) => !seenIds.contains(d.id))];
      }
      final currentTitles = state.map((e) => e['title'].toString()).toSet();
      final facts = _toFacts(docs)
          .where((f) =>
              !_seenTitles.contains(f['title']) &&
              !currentTitles.contains(f['title']) &&
              !skip.contains(f['title'].toString()))
          .toList();
      if (isClosed || facts.isEmpty) return;
      for (final f in facts) {
        _seenTitles.add(f['title'].toString());
      }
      if (_seenTitles.length > _maxSeenTitles) {
        _seenTitles.removeWhere(
          (title) => !state.any((e) => e['title'] == title),
        );
      }
      emit([...state, ...facts]);
    } catch (e, stack) {
      showSomethingWentWrong(error: e, stack: stack, context: 'content:load');
    } finally {
      _isLoadingMore = false;
    }
  }

  /// Fetches bookmarked facts one-by-one so a single missing/denied document
  /// cannot make the whole bookmarks grid fail.
  Future<List<Map<String, dynamic>>> fetchByTitles(Set<String> titles) async {
    if (titles.isEmpty) return [];
    final results = await Future.wait(
      titles.map((title) async {
        try {
          return await _collection.doc(slug(title)).get().timeout(
                const Duration(seconds: 15),
              );
        } catch (_) {
          return null;
        }
      }),
    );
    final rewardedTitles = state
        .where((e) => e['rewarded'] == true)
        .map((e) => e['title'].toString())
        .toSet();
    return results
        .whereType<DocumentSnapshot<Map<String, dynamic>>>()
        .where((snapshot) => snapshot.exists)
        .map((snapshot) {
          final data = snapshot.data()!;
          final title = data['title']?.toString() ?? '';
          return <String, dynamic>{
            'title': title,
            'body': data['body']?.toString() ?? '',
            'summary': data['summary']?.toString() ?? '',
            'rewarded': rewardedTitles.contains(title),
          };
        })
        .where((e) => (e['title'] as String).isNotEmpty)
        .toList();
  }

  void markAsRewarded(String title) {
    if (isClosed) return;
    emit(state.map((e) {
      if (e['title'] == title) return <String, dynamic>{...e, 'rewarded': true};
      return e;
    }).toList());
  }

  void refresh({Set<String> skip = const {}}) {
    _seenTitles.clear();
    if (!isClosed) emit([]);
    loadMore(skip: skip);
  }

  @override
  void emit(List<Map<String, dynamic>> state) {
    if (isClosed) return;
    super.emit(state);
  }

  @override
  Future<void> close() async {
    await _authenticationSubscription?.cancel();
    return super.close();
  }
}

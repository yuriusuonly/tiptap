import 'dart:async';
import 'dart:math';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:tiptap/app/shared/toast.dart';

class ContentService extends Cubit<List<Map<String, dynamic>>> {
  static const int _batchSize = 5;
  final Random _random = Random();
  bool _isLoadingMore = false;
  final Set<String> _seenTitles = {};
  StreamSubscription? _authenticationSubscription;

  ContentService() : super([]) {
    _authenticationSubscription = FirebaseAuth.instance.authStateChanges().listen(
      (user) {
        if (user == null && !isClosed && state.isNotEmpty) {
          emit(state
              .map((e) => <String, dynamic>{...e, 'rewarded': false})
              .toList());
        }
      },
      onError: (_) { showSomethingWentWrong(); },
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

  List<Map<String, dynamic>> _toFacts(List<QueryDocumentSnapshot<Map<String, dynamic>>> docs) {
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
          .get();
      var docs = snapshot.docs;
      if (docs.length < _batchSize) {
        // Wrap around from the beginning to fill the batch.
        final wrap = await _collection.limit(_batchSize - docs.length).get();
        final seenIds = docs.map((d) => d.id).toSet();
        docs = [...docs, ...wrap.docs.where((d) => !seenIds.contains(d.id))];
      }
      final currentTitles = state.map((e) => e['title'].toString()).toSet();
      var facts = _toFacts(docs)
          .where((f) =>
              !_seenTitles.contains(f['title']) &&
              !currentTitles.contains(f['title']) &&
              !skip.contains(f['title'].toString()))
          .toList();
      if (isClosed) return;
      if (facts.isEmpty) return;
      for (final f in facts) {
        _seenTitles.add(f['title'].toString());
      }
      emit([...state, ...facts]);
    } catch (_) {
      showSomethingWentWrong();
    } finally {
      _isLoadingMore = false;
    }
  }

  Future<List<Map<String, dynamic>>> fetchByTitles(Set<String> titles) async {
    if (titles.isEmpty) return [];
    final futures = titles.map((title) => _collection.doc(slug(title)).get());
    final snapshots = await Future.wait(futures);
    return snapshots
        .where((s) => s.exists)
        .map((s) {
          final data = s.data()!;
          return <String, dynamic>{
            'title': data['title']?.toString() ?? '',
            'body': data['body']?.toString() ?? '',
            'summary': data['summary']?.toString() ?? '',
            'rewarded': state.any((e) => e['title'] == data['title'].toString() && e['rewarded'] == true),
          };
        })
        .where((e) => (e['title'] as String).isNotEmpty)
        .toList();
  }

  void markAsRewarded(String title) {
    if (isClosed) return;
    final next = state.map((e) {
      if (e['title'] == title) return <String, dynamic>{...e, 'rewarded': true};
      return e;
    }).toList();
    emit(next);
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

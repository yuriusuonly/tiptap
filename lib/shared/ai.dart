import 'dart:async';
import 'dart:convert';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_ai/firebase_ai.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:hydrated_bloc/hydrated_bloc.dart';

final GenerativeModel _generativeModel = FirebaseAI.googleAI().generativeModel(
  model: 'gemini-3.1-flash-lite-preview',
  generationConfig: GenerationConfig(
    responseMimeType: 'application/json',
    responseSchema: Schema(
      SchemaType.object,
      properties: {
        'title': Schema.string(description: 'The subject title.'),
        'body': Schema.string(description: 'One or more detailed paragraphs.'),
        'summary': Schema.string(description: 'A one-sentence TL;DR.')
      }
    )
  ),
  systemInstruction: Content.system(
    'You are a helpful trivia expert. '
    'Always provide informative, exciting, and verified facts. '
    'Avoid repetition and always give unique random facts.'
  )
);

class AIService extends HydratedCubit<List<Map<String, dynamic>>> {
  StreamSubscription? _authenticationSubscription;
  StreamSubscription? _firestoreSubscription;

  AIService() : super([]) {
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

    final List<Map<String, dynamic>> remoteData = snapshot.exists
        ? List<Map<String, dynamic>>.from(snapshot.data()?['ai'] ?? [])
        : [];

    // Merge local state with remote data to prevent data loss for new users
    final mergedData = List<Map<String, dynamic>>.from(remoteData);
    bool needsUpdate = false;
    for (final localItem in state) {
      if (!mergedData.any((item) => item['title'] == localItem['title'])) {
        mergedData.add(localItem);
        needsUpdate = true;
      }
    }

    if (needsUpdate || !snapshot.exists) {
      await document.set({'ai': mergedData}, SetOptions(merge: true));
    }
    super.emit(mergedData);

    _firestoreSubscription = document.snapshots().listen((snapshot) {
      if (snapshot.exists) {
        final incomingData = List<Map<String, dynamic>>.from(snapshot.data()?['ai'] ?? []);
        // Use jsonEncode for a simple deep comparison of the list content
        if (jsonEncode(incomingData) != jsonEncode(state)) {
          super.emit(incomingData);
        }
      }
    });
  }

  void _reset() {
    emit([]);
  }

  @override
  void emit(List<Map<String, dynamic>> state) {
    super.emit(state);
    final user = FirebaseAuth.instance.currentUser;
    if (user != null) {
      FirebaseFirestore.instance
        .collection('users')
        .doc(user.uid)
        .set({'ai': state}, SetOptions(merge: true));
    }
  }

  Future<void> askAI() async {
    final newState = List<Map<String, dynamic>>.from(state);
    final prompt = 'Tell me a random interesting fact.'
      '${newState.isNotEmpty ? ' Do not repeat any of the following topics: ${newState.map((map) => map['title']).join(', ')}.' : ''}';
    final response = await _generativeModel.generateContent([Content.text(prompt)]);
    if (response.text == null) {
      throw 'AI response is empty.';
    }
    final result = jsonDecode(response.text!) as Map<String, dynamic>;
    result.addAll({'bookmarked': false});
    result.addAll({'rewarded': false});
    newState.add(result);
    emit(newState);
  }

  void markAsRewarded(Map<String, dynamic> data) {
    final newState = List<Map<String, dynamic>>.from(state);
    final index = newState.indexWhere((map) => map['title'] == data['title']);
    if (index != -1) {
      newState[index]['rewarded'] = true;
      emit(newState);
    }
  }

  void toggleBookmark(Map<String, dynamic> data) {
    final newState = List<Map<String, dynamic>>.from(state);
    final index = newState.indexWhere((map) => map['title'] == data['title']);
    if (index != -1) {
      newState[index]['bookmarked'] = !newState[index]['bookmarked'];
      emit(newState);
    }
  }

  List<Map<String, dynamic>> getBookmarks() {
    return state.where((map) => map['bookmarked'] == true).toList();
  }

  @override
  Future<void> close() {
    _authenticationSubscription?.cancel();
    _firestoreSubscription?.cancel();
    return super.close();
  }

  @override
  List<Map<String, dynamic>>? fromJson(Map<String, dynamic> json) {
    return List<Map<String, dynamic>>.from(json['ai'] ?? []);
  }

  @override
  Map<String, dynamic>? toJson(List<Map<String, dynamic>> state) {
    return {'ai': state};
  }
}

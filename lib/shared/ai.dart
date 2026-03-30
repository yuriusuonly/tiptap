import 'dart:async';
import 'dart:convert';

import 'package:firebase_ai/firebase_ai.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:tiptap/shared/database.dart';

final GenerativeModel _generativeModel = FirebaseAI.googleAI().generativeModel(
  model: 'gemini-3.1-flash-lite-preview',
  generationConfig: GenerationConfig(
    responseMimeType: 'application/json',
    responseSchema: Schema(
      SchemaType.object,
      properties: {
        'title': Schema.string(),
        'body': Schema.string(),
        'summary': Schema.string()
      }
    )
  ),
  systemInstruction: Content.system(
    'You are a helpful trivia expert. '
    'You always provide informative, exciting, and verified facts.'
  )
);

class AIService extends Cubit<List<int>> {
  final DatabaseService _databaseService;
  StreamSubscription? _databaseSubscription;

  AIService(this._databaseService)
      : super(List<int>.generate(
            (_databaseService.get('ai') as List?)?.length ?? 0, (i) => i)) {
    _databaseSubscription = _databaseService.stream.listen(
      (data) {
        final aiList = data['ai'] as List?;
        emit(List<int>.generate(aiList?.length ?? 0, (i) => i));
      }
    );
  }

  Future<int?> askAI() async {
    await Future.delayed(const Duration(milliseconds: 1000));
    final aiData = List<Map<String, dynamic>>.from(_databaseService.get('ai') ?? []);
    final prompt = 'Tell me a random interesting fact.'
      '${aiData.isNotEmpty ? ' Do not repeat any of the following topics: ${aiData.map((map) => map['title']).join(', ')}.' : ''}';
      
    final response = await _generativeModel.generateContent([Content.text(prompt)]);
    if (response.text == null) {
      throw 'AI response is empty.';
    }

    final result = jsonDecode(response.text!) as Map<String, dynamic>;
    result.addAll({'bookmarked': false});
    result.addAll({'rewarded': false});
    aiData.add(result);
    _databaseService.set({'ai': aiData});
    return aiData.length - 1;
  }

  List<int> get bookmarks {
    final aiData = _databaseService.get('ai') as List? ?? [];
    return [for (int i = 0; i < aiData.length; i++) if (aiData[i]['bookmarked'] == true) i];
  }

  Map<String, dynamic>? getByIndex(int index) {
    final aiData = _databaseService.get('ai') as List?;
    if (aiData == null || index < 0 || index >= aiData.length) return null;
    return aiData[index] as Map<String, dynamic>?;
  }

  Future<void> markAsRewarded(int index) async {
    final aiData = List<Map<String, dynamic>>.from(_databaseService.get('ai') ?? []);
    if (index >= 0 && index < aiData.length) {
      aiData[index]['rewarded'] = true;
      await _databaseService.set({'ai': aiData});
    }
  }

  Future<void> toggleBookmark(int index) async {
    final aiData = List<Map<String, dynamic>>.from(_databaseService.get('ai') ?? []);
    if (index >= 0 && index < aiData.length) {
      aiData[index]['bookmarked'] = !(aiData[index]['bookmarked'] ?? false);
      await _databaseService.set({'ai': aiData});
    }
  }

  @override
  Future<void> close() async {
    await _databaseSubscription?.cancel();
    return await super.close();
  }
}

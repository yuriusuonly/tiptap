import 'dart:async';

import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:tiptap/shared/database.dart';

class StreakService extends Cubit<Map<String, dynamic>> {
  final DatabaseService _databaseService;
  StreamSubscription? _databaseSubscription;

  StreakService(this._databaseService) : super({}) {
    _databaseSubscription = _databaseService.stream
      .listen(
        (data) {
          emit(data['streak'] ?? {});
        }
      );
  }

  int get count {
    final streakData = _databaseService.get('streak') ?? {};
    final lastActivityStr = streakData['last_activity'];
    if (lastActivityStr == null) return 0;

    final lastActivity = DateTime.parse(lastActivityStr);
    final now = DateTime.now();
    final lastDate = DateTime(lastActivity.year, lastActivity.month, lastActivity.day);
    final today = DateTime(now.year, now.month, now.day);
    final yesterday = today.subtract(const Duration(days: 1));

    return (lastDate == today || lastDate == yesterday) ? (streakData['count'] as int? ?? 0) : 0;
  }

  void recordActivity() {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final streakData = _databaseService.get('streak') ?? {};
    final lastActivityStr = streakData['last_activity'];
    int newCount = 1;

    if (lastActivityStr != null) {
      final lastActivity = DateTime.parse(lastActivityStr);
      final lastDate = DateTime(lastActivity.year, lastActivity.month, lastActivity.day);
      final yesterday = today.subtract(const Duration(days: 1));

      if (lastDate == today) {
        newCount = streakData['count'] as int? ?? 1;
      } else if (lastDate == yesterday) {
        newCount = (streakData['count'] as int? ?? 0) + 1;
      }
    }

    _databaseService.set({
      'streak': {
        'count': newCount,
        'last_activity': now.toIso8601String(),
      }
    });
  }

  @override
  Future<void> close() async {
    await _databaseSubscription?.cancel();
    return await super.close();
  }
}

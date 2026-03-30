import 'dart:async';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:tiptap/shared/database.dart';

class FirstLaunchService extends Cubit<bool> {
  final DatabaseService _databaseService;
  StreamSubscription? _databaseSubscription;

  FirstLaunchService(this._databaseService)
      : super(_databaseService.get('first_launch') as bool? ?? true) {
    _databaseSubscription = _databaseService.stream.listen(
      (data) {
        final isFirst = data['first_launch'] as bool? ?? true;
        emit(isFirst);
      }
    );
  }

  Future<void> dismissIntro() async {
    await _databaseService.set({'first_launch': false});
  }

  @override
  Future<void> close() async {
    await _databaseSubscription?.cancel();
    return await super.close();
  }
}

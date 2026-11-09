import 'package:flutter/material.dart';

final appScaffoldMessengerKey = GlobalKey<ScaffoldMessengerState>();
GlobalKey<ScaffoldMessengerState>? _bottomSheetScaffoldMessengerKey;
DateTime? _lastShown;

GlobalKey<ScaffoldMessengerState> get activeScaffoldMessengerKey =>
    _bottomSheetScaffoldMessengerKey ?? appScaffoldMessengerKey;

void setBottomSheetScaffoldMessenger(GlobalKey<ScaffoldMessengerState>? key) {
  _bottomSheetScaffoldMessengerKey = key;
}

void showSomethingWentWrong() {
  final now = DateTime.now();
  if (_lastShown != null && now.difference(_lastShown!) < const Duration(seconds: 2)) return;
  _lastShown = now;
  final messenger = activeScaffoldMessengerKey.currentState;
  if (messenger == null) return;
  messenger.hideCurrentSnackBar();
  messenger.showSnackBar(
    const SnackBar(content: Text('Something went wrong')),
  );
}

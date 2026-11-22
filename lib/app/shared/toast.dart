import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'package:flutter/foundation.dart';
import 'package:material_ui/material_ui.dart';

final appScaffoldMessengerKey = GlobalKey<ScaffoldMessengerState>();
GlobalKey<ScaffoldMessengerState>? _bottomSheetScaffoldMessengerKey;
DateTime? _lastShown;

GlobalKey<ScaffoldMessengerState> get activeScaffoldMessengerKey =>
    _bottomSheetScaffoldMessengerKey ?? appScaffoldMessengerKey;

void setBottomSheetScaffoldMessenger(GlobalKey<ScaffoldMessengerState>? key) {
  _bottomSheetScaffoldMessengerKey = key;
}

/// Records an error with Crashlytics in release builds and logs it in debug.
///
/// Never throws: error reporting must not break the UI that triggered it.
void reportError(
  Object error,
  StackTrace? stack, {
  String? context,
  bool fatal = false,
}) {
  final label = context == null ? 'AppError' : 'AppError:$context';
  if (kDebugMode) {
    debugPrint('[$label] $error');
    if (stack != null) debugPrintStack(stackTrace: stack, label: label);
    return;
  }
  try {
    FirebaseCrashlytics.instance.recordError(
      error,
      stack ?? StackTrace.current,
      fatal: fatal,
      information: context == null ? <String>[] : <String>[context],
    );
  } catch (_) {
    // Crashlytics may not be initialized yet (e.g. during bootstrap).
    debugPrint('[$label] $error');
  }
}

/// Shows a user-friendly, rate-limited error snackbar and reports [error].
void showSomethingWentWrong({
  Object? error,
  StackTrace? stack,
  String? context,
}) {
  if (error != null) reportError(error, stack, context: context);

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

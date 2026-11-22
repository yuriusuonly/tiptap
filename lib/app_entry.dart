import 'dart:async';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_analytics/firebase_analytics.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'package:flutter/foundation.dart';
import 'package:material_ui/material_ui.dart';
import 'package:flutter/services.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:hydrated_bloc/hydrated_bloc.dart';
import 'package:path_provider/path_provider.dart';
import 'package:tiptap/app/shared/bootstrap_error_screen.dart';
import 'package:tiptap/app/shared/firebase_options.dart';
import 'package:tiptap/app/shared/root.dart';
import 'package:tiptap/app/shared/toast.dart';

// A bounded offline cache prevents unbounded disk usage on long-lived installs.
const _firestoreCacheSize = 50 * 1024 * 1024;

Future<void> bootstrap() async {
  runZonedGuarded(
    () async {
      try {
        await _initialize();
        runApp(const Root());
      } catch (error, stack) {
        reportError(error, stack, context: 'bootstrap', fatal: true);
        runApp(const BootstrapErrorScreen());
      }
    },
    (error, stack) {
      reportError(error, stack, context: 'zone', fatal: true);
    },
  );
}

Future<void> _initialize() async {
  WidgetsFlutterBinding.ensureInitialized();

  LicenseRegistry.addLicense(() async* {
    final license = await rootBundle.loadString('fonts/OFL.txt');
    yield LicenseEntryWithLineBreaks(['google_fonts'], license);
  });

  // Critical: nothing else can work without Firebase.
  await _step('firebase', () async {
    if (Firebase.apps.isEmpty) {
      await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
    }
  }, fatal: true);

  if (!kDebugMode) {
    await _step('crashlytics', () async {
      await FirebaseCrashlytics.instance.setCrashlyticsCollectionEnabled(true);
      FlutterError.onError = FirebaseCrashlytics.instance.recordFlutterFatalError;
      PlatformDispatcher.instance.onError = (error, stack) {
        reportError(error, stack, context: 'platform', fatal: true);
        return true;
      };
    });
    await _step('analytics', () async {
      await FirebaseAnalytics.instance.setAnalyticsCollectionEnabled(true);
    });
  }

  // Firestore settings must be set before any Firestore use. A failure here is
  // non-fatal: Firestore still works with its default (in-memory) settings.
  await _step('firestore-settings', () async {
    FirebaseFirestore.instance.settings = const Settings(
      persistenceEnabled: true,
      cacheSizeBytes: _firestoreCacheSize,
    );
  });

  await _step('google-sign-in', GoogleSignIn.instance.initialize);

  await _step('admob', () async {
    // Set request configuration before initialize() (Next-Gen SDK requirement).
    var testDeviceIds = String.fromEnvironment('ADMOB_TEST_DEVICE_IDS')
        .split(',')
        .map((e) => e.trim())
        .where((e) => e.isNotEmpty)
        .toList();
    if (testDeviceIds.isEmpty && kDebugMode) {
      testDeviceIds = const ['E750E69FA446F5DCD51E149DB7AE183B'];
    }
    if (testDeviceIds.isNotEmpty) {
      await MobileAds.instance.updateRequestConfiguration(
        RequestConfiguration(testDeviceIds: testDeviceIds),
      );
    }
    await MobileAds.instance.initialize();
  });

  // Critical: HydratedCubits require storage to be configured before they are
  // created by the widget tree. Fall back to the temporary directory if the
  // documents directory is unavailable.
  await _step('hydrated-storage', () async {
    final directory = await _storageDirectory();
    HydratedBloc.storage = await HydratedStorage.build(
      storageDirectory: kIsWeb
          ? HydratedStorageDirectory.web
          : HydratedStorageDirectory(directory),
    );
  }, fatal: true);

  await _step('system-ui', () async {
    await SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
  });
}

Future<String> _storageDirectory() async {
  try {
    return (await getApplicationDocumentsDirectory()).path;
  } catch (_) {
    return (await getTemporaryDirectory()).path;
  }
}

/// Runs an initialization step, reporting failures instead of leaving the app
/// in a half-configured state without diagnostics.
Future<void> _step(
  String name,
  Future<void> Function() step, {
  bool fatal = false,
}) async {
  try {
    await step();
  } catch (error, stack) {
    reportError(error, stack, context: 'init:$name');
    if (fatal) rethrow;
  }
}

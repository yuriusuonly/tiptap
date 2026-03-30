import 'dart:async';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_analytics/firebase_analytics.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:hydrated_bloc/hydrated_bloc.dart';
import 'package:path_provider/path_provider.dart';
import 'package:tiptap/shared/firebase_options.dart';
import 'package:tiptap/shared/root.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  LicenseRegistry.addLicense(() async* {
    final license = await rootBundle.loadString('fonts/OFL.txt');
    yield LicenseEntryWithLineBreaks(['google_fonts'], license);
  });

  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);

  if (!kDebugMode) {
    await FirebaseAnalytics.instance.setAnalyticsCollectionEnabled(true);
    await FirebaseCrashlytics.instance.setCrashlyticsCollectionEnabled(true);
  }

  if (!kIsWeb) {
    await GoogleSignIn.instance.initialize();
    await MobileAds.instance.initialize();
  }

  FirebaseFirestore.instance.settings = const Settings(
    persistenceEnabled: true,
    cacheSizeBytes: Settings.CACHE_SIZE_UNLIMITED
  );

  HydratedBloc.storage = await HydratedStorage.build(
    storageDirectory: kIsWeb
      ? HydratedStorageDirectory.web
      : HydratedStorageDirectory((await getApplicationDocumentsDirectory()).path)
  );

  await SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);

  runApp(const Root());
}

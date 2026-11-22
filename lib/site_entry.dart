import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:material_ui/material_ui.dart';
import 'package:flutter/services.dart';
import 'package:flutter_web_plugins/url_strategy.dart';
import 'package:tiptap/site/root.dart';

Future<void> bootstrap() async {
  runZonedGuarded(
    () async {
      WidgetsFlutterBinding.ensureInitialized();

      LicenseRegistry.addLicense(() async* {
        final license = await rootBundle.loadString('fonts/OFL.txt');
        yield LicenseEntryWithLineBreaks(['google_fonts'], license);
      });

      usePathUrlStrategy();

      runApp(const Root());
    },
    (error, stack) {
      debugPrint('[site bootstrap] $error');
      debugPrintStack(stackTrace: stack);
    },
  );
}

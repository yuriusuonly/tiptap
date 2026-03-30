import 'dart:io';

import 'package:flutter/foundation.dart';

class AdMobOptions {
  static String get rewardedAdUnitID {
    if (Platform.isAndroid) {
      if (kDebugMode) {
        return 'ca-app-pub-3940256099942544/5224354917';
      }
      return String.fromEnvironment('ADMOB_ANDROID_REWARDED_AD_UNIT_ID');
    }
    throw UnsupportedError('AdMobOptions are not supported for this platform.');
  }
}

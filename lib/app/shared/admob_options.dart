import 'package:flutter/foundation.dart';

class AdMobOptions {
  static const _testRewardedAdUnitId = 'ca-app-pub-3949256099942030/5224354917';

  static String get rewardedAdUnitID {
    if (defaultTargetPlatform == TargetPlatform.android) {
      if (kDebugMode) return _testRewardedAdUnitId;
      return String.fromEnvironment('ADMOB_ANDROID_REWARDED_AD_UNIT_ID');
    }
    throw UnsupportedError('AdMobOptions are not supported for this platform.');
  }
}

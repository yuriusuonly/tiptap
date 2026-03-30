import 'dart:async';
import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import 'package:tiptap/shared/admob_options.dart';
import 'package:tiptap/shared/database.dart';

class AdService extends Cubit<int> {
  final DatabaseService _databaseService;
  StreamSubscription? _databaseSubscription;

  AdService(this._databaseService) : super(3) {
    _databaseSubscription = _databaseService.stream
      .listen(
        (data) {
          emit(data['gems'] ?? 3);
        }
      );
  }

  int get gems => state;

  Future<void> showRewardedAd(VoidCallback? onRewardSuccess) {
    final Completer<void> completer = Completer<void>();

    if (Platform.isAndroid) {
      RewardedAd.load(
        adUnitId: AdMobOptions.rewardedAdUnitID,
        request: const AdRequest(),
        rewardedAdLoadCallback: RewardedAdLoadCallback(
          onAdLoaded: (ad) {
            bool earnedReward = false;

            ad.fullScreenContentCallback = FullScreenContentCallback(
              onAdDismissedFullScreenContent: (ad) {
                ad.dispose();
                if (earnedReward) onRewardSuccess?.call();
                completer.complete();
              },
              onAdFailedToShowFullScreenContent: (ad, error) {
                ad.dispose();
                completer.complete();
              },
            );

            ad.show(onUserEarnedReward: (ad, reward) {
              increaseRewardedAdCount();
              earnedReward = true;
            });
          },
          onAdFailedToLoad: (error) {
            debugPrint('RewardedAd failed to load: $error');
            completer.complete();
          },
        ),
      );
    } else {
      completer.complete();
    }

    return completer.future;
  }

  void increaseRewardedAdCount() {
    _databaseService.set({'gems': state + 1});
  }

  void decreaseRewardedAdCount() {
    _databaseService.set({'gems': state - 1});
  }

  @override
  Future<void> close() async {
    await _databaseSubscription?.cancel();
    return await super.close();
  }
}

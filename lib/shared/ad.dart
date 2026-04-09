import 'dart:async';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import 'package:hydrated_bloc/hydrated_bloc.dart';
import 'package:tiptap/shared/admob_options.dart';

class AdService extends HydratedCubit<int> {
  StreamSubscription? _authenticationSubscription;
  StreamSubscription? _firestoreSubscription;

  AdService() : super(3) {
    _authenticationSubscription = FirebaseAuth.instance.authStateChanges().listen(
      (user) {
        _firestoreSubscription?.cancel();
        if (user != null) {
          _syncToFirestore(user.uid);
        } else {
          _reset();
        }
      }
    );
  }

  Future<void> _syncToFirestore(String userID) async {
    final document = FirebaseFirestore.instance.collection('users').doc(userID);
    final snapshot = await document.get();

    int remoteGems = snapshot.exists ? (snapshot.data()?['gems'] as int? ?? 3) : 3;
    // Merge logic: Take the higher value to preserve progress
    int mergedGems = remoteGems > state ? remoteGems : state;

    if (!snapshot.exists || mergedGems > remoteGems) {
      await document.set({'gems': mergedGems}, SetOptions(merge: true));
    }
    super.emit(mergedGems);

    _firestoreSubscription = document.snapshots().listen((snapshot) {
      if (snapshot.exists) {
        final incomingGems = snapshot.data()?['gems'] as int? ?? 3;
        if (incomingGems != state) {
          super.emit(incomingGems);
        }
      }
    });
  }

  void _reset() {
    emit(3);
  }

  @override
  void emit(int state) {
    super.emit(state);
    final user = FirebaseAuth.instance.currentUser;
    if (user != null) {
      FirebaseFirestore.instance
        .collection('users')
        .doc(user.uid)
        .set({'gems': state}, SetOptions(merge: true));
    }
  }

  Future<void> showRewardedAd() async {
    final completer = Completer<void>();

    await RewardedAd.load(
      adUnitId: AdMobOptions.rewardedAdUnitID,
      request: const AdRequest(),
      rewardedAdLoadCallback: RewardedAdLoadCallback(
        onAdLoaded: (ad) {
          ad.fullScreenContentCallback = FullScreenContentCallback(
            onAdDismissedFullScreenContent: (ad) {
              ad.dispose();
              if (!completer.isCompleted) completer.complete();
            },
            onAdFailedToShowFullScreenContent: (ad, error) {
              ad.dispose();
              if (!completer.isCompleted) completer.completeError(error);
            },
          );
          ad.show(onUserEarnedReward: (ad, reward) {
            increaseRewardedAdCount();
          });
        },
        onAdFailedToLoad: (error) {
          if (!completer.isCompleted) completer.completeError(error);
        },
      ),
    );

    return completer.future;
  }

  void increaseRewardedAdCount() {
    emit(state + 1);
  }

  void decreaseRewardedAdCount() {
    emit(state - 1);
  }

  @override
  Future<void> close() {
    _authenticationSubscription?.cancel();
    _firestoreSubscription?.cancel();
    return super.close();
  }

  @override
  int? fromJson(Map<String, dynamic> json) {
    return json['gems'] as int? ?? 3;
  }

  @override
  Map<String, dynamic>? toJson(int state) {
    return {'gems': state};
  }
}

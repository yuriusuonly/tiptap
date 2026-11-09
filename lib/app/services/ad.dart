import 'dart:async';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import 'package:hydrated_bloc/hydrated_bloc.dart';
import 'package:tiptap/app/shared/toast.dart';
import 'package:tiptap/app/shared/admob_options.dart';

class AdService extends HydratedCubit<int> {
  StreamSubscription? _authenticationSubscription;
  StreamSubscription? _firestoreSubscription;
  bool _isSyncing = false;

  AdService() : super(3) {
    _authenticationSubscription = FirebaseAuth.instance.authStateChanges().listen(
      (user) {
        _firestoreSubscription?.cancel();
        if (user != null) {
          _syncToFirestore(user.uid).catchError((_) { showSomethingWentWrong(); });
        } else {
          _reset();
        }
      },
      onError: (_) { showSomethingWentWrong(); },
    );
  }

  int _parseGems(dynamic value) {
    if (value is int) return value;
    if (value is num) return value.toInt();
    if (value is String) return int.tryParse(value) ?? 3;
    return 3;
  }

  Future<void> _syncToFirestore(String userID) async {
    _isSyncing = true;
    try {
      final document = FirebaseFirestore.instance.collection('users').doc(userID);
      final snapshot = await document.get();

      final hasField = snapshot.exists && snapshot.data()?['gems'] != null;
      if (!snapshot.exists || !hasField) {
        // New account/profile: only then sync local -> Firestore.
        await document.set({'gems': state}, SetOptions(merge: true));
      } else {
        // Existing account: Firestore is authoritative, never overwrite with local.
        if (isClosed) return;
        super.emit(_parseGems(snapshot.data()?['gems']));
      }

      _firestoreSubscription = document.snapshots().listen((snapshot) {
        if (isClosed) return;
        if (snapshot.exists) {
          final incomingGems = _parseGems(snapshot.data()?['gems']);
          if (incomingGems != state) {
            super.emit(incomingGems);
          }
        }
      }, onError: (_) { showSomethingWentWrong(); });
    } catch (_) {
      showSomethingWentWrong();
      // Offline / permission — keep local value; retry next auth change.
    } finally {
      _isSyncing = false;
    }
  }

  void _reset() {
    if (isClosed) return;
    emit(3);
  }

  @override
  void emit(int state) {
    if (isClosed) return;
    super.emit(state);
    if (_isSyncing) return;
    final user = FirebaseAuth.instance.currentUser;
    if (user != null) {
      FirebaseFirestore.instance
        .collection('users')
        .doc(user.uid)
        .set({'gems': state}, SetOptions(merge: true))
        .catchError((_) { showSomethingWentWrong(); });
    }
  }

  Future<void> showRewardedAd() async {
    final completer = Completer<void>();
    final adUnitId = AdMobOptions.rewardedAdUnitID;
    if (adUnitId.trim().isEmpty) {
      debugPrint('AdMob: rewardedAdUnitID is empty — did you run with --dart-define-from-file=.env?');
      if (!completer.isCompleted) completer.completeError('Ad unit ID is not configured.');
      return completer.future;
    }
    debugPrint('AdMob: requesting rewarded ad unit=${adUnitId.substring(0, adUnitId.length > 14 ? 14 : adUnitId.length)}... (${adUnitId.length} chars)');
    try {
      await RewardedAd.load(
        adUnitId: adUnitId,
        request: const AdRequest(),
        rewardedAdLoadCallback: RewardedAdLoadCallback(
          onAdLoaded: (ad) {
            debugPrint('AdMob: rewarded ad loaded, showing...');
            ad.fullScreenContentCallback = FullScreenContentCallback(
              onAdDismissedFullScreenContent: (ad) {
                ad.dispose();
                if (!completer.isCompleted) completer.complete();
              },
              onAdFailedToShowFullScreenContent: (ad, error) {
                debugPrint('AdMob show failed code=${error.code} domain=${error.domain} message=${error.message}');
                ad.dispose();
                if (!completer.isCompleted) completer.completeError(error);
              },
            );
            ad.show(onUserEarnedReward: (ad, reward) {
              increaseRewardedAdCount();
            });
          },
          onAdFailedToLoad: (error) {
            debugPrint('AdMob load failed code=${error.code} domain=${error.domain} message=${error.message}');
            if (!completer.isCompleted) completer.completeError(error);
          },
        ),
      );
    } catch (e) {
      debugPrint('AdMob exception: $e');
      if (!completer.isCompleted) completer.completeError(e);
    }

    return completer.future;
  }

  void increaseRewardedAdCount() {
    if (isClosed) return;
    emit(state + 1);
  }

  void decreaseRewardedAdCount() {
    if (isClosed) return;
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
    return _parseGems(json['gems']);
  }

  @override
  Map<String, dynamic>? toJson(int state) {
    return {'gems': state};
  }
}

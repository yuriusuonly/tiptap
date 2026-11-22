import 'dart:async';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import 'package:hydrated_bloc/hydrated_bloc.dart';
import 'package:tiptap/app/shared/admob_options.dart';
import 'package:tiptap/app/shared/toast.dart';

class AdService extends HydratedCubit<int> {
  StreamSubscription? _authenticationSubscription;
  StreamSubscription? _firestoreSubscription;
  bool _isSyncing = false;
  int _syncGeneration = 0;

  AdService() : super(3) {
    _authenticationSubscription = FirebaseAuth.instance.authStateChanges().listen(
      (user) {
        _syncGeneration++;
        _firestoreSubscription?.cancel();
        _firestoreSubscription = null;
        if (user != null) {
          _syncToFirestore(user.uid);
        } else {
          _reset();
        }
      },
      onError: (error, stack) {
        showSomethingWentWrong(error: error, stack: stack, context: 'ads:auth');
      },
    );
  }

  int _parseGems(dynamic value) {
    if (value is int) return value;
    if (value is num) return value.toInt();
    if (value is String) return int.tryParse(value) ?? 3;
    return 3;
  }

  Future<void> _syncToFirestore(String userID) async {
    final generation = _syncGeneration;
    _isSyncing = true;
    try {
      final document = FirebaseFirestore.instance.collection('users').doc(userID);
      final snapshot = await document.get();
      if (isClosed || generation != _syncGeneration) return;

      final hasField = snapshot.exists && snapshot.data()?['gems'] != null;
      if (!snapshot.exists || !hasField) {
        // New account/profile: only then sync local -> Firestore.
        await document.set({'gems': state}, SetOptions(merge: true));
      } else {
        // Existing account: Firestore is authoritative, never overwrite with local.
        super.emit(_parseGems(snapshot.data()?['gems']).clamp(0, 1 << 30));
      }

      if (isClosed || generation != _syncGeneration) return;
      _firestoreSubscription = document.snapshots().listen((snapshot) {
        if (isClosed || generation != _syncGeneration) return;
        if (snapshot.exists) {
          final incomingGems = _parseGems(snapshot.data()?['gems']).clamp(0, 1 << 30);
          if (incomingGems != state) super.emit(incomingGems);
        }
      }, onError: (error, stack) {
        showSomethingWentWrong(error: error, stack: stack, context: 'ads:sync');
      });
    } catch (e, stack) {
      showSomethingWentWrong(error: e, stack: stack, context: 'ads:sync');
    } finally {
      if (generation == _syncGeneration) _isSyncing = false;
    }
  }

  void _reset() {
    if (!isClosed && state != 3) emit(3);
  }

  @override
  void emit(int state) {
    if (isClosed || state == this.state) return;
    super.emit(state);
    if (_isSyncing) return;
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;
    FirebaseFirestore.instance
        .collection('users')
        .doc(user.uid)
        .set({'gems': state}, SetOptions(merge: true))
        .catchError((Object error, StackTrace stack) {
      showSomethingWentWrong(error: error, stack: stack, context: 'ads:write');
    });
  }

  /// Shows a rewarded ad. Returns `true` only when the reward callback fired;
  /// dismissal, load/show failures and timeouts all return `false`.
  Future<bool> showRewardedAd() async {
    final adUnitId = AdMobOptions.rewardedAdUnitID;
    if (adUnitId.trim().isEmpty) {
      if (kDebugMode) {
        debugPrint('AdMob: rewardedAdUnitID is empty — check --dart-define-from-file=.env');
      }
      return false;
    }

    final completer = Completer<bool>();
    RewardedAd? ad;
    Timer? safetyTimer;
    var settled = false;
    var earned = false;

    void settle() {
      if (settled) return;
      settled = true;
      safetyTimer?.cancel();
      ad?.dispose();
      ad = null;
      if (!completer.isCompleted) completer.complete(earned);
    }

    // Guards against a callback never arriving (backgrounded app, SDK stall).
    safetyTimer = Timer(const Duration(seconds: 90), settle);

    try {
      await RewardedAd.load(
        adUnitId: adUnitId,
        request: const AdRequest(),
        rewardedAdLoadCallback: RewardedAdLoadCallback(
          onAdLoaded: (loaded) {
            ad = loaded;
            if (settled) {
              loaded.dispose();
              ad = null;
              return;
            }
            loaded.fullScreenContentCallback = FullScreenContentCallback(
              onAdDismissedFullScreenContent: (_) => settle(),
              onAdFailedToShowFullScreenContent: (_, error) {
                if (kDebugMode) debugPrint('AdMob show failed: ${error.message}');
                reportError(error, null, context: 'ads:show');
                settle();
              },
            );
            try {
              loaded.show(onUserEarnedReward: (_, _) => earned = true);
            } catch (e, stack) {
              reportError(e, stack, context: 'ads:show');
              settle();
            }
          },
          onAdFailedToLoad: (error) {
            if (kDebugMode) debugPrint('AdMob load failed: ${error.message}');
            reportError(error, null, context: 'ads:load');
            settle();
          },
        ),
      );
    } catch (e, stack) {
      reportError(e, stack, context: 'ads:load');
      settle();
    }
    return completer.future;
  }

  void increaseRewardedAdCount() {
    if (!isClosed) emit(state + 1);
  }

  void decreaseRewardedAdCount() {
    if (!isClosed && state > 0) emit(state - 1);
  }

  @override
  Future<void> close() {
    _authenticationSubscription?.cancel();
    _firestoreSubscription?.cancel();
    return super.close();
  }

  @override
  int? fromJson(Map<String, dynamic> json) {
    return _parseGems(json['gems']).clamp(0, 1 << 30);
  }

  @override
  Map<String, dynamic>? toJson(int state) {
    return {'gems': state};
  }
}

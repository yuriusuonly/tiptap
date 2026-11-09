import 'dart:async';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:hydrated_bloc/hydrated_bloc.dart';
import 'package:tiptap/app/shared/toast.dart';
import 'package:in_app_purchase/in_app_purchase.dart';
import 'package:in_app_purchase_android/in_app_purchase_android.dart';
import 'package:url_launcher/url_launcher.dart';

// Billing stays in test mode for all builds (debug + release) via the Play
// Console test track + License Testers. Keep `tiptap_premium_subscription` on
// the test track; do not promote to the production track.
class PremiumService extends HydratedCubit<bool> {
  late final InAppPurchase _inAppPurchase;
  StreamSubscription<List<PurchaseDetails>>? _purchaseDetailsSubscription;
  List<ProductDetails> productDetails = [];

  StreamSubscription? _authenticationSubscription;
  StreamSubscription? _firestoreSubscription;

  PremiumService() : super(false) {
    _authenticationSubscription = FirebaseAuth.instance.authStateChanges().listen(
      (user) {
        _firestoreSubscription?.cancel();
        if (user != null) {
          _syncToFirestore(user.uid).catchError((_) { showSomethingWentWrong(); });
        } else {
          _revokePremium();
        }
      },
      onError: (_) { showSomethingWentWrong(); },
    );
    _inAppPurchase = InAppPurchase.instance;
    _purchaseDetailsSubscription = _inAppPurchase.purchaseStream.listen(
      (List<PurchaseDetails> purchaseDetails) {
        _onPurchaseUpdate(purchaseDetails).catchError((_) { showSomethingWentWrong(); });
      },
      onError: (_) { showSomethingWentWrong(); },
    );
    getProductDetails().catchError((_) { showSomethingWentWrong(); });
    refresh().catchError((_) { showSomethingWentWrong(); });
  }

  Future<void> _syncToFirestore(String userID) async {
    try {
      final document = FirebaseFirestore.instance.collection('users').doc(userID);
      final snapshot = await document.get();

      bool remotePremium = snapshot.exists ? (snapshot.data()?['premium'] as bool? ?? false) : false;
      // Merge logic: If either local or remote is true, the user has premium
      bool mergedPremium = state || remotePremium;

      if (!snapshot.exists || (mergedPremium != remotePremium)) {
        await document.set({'premium': mergedPremium}, SetOptions(merge: true));
      }
      if (isClosed) return;
      super.emit(mergedPremium);

      _firestoreSubscription = document.snapshots().listen((snapshot) {
        if (isClosed) return;
        if (snapshot.exists) {
          final incomingPremium = snapshot.data()?['premium'] as bool? ?? false;
          if (incomingPremium != state) {
            super.emit(incomingPremium);
          }
        }
      }, onError: (_) { showSomethingWentWrong(); });
    } catch (_) {
      showSomethingWentWrong();
      // Offline — keep local value.
    }
  }

  @override
  void emit(bool state) {
    if (isClosed) return;
    super.emit(state);
    final user = FirebaseAuth.instance.currentUser;
    if (user != null) {
      FirebaseFirestore.instance
        .collection('users')
        .doc(user.uid)
        .set({'premium': state}, SetOptions(merge: true))
        .catchError((_) { showSomethingWentWrong(); });
    }
  }

  Future<void> refresh() async {
    try {
      final isAvailable = await _inAppPurchase.isAvailable();
      if (!isAvailable) return;
      await _inAppPurchase.restorePurchases();
    } catch (_) { showSomethingWentWrong(); }
  }

  /// Live premium check straight from Google Play (authoritative),
  /// not from the cached Firestore/Hydrated `state`.
  /// Updates `state` (+ Firestore) to match Play, returns the live result.
  Future<bool> checkPremium() async {
    try {
      final isAvailable = await _inAppPurchase.isAvailable();
      if (!isAvailable) return state;
      final androidAddition =
          _inAppPurchase.getPlatformAddition<InAppPurchaseAndroidPlatformAddition>();
      final response = await androidAddition.queryPastPurchases();
      if (response.error != null) return state;
      bool hasPremium = false;
      for (final purchase in response.pastPurchases) {
        if (purchase.status == PurchaseStatus.purchased ||
            purchase.status == PurchaseStatus.restored) {
          hasPremium = true;
        }
        if (purchase.pendingCompletePurchase) {
          try {
            await _inAppPurchase.completePurchase(purchase);
          } catch (_) { showSomethingWentWrong(); }
        }
      }
      if (isClosed) return hasPremium;
      if (hasPremium) {
        _activatePremium();
      } else {
        _revokePremium();
      }
      return hasPremium;
    } catch (_) {
      showSomethingWentWrong();
      return state;
    }
  }

  Future<void> _onPurchaseUpdate(List<PurchaseDetails> purchaseDetails) async {
    try {
      if (purchaseDetails.isEmpty) {
        _revokePremium();
        return;
      }

      bool isPurchased = false;
      for (final purchase in purchaseDetails) {
        if (purchase.status == PurchaseStatus.purchased ||
            purchase.status == PurchaseStatus.restored) {
          isPurchased = true;
        }
        if (purchase.pendingCompletePurchase) {
          try {
            await _inAppPurchase.completePurchase(purchase);
          } catch (_) { showSomethingWentWrong(); }
        }
      }

      if (isPurchased) {
        _activatePremium();
      } else {
        _revokePremium();
      }
    } catch (_) { showSomethingWentWrong(); }
  }

  void _activatePremium() {
    if (isClosed) return;
    emit(true);
  }

  void _revokePremium() {
    if (isClosed) return;
    emit(false);
  }

  Future<void> getProductDetails() async {
    try {
      const productID = {'tiptap_premium_subscription'};
      final response = await _inAppPurchase.queryProductDetails(productID);
      if (response.error != null) {
        productDetails = [];
        return;
      }
      productDetails = response.productDetails;
    } catch (_) {
      showSomethingWentWrong();
      productDetails = [];
    }
  }

  Future<void> subscribe(ProductDetails product, String offerToken) async {
    try {
      final purchaseParam = GooglePlayPurchaseParam(
        productDetails: product,
        offerToken: offerToken
      );
      await _inAppPurchase.buyNonConsumable(purchaseParam: purchaseParam);
    } catch (_) { showSomethingWentWrong(); }
  }

  Future<void> manageSubscription() async {
    try {
      const String sku = 'tiptap_premium_subscription';
      const String package = 'dev.yuriusu.tiptap';
      final Uri url = Uri.parse('https://play.google.com/store/account/subscriptions?sku=$sku&package=$package');
      if (await canLaunchUrl(url)) {
        await launchUrl(url, mode: LaunchMode.externalApplication);
      }
    } catch (_) { showSomethingWentWrong(); }
  }

  @override
  Future<void> close() async {
    await _authenticationSubscription?.cancel();
    await _firestoreSubscription?.cancel();
    await _purchaseDetailsSubscription?.cancel();
    return super.close();
  }

  @override
  bool? fromJson(Map<String, dynamic> json) {
    return json['premium'];
  }

  @override
  Map<String, dynamic>? toJson(bool state) {
    return {'premium': state};
  }
}

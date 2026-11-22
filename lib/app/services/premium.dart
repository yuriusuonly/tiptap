import 'dart:async';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:hydrated_bloc/hydrated_bloc.dart';
import 'package:in_app_purchase/in_app_purchase.dart';
import 'package:in_app_purchase_android/in_app_purchase_android.dart';
import 'package:tiptap/app/shared/toast.dart';
import 'package:url_launcher/url_launcher.dart';

// Billing stays in test mode for all builds (debug + release) via the Play
// Console test track + License Testers. Keep `tiptap_premium_subscription` on
// the test track; do not promote to the production track.
//
// NOTE: entitlement is still client-visible in Firestore. A production launch
// should verify purchases server-side (Play Developer API / Cloud Function)
// before granting premium, since Firestore rules cannot distinguish a real
// purchase from a client-written `premium: true`.
class PremiumService extends HydratedCubit<bool> {
  static const _productId = 'tiptap_premium_subscription';
  static const _packageId = 'dev.yuriusu.tiptap';

  late final InAppPurchase _inAppPurchase;
  StreamSubscription<List<PurchaseDetails>>? _purchaseDetailsSubscription;
  List<ProductDetails> productDetails = [];

  StreamSubscription? _authenticationSubscription;
  StreamSubscription? _firestoreSubscription;
  int _syncGeneration = 0;

  PremiumService() : super(false) {
    _authenticationSubscription = FirebaseAuth.instance.authStateChanges().listen(
      (user) {
        _syncGeneration++;
        _firestoreSubscription?.cancel();
        _firestoreSubscription = null;
        if (user != null) {
          _syncToFirestore(user.uid);
        } else {
          _revokePremium();
        }
      },
      onError: (error, stack) {
        showSomethingWentWrong(error: error, stack: stack, context: 'premium:auth');
      },
    );
    _inAppPurchase = InAppPurchase.instance;
    _purchaseDetailsSubscription = _inAppPurchase.purchaseStream.listen(
      _onPurchaseUpdate,
      onError: (error, stack) {
        showSomethingWentWrong(error: error, stack: stack, context: 'premium:purchases');
      },
    );
    getProductDetails();
    refresh();
  }

  Future<void> _syncToFirestore(String userID) async {
    final generation = _syncGeneration;
    try {
      final document = FirebaseFirestore.instance.collection('users').doc(userID);
      final snapshot = await document.get();
      if (isClosed || generation != _syncGeneration) return;

      final remotePremium = snapshot.data()?['premium'] as bool? ?? false;
      final merged = state || remotePremium;
      if (!snapshot.exists || merged != remotePremium) {
        await document.set({'premium': merged}, SetOptions(merge: true));
      }
      if (isClosed || generation != _syncGeneration) return;
      super.emit(merged);

      _firestoreSubscription = document.snapshots().listen((snapshot) {
        if (isClosed || generation != _syncGeneration) return;
        if (!snapshot.exists) return;
        final incoming = snapshot.data()?['premium'] as bool? ?? false;
        if (incoming != state) super.emit(incoming);
      }, onError: (error, stack) {
        showSomethingWentWrong(error: error, stack: stack, context: 'premium:sync');
      });
    } catch (e, stack) {
      showSomethingWentWrong(error: e, stack: stack, context: 'premium:sync');
      // Offline — keep local value.
    }
  }

  @override
  void emit(bool state) {
    if (isClosed || state == this.state) return;
    super.emit(state);
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;
    FirebaseFirestore.instance
        .collection('users')
        .doc(user.uid)
        .set({'premium': state}, SetOptions(merge: true))
        .catchError((Object error, StackTrace stack) {
      showSomethingWentWrong(error: error, stack: stack, context: 'premium:write');
    });
  }

  Future<void> refresh() async {
    try {
      if (!await _inAppPurchase.isAvailable()) return;
      await _inAppPurchase.restorePurchases();
    } catch (e, stack) {
      showSomethingWentWrong(error: e, stack: stack, context: 'premium:restore');
    }
  }

  /// Live premium check straight from Google Play (authoritative),
  /// not from the cached Firestore/Hydrated `state`.
  Future<bool> checkPremium() async {
    try {
      if (!await _inAppPurchase.isAvailable()) return state;
      final androidAddition =
          _inAppPurchase.getPlatformAddition<InAppPurchaseAndroidPlatformAddition>();
      final response = await androidAddition.queryPastPurchases();
      if (response.error != null) {
        reportError(response.error!, null, context: 'premium:query');
        return state;
      }
      final hasPremium = response.pastPurchases.any(
        (purchase) =>
            purchase.productID == _productId &&
            (purchase.status == PurchaseStatus.purchased ||
                purchase.status == PurchaseStatus.restored),
      );
      for (final purchase in response.pastPurchases) {
        if (purchase.pendingCompletePurchase) {
          try {
            await _inAppPurchase.completePurchase(purchase);
          } catch (e, stack) {
            showSomethingWentWrong(error: e, stack: stack, context: 'premium:complete');
          }
        }
      }
      if (isClosed) return hasPremium;
      if (hasPremium) {
        _activatePremium();
      } else {
        _revokePremium();
      }
      return hasPremium;
    } catch (e, stack) {
      showSomethingWentWrong(error: e, stack: stack, context: 'premium:check');
      return state;
    }
  }

  Future<void> _onPurchaseUpdate(List<PurchaseDetails> purchaseDetails) async {
    try {
      final relevant = purchaseDetails
          .where((purchase) => purchase.productID == _productId)
          .toList();
      if (relevant.isEmpty) return;

      var isPurchased = false;
      for (final purchase in relevant) {
        if (purchase.status == PurchaseStatus.purchased ||
            purchase.status == PurchaseStatus.restored) {
          isPurchased = true;
        }
        if (purchase.status == PurchaseStatus.error && purchase.error != null) {
          reportError(purchase.error!, null, context: 'premium:purchase');
        }
        if (purchase.pendingCompletePurchase) {
          try {
            await _inAppPurchase.completePurchase(purchase);
          } catch (e, stack) {
            showSomethingWentWrong(error: e, stack: stack, context: 'premium:complete');
          }
        }
      }
      if (isPurchased) {
        _activatePremium();
      } else {
        _revokePremium();
      }
    } catch (e, stack) {
      showSomethingWentWrong(error: e, stack: stack, context: 'premium:purchase');
    }
  }

  void _activatePremium() {
    if (!isClosed) emit(true);
  }

  void _revokePremium() {
    if (!isClosed) emit(false);
  }

  Future<void> getProductDetails() async {
    try {
      final response = await _inAppPurchase.queryProductDetails({_productId});
      if (response.error != null) {
        reportError(response.error!, null, context: 'premium:products');
        productDetails = <ProductDetails>[];
        return;
      }
      productDetails = response.productDetails
          .where((product) => product.id == _productId)
          .toList();
    } catch (e, stack) {
      showSomethingWentWrong(error: e, stack: stack, context: 'premium:products');
      productDetails = <ProductDetails>[];
    }
  }

  Future<void> subscribe(ProductDetails product, String offerToken) async {
    if (product.id != _productId || offerToken.isEmpty) return;
    try {
      await _inAppPurchase.buyNonConsumable(
        purchaseParam: GooglePlayPurchaseParam(
          productDetails: product,
          offerToken: offerToken,
        ),
      );
    } catch (e, stack) {
      showSomethingWentWrong(error: e, stack: stack, context: 'premium:buy');
    }
  }

  Future<void> manageSubscription() async {
    final url = Uri.https(
      'play.google.com',
      '/store/account/subscriptions',
      <String, String>{'sku': _productId, 'package': _packageId},
    );
    try {
      if (await canLaunchUrl(url)) {
        await launchUrl(url, mode: LaunchMode.externalApplication);
      }
    } catch (e, stack) {
      showSomethingWentWrong(error: e, stack: stack, context: 'premium:manage');
    }
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
    return json['premium'] as bool? ?? false;
  }

  @override
  Map<String, dynamic>? toJson(bool state) {
    return {'premium': state};
  }
}

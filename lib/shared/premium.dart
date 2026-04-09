import 'dart:async';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:hydrated_bloc/hydrated_bloc.dart';
import 'package:in_app_purchase/in_app_purchase.dart';
import 'package:in_app_purchase_android/in_app_purchase_android.dart';
import 'package:url_launcher/url_launcher.dart';

class _InAppPurchaseConnection {
  static InAppPurchase? _instance;
  static InAppPurchase get instance {
    _instance ??= InAppPurchase.instance;
    return _instance!;
  }
}

class PremiumService extends HydratedCubit<bool> {
  late final InAppPurchase _inAppPurchase;
  StreamSubscription<List<PurchaseDetails>>? _purchaseDetailsSubscription;
  late List<ProductDetails> productDetails;

  StreamSubscription? _authenticationSubscription;
  StreamSubscription? _firestoreSubscription;

  PremiumService() : super(false) {
    _authenticationSubscription = FirebaseAuth.instance.authStateChanges().listen(
      (user) {
        _firestoreSubscription?.cancel();
        if (user != null) {
          _syncToFirestore(user.uid);
        } else {
          _revokePremium();
        }
      }
    );
    _inAppPurchase = _InAppPurchaseConnection.instance;
    _purchaseDetailsSubscription = _inAppPurchase.purchaseStream.listen(
      (List<PurchaseDetails> purchaseDetails) {
        _onPurchaseUpdate(purchaseDetails);
      }
    );
    getProductDetails();
    refresh();
  }

  Future<void> _syncToFirestore(String userID) async {
    final document = FirebaseFirestore.instance.collection('users').doc(userID);
    final snapshot = await document.get();

    bool remotePremium = snapshot.exists ? (snapshot.data()?['premium'] as bool? ?? false) : false;
    // Merge logic: If either local or remote is true, the user has premium
    bool mergedPremium = state || remotePremium;

    if (!snapshot.exists || (mergedPremium != remotePremium)) {
      await document.set({'premium': mergedPremium}, SetOptions(merge: true));
    }
    super.emit(mergedPremium);

    _firestoreSubscription = document.snapshots().listen((snapshot) {
      if (snapshot.exists) {
        final incomingPremium = snapshot.data()?['premium'] as bool? ?? false;
        if (incomingPremium != state) {
          super.emit(incomingPremium);
        }
      }
    });
  }

  @override
  void emit(bool state) {
    super.emit(state);
    final user = FirebaseAuth.instance.currentUser;
    if (user != null) {
      FirebaseFirestore.instance
        .collection('users')
        .doc(user.uid)
        .set({'premium': state}, SetOptions(merge: true));
    }
  }

  Future<void> refresh() async {
    final isAvailable = await _inAppPurchase.isAvailable();
    if (!isAvailable) return;
    _inAppPurchase.restorePurchases();
  }

  Future<void> _onPurchaseUpdate(List<PurchaseDetails> purchaseDetails) async {
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
        await _inAppPurchase.completePurchase(purchase);
      }
    }

    if (isPurchased) {
      _activatePremium();
    } else {
      _revokePremium();
    }
  }

  void _activatePremium() {
    emit(true);
  }

  void _revokePremium() {
    emit(false);
  }

  Future<void> getProductDetails() async {
    const productID = {'tiptap_premium_subscription'};
    final response = await _inAppPurchase.queryProductDetails(productID);
    productDetails = response.productDetails;
  }

  Future<void> subscribe(ProductDetails product, String offerToken) async {
    final purchaseParam = GooglePlayPurchaseParam(
      productDetails: product, 
      offerToken: offerToken
    );
    await _inAppPurchase.buyNonConsumable(purchaseParam: purchaseParam);
  }

  Future<void> manageSubscription() async {
    const String sku = 'tiptap_premium_subscription';
    const String package = 'dev.yuriusu.tiptap'; 
    final Uri url = Uri.parse('https://play.google.com/store/account/subscriptions?sku=$sku&package=$package');
    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Future<void> close() {
    _authenticationSubscription?.cancel();
    _firestoreSubscription?.cancel();
    _purchaseDetailsSubscription?.cancel();
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

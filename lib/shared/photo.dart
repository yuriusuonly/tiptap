import 'dart:async';
import 'dart:convert';

import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart';
import 'package:hydrated_bloc/hydrated_bloc.dart';

class PhotoService extends HydratedCubit<Uint8List?> {
  StreamSubscription? _userSubscription;

  PhotoService() : super(null) {
    _userSubscription = FirebaseAuth.instance.authStateChanges().listen(
      (User? user) {
        if (user?.photoURL != null) {
          _cachePhoto(user!.photoURL!);
        } else {
          _clearCache();
        }
      },
    );
  }

  Future<void> _cachePhoto(String url) async {
    final response = await get(Uri.parse(url));
    emit(response.bodyBytes);
  }

  void _clearCache() {
    emit(null);
  }

  @override
  Future<void> close() {
    _userSubscription?.cancel();
    return super.close();
  }

  @override
  Uint8List? fromJson(Map<String, dynamic> json) {
    return jsonDecode(json['user_photo']);
  }

  @override
  Map<String, dynamic>? toJson(Uint8List? state) {
    return {'user_photo': jsonEncode(state)};
  }
}

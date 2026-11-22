import 'dart:async';
import 'dart:convert';

import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart';
import 'package:hydrated_bloc/hydrated_bloc.dart';
import 'package:tiptap/app/shared/toast.dart';

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
      onError: (error, stack) {
        showSomethingWentWrong(error: error, stack: stack, context: 'photo:auth');
      },
    );
  }

  Future<void> _cachePhoto(String url) async {
    try {
      final response = await get(Uri.parse(url)).timeout(const Duration(seconds: 15));
      if (isClosed) return;
      if (response.statusCode == 200 && response.bodyBytes.isNotEmpty) {
        // Ignore unexpectedly large avatars to keep hydrated storage small.
        if (response.bodyBytes.lengthInBytes > 5 * 1024 * 1024) return;
        emit(response.bodyBytes);
      } else {
        _clearCache();
      }
    } catch (e, stack) {
      reportError(e, stack, context: 'photo:download');
      if (!isClosed) _clearCache();
    }
  }

  void _clearCache() {
    if (isClosed) return;
    emit(null);
  }

  @override
  Future<void> close() async {
    await _userSubscription?.cancel();
    return super.close();
  }

  @override
  Uint8List? fromJson(Map<String, dynamic> json) {
    try {
      final raw = json['user_photo'];
      if (raw is! String) return null;
      final decoded = jsonDecode(raw);
      if (decoded is List) return Uint8List.fromList(List<int>.from(decoded));
      return null;
    } catch (_) {
      return null;
    }
  }

  @override
  Map<String, dynamic>? toJson(Uint8List? state) {
    return {'user_photo': state == null ? null : jsonEncode(state.toList())};
  }
}

import 'dart:async';
import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:http/http.dart';
import 'package:hydrated_bloc/hydrated_bloc.dart';
import 'package:tiptap/shared/authentication.dart';

class PhotoService extends HydratedCubit<String?> {
  final AuthenticationService _authenticationService;
  StreamSubscription? _userSubscription;
  Uint8List? _imageBytes;

  PhotoService(this._authenticationService) : super(null) {
    _userSubscription = _authenticationService.stream.listen(
      (user) {
        if (user?.photoURL != null) {
          _fetchPhoto(user!.photoURL!);
        } else {
          clearCache();
        }
      },
    );
  }

  Future<void> _fetchPhoto(String url) async {
    final response = await get(Uri.parse(url));
    _imageBytes = response.bodyBytes;
    final base64string = base64Encode(_imageBytes!);
    emit(base64string);
  }

  Uint8List? get imageBytes => _imageBytes;

  void clearCache() => emit(null);

  @override
  Future<void> close() {
    _userSubscription?.cancel();
    return super.close();
  }

  @override
  String? fromJson(Map<String, dynamic> json) => json['photo'] as String?;

  @override
  Map<String, dynamic>? toJson(String? state) => {'photo': state};
}

import 'package:hydrated_bloc/hydrated_bloc.dart';

class FirstLaunchService extends HydratedCubit<bool> {
  FirstLaunchService() : super(true);

  void dismissIntroduction() {
    emit(false);
  }

  @override
  bool? fromJson(Map<String, dynamic> json) {
    return json['first_launch'] as bool;
  }

  @override
  Map<String, dynamic>? toJson(bool state) {
    return {'first_launch': state};
  }
}

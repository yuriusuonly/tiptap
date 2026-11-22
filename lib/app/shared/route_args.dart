import 'package:go_router/go_router.dart';
import 'package:material_ui/material_ui.dart';

/// Validates the map passed between fact routes. Deep links, browser reloads
/// and restored router state can produce `null` or unexpected `extra` values;
/// a blind cast would crash the app.
Map<String, dynamic>? factFromExtra(Object? extra) {
  if (extra is! Map) return null;
  final map = Map<String, dynamic>.from(extra);
  if ((map['title']?.toString() ?? '').isEmpty) return null;
  return map;
}

class InvalidRouteArgumentPage extends StatelessWidget {
  const InvalidRouteArgumentPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Unavailable')),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            spacing: 16,
            children: [
              const Text(
                'This page is no longer available. Please go back and try again.',
                textAlign: TextAlign.center,
              ),
              FilledButton(
                onPressed: () => context.pop(),
                child: const Text('Go back'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

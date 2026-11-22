import 'package:material_ui/material_ui.dart';

/// Fallback UI shown when initialization fails, so users never see a blank
/// screen with no explanation or way to recover.
class BootstrapErrorScreen extends StatelessWidget {
  final String? message;
  final VoidCallback? onRetry;

  const BootstrapErrorScreen({
    super.key,
    this.message,
    this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      home: Scaffold(
        body: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                spacing: 16,
                children: [
                  Icon(
                    Icons.cloud_off,
                    size: 64,
                    color: Theme.of(context).colorScheme.error,
                  ),
                  Text(
                    'Unable to start TipTap',
                    style: Theme.of(context).textTheme.headlineSmall,
                    textAlign: TextAlign.center,
                  ),
                  Text(
                    message ??
                        'Something went wrong while starting the app. '
                        'Please check your connection and try again.',
                    style: Theme.of(context).textTheme.bodyLarge,
                    textAlign: TextAlign.center,
                  ),
                  if (onRetry != null)
                    FilledButton.icon(
                      onPressed: onRetry,
                      icon: const Icon(Icons.refresh),
                      label: const Text('Try again'),
                    ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

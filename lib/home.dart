import 'package:animate_do/animate_do.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:go_router/go_router.dart';
import 'package:tiptap/privacy.dart';
import 'package:tiptap/terms.dart';
import 'package:url_launcher/url_launcher.dart';

class HomeRoute extends GoRoute {
  HomeRoute()
    : super(
        path: '/',
        builder: (context, state) => const HomePage(),
        routes: [
          PrivacyRoute(),
          TermsRoute()
        ]
      );
}

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  bool _isTapped = false;

  Future<void> _goToPlayStore() async {
    final playstoreUri = Uri.parse('market://details?id=dev.yuriusu.tiptap');
    final webUri = Uri.parse('https://play.google.com/store/apps/details?id=dev.yuriusu.tiptap');
    if (await canLaunchUrl(playstoreUri)) {
      await launchUrl(playstoreUri);
    } else if (await canLaunchUrl(webUri)) {
      await launchUrl(webUri);
    }
  }

  Future<void> _goToGitHubRepository() async {
    final githubUri = Uri.parse('https://github.com/yuriusuonly/tiptap');
    if (await canLaunchUrl(githubUri)) {
      await launchUrl(githubUri);
    }
  }

  void _goToPrivacyPage() {
    context.goNamed('privacy');
  }

  void _goToTermsPage() {
    context.goNamed('terms');
  }

  Widget _responsiveExpanded(bool isExpanded, Widget child) {
    return isExpanded ? Expanded(child: child) : child;
  }

  Widget _phoneFrame(String asset) {
    return GestureDetector(
      onTap: () {
        setState(() {
          _isTapped = !_isTapped;
        });
      },
      child: Container(
        decoration: BoxDecoration(
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.3),
              blurRadius: 24,
              offset: const Offset(8, 0),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(28),
          child: Image.asset(asset, fit: BoxFit.contain),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final screenSize = MediaQuery.of(context).size;
    final isDesktop = screenSize.width > 1000;

    final screenshots = [
      AnimatedAlign(
        key: const ValueKey('screenshot_2'),
        duration: const Duration(milliseconds: 600),
        curve: Curves.easeInOutQuart,
        alignment: Alignment.center,
        child: AnimatedScale(
          duration: const Duration(milliseconds: 600),
          scale: _isTapped ? 1.0 : 0.85,
          curve: Curves.easeOutBack,
          child: _phoneFrame(
            'images/screenshot_2.png'
          ),
        ),
      ),

      AnimatedAlign(
        key: const ValueKey('screenshot_1'),
        duration: const Duration(milliseconds: 600),
        curve: Curves.easeInOutQuart,
        alignment: const Alignment(-111.5, 0),
        child: AnimatedScale(
          duration: const Duration(milliseconds: 600),
          curve: Curves.easeOutBack,
          scale: _isTapped ? 0.85 : 1,
          child: _phoneFrame(
            'images/screenshot_1.png',
          ),
        ),
      ),
    ];

    final content = [
      _responsiveExpanded(
        isDesktop,
        Center(
          child: ZoomIn(
            child: SizedBox(
              height: isDesktop ? screenSize.height * 0.7 : 512,
              child: Transform.translate(
                offset: const Offset(27.875, 0),
                child: AspectRatio(
                  aspectRatio: 9 / 19.5,
                  child: Stack(
                    clipBehavior: Clip.none,
                    alignment: Alignment.center,
                    children: _isTapped
                      ? screenshots.reversed.toList()
                      : screenshots,
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
      Flex(
        spacing: 40,
        direction: Axis.vertical,
        mainAxisAlignment: MainAxisAlignment.start,
        crossAxisAlignment: isDesktop ? CrossAxisAlignment.start : CrossAxisAlignment.center,
        children: [
          FadeInUp(
            child: Flex(
              spacing: 8,
              direction: Axis.vertical,
              mainAxisAlignment: isDesktop ? MainAxisAlignment.end : MainAxisAlignment.center,
              crossAxisAlignment: isDesktop ? CrossAxisAlignment.start : CrossAxisAlignment.center,
              children: [
                Text(
                  'TipTap',
                  style: Theme.of(context).textTheme.displaySmall?.copyWith(
                    fontWeight: FontWeight.bold
                  ),
                ),
                Text(
                  'Tap. Learn. Impress.',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
                  textAlign: isDesktop ? TextAlign.start : TextAlign.center,
                )
              ],
            ),
          ),
          FadeInUp(
            child: Wrap(
              spacing: 16,
              runSpacing: 16,
              children: [
                OutlinedButton.icon(
                  onPressed: () async {
                    await _goToPlayStore();
                  },
                  style: OutlinedButton.styleFrom(
                    fixedSize: Size(168, 48),
                    backgroundColor: Colors.white
                  ),
                  icon: SvgPicture.asset(
                    'icons/google_play.svg',
                    width: 24,
                    height: 24,
                  ),
                  label: Text(
                    'Google Play',
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      color: Colors.black,
                    ),
                  )
                ),
                OutlinedButton.icon(
                  onPressed: () async {
                    await _goToGitHubRepository();
                  },
                  style: OutlinedButton.styleFrom(
                    fixedSize: Size(168, 48),
                    backgroundColor: Colors.white,
                  ),
                  icon: SvgPicture.asset(
                    'icons/github.svg',
                    width: 24,
                    height: 24,
                  ),
                  label: Text(
                    'GitHub',
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      color: Colors.black,
                    )
                  )
                ),
              ],
            ),
          ),
          FadeInUp(
            child: Flex(
              spacing: 8,
              direction: Axis.horizontal,
              mainAxisAlignment: isDesktop ? MainAxisAlignment.start : MainAxisAlignment.center,
              crossAxisAlignment: isDesktop ? CrossAxisAlignment.start : CrossAxisAlignment.center,
              children: [
                Text(
                  '©2026 TipTap —',
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                    color: Theme.of(context).colorScheme.onSurface,
                  ),
                ),
                Text.rich(
                  TextSpan(
                    text: 'Privacy',
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      color: Theme.of(context).colorScheme.onSurface,
                      decoration: TextDecoration.underline,
                    ),
                    recognizer: TapGestureRecognizer()..onTap = () {
                      _goToPrivacyPage();
                    }
                  ),
                ),
                Text(
                  '•',
                  style: Theme.of(context).textTheme.titleLarge
                ),
                Text.rich(
                  TextSpan(
                    text: 'Terms',
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      color: Theme.of(context).colorScheme.onSurface,
                      decoration: TextDecoration.underline,
                    ),
                    recognizer: TapGestureRecognizer()..onTap = () {
                      _goToTermsPage();
                    }
                  ),
                ),
              ]
            ),
          )
        ],
      )
    ];

    return Scaffold(
      body: Center(
        child: SingleChildScrollView(
          padding: isDesktop ? EdgeInsets.all(64) : EdgeInsets.fromLTRB(24, 56, 24, 56),
          child: Flex(
            spacing: 64,
            direction: isDesktop ? Axis.horizontal : Axis.vertical,
            children: isDesktop ? content.reversed.toList() : content,
          )
        ),
      ),
    );
  }
}

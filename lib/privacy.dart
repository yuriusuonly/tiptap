import 'package:animate_do/animate_do.dart';
import 'package:animations/animations.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

class PrivacyRoute extends GoRoute {
  PrivacyRoute()
    : super(
        path: '/privacy',
        name: 'privacy',
        pageBuilder: (context, state) => CustomTransitionPage(
          key: state.pageKey,
          transitionDuration: const Duration(milliseconds: 800),
          reverseTransitionDuration: const Duration(milliseconds: 800),
          transitionsBuilder: (context, animation, secondaryAnimation, child) => SharedAxisTransition(
            animation: animation,
            secondaryAnimation: secondaryAnimation,
            transitionType: SharedAxisTransitionType.vertical,
            child: child,
          ),
          child: const PrivacyPage()
        ),
      );
}

class PrivacyPage extends StatefulWidget {
  const PrivacyPage({super.key});

  @override
  State<PrivacyPage> createState() => _PrivacyPageState();
}

class _PrivacyPageState extends State<PrivacyPage> {
  final _informationWeCollectSectionKey = GlobalKey();
  final _howWeUseYourInformationSectionKey = GlobalKey();
  final _advertisingAndAnalyticsSectionKey = GlobalKey();
  final _dataSharingSectionKey = GlobalKey();
  final _dataRetentionSectionKey = GlobalKey();
  final _yourRightsSectionKey = GlobalKey();
  final _childrensPrivacySectionKey = GlobalKey();
  final _internationalDataTransfersSectionKey = GlobalKey();
  final _changesToThisPolicySectionKey = GlobalKey();
  final _contactSectionKey = GlobalKey();

  void _scrollToSection(GlobalKey key, String section) {
    context.go('/privacy#$section');
    Scrollable.ensureVisible(
      key.currentContext!,
      duration: const Duration(milliseconds: 500),
      curve: Curves.easeInOut,
    );
  }

  Future<void> _sendEmail() async {
    final Uri emailLaunchUri = Uri(
      scheme: 'mailto',
      path: 'yuriusu.dev@gmail.com',
      queryParameters: {
        'subject': 'Topic?',
        'body': 'Feedback?'
      },
    );
    if (await canLaunchUrl(emailLaunchUri)) {
      await launchUrl(emailLaunchUri);
    }
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final String fragment = GoRouterState.of(context).uri.fragment;
      switch (fragment) {
        case 'information-we-collect':
          return _scrollToSection(_informationWeCollectSectionKey, fragment);
        case 'how-we-use-your-information':
          return _scrollToSection(_howWeUseYourInformationSectionKey, fragment);
        case 'advertising-and-analytics':
          return _scrollToSection(_advertisingAndAnalyticsSectionKey, fragment);
        case 'data-sharing':
          return _scrollToSection(_dataSharingSectionKey, fragment);
        case 'data-retention':
          return _scrollToSection(_dataRetentionSectionKey, fragment);
        case 'your-rights':
          return _scrollToSection(_yourRightsSectionKey, fragment);
        case 'childrens-privacy':
          return _scrollToSection(_childrensPrivacySectionKey, fragment);
        case 'international-data-transfers':
          return _scrollToSection(_internationalDataTransfersSectionKey, fragment);
        case 'changes-to-this-policy':
          return _scrollToSection(_changesToThisPolicySectionKey, fragment);
        case 'contact':
          return _scrollToSection(_contactSectionKey, fragment);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: true,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return;
      },
      child: Actions(
        actions: {
          DismissIntent: CallbackAction<DismissIntent>(
            onInvoke: (intent) => {
              if (context.mounted) context.pop()
            },
          ),
        },
        child: Shortcuts(
          shortcuts: {
            SingleActivator(LogicalKeyboardKey.escape): const DismissIntent(),
          },
          child: Focus(
            autofocus: true,
            child: SelectionArea(
              child: Scaffold(
                appBar: AppBar(
                  automaticallyImplyLeading: false,
                  title: Text(
                    'Privacy',
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.onPrimary
                    )
                  ),
                  actions: [
                    IconButton(
                      onPressed: () {
                        if (context.mounted) context.pop();
                      },
                      icon: SvgPicture.asset(
                        'icons/close.svg',
                        colorFilter: ColorFilter.mode(
                          Theme.of(context).colorScheme.onPrimary,
                          BlendMode.srcIn
                        ),
                        width: 24,
                        height: 24,
                      )
                    ),
                    SizedBox(width: 8)
                  ],
                  backgroundColor: Theme.of(context).colorScheme.primary,
                ),
                body: FadeInUp(
                  duration: const Duration(milliseconds: 500),
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.fromLTRB(16, 16, 16, 40),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildSectionTitle('Effective Date: March 31, 2026'),
                        SizedBox(height: 16),
                                
                        _buildBodyText('This Privacy Policy explains how TipTap ("we", "our", or "us") collects, uses, stores, and protects information when you use the TipTap mobile application (the "App").'),
                        SizedBox(height: 40),
                                
                        _buildSectionTitle('Information We Collect', key: _informationWeCollectSectionKey),
                        SizedBox(height: 16),
                                
                        _buildBodyText('Depending on how you use the App, we may collect:'),
                        SizedBox(height: 16),
                                
                        _buildBodyText('Information you provide:'),
                        SizedBox(height: 16),
                                
                        _buildBulletPointText('Email address (if you create an account)'),
                        SizedBox(height: 16),
                                
                        _buildBodyText('Automatically collected information:'),
                        SizedBox(height: 16),
                                
                        _buildBulletPointText('Device and app usage'),
                        _buildBulletPointText('Crash logs and diagnostics'),
                        SizedBox(height: 16),
                                
                        _buildBodyText('Advertising data:'),
                        SizedBox(height: 16),
                                
                        _buildBulletPointText('Ad impressions and interactions (non-personal)'),
                        SizedBox(height: 40),
                                
                        _buildSectionTitle('How We Use Your Information', key: _howWeUseYourInformationSectionKey),
                        SizedBox(height: 16),
                                
                        _buildBodyText('We use collected data to:'),
                        SizedBox(height: 16),
                                
                        _buildBulletPointText('Provide and operate the App'),
                        _buildBulletPointText('Enable subscriptions and feature access'),
                        _buildBulletPointText('Display advertisements to non-subscribed users'),
                        _buildBulletPointText('Improve performance, security, and stability'),
                        _buildBulletPointText('Respond to support requests'),
                        SizedBox(height: 40),
                                
                        _buildSectionTitle('Advertising and Analytics', key: _advertisingAndAnalyticsSectionKey),
                        SizedBox(height: 16),
                                
                        _buildBodyText('Advertisements may be displayed to non-subscribed users and may be required to unlock certain content.'),
                        SizedBox(height: 16),
                                
                        _buildBodyText('We may use third-party analytics and advertising services to understand usage patterns and improve the App. These services operate under their own privacy policies.'),
                        SizedBox(height: 40),
                                
                        _buildSectionTitle('Data Sharing', key: _dataSharingSectionKey),
                        SizedBox(height: 16),
                                
                        _buildBodyText('We do not sell personal data.'),
                        SizedBox(height: 16),
                                
                        _buildBodyText('We may share data with trusted service providers for hosting, analytics, crash reporting, and subscription processing. These providers are contractually required to protect user data.'),
                        SizedBox(height: 40),
                                
                        _buildSectionTitle('Data Retention', key: _dataRetentionSectionKey),
                        SizedBox(height: 16),
                                
                        _buildBodyText('Personal data is retained only as long as necessary to provide the App, comply with legal obligations, or resolve disputes.'),
                        SizedBox(height: 16),
                                
                        _buildBodyText('Users may request deletion of their account and associated data at any time.'),
                        SizedBox(height: 40),
                                
                        _buildSectionTitle('Your Rights', key: _yourRightsSectionKey),
                        SizedBox(height: 16),
                                
                        _buildBodyText('Under applicable laws, including GDPR, you have the right to:'),
                        SizedBox(height: 16),
                                
                        _buildBulletPointText('Access your data'),
                        _buildBulletPointText('Correct inaccurate data'),
                        _buildBulletPointText('Request deletion'),
                        _buildBulletPointText('Restrict or object to processing'),
                        _buildBulletPointText('Withdraw consent where applicable'),
                        SizedBox(height: 16),
                                
                        _buildRichText([
                          TextSpan(
                            text: 'Request can be made via the App or by '
                          ),
                          TextSpan(
                            text: 'contacting us',
                            style: TextStyle(
                              decoration: TextDecoration.underline
                            ),
                            recognizer: TapGestureRecognizer()..onTap = () {
                              _scrollToSection(_contactSectionKey, 'contact');
                            }
                          ),
                          TextSpan(
                            text: '.'
                          )
                        ]),
                        SizedBox(height: 40),
                  
                        _buildSectionTitle("Children's Privacy", key: _childrensPrivacySectionKey),
                        SizedBox(height: 16),
                  
                        _buildRichText([
                          TextSpan(
                            text: 'The App is intended for users '
                          ),
                          TextSpan(
                            text: '13 years and older',
                            style: TextStyle(
                              fontWeight: FontWeight.bold
                            ),
                          ),
                          TextSpan(
                            text: '.'
                          )
                        ]),
                        SizedBox(height: 16),
                  
                        _buildBodyText('We do not knowingly collect personal data from children under 13. If such data is discovered, it will be deleted promptly.'),
                        SizedBox(height: 40),
                  
                        _buildSectionTitle('International Data Transfers', key: _internationalDataTransfersSectionKey),
                        SizedBox(height: 16),
                  
                        _buildBodyText('Data may be processed or stored outside your country of residence. Appropriate safeguards are applied where required by law.'),
                        SizedBox(height: 40),
                  
                        _buildSectionTitle('Changes to This Policy', key: _changesToThisPolicySectionKey),
                        SizedBox(height: 16),
                  
                        _buildBodyText('This Privacy Policy may be updated periodically. Continued use of the App constitutes acceptance of the updated policy.'),
                        SizedBox(height: 40),
                  
                        _buildSectionTitle('Contact', key: _contactSectionKey),
                        SizedBox(height: 16),
                  
                        _buildRichText([
                          TextSpan(
                            text: 'For questions or data requests, contact '
                          ),
                          TextSpan(
                            text: 'yuriusu.dev@gmail.com',
                            style: TextStyle(
                              decoration: TextDecoration.underline
                            ),
                            recognizer: TapGestureRecognizer()..onTap = () async {
                              await _sendEmail();
                            }
                          ),
                          TextSpan(
                            text: '.'
                          )
                        ]),
                        SizedBox(height: 16),
                  
                        _buildRichText([
                          TextSpan(
                            text: 'By using '
                          ),
                          TextSpan(
                            text: 'TipTap',
                            style: TextStyle(
                              fontWeight: FontWeight.bold
                            ),
                          ),
                          TextSpan(
                            text: ', '
                          ),
                          TextSpan(
                            text: 'you acknowledge that you have read and understood this Privacy Policy.'
                          )
                        ]),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title, {Key? key}) {
    return Text(
      key: key,
      title,
      style: Theme.of(context).textTheme.titleLarge,
    );
  }

  Widget _buildBodyText(String text) {
    return Text(
      text,
      style: Theme.of(context).textTheme.bodyLarge,
    );
  }

  Widget _buildBulletPointText(String text) {
    return Padding(
      padding: const EdgeInsets.only(left: 16.0),
      child: Row(
        spacing: 8,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text("•", style: Theme.of(context).textTheme.titleLarge),
          Expanded(
            child: Text(
              text,
              style: Theme.of(context).textTheme.bodyLarge,
            ),
          )
        ],
      ),
    );
  }

  Widget _buildRichText(List<TextSpan> texts) {
    return Text.rich(
      TextSpan(
        style: Theme.of(context).textTheme.bodyLarge,
        children: texts
      )
    );
  }
}

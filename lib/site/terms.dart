import 'package:animate_do/animate_do.dart';
import 'package:animations/animations.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

class TermsRoute extends GoRoute {
  TermsRoute()
    : super(
        path: '/terms',
        name: 'terms',
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
          child: const TermsPage()
        ),
      );
}

class TermsPage extends StatefulWidget {
  const TermsPage({super.key});

  @override
  State<TermsPage> createState() => _TermsPageState();
}

class _TermsPageState extends State<TermsPage> {
  final _eligibilityAndAgeRequirementsSectionKey = GlobalKey();
  final _userAccountsSectionKey = GlobalKey();
  final _subscriptionsAndPayments = GlobalKey();
  final _contentAndIntellectualProperty = GlobalKey();
  final _acceptableUseSectionKey = GlobalKey();
  final _educationalDisclaimerSectionKey = GlobalKey();
  final _limitationOfLiabilitySectionKey = GlobalKey();
  final _terminationSectionKey = GlobalKey();
  final _changesToTermsSectionKey = GlobalKey();
  final _governingLawSectionKey = GlobalKey();
  final _contactSectionKey = GlobalKey();

  void _scrollToSection(GlobalKey key, String section) {
    context.go('/terms#$section');
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
        case 'eligibility-and-age-requirements':
          return _scrollToSection(_eligibilityAndAgeRequirementsSectionKey, fragment);
        case 'user-accounts':
          return _scrollToSection(_userAccountsSectionKey, fragment);
        case 'subscriptions-and-payments':
          return _scrollToSection(_subscriptionsAndPayments, fragment);
        case 'content-and-intellectual-property':
          return _scrollToSection(_contentAndIntellectualProperty, fragment);
        case 'acceptable-use':
          return _scrollToSection(_acceptableUseSectionKey, fragment);
        case 'educational-disclaimer':
          return _scrollToSection(_educationalDisclaimerSectionKey, fragment);
        case 'limitation-of-liability':
          return _scrollToSection(_limitationOfLiabilitySectionKey, fragment);
        case 'termination':
          return _scrollToSection(_terminationSectionKey, fragment);
        case 'changes-to-terms':
          return _scrollToSection(_changesToTermsSectionKey, fragment);
        case 'governing-law':
          return _scrollToSection(_governingLawSectionKey, fragment);
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
                    'Terms',
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

                        _buildRichText([
                          TextSpan(
                            text: 'Welcome to '
                          ),
                          TextSpan(
                            text: 'TipTap',
                            style: TextStyle(
                              fontWeight: FontWeight.bold
                            )
                          ),
                          TextSpan(
                            text: ' ("we", "our", or "us"). These Terms of Use ("Terms") govern your access to and use of the '
                          ),
                          TextSpan(
                            text: 'TipTap',
                            style: TextStyle(
                              fontWeight: FontWeight.bold
                            )
                          ),
                          TextSpan(
                            text: ' mobile application (the "App"). By downloading, installing, accessing, or using the App, you confirm that you have read, understood, and agreed to be bound by these Terms. If you do not agree, you must not use the App.'
                          ),
                        ]),
                        SizedBox(height: 16),

                        _buildBodyText('TipTap is an educational application designed to provide short, informative facts and explanations for learning and entertainment purposes.'),
                        SizedBox(height: 40),

                        _buildSectionTitle('Eligibility and Age Requirements', key: _eligibilityAndAgeRequirementsSectionKey),
                        SizedBox(height: 16),

                        _buildRichText([
                          TextSpan(
                            text: 'The App is intended for users '
                          ),
                          TextSpan(
                            text: '13 years of age and older',
                            style: TextStyle(
                              fontWeight: FontWeight.bold
                            )
                          ),
                          TextSpan(
                            text: '.'
                          ),
                        ]),
                        SizedBox(height: 16),

                        _buildBulletPointText('Users under the age of 13 may use the App only anonymously and must not provide personal information.'),
                        _buildBulletPointText('If you are under the age of 18, you confirm that you have permission from a parent or legal guardian to use the App.'),
                        SizedBox(height: 16),

                        _buildBodyText('We do not knowingly collect personal data from children under 13. If such data is identified, it will be deleted promptly.'),
                        SizedBox(height: 40),

                        _buildSectionTitle('User Accounts', key: _userAccountsSectionKey),
                        SizedBox(height: 16),

                        _buildBodyText('To access certain features of the App, you may:'),
                        SizedBox(height: 16),

                        _buildBulletPointText('Create an account by signing in using an existing Google account'),
                        _buildBulletPointText('Use the App anonymously without creating an account'),
                        SizedBox(height: 16),

                        _buildBodyText('You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to provide accurate and up-to-date information.'),
                        SizedBox(height: 16),

                        _buildBodyText('We reserve the right to suspend or terminate accounts that violate these Terms, are used unlawfully, or pose a risk to the App or other users.'),
                        SizedBox(height: 40),

                        _buildSectionTitle('Subscriptions and Payments', key: _subscriptionsAndPayments),
                        SizedBox(height: 16),

                        _buildRichText([
                          TextSpan(
                            text: 'TipTap offers '
                          ),
                          TextSpan(
                            text: 'optional paid subscriptions',
                            style: TextStyle(
                              fontWeight: FontWeight.bold
                            )
                          ),
                          TextSpan(
                            text: ' (monthly and yearly).'
                          )
                        ]),
                        SizedBox(height: 16),

                        _buildBodyText('An active subscription:'),
                        SizedBox(height: 16),

                        _buildBulletPointText('Unlocks all app features'),
                        _buildBulletPointText('Removes all advertisements'),
                        SizedBox(height: 16),

                        _buildBodyText('Without a subscription:'),
                        SizedBox(height: 16),

                        _buildBulletPointText('Advertisements may be shown'),
                        _buildBulletPointText('Ads may be required to unlock certain content'),
                        SizedBox(height: 16),

                        _buildBodyText('Subscription prices are displayed in the App and may vary by region. Payment will be charged to your account at confirmation of purchase.'),
                        SizedBox(height: 16),

                        _buildBodyText('Subscriptions automatically renew unless canceled at least 24 hours before the end of the current billing period.'),
                        SizedBox(height: 16),

                        _buildBodyText('You can manage or cancel your subscription at any time through your account settings in the platform where the purchase was made.'),
                        SizedBox(height: 16),

                        _buildBodyText('Payments, renewals, and cancellations are handled through the Google Play Store and are subject to their respective terms and policies.'),
                        SizedBox(height: 40),

                        _buildSectionTitle('Content and Intellectual Property', key: _contentAndIntellectualProperty),
                        SizedBox(height: 16),

                        _buildBodyText('All content provided in the App, including facts, explanations, text, graphics, and design elements, is owned by or licensed to TipTap.'),
                        SizedBox(height: 16),

                        _buildBodyText('You are permitted to read and share content for personal and educational purposes. Any commercial use, redistribution, or modification of content requires prior written permission from TipTap.'),
                        SizedBox(height: 40),

                        _buildSectionTitle('Acceptable Use', key: _acceptableUseSectionKey),
                        SizedBox(height: 16),

                        _buildBodyText('You agree not to use the App for unlawful purposes, attempt unauthorized access, interfere with App functionality or security, or abuse other users.'),
                        SizedBox(height: 16),

                        _buildBodyText('Violation of these rules may result in suspension or termination.'),
                        SizedBox(height: 40),

                        _buildSectionTitle('Educational Disclaimer', key: _educationalDisclaimerSectionKey),
                        SizedBox(height: 16),

                        _buildBodyText('The App provides educational and informational content only. While we strive for accuracy, we do not guarantee completeness or correctness. Content should not be considered professional, medical, legal, or financial advice.'),
                        SizedBox(height: 40),

                        _buildSectionTitle('Limitation of Liability', key: _limitationOfLiabilitySectionKey),
                        SizedBox(height: 16),

                        _buildBodyText('The App is provided on an "as is" and "as available" basis. To the maximum extent permitted by law, TipTap shall not be liable for indirect, incidental, consequential, or special damages arising from use of the App.'),
                        SizedBox(height: 40),

                        _buildSectionTitle('Termination', key: _terminationSectionKey),
                        SizedBox(height: 16),

                        _buildBodyText('We may suspend or terminate your access to the App at any time, with or without notice, if you violate these Terms or applicable laws.'),
                        SizedBox(height: 16),

                        _buildBodyText('Upon termination, your right to use the App ceases immediately.'),
                        SizedBox(height: 40),

                        _buildSectionTitle('Changes to Terms', key: _changesToTermsSectionKey),
                        SizedBox(height: 16),

                        _buildBodyText('We may update these Terms from time to time. Continued use of the App after changes take effect constitutes acceptance of the updated Terms.'),
                        SizedBox(height: 40),

                        _buildSectionTitle('Governing Law', key: _governingLawSectionKey),
                        SizedBox(height: 16),

                        _buildBodyText('These Terms are governed by applicable laws of the jurisdiction in which TipTap operates, without regard to conflict-of-law principles.'),
                        SizedBox(height: 40),

                        _buildSectionTitle('Contact', key: _contactSectionKey),
                        SizedBox(height: 16),
                  
                        _buildRichText([
                          TextSpan(
                            text: 'For questions regarding these Terms, please contact us at '
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
                            text: 'you confirm that you have read and agreed to these Terms of Use.'
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

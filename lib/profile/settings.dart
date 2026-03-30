import 'package:animations/animations.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/svg.dart';
import 'package:go_router/go_router.dart';
import 'package:tiptap/shared/authentication.dart';
import 'package:tiptap/shared/database.dart';
import 'package:tiptap/shared/photo.dart';
import 'package:tiptap/shared/theme.dart';
import 'package:url_launcher/url_launcher.dart';

class SettingsPage extends StatefulWidget {
  const SettingsPage({super.key});

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        scrollDirection: Axis.vertical,
        child: Column(
          spacing: 24,
          mainAxisAlignment: MainAxisAlignment.start,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _accountSection(),
            _preferenceSection(),
            _moreSection()
          ],
        ),
      ),
    );
  }

  Widget _accountSection() {
    final authentication = context.watch<AuthenticationService>();
    final database = context.read<DatabaseService>();
    final photo = context.read<PhotoService>();

    return Column(
      spacing: 16,
      mainAxisAlignment: MainAxisAlignment.start,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Account',
          style: Theme.of(context).textTheme.titleLarge,
        ),
        Card(
          elevation: 0,
          clipBehavior: Clip.antiAlias,
          child: Column(
            children: [
              ListTile(
                onTap: () async {
                  if (authentication.state == null) {
                    await authentication.signInWithGoogle();
                  } else {
                    await authentication.signOut();
                    database.deleteLocal();
                  }
                },
                leading: authentication.state == null
                  ? CircleAvatar(
                      backgroundColor: Colors.transparent,
                      child: SvgPicture.asset(
                        'icons/google.svg',
                        width: 36,
                        height: 36
                      ),
                    )
                  : CircleAvatar(
                      backgroundImage: photo.imageBytes != null
                        ? MemoryImage(photo.imageBytes!)
                        : NetworkImage(authentication.state!.photoURL!),
                    ),
                title: Text(
                  authentication.state == null
                    ? 'Sign In with Google'
                    : authentication.state!.displayName!
                ),
                subtitle: Text(
                  authentication.state == null
                    ? 'Sync your account across devices'
                    : authentication.state!.email!
                ),
                trailing: authentication.state != null
                  ? SvgPicture.asset(
                      'icons/logout.svg',
                      colorFilter: ColorFilter.mode(
                        Theme.of(context).colorScheme.onSurfaceVariant,
                        BlendMode.srcIn
                      ),
                      width: 24,
                      height: 24
                    )
                  : null,
              ),
              if (authentication.state != null)
                ListTile(
                  onTap: () {
                    _showAccountDeletionConfirmation();
                  },
                  leading: Padding(
                    padding: const EdgeInsets.fromLTRB(8, 0, 8, 0),
                    child: SvgPicture.asset(
                      'icons/delete_forever.svg',
                      colorFilter: ColorFilter.mode(
                        Theme.of(context).colorScheme.error,
                        BlendMode.srcIn
                      ),
                      width: 24,
                      height: 24
                    ),
                  ),
                  title: Text(
                    'Delete Account'
                  ),
                )
            ],
          )
        )
      ]
    );
  }

  void _showAccountDeletionConfirmation() {
    final authentication = context.read<AuthenticationService>();
    final database = context.read<DatabaseService>();

    showModal(
      configuration: const FadeScaleTransitionConfiguration(
        transitionDuration: Duration(milliseconds: 300),
        reverseTransitionDuration: Duration(milliseconds: 300),
        barrierDismissible: true,
      ),
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text(
            'Delete Account?',
            style: Theme.of(context).textTheme.titleLarge
          ),
          content: SingleChildScrollView(
            child: Text(
              'All data linked to this account will be deleted.',
              style: Theme.of(context).textTheme.bodyLarge
            ),
          ),
          actions: authentication.state != null
            ? [
              TextButton(
                onPressed: () async {
                  await database.deleteRemote();
                  await authentication.deleteUser();
                  database.deleteLocal();
                  if (context.mounted) context.pop();
                },
                child: Text(
                  'Continue',
                  style: TextStyle(
                    color: Theme.of(context).colorScheme.error
                  )
                )
              ),
              TextButton(
                onPressed: () {
                  context.pop();
                },
                child: Text('Cancel')
              )
            ]
          : null
        );
      }
    );
  }

  Widget _preferenceSection() {
    final theme = context.watch<ThemeService>();
    final themeDropdown = {
      'onChanged': (ThemeMode? value) {
        theme.themeMode = value!;
      },
      'value': theme.themeMode,
      'title': 'Theme',
      'items': [
        {
          'value': ThemeMode.dark,
          'leading': 'icons/brightness_4.svg',
          'subtitle': 'Dark',
        },
        {
          'value': ThemeMode.system,
          'leading': 'icons/brightness_6.svg',
          'subtitle': 'System',
        },
        {
          'value': ThemeMode.light,
          'leading': 'icons/brightness_7.svg',
          'subtitle': 'Light',
        }
      ]
    };

    return Column(
      spacing: 16,
      mainAxisAlignment: MainAxisAlignment.start,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Preferences',
          style: Theme.of(context).textTheme.titleLarge,
        ),
        Card(
          elevation: 0,
          clipBehavior: Clip.antiAlias,
          child: Column(
            children: [
              DropdownButtonHideUnderline(
                child: DropdownButton(
                  onChanged: themeDropdown['onChanged'] as void Function(ThemeMode?)?,
                  mouseCursor: SystemMouseCursors.click,
                  padding: EdgeInsets.zero,
                  isDense: false,
                  icon: const SizedBox.shrink(),
                  value: themeDropdown['value'] as ThemeMode?,
                  alignment: AlignmentDirectional.centerStart,
                  isExpanded: true,
                  itemHeight: null,
                  selectedItemBuilder: (context) {
                    return (themeDropdown['items'] as List).map(
                      (item) {
                        return ListTile(
                          mouseCursor: SystemMouseCursors.click,
                          leading: Padding(
                            padding: const EdgeInsets.fromLTRB(8, 0, 8, 0),
                            child: SvgPicture.asset(
                              item['leading'] as String,
                              colorFilter: ColorFilter.mode(
                                Theme.of(context).colorScheme.onSurfaceVariant,
                                BlendMode.srcIn
                              ),
                              width: 24,
                              height: 24
                            ),
                          ),
                          title: Text(
                            themeDropdown['title'] as String
                          ),
                          subtitle: Text(
                            item['subtitle'] as String
                          ),
                        );
                      }
                    ).toList();
                  },
                  items: (themeDropdown['items'] as List).map(
                    (item) {
                      return DropdownMenuItem(
                        value: item['value'] as ThemeMode?,
                        child: Text(
                          item['subtitle']
                        )
                      );
                    }
                  ).toList()
                )
              )
            ]
          )
        )
      ]
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

  Widget _moreSection() {
    final moreListTiles = [
      {
        'onTap': () async {
          await _sendEmail();
        },
        'leading': 'icons/help.svg',
        'title': 'Contact Support',
      },
      {
        'onTap': () {},
        'leading': 'icons/policy.svg',
        'title': 'Privacy',
      },
      {
        'onTap': () {},
        'leading': 'icons/contract.svg',
        'title': 'Terms',
      },
      {
        'onTap': () {},
        'leading': 'icons/info.svg',
        'title': 'About',
      },
    ];

    return Column(
      spacing: 16,
      mainAxisAlignment: MainAxisAlignment.start,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'More',
          style: Theme.of(context).textTheme.titleLarge,
        ),
        Card(
          elevation: 0,
          clipBehavior: Clip.antiAlias,
          child: Column(
            children: moreListTiles.map(
              (tile) {
                return ListTile(
                  onTap: tile['onTap'] as void Function()?,
                  leading: Padding(
                    padding: const EdgeInsets.fromLTRB(8, 0, 8, 0),
                    child: SvgPicture.asset(
                      tile['leading'] as String,
                      colorFilter: ColorFilter.mode(
                        Theme.of(context).colorScheme.onSurfaceVariant,
                        BlendMode.srcIn
                      ),
                      width: 24,
                      height: 24
                    ),
                  ),
                  title: Text(
                    tile['title'] as String
                  ),
                );
              }
            ).toList()
          )
        )
      ]
    );
  }
}

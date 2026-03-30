import 'package:animate_do/animate_do.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/svg.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:tiptap/profile/bookmark.dart';
import 'package:tiptap/profile/gems.dart';
import 'package:tiptap/profile/streak.dart';
import 'package:tiptap/shared/ad.dart';
import 'package:tiptap/shared/ai.dart';
import 'package:tiptap/shared/authentication.dart';
import 'package:tiptap/shared/photo.dart';
import 'package:tiptap/shared/root.dart';
import 'package:tiptap/profile/settings.dart';
import 'package:tiptap/shared/streak.dart';
import 'package:tiptap/shared/theme.dart';

class ProfileRoute extends StatefulShellBranch implements RootNavigationShellBranch {
  ProfileRoute({required GlobalKey<NavigatorState> navigatorKey})
    : super(
        navigatorKey: navigatorKey,
        routes: [
          GoRoute(
            path: '/profile',
            builder: (context, state) => const ProfilePage(),
            routes: [
              GemsStatRoute(),
              BookmarksStatRoute(),
              StreakStatRoute(),
              BookmarksDetailsRoute(),
            ]
          )
        ]
      );

  @override
  BottomNavigationBarItem bottomNavigationBarItem(BuildContext context) {
    return BottomNavigationBarItem(
      icon: SvgPicture.asset(
        'icons/person.svg',
        colorFilter: ColorFilter.mode(
          Theme.of(context).colorScheme.onSurfaceVariant,
          BlendMode.srcIn
        ),
        width: 24,
        height: 24
      ),
      activeIcon: SvgPicture.asset(
        'icons/person_filled.svg',
        colorFilter: ColorFilter.mode(
          Theme.of(context).colorScheme.primary,
          BlendMode.srcIn
        ),
        width: 24,
        height: 24
      ),
      label: 'Profile'
    );
  }
}

class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  late final ScrollController _scrollController;
  bool _showTitle = false;

  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController();
    _scrollController.addListener(_scrollListener);
  }

  void _scrollListener() {
    if (_scrollController.offset > 120 && !_showTitle) {
      setState(() => _showTitle = true);
    } else if (_scrollController.offset <= 120 && _showTitle) {
      setState(() => _showTitle = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    context.watch<ThemeService>();

    return Scaffold(
      body: NestedScrollView(
        controller: _scrollController,
        headerSliverBuilder: (context, innerBoxIsScrolled) {
          final authentication = context.watch<AuthenticationService>();
          return [
            SliverAppBar(
              pinned: true,
              automaticallyImplyLeading: false,
              automaticallyImplyActions: false,
              centerTitle: true,
              title: AnimatedOpacity(
                opacity: _showTitle ? 1 : 0,
                duration: Duration(milliseconds: 300),
                child: Text(authentication.state?.displayName ?? 'TipTap')
              ),
            ),
            SliverToBoxAdapter(
              child: ProfileSection()
            ),
          ];
        },
        body: BookmarksSection()
      )
    );
  }
}

class ProfileSection extends StatefulWidget {
  const ProfileSection({super.key});

  @override
  State<ProfileSection> createState() => _ProfileSectionState();
}

class _ProfileSectionState extends State<ProfileSection> {
  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center,
        spacing: 16,
        children: [
          _profileBadge(),
          _profileInfo(),
          const SizedBox(
            height: 16,
            child: Divider(height: 1),
          )
        ],
      ),
    );
  }

  Widget _profileBadge() {
    final photo = context.watch<PhotoService>();

    return Badge(
      backgroundColor: Colors.transparent,
      alignment: Alignment.bottomRight,
      offset: const Offset(-24, -24),
      label: Container(
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surface,
          shape: BoxShape.circle,
          border: Border.all(
            color: Theme.of(context).colorScheme.surface,
            width: 4
          ),
        ),
        child: SizedBox(
          width: 36,
          height: 36,
          child: IconButton.filled(
            onPressed: () {
              _showSettings();
            },
            icon: SvgPicture.asset(
              'icons/settings.svg',
              colorFilter: ColorFilter.mode(
                Theme.of(context).colorScheme.onPrimary,
                BlendMode.srcIn
              ),
              width: 24,
              height: 24,
            ),
          ),
        ),
      ),
      child: CircleAvatar(
        radius: 40,
        backgroundImage: photo.imageBytes != null
          ? MemoryImage(photo.imageBytes!)
          : AssetImage('images/logo_1024x1024.png'),
      ),
    );
  }

  void _showSettings() {
    showModalBottomSheet(
      useRootNavigator: true,
      isScrollControlled: true,
      enableDrag: true,
      showDragHandle: true,
      context: context,
      builder: (context) {
        return SettingsPage();
      }
    );
  }

  Widget _profileInfo() {
    final authentication = context.watch<AuthenticationService>();
    final ai = context.watch<AIService>();
    final streak = context.watch<StreakService>();
    final ads = context.watch<AdService>();

    final statsRow = [
      {
        'onPressed': () {
          context.goNamed('gems-stat');
        },
        'icon': 'icons/diamond.svg',
        'value': ads.gems,
        'label': 'Gems'
      },
      {
        'onPressed': () {
          context.goNamed('bookmarks-stat');
        },
        'icon': 'icons/bookmark.svg',
        'value': ai.bookmarks.length,
        'label': 'Bookmarks'
      },
      {
        'onPressed': () {
          context.goNamed('streak-stat');
        },
        'icon': 'icons/mode_heat.svg',
        'value': streak.count,
        'label': 'Streak'
      }
    ];

    return Column(
      spacing: 16,
      children: [
        if (authentication.state != null)
          Column(
            children: [
              Text(
                authentication.state!.displayName!,
                style: Theme.of(context).textTheme.titleLarge
              ),
              Text(
                authentication.state!.email!,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Theme.of(context).colorScheme.onSurfaceVariant
                )
              )
            ],
          ),
        IntrinsicHeight(
          child: Row(
            spacing: 16,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              for (int i = 0; i < statsRow.length; i++) ...[
                TextButton(
                  onPressed: statsRow[i]['onPressed'] as void Function()?,
                  child: Column(
                    children: [
                      Row(
                        spacing: 4,
                        children: [
                          Text(
                            NumberFormat.compact().format(statsRow[i]['value']),
                            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                              color: Theme.of(context).colorScheme.onSurfaceVariant
                            )
                          ),
                          Hero(
                            tag: 'tag-${(statsRow[i]['label'] as String).toLowerCase()}-stat',
                            child: SvgPicture.asset(
                              '${statsRow[i]['icon']}',
                              colorFilter: ColorFilter.mode(
                                Theme.of(context).colorScheme.onSurfaceVariant,
                                BlendMode.srcIn
                              ),
                              width: 24,
                              height: 24
                            )
                          )
                        ],
                      ),
                      Text(
                        '${statsRow[i]['label']}',
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Theme.of(context).colorScheme.onSurfaceVariant
                        ),
                      )
                    ],
                  ),
                ),
                if (i < statsRow.length - 1)
                  const SizedBox(
                    height: 24,
                    child: VerticalDivider(width: 1)
                  ),
              ],
            ],
          ),
        )
      ],
    );
  }
}

class BookmarksSection extends StatelessWidget {
  const BookmarksSection({super.key});

  @override
  Widget build(BuildContext context) {
    final ai = context.watch<AIService>();
    context.watch<ThemeService>();
    final bookmarks = ai.bookmarks.reversed.toList();
    if (bookmarks.isEmpty) {
      return Center(
        child: FadeIn(
          duration: Duration(milliseconds: 1000),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Text(
                //'(= ФェФ=)',
                '( ❍ᴥ❍ )',
                //'( ⌣ʟ⌣ )',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  color: Theme.of(context).colorScheme.onSurfaceVariant
                ),
                textAlign: TextAlign.center
              ),
              const SizedBox(height: 8),
              Column(
                children: [
                  Text(
                    'No bookmarks yet',
                    style: Theme.of(context).textTheme.titleLarge,
                    textAlign: TextAlign.center
                  ),
                  Text(
                    'All your saved facts will appear here.',
                    style: Theme.of(context).textTheme.bodyLarge,
                    textAlign: TextAlign.center
                  )
                ],
              )
            ],
          ),
        )
      );
    } else {
      return GridView.builder(
        key: ValueKey(Theme.of(context).brightness),
        padding: EdgeInsets.all(4),
        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 3,
          crossAxisSpacing: 2,
          mainAxisSpacing: 2,
          childAspectRatio: 0.5,
        ),
        itemCount: bookmarks.length,
        itemBuilder: (context, index) {
          final globalIndex = bookmarks[index];
          final data = ai.getByIndex(globalIndex);

          return FadeIn(
            duration: Duration(milliseconds: 1000),
            delay: Duration(milliseconds: index * 100),
            child: Card(
              elevation: 0,
              clipBehavior: Clip.antiAlias,
              child: InkWell(
                onTap: () {
                  context.goNamed(
                    'bookmarks',
                    pathParameters: {
                      'id': globalIndex.toString()
                    }
                  );
                },
                child: Center(
                  child: Padding(
                    padding: EdgeInsetsGeometry.all(8),
                    child: Text(
                      '${data?['title'] ?? ''}',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Theme.of(context).colorScheme.onSurfaceVariant
                      ),
                      textAlign: TextAlign.center
                    )
                  )
                ),
              )
            ),
          );
        }
      );
    }
  }
}

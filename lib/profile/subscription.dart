import 'package:animate_do/animate_do.dart';
import 'package:animations/animations.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/svg.dart';
import 'package:go_router/go_router.dart';
import 'package:in_app_purchase_android/in_app_purchase_android.dart';
import 'package:tiptap/shared/premium.dart';
import 'package:tiptap/shared/root.dart';

class SubscriptionRoute extends GoRoute {
  SubscriptionRoute()
    : super(
        parentNavigatorKey: rootNavigatorKey,
        name: 'subscription',
        path: 'subscription',
        pageBuilder: (context, state) {
          return CustomTransitionPage(
            key: state.pageKey,
            transitionDuration: const Duration(milliseconds: 500),
            reverseTransitionDuration: const Duration(milliseconds: 500),
            transitionsBuilder: (context, animation, secondaryAnimation, child) {
              return SharedAxisTransition(
                animation: animation,
                secondaryAnimation: secondaryAnimation,
                transitionType: SharedAxisTransitionType.scaled,
                child: child
              );
            },
            child: SubscriptionPage()
          );
        }
      );
}

class SubscriptionPage extends StatefulWidget {
  const SubscriptionPage({super.key});

  @override
  State<SubscriptionPage> createState() => _SubscriptionPageState();
}

class _SubscriptionPageState extends State<SubscriptionPage> {
  @override
  Widget build(BuildContext context) {
    return BlocListener<PremiumService, bool>(
      listenWhen: (previous, current) => previous == false && current == true,
      listener: (context, isNowPremium) {
        if (isNowPremium) {
          if (mounted) context.pop();
        }
      },
      child: PopScope(
        canPop: true,
        child: Actions(
          actions: { 
            DismissIntent: CallbackAction<DismissIntent>(onInvoke: (intent) => context.pop()) 
          },
          child: Shortcuts(
            shortcuts: { 
              SingleActivator(LogicalKeyboardKey.escape): const DismissIntent() 
            },
            child: Focus(
              autofocus: true,
              child: Scaffold(
                body: Center(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.fromLTRB(16, 16, 16, 88),
                    child: _buildProductList(),
                  )
                ),
                floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
                floatingActionButton: ZoomIn(
                  duration: Duration(milliseconds: 1000),
                  delay: Duration(milliseconds: 2000),
                  child: IconButton.filled(
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

  Widget _buildProductList() {
    final premium = context.read<PremiumService>();
    final products = premium.productDetails;
    if (products.isEmpty) return const CircularProgressIndicator();

    final product = products.first;
    if (product is GooglePlayProductDetails) {
      final offers = product.productDetails.subscriptionOfferDetails ?? [];
      return Column(
        spacing: 16,
        children: [
          SvgPicture.asset(
            'icons/crown_filled.svg',
            colorFilter: ColorFilter.mode(
              Theme.of(context).colorScheme.primary,
              BlendMode.srcIn
            ),
            width: 56,
            height: 56,
          ),
          Text('Upgrade to Premium', style: Theme.of(context).textTheme.headlineSmall),
          SizedBox(height: 8),
          ...offers.map((offer) {
            final isMonthly = offer.basePlanId == 'monthly-premium-subscription';
            return isMonthly
              ? FadeInLeft(
                  duration: const Duration(milliseconds: 800),
                  delay: const Duration(milliseconds: 800),
                  child: Card(
                    clipBehavior: Clip.antiAlias,
                    elevation: 0,
                    child: ListTile(
                      title: Text('Monthly Plan'),
                      subtitle: Text('${offer.pricingPhases.first.formattedPrice} per month'),
                      onTap: () => premium.subscribe(product, offer.offerIdToken),
                    )
                  ),
                )
              : FadeInRight(
                  duration: const Duration(milliseconds: 800),
                  delay: const Duration(milliseconds: 800),
                  child: Card(
                    elevation: 0,
                    child: Badge(
                      label: Text('50% off'),
                      textColor: Theme.of(context).colorScheme.onPrimary,
                      offset: const Offset(-56, -6),
                      backgroundColor: Theme.of(context).colorScheme.primary,
                      isLabelVisible: true,
                      child: ListTile(
                        title: Text('Annual Plan'),
                        subtitle: Text('${offer.pricingPhases.first.formattedPrice} per year'),
                        onTap: () => premium.subscribe(product, offer.offerIdToken),
                      ),
                    )
                  )
                );
          }),
          SizedBox(height: 8),
          FadeIn(
            duration: const Duration(milliseconds: 1000),
            delay: const Duration(milliseconds: 1500),
            child: Column(
              spacing: 8,
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SvgPicture.asset(
                      'icons/ad_off.svg',
                      colorFilter: ColorFilter.mode(
                        Theme.of(context).colorScheme.onSurfaceVariant,
                        BlendMode.srcIn
                      ),
                      width: 24,
                      height: 24,
                    ),
                    SizedBox(width: 8),
                    Text('No advertisement', style: Theme.of(context).textTheme.bodyLarge),
                  ]
                ),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SvgPicture.asset(
                      'icons/bookmark_added.svg',
                      colorFilter: ColorFilter.mode(
                        Theme.of(context).colorScheme.onSurfaceVariant,
                        BlendMode.srcIn
                      ),
                      width: 24,
                      height: 24,
                    ),
                    SizedBox(width: 8),
                    Text('Unlimited save feature', style: Theme.of(context).textTheme.bodyLarge),
                  ]
                ),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SvgPicture.asset(
                      'icons/sync.svg',
                      colorFilter: ColorFilter.mode(
                        Theme.of(context).colorScheme.onSurfaceVariant,
                        BlendMode.srcIn
                      ),
                      width: 24,
                      height: 24,
                    ),
                    SizedBox(width: 8),
                    Text('Synchronized data across devices', style: Theme.of(context).textTheme.bodyLarge),
                  ]
                ),
              ],
            ),
          )
        ],
      );
    }

    return Text('Unavailable');
  }
}

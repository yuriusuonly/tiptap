import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/svg.dart';
import 'package:tiptap/app/services/first_launch.dart';

class IntroductionPage extends StatefulWidget {
  const IntroductionPage({super.key});

  @override
  State<IntroductionPage> createState() => _IntroductionPageState();
}

class _IntroductionPageState extends State<IntroductionPage> with SingleTickerProviderStateMixin {
  late final AnimationController _glowController;
  late final Animation<double> _glowAnimation;

  @override
  void initState() {
    super.initState();
    _glowController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2000),
    )..repeat(reverse: true);
    _glowAnimation = Tween<double>(begin: 20, end: 60).animate(_glowController);
  }

  @override
  void dispose() {
    _glowController.dispose();
    super.dispose();
  }

  void _dismiss() {
    context.read<FirstLaunchService>().dismissIntroduction();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: _dismiss,
      child: SafeArea(
        child: Container(
          color: Colors.black.withValues(alpha: 0.8),
          child: Center(
            child: SingleChildScrollView(
              padding: EdgeInsets.all(24),
              child: Column(
                spacing: 24,
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  AnimatedBuilder(
                    animation: _glowAnimation,
                    builder: (context, child) {
                      return Container(
                        width: 140,
                        height: 140,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: Colors.white.withValues(alpha: 0.1),
                          boxShadow: [
                            BoxShadow(
                              color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.7),
                              blurRadius: _glowAnimation.value,
                              spreadRadius: 6,
                            ),
                          ],
                        ),
                        child: child,
                      );
                    },
                    child: Padding(
                      padding: EdgeInsets.all(16),
                      child: SvgPicture.asset(
                        'icons/local_library_filled.svg',
                        width: 108,
                        height: 108,
                        colorFilter: ColorFilter.mode(
                          Colors.white,
                          BlendMode.srcIn
                        ),
                      ),
                    ),
                  ),
                  Text(
                    'Turn curiosity into knowledge',
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      color: Colors.white
                    ),
                    textAlign: TextAlign.center,
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

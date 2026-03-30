//import 'package:animations/animations.dart';
import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';

/*
class NavigationTransitionSwitcher extends StatefulWidget {
  final PageTransitionSwitcherTransitionBuilder transitionBuilder;
  final int currentIndex;
  final Widget child;
  final Duration duration;

  const NavigationTransitionSwitcher({
    super.key, 
    required this.currentIndex,
    this.duration = const Duration(milliseconds: 1000),
    required this.transitionBuilder,
    required this.child,
  });

  @override
  State<NavigationTransitionSwitcher> createState() => _NavigationTransitionSwitcherState();
}

class _NavigationTransitionSwitcherState extends State<NavigationTransitionSwitcher> {
  bool _reverse = false;

  @override
  void didUpdateWidget(NavigationTransitionSwitcher oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.currentIndex != oldWidget.currentIndex) {
      _reverse = widget.currentIndex < oldWidget.currentIndex;
    }
  }

  @override
  Widget build(BuildContext context) {
    return PageTransitionSwitcher(
      reverse: _reverse,
      duration: widget.duration,
      transitionBuilder: widget.transitionBuilder,
      child: KeyedSubtree(
        key: ValueKey(widget.currentIndex),
        child: widget.child,
      ),
    );
  }
}
*/

class IntervalLottie extends StatefulWidget {
  final String asset;
  final Duration interval;

  const IntervalLottie({
    super.key,
    required this.asset,
    this.interval = const Duration(milliseconds: 1000)
  });

  @override
  State<IntervalLottie> createState() => _IntervalLottieState();
}

class _IntervalLottieState extends State<IntervalLottie> with TickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this);

    // Add status listener to trigger interval after each play
    _controller.addStatusListener((status) {
      if (status == AnimationStatus.completed) {
        _playWithInterval();
      }
    });
  }

  void _playWithInterval() async {
    // Wait for 3 seconds before playing again
    await Future.delayed(widget.interval);
    if (mounted) {
      _controller.forward(from: 0);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Lottie.asset(
      widget.asset,
      controller: _controller,
      onLoaded: (composition) {
        // Set controller duration to match the Lottie file
        _controller.duration = composition.duration;
        _controller.forward();
      },
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }
}

class PulseTransition extends StatefulWidget {
  final Widget child;
  final Duration duration;

  const PulseTransition({
    super.key,
    required this.child,
    this.duration = const Duration(milliseconds: 500),
  });

  @override
  State<PulseTransition> createState() => _PulseTransitionState();
}

class _PulseTransitionState extends State<PulseTransition> with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: widget.duration,
    )..repeat(reverse: true);
    _animation = Tween<double>(begin: 0.5, end: 1.0).animate(_controller);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(opacity: _animation, child: widget.child);
  }
}

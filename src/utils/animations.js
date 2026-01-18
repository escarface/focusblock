// Modern Reanimated Animations
// Smooth, natural animations following Apple's design

import {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
  SlideInUp,
  SlideOutUp,
  ZoomIn,
  ZoomOut,
  BounceIn,
  BounceOut,
  Easing,
} from 'react-native-reanimated';

// Fade animations with smooth easing
export const fadeIn = FadeIn.duration(300).easing(Easing.out(Easing.quad));
export const fadeOut = FadeOut.duration(200);

// Slide animations with spring physics
export const slideInUp = SlideInUp.duration(400).springify().damping(15);
export const slideOutDown = SlideOutDown.duration(300).springify().damping(20);
export const slideInDown = SlideInDown.duration(400).springify().damping(15);
export const slideOutUp = SlideOutUp.duration(300).springify().damping(20);

// Scale animations
export const scaleIn = ZoomIn.duration(300).springify().damping(15);
export const scaleOut = ZoomOut.duration(200);

// Bounce animations (for success states)
export const bounceIn = BounceIn.duration(500);
export const bounceOut = BounceOut.duration(300);

// Card animations
export const cardEntering = FadeIn.duration(300).delay(100);
export const cardExiting = FadeOut.duration(200);

// Modal animations
export const modalEntering = SlideInDown.duration(400).springify().damping(18);
export const modalExiting = SlideOutDown.duration(300).springify().damping(20);

// List item animations (staggered)
export const listItemEntering = (index = 0) =>
  FadeIn.duration(300)
    .delay(index * 50)
    .easing(Easing.out(Easing.quad));

export const listItemExiting = FadeOut.duration(200);

export default {
  fadeIn,
  fadeOut,
  slideInUp,
  slideOutDown,
  slideInDown,
  slideOutUp,
  scaleIn,
  scaleOut,
  bounceIn,
  bounceOut,
  cardEntering,
  cardExiting,
  modalEntering,
  modalExiting,
  listItemEntering,
  listItemExiting,
};

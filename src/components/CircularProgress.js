// FocusBlocks Circular Progress Component
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../contexts/ThemeContext';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function CircularProgress({
  size = 250,
  strokeWidth = 12,
  progress = 0, // 0 to 1
  pulse = false,
  children,
}) {
  const { colors } = useTheme();
  const clampedProgress = Math.min(1, Math.max(0, progress));
  const gradientId = useRef(`timerGradient-${Math.random().toString(36).slice(2, 8)}`);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progressValue = useSharedValue(clampedProgress);
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0);

  useEffect(() => {
    progressValue.value = withTiming(clampedProgress, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    });
  }, [clampedProgress, progressValue]);

  useEffect(() => {
    if (pulse) {
      pulseOpacity.value = withTiming(0.18, { duration: 200 });
      pulseScale.value = withRepeat(
        withTiming(1.06, { duration: 1200, easing: Easing.inOut(Easing.quad) }),
        -1,
        true
      );
    } else {
      cancelAnimation(pulseScale);
      cancelAnimation(pulseOpacity);
      pulseScale.value = withTiming(1, { duration: 200 });
      pulseOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [pulse, pulseOpacity, pulseScale]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference - progressValue.value * circumference,
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View
        style={[
          styles.pulse,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: colors.primaryLight,
          },
          pulseStyle,
        ]}
      />
      <Svg width={size} height={size} style={styles.svg}>
        <Defs>
          <LinearGradient
            id={gradientId.current}
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >
            <Stop offset="0" stopColor={colors.primaryLight} />
            <Stop offset="0.6" stopColor={colors.primary} />
            <Stop offset="1" stopColor={colors.primaryDark} />
          </LinearGradient>
        </Defs>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.timerBackground}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#${gradientId.current})`}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animatedProps={animatedProps}
          />
        </G>
      </Svg>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  pulse: {
    position: 'absolute',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

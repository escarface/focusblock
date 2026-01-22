// FocusBlocks Button Component
import React, { useCallback, useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';

export default function Button({
  title,
  onPress,
  variant = 'primary', // primary, secondary, outline, ghost
  size = 'medium', // small, medium, large
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  haptics = true,
  style,
  textStyle,
  children,
}) {
  const { colors, typography, spacing } = useTheme();
  const [isPressed, setIsPressed] = useState(false);

  const getBackgroundColor = () => {
    if (disabled) return colors.state.disabledBackground;
    switch (variant) {
      case 'primary':
        return isPressed ? colors.primaryDark : colors.primary;
      case 'secondary':
        return isPressed ? colors.surface : colors.backgroundSecondary;
      case 'outline':
        return isPressed ? colors.state.pressed : 'transparent';
      case 'ghost':
        return isPressed ? colors.state.pressed : 'transparent';
      default:
        return isPressed ? colors.primaryDark : colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.state.disabledText;
    switch (variant) {
      case 'primary':
        return colors.textOnPrimary;
      case 'secondary':
        return isPressed ? colors.textPrimary : colors.textSecondary;
      case 'outline':
        return isPressed ? colors.primaryDark : colors.primary;
      case 'ghost':
        return isPressed ? colors.primaryDark : colors.primary;
      default:
        return colors.textOnPrimary;
    }
  };

  const getSize = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: spacing.buttonPaddingSmallVertical,
          paddingHorizontal: spacing.buttonPaddingSmallHorizontal,
          fontSize: typography.sizes.sm,
          minHeight: spacing.buttonHeightSmall,
        };
      case 'large':
        return {
          paddingVertical: spacing.buttonPaddingLargeVertical,
          paddingHorizontal: spacing.buttonPaddingLargeHorizontal,
          fontSize: typography.sizes.xl,
          minHeight: spacing.buttonHeightLarge,
        };
      default:
        return {
          paddingVertical: spacing.buttonPaddingVertical,
          paddingHorizontal: spacing.buttonPaddingHorizontal,
          fontSize: typography.sizes.lg,
          minHeight: spacing.buttonHeightMedium,
        };
    }
  };

  const sizeStyles = getSize();
  const isDisabled = disabled || loading;

  const triggerHaptics = useCallback(async () => {
    if (!haptics || process.env.EXPO_OS !== 'ios') return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Button haptics failed:', error);
    }
  }, [haptics]);

  const handlePress = useCallback(async () => {
    if (isDisabled) return;
    await triggerHaptics();
    if (onPress) {
      onPress();
    }
  }, [isDisabled, onPress, triggerHaptics]);

  const handlePressIn = useCallback(() => setIsPressed(true), []);
  const handlePressOut = useCallback(() => setIsPressed(false), []);

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          minHeight: sizeStyles.minHeight,
          borderWidth: variant === 'outline' ? 1.5 : 0,
          borderColor: variant === 'outline' ? colors.primary : 'transparent',
          borderRadius: spacing.buttonRadius,
        },
        style,
      ]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && (
            <View style={[styles.iconLeft, { marginRight: spacing.xs }]}>
              {icon}
            </View>
          )}
          {title ? (
            <Text
              style={[
                styles.text,
                {
                  color: getTextColor(),
                  fontSize: sizeStyles.fontSize,
                },
                textStyle,
              ]}
            >
              {title}
            </Text>
          ) : (
            children
          )}
          {icon && iconPosition === 'right' && (
            <View style={[styles.iconRight, { marginLeft: spacing.xs }]}>
              {icon}
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
  },
  iconLeft: {
    marginRight: 0,
  },
  iconRight: {
    marginLeft: 0,
  },
});

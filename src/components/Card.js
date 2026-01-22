// FocusBlocks Card Component
import React, { useCallback, useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export default function Card({
  children,
  onPress,
  onLongPress,
  delayLongPress,
  style,
  variant = 'default', // default, active, elevated
  padding = true,
}) {
  const { colors, spacing, shadows } = useTheme();
  const [isPressed, setIsPressed] = useState(false);

  const getBackgroundColor = () => {
    switch (variant) {
      case 'active':
        return colors.blockActive;
      case 'elevated':
        return colors.surface;
      default:
        return colors.blockDefault;
    }
  };

  const Container = onPress || onLongPress ? TouchableOpacity : View;
  const baseBackground = getBackgroundColor();
  const pressedBackground = isPressed
    ? variant === 'active'
      ? colors.blockActive
      : colors.backgroundSecondary
    : baseBackground;

  const handlePressIn = useCallback(() => setIsPressed(true), []);
  const handlePressOut = useCallback(() => setIsPressed(false), []);

  return (
    <Container
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={delayLongPress}
      onPressIn={onPress ? handlePressIn : undefined}
      onPressOut={onPress ? handlePressOut : undefined}
      activeOpacity={0.7}
      style={[
        styles.card,
        {
          backgroundColor: pressedBackground,
          padding: padding ? spacing.cardPadding : 0,
          borderRadius: spacing.cardRadius,
          borderWidth: 1,
          borderColor: colors.border,
        },
        variant === 'elevated' ? shadows.medium : shadows.small,
        style,
      ]}
    >
      {children}
    </Container>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 0,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
});

// FocusBlocks Card Component
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export default function Card({
  children,
  onPress,
  style,
  variant = 'default', // default, active, elevated
  padding = true,
}) {
  const { colors, spacing, shadows, isDark } = useTheme();

  const getBackgroundColor = () => {
    switch (variant) {
      case 'active':
        return colors.blockActive;
      case 'elevated':
        return colors.surface;
      default:
        return isDark ? colors.surface : colors.blockDefault;
    }
  };

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.card,
        {
          backgroundColor: getBackgroundColor(),
          padding: padding ? spacing.cardPadding : 0,
          borderWidth: isDark ? 1 : 0,
          borderColor: isDark ? colors.border : 'transparent',
        },
        variant === 'elevated' && shadows.medium,
        style,
      ]}
    >
      {children}
    </Container>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
});

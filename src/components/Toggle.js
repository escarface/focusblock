// FocusBlocks Toggle/Switch Component
import React, { useCallback } from 'react';
import { TouchableOpacity, View, StyleSheet, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';

export default function Toggle({ value, onValueChange, disabled = false }) {
  const { colors, shadows } = useTheme();

  const translateX = React.useRef(new Animated.Value(value ? 24 : 2)).current;

  React.useEffect(() => {
    Animated.spring(translateX, {
      toValue: value ? 24 : 2,
      useNativeDriver: true,
      bounciness: 4,
    }).start();
  }, [value]);

  const handlePress = useCallback(async () => {
    if (disabled) return;
    if (process.env.EXPO_OS === 'ios') {
      try {
        await Haptics.selectionAsync();
      } catch (error) {
        console.error('Toggle haptics failed:', error);
      }
    }
    onValueChange(!value);
  }, [disabled, onValueChange, value]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      style={[
        styles.container,
        {
          backgroundColor: disabled
            ? colors.state.disabledBackground
            : value
            ? colors.primary
            : colors.border,
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.thumb,
          shadows.small,
          {
            backgroundColor: '#FFFFFF',
            transform: [{ translateX }],
          },
        ]}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 52,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
});

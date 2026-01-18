// FocusBlocks Header Component
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { SymbolIcon } from './SymbolIcon';

export default function Header({
  title,
  leftAction,
  rightAction,
  leftIcon = 'back',
  rightIcon,
  transparent = false,
  centerTitle = true,
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 8,
          backgroundColor: transparent ? 'transparent' : colors.background,
        },
      ]}
    >
      <View style={styles.content}>
        {leftAction ? (
          <TouchableOpacity
            onPress={leftAction}
            style={styles.button}
            activeOpacity={0.7}
          >
            <SymbolIcon name={leftIcon} color={colors.textPrimary} size={24} />
          </TouchableOpacity>
        ) : (
          <View style={styles.button} />
        )}

        {centerTitle ? (
          <Text
            style={[styles.titleCenter, { color: colors.textPrimary }]}
            numberOfLines={1}
          >
            {title}
          </Text>
        ) : (
          <View style={styles.titleLeft}>
            <Text
              style={[styles.title, { color: colors.textPrimary }]}
              numberOfLines={1}
            >
              {title}
            </Text>
          </View>
        )}

        {rightAction && rightIcon ? (
          <TouchableOpacity
            onPress={rightAction}
            style={styles.button}
            activeOpacity={0.7}
          >
            <SymbolIcon name={rightIcon} color={colors.textPrimary} size={24} />
          </TouchableOpacity>
        ) : (
          <View style={styles.button} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
  },
  button: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleCenter: {
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  titleLeft: {
    flex: 1,
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
  },
});

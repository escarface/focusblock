import React, { useCallback, useMemo } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TabSymbolIcon } from './SymbolIcon';
import { useTheme } from '../contexts/ThemeContext';

const CTA_CONFIG = {
  routeName: 'timer',
  targetScreen: 'EditBlock',
  label: 'Add',
  iconName: 'plus',
};

const withAlpha = (hexColor, alpha) => {
  if (!hexColor || typeof hexColor !== 'string') return hexColor;
  const hex = hexColor.replace('#', '');
  if (hex.length !== 6) return hexColor;

  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return hexColor;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

function TabBarItem({
  route,
  options,
  isFocused,
  navigation,
  colors,
  styles,
  iconSize,
  inactiveColor,
}) {
  const handlePress = useCallback(() => {
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name);
    }
  }, [isFocused, navigation, route.key, route.name]);

  const handleLongPress = useCallback(() => {
    navigation.emit({
      type: 'tabLongPress',
      target: route.key,
    });
  }, [navigation, route.key]);

  const label = typeof options.tabBarLabel === 'string'
    ? options.tabBarLabel
    : (options.title ?? route.name);

  const color = isFocused ? colors.primary : inactiveColor;
  const icon = options.tabBarIcon
    ? options.tabBarIcon({ color, size: iconSize, focused: isFocused })
    : <TabSymbolIcon name={route.name} color={color} size={iconSize} />;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={options.tabBarAccessibilityLabel}
      testID={options.tabBarTestID}
      onPress={handlePress}
      onLongPress={handleLongPress}
      style={styles.tabItem}
      activeOpacity={0.8}
    >
      <View style={styles.iconWrapper}>
        {icon}
      </View>
      <Text
        style={[styles.label, isFocused ? styles.labelActive : styles.labelInactive]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function FloatingTabBar({ state, descriptors, navigation }) {
  const { colors, spacing, typography, shadows, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const routes = state.routes;

  const ctaRoute = useMemo(
    () => routes.find((route) => route.name === CTA_CONFIG.routeName),
    [routes]
  );

  const leftRoutes = routes.slice(0, Math.ceil(routes.length / 2));
  const rightRoutes = routes.slice(Math.ceil(routes.length / 2));

  const iconSize = spacing?.iconSmall ?? 20;
  const ctaSize = (spacing?.buttonHeightLarge ?? 52) + (spacing?.xs ?? 8);
  const dockHeight = spacing?.tabBarHeight ?? 80;
  const inactiveColor = isDark ? colors.textMuted : colors.textSecondary;
  const slots = useMemo(
    () => [...leftRoutes, null, ...rightRoutes],
    [leftRoutes, rightRoutes]
  );

  const styles = useMemo(() => StyleSheet.create({
    container: {
      position: 'absolute',
      left: spacing?.screenHorizontal ?? 24,
      right: spacing?.screenHorizontal ?? 24,
      bottom: (insets.bottom ?? 0) + (spacing?.sm ?? 12),
      zIndex: 10,
    },
    dock: {
      height: dockHeight,
      borderRadius: dockHeight / 2,
      borderCurve: 'continuous',
      overflow: 'hidden',
      justifyContent: 'center',
      backgroundColor: Platform.OS === 'ios'
        ? 'transparent'
        : (isDark ? colors.surface : colors.background),
      borderWidth: isDark ? 0 : 1,
      borderColor: isDark ? 'transparent' : colors.border,
      ...(shadows?.medium ?? {}),
    },
    blur: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: withAlpha(colors.background, isDark ? 0.82 : 0.9),
    },
    dockContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing?.sm ?? 12,
    },
    slot: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabItem: {
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
    },
    iconWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing?.xxs ?? 4,
    },
    label: {
      fontFamily: typography?.fontFamily,
      fontSize: typography?.sizes?.xs ?? 11,
      fontWeight: typography?.fontWeights?.semibold ?? '600',
      letterSpacing: 0.3,
      textAlign: 'center',
    },
    labelActive: {
      color: colors.primary,
    },
    labelInactive: {
      color: colors.textMuted,
    },
    ctaWrapper: {
      position: 'absolute',
      left: '50%',
      top: -((ctaSize / 2) - (spacing?.sm ?? 12)),
      marginLeft: -(ctaSize / 2),
      alignItems: 'center',
    },
    ctaButton: {
      width: ctaSize,
      height: ctaSize,
      borderRadius: ctaSize / 2,
      borderCurve: 'continuous',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      ...(shadows?.large ?? {}),
    },
    ctaButtonActive: {
      backgroundColor: isDark ? colors.primaryLight : colors.primary,
    },
    ctaIcon: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    ctaLabel: {
      marginTop: spacing?.xxs ?? 4,
      fontFamily: typography?.fontFamily,
      fontSize: typography?.sizes?.xs ?? 11,
      fontWeight: typography?.fontWeights?.semibold ?? '600',
      color: colors.primary,
      letterSpacing: 0.3,
    },
  }), [
    colors,
    spacing,
    typography,
    shadows,
    insets.bottom,
    isDark,
    ctaSize,
    dockHeight,
  ]);

  const isCtaFocused = ctaRoute
    ? state.index === routes.indexOf(ctaRoute)
    : false;

  const handleCtaPress = useCallback(() => {
    if (!ctaRoute) return;

    navigation.navigate(CTA_CONFIG.routeName, { screen: CTA_CONFIG.targetScreen });
  }, [ctaRoute, navigation]);

  return (
    <View pointerEvents="box-none" style={styles.container}>
      <View style={styles.dock}>
        {Platform.OS === 'ios' ? (
          <BlurView
            intensity={isDark ? 80 : 70}
            tint={isDark ? 'dark' : 'light'}
            style={styles.blur}
          />
        ) : (
          <View style={styles.blur} />
        )}
        <View style={styles.dockContent}>
          {slots.map((route, index) => {
            if (!route) {
              return (
                <View
                  key={`cta-slot-${index}`}
                  style={styles.slot}
                  pointerEvents="none"
                />
              );
            }

            const descriptor = descriptors[route.key];
            return (
              <View key={route.key} style={styles.slot}>
                <TabBarItem
                  route={route}
                  options={descriptor.options}
                  isFocused={state.index === routes.indexOf(route)}
                  navigation={navigation}
                  colors={colors}
                  styles={styles}
                  iconSize={iconSize}
                  inactiveColor={inactiveColor}
                />
              </View>
            );
          })}
        </View>
      </View>
      <View pointerEvents="box-none" style={styles.ctaWrapper}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`${CTA_CONFIG.label} tab`}
          onPress={handleCtaPress}
          activeOpacity={0.85}
          style={[styles.ctaButton, isCtaFocused ? styles.ctaButtonActive : null]}
        >
          <View style={styles.ctaIcon}>
            <TabSymbolIcon name={CTA_CONFIG.iconName} color={colors.textOnPrimary} size={iconSize + 6} />
          </View>
        </TouchableOpacity>
        <Text style={styles.ctaLabel} numberOfLines={1}>
          {CTA_CONFIG.label}
        </Text>
      </View>
    </View>
  );
}

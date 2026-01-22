// FocusBlocks App Navigator
// Main navigation structure

import React, { useEffect, useRef, useState } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Animated, Easing, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';

import { useApp } from '../contexts/AppContext';
import { useTheme } from '../contexts/ThemeContext';

// Screens
import TimerScreen from '../screens/TimerScreen';
import ProjectsScreen from '../screens/ProjectsScreen';
import ProjectDetailScreen from '../screens/ProjectDetailScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import EditBlockScreen from '../screens/EditBlockScreen';
import BlockDetailScreen from '../screens/BlockDetailScreen';
import EditProfileScreen from '../screens/EditProfileScreen';

// Icons
import { TabSymbolIcon } from '../components/SymbolIcon';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const AnimatedImage = Animated.createAnimatedComponent(Image);

// Tab Navigator
function TabNavigator() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : (isDark ? colors.surface : colors.background),
          borderTopWidth: isDark ? 0 : 0.5,
          borderTopColor: isDark ? 'transparent' : colors.border,
          elevation: isDark ? 8 : 0,
          shadowColor: isDark ? colors.primary : '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: isDark ? 0.15 : 0.05,
          shadowRadius: 8,
          height: 64 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 10,
        },
        tabBarBackground: () =>
          Platform.OS === 'ios' ? (
            <BlurView
              intensity={isDark ? 90 : 80}
              tint={isDark ? 'dark' : 'light'}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                backgroundColor: isDark ? 'rgba(30, 25, 20, 0.85)' : 'transparent',
              }}
            />
          ) : null,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: isDark ? colors.textMuted : colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 4,
          letterSpacing: 0.2,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="Timer"
        component={TimerStackNavigator}
        options={{
          tabBarLabel: 'Timer',
          tabBarIcon: ({ color, size }) => (
            <TabSymbolIcon name="timer" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Tasks"
        component={ProjectsStackNavigator}
        options={{
          tabBarLabel: 'Tasks',
          tabBarIcon: ({ color, size }) => (
            <TabSymbolIcon name="tasks" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryStackNavigator}
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({ color, size }) => (
            <TabSymbolIcon name="history" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStackNavigator}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <TabSymbolIcon name="settings" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Timer Stack
function TimerStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="TimerMain"
        component={TimerScreen}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="EditBlock"
        component={EditBlockScreen}
        options={{
          headerShown: false,
          presentation: Platform.OS === 'ios' ? 'formSheet' : 'modal',
          animation: Platform.OS === 'ios' ? 'default' : 'slide_from_bottom',
          sheetGrabberVisible: true,
          sheetAllowedDetents: [0.6, 1.0],
          sheetInitialDetentIndex: 1,
          sheetLargestUndimmedDetentIndex: 0,
          sheetCornerRadius: 28,
          contentStyle: Platform.OS === 'ios' ? { backgroundColor: 'transparent' } : undefined,
        }}
      />
      <Stack.Screen name="BlockDetail" component={BlockDetailScreen} />
    </Stack.Navigator>
  );
}

// Projects Stack
function ProjectsStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="ProjectsList"
        component={ProjectsScreen}
        options={{ headerShown: true }}
      />
      <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
      <Stack.Screen
        name="EditBlock"
        component={EditBlockScreen}
        options={{
          headerShown: false,
          presentation: Platform.OS === 'ios' ? 'formSheet' : 'modal',
          animation: Platform.OS === 'ios' ? 'default' : 'slide_from_bottom',
          sheetGrabberVisible: true,
          sheetAllowedDetents: [0.6, 1.0],
          sheetInitialDetentIndex: 1,
          sheetLargestUndimmedDetentIndex: 0,
          sheetCornerRadius: 28,
          contentStyle: Platform.OS === 'ios' ? { backgroundColor: 'transparent' } : undefined,
        }}
      />
      <Stack.Screen name="BlockDetail" component={BlockDetailScreen} />
    </Stack.Navigator>
  );
}

// History Stack
function HistoryStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HistoryMain" component={HistoryScreen} />
      <Stack.Screen name="BlockDetail" component={BlockDetailScreen} />
    </Stack.Navigator>
  );
}

// Settings Stack
function SettingsStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SettingsMain" component={SettingsScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    </Stack.Navigator>
  );
}

// Main Navigator (uses theme - only rendered after loading)
function MainNavigator() {
  const { colors, isDark } = useTheme();

  const baseTheme = isDark ? DarkTheme : DefaultTheme;

  const navigationTheme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.textPrimary,
      border: colors.border,
      notification: colors.primary,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <TabNavigator />
    </NavigationContainer>
  );
}

function LoadingScreen() {
  const insets = useSafeAreaInsets();
  const pulse = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textOffset = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();

    Animated.parallel([
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 900,
        delay: 250,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(textOffset, {
        toValue: 0,
        duration: 900,
        delay: 250,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();

    return () => pulseAnimation.stop();
  }, [pulse, textOpacity, textOffset]);

  const scale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.98, 1.04],
  });

  const glowOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.45],
  });

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={styles.loadingRoot}
      contentContainerStyle={[
        styles.loadingContent,
        { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 32 },
      ]}
    >
      <LinearGradient
        colors={['#FBF7F2', '#F2E3D5']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.loadingCenter}>
        <Animated.View style={[styles.glow, { opacity: glowOpacity }]} />
        <AnimatedImage
          source={require('../../assets/splash-symbol.png')}
          contentFit="contain"
          style={[styles.logo, { transform: [{ scale }] }]}
        />
        <Animated.View
          style={[
            styles.textWrap,
            { opacity: textOpacity, transform: [{ translateY: textOffset }] },
          ]}
        >
          <Text style={styles.title}>FocusBlocks</Text>
          <Text style={styles.subtitle}>Focus, in blocks</Text>
        </Animated.View>
      </View>
    </ScrollView>
  );
}

// Root Navigator (no theme dependency during loading)
export default function AppNavigator() {
  const { isLoading } = useApp();
  const [showLoading, setShowLoading] = useState(true);
  const loadStartRef = useRef(Date.now());

  useEffect(() => {
    if (isLoading) {
      loadStartRef.current = Date.now();
      setShowLoading(true);
      return undefined;
    }

    const minDurationMs = 2000;
    const elapsed = Date.now() - loadStartRef.current;
    const remaining = Math.max(0, minDurationMs - elapsed);
    const timer = setTimeout(() => setShowLoading(false), remaining);
    return () => clearTimeout(timer);
  }, [isLoading]);

  if (isLoading || showLoading) {
    return <LoadingScreen />;
  }

  return <MainNavigator />;
}

const styles = StyleSheet.create({
  loadingRoot: {
    flex: 1,
    backgroundColor: '#FAF6F1',
  },
  loadingContent: {
    flexGrow: 1,
  },
  loadingCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },
  glow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#EBCB88',
    boxShadow: '0 30px 60px rgba(214, 165, 86, 0.35)',
  },
  logo: {
    width: 164,
    height: 164,
  },
  textWrap: {
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2F2620',
    letterSpacing: 0.4,
  },
  subtitle: {
    fontSize: 15,
    color: '#8B7768',
    letterSpacing: 0.4,
  },
});

// FocusBlocks App Navigator
// Main navigation structure

import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

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
      <Stack.Screen name="TimerMain" component={TimerScreen} />
      <Stack.Screen
        name="EditBlock"
        component={EditBlockScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
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
      <Stack.Screen name="ProjectsList" component={ProjectsScreen} />
      <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
      <Stack.Screen
        name="EditBlock"
        component={EditBlockScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
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

// Root Navigator (no theme dependency during loading)
export default function AppNavigator() {
  const { isLoading } = useApp();

  if (isLoading) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: '#FAF6F1',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <View style={{
          width: 100,
          height: 100,
          borderRadius: 24,
          backgroundColor: '#FFFFFF',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 4,
        }}>
          <View style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: '#D4714A',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Text style={{ fontSize: 28, color: '#FFF' }}>✓</Text>
          </View>
        </View>
        <Text style={{ fontSize: 32, fontWeight: '700', color: '#3D3D3D' }}>FocusBlocks</Text>
        <Text style={{ fontSize: 16, color: '#8B8B8B', marginTop: 8 }}>Your cozy space for deep work</Text>
      </View>
    );
  }

  return <MainNavigator />;
}

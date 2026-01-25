import React, { useEffect } from 'react';
import { LogBox, StatusBar } from 'react-native';
import { ThemeProvider as NavigationThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { Slot } from 'expo-router';

import { AppProvider } from '../src/contexts/AppContext';
import { ThemeProvider, useTheme } from '../src/contexts/ThemeContext';
import { WatchCommandHandler } from '../src/components/WatchCommandHandler';
import { notificationService } from '../src/services/NotificationService';

SplashScreen.preventAutoHideAsync().catch(() => {});

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

function AppShell() {
  const { colors, isDark } = useTheme();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await notificationService.initialize();
      } catch (error) {
        console.error('Error initializing notifications:', error);
      } finally {
        try {
          await SplashScreen.hideAsync();
        } catch (error) {
          console.error('Error hiding splash screen:', error);
        }
      }
    };

    const timer = setTimeout(initializeApp, 100);
    return () => clearTimeout(timer);
  }, []);

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
    <NavigationThemeProvider value={navigationTheme}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <Slot />
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <WatchCommandHandler />
          <ThemeProvider>
            <AppShell />
          </ThemeProvider>
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

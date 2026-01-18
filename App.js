// FocusBlocks - Main App Entry Point
import React, { useEffect } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';

import { AppProvider } from './src/contexts/AppContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import { notificationService } from './src/services/NotificationService';

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync().catch(() => {});

// Ignore specific warnings in development
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

function AppContent() {
  useEffect(() => {
    const initializeApp = async () => {
      // Initialize notification service
      await notificationService.initialize();

      // Hide splash screen after app is ready
      await SplashScreen.hideAsync();
    };

    // Small delay to ensure smooth transition
    const timer = setTimeout(initializeApp, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <AppNavigator />
    </>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <ThemeProvider>
            <AppContent />
          </ThemeProvider>
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

import React from 'react';
import { Tabs } from 'expo-router';

import FloatingTabBar from '../../src/components/FloatingTabBar';
import { TabSymbolIcon } from '../../src/components/SymbolIcon';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <FloatingTabBar {...props} />}
    >
      <Tabs.Screen
        name="timer"
        options={{
          title: 'Timer',
          tabBarAccessibilityLabel: 'Timer tab',
          tabBarIcon: ({ color, size }) => <TabSymbolIcon name="timer" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tasks',
          tabBarAccessibilityLabel: 'Tasks tab',
          tabBarIcon: ({ color, size }) => <TabSymbolIcon name="tasks" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarAccessibilityLabel: 'History tab',
          tabBarIcon: ({ color, size }) => <TabSymbolIcon name="history" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarAccessibilityLabel: 'Settings tab',
          tabBarIcon: ({ color, size }) => <TabSymbolIcon name="settings" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}

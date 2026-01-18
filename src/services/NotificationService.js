// FocusBlocks Notification Service
// Handles local notifications with background support

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification handling for foreground
// This ONLY affects notifications when app is in FOREGROUND
// Background/locked notifications are handled automatically by the OS
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,   // Show banner notification
    shouldShowList: true,     // Add to notification center
    shouldPlaySound: true,    // Play notification sound
    shouldSetBadge: false,    // Don't update badge
  }),
});

class NotificationService {
  constructor() {
    this.notificationListener = null;
    this.responseListener = null;
    this.isInitialized = false;
    this.hasPermission = false;
  }

  // Initialize notification service (call once at app start)
  async initialize() {
    if (this.isInitialized) return this.hasPermission;

    try {
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      this.hasPermission = finalStatus === 'granted';

      if (this.hasPermission) {
        // For Android, create high-priority notification channel that works on locked screen
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('timer-alarm', {
            name: 'Timer Alarm',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            sound: true,
            enableVibrate: true,
            lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
            bypassDnd: true,
            showBadge: true,
          });
        }

        // Cancel any leftover notifications from previous sessions
        await this.cancelAllNotifications();
      }

      this.isInitialized = true;
      return this.hasPermission;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      this.isInitialized = true;
      return false;
    }
  }

  // Request notification permissions (deprecated - use initialize instead)
  async requestPermissions() {
    return this.initialize();
  }

  // Schedule notification for timer completion (works on locked screen)
  async scheduleTimerNotification(seconds, title, body) {
    try {
      // Ensure initialized
      await this.initialize();
      if (!this.hasPermission) return null;

      // Ensure we have a valid duration (minimum 1 second)
      const rawSeconds = Number(seconds);
      const validSeconds = Number.isFinite(rawSeconds)
        ? Math.max(1, Math.floor(rawSeconds))
        : 1;

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
          vibrate: [0, 250, 250, 250],
          autoDismiss: false,
          sticky: false,
          ...(Platform.OS === 'android' ? { channelId: 'timer-alarm' } : {}),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: validSeconds,
          ...(Platform.OS === 'android' ? { channelId: 'timer-alarm' } : {}),
        },
      });

      return notificationId;
    } catch (error) {
      console.error('[NotificationService] Error scheduling notification:', error);
      return null;
    }
  }

  // Send immediate notification
  async sendNotification(title, body) {
    try {
      // Ensure initialized
      await this.initialize();
      if (!this.hasPermission) return null;

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.DEFAULT,
        },
        trigger: null, // immediate
      });

      return notificationId;
    } catch (error) {
      console.error('Error sending notification:', error);
      return null;
    }
  }

  // Cancel a specific notification
  async cancelNotification(notificationId) {
    if (notificationId) {
      try {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
      } catch (error) {
        console.error('Error canceling notification:', error);
      }
    }
  }

  // Cancel all scheduled notifications
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      // Also dismiss any presented notifications
      await Notifications.dismissAllNotificationsAsync();
    } catch (error) {
      console.error('[NotificationService] Error canceling all notifications:', error);
    }
  }

  // Set up notification listeners
  setupListeners(onNotification, onResponse) {
    // Listener for incoming notifications when app is in foreground
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      if (onNotification) {
        onNotification(notification);
      }
    });

    // Listener for when user taps on notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      if (onResponse) {
        onResponse(response);
      }
    });
  }

  // Remove listeners
  removeListeners() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
      this.notificationListener = null;
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
      this.responseListener = null;
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;

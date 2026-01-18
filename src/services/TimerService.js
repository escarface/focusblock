// FocusBlocks Timer Service
// Handles timer logic with background support

import { AppState, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

class TimerService {
  constructor() {
    this.intervalId = null;
    this.onTick = null;
    this.onComplete = null;
    this.appStateSubscription = null;
    this.lastBackgroundTime = null;
  }

  // Calculate elapsed time accounting for background time
  calculateElapsedSeconds(timerState) {
    if (!timerState.startTimestamp) return 0;

    const now = Date.now();
    const startTime = new Date(timerState.startTimestamp).getTime();
    let elapsed = Math.floor((now - startTime) / 1000);

    // Subtract total paused time
    elapsed -= timerState.totalPausedSeconds || 0;

    // If currently paused, account for current pause duration
    if (timerState.isPaused && timerState.pauseTimestamp) {
      const pauseStart = new Date(timerState.pauseTimestamp).getTime();
      const currentPauseSeconds = Math.floor((now - pauseStart) / 1000);
      elapsed -= currentPauseSeconds;
    }

    return Math.max(0, elapsed);
  }

  // Start the timer
  start(timerState, durationMinutes, onTick, onComplete) {
    const durationSeconds = durationMinutes * 60;

    // Clear any existing interval BEFORE setting callbacks
    this.stop();

    // Now set the callbacks after stop() cleared them
    this.onTick = onTick;
    this.onComplete = onComplete;

    // Call onTick immediately to update display right away
    if (this.onTick) {
      const elapsed = this.calculateElapsedSeconds(timerState);
      const remaining = durationSeconds - elapsed;
      this.onTick(elapsed, remaining);
    }

    // Set up the tick interval
    this.intervalId = setInterval(() => {
      const elapsed = this.calculateElapsedSeconds(timerState);
      const remaining = durationSeconds - elapsed;

      if (this.onTick) {
        this.onTick(elapsed, remaining);
      }

      if (remaining <= 0) {
        // Guardar callback ANTES de stop() (que limpia this.onComplete)
        const completeCallback = this.onComplete;
        this.stop();
        if (completeCallback) {
          completeCallback(durationSeconds);
        }
      }
    }, 1000);

    // Set up app state listener
    this.setupAppStateListener(timerState, durationMinutes);
  }

  // Set up listener for app going to background/foreground
  setupAppStateListener(timerState, durationMinutes) {
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
    }

    this.appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active' && this.lastBackgroundTime) {
        // App came back to foreground - recalculate time
        const elapsed = this.calculateElapsedSeconds(timerState);
        const remaining = (durationMinutes * 60) - elapsed;

        if (this.onTick) {
          this.onTick(elapsed, remaining);
        }

        if (remaining <= 0) {
          // Guardar callback ANTES de stop() (que limpia this.onComplete)
          const completeCallback = this.onComplete;
          this.stop();
          if (completeCallback) {
            completeCallback(durationMinutes * 60);
          }
        }

        this.lastBackgroundTime = null;
      } else if (nextAppState === 'background') {
        this.lastBackgroundTime = Date.now();
      }
    });
  }

  // Pause the timer (just stops the interval, state is managed externally)
  pause() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // Resume the timer
  resume(timerState, durationMinutes, onTick, onComplete) {
    this.start(timerState, durationMinutes, onTick, onComplete);
  }

  // Stop and clean up
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
    this.onTick = null;
    this.onComplete = null;
    this.lastBackgroundTime = null;
  }

  // Schedule a notification for when timer completes
  async scheduleCompletionNotification(durationMinutes, blockTitle) {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        if (newStatus !== 'granted') return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Focus Block Complete!',
          body: `${blockTitle} - Time's up! Great focus session.`,
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: durationMinutes * 60,
          ...(Platform.OS === 'android' ? { channelId: 'timer-alarm' } : {}),
        },
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  // Cancel a scheduled notification
  async cancelNotification(notificationId) {
    if (notificationId) {
      try {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
      } catch (error) {
        console.error('Error canceling notification:', error);
      }
    }
  }

  // Cancel all notifications
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }
}

export const timerService = new TimerService();
export default timerService;

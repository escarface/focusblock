import { NativeModules, Platform } from 'react-native';

const { SharedDataBridge } = NativeModules;

/**
 * Service for syncing timer state to iOS shared container
 * Enables iOS widget and Apple Watch to display live timer data
 */
export class SharedDataService {
  /**
   * Updates shared timer state in App Groups container
   * @param {Object} timerState - Current timer state from AppContext
   * @param {Object} activeBlock - The currently active block (if any)
   */
  static updateTimerState(timerState, activeBlock) {
    // Only run on iOS and if native module is available
    if (Platform.OS !== 'ios' || !SharedDataBridge) {
      return;
    }

    const sharedData = {
      blockId: timerState.blockId || null,
      blockTitle: activeBlock?.title || 'No active timer',
      duration: activeBlock?.duration || 0,
      isRunning: timerState.isRunning || false,
      isPaused: timerState.isPaused || false,
      startTimestamp: timerState.startTimestamp || null,
      pauseTimestamp: timerState.pauseTimestamp || null,
      totalPausedSeconds: timerState.totalPausedSeconds || 0,
      lastUpdated: new Date().toISOString(),
    };

    try {
      SharedDataBridge.updateSharedTimerState(sharedData);
      console.log('[SharedDataService] Updated shared timer state:', sharedData);
    } catch (error) {
      console.error('[SharedDataService] Failed to update shared state:', error);
    }
  }
}

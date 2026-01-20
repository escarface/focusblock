import { useEffect } from 'react';
import { NativeEventEmitter, NativeModules, Platform } from 'react-native';
import { useApp } from '../contexts/AppContext';

const { WatchCommandBridge } = NativeModules;

/**
 * Component that listens for Apple Watch commands and executes them
 * Must be placed inside AppProvider to access timer functions
 */
export function WatchCommandHandler() {
  const { timerState, pauseTimer, resumeTimer, skipBlock } = useApp();

  useEffect(() => {
    // Only set up on iOS and if native module is available
    if (Platform.OS !== 'ios' || !WatchCommandBridge) {
      return;
    }

    // Create event emitter for watch commands
    const eventEmitter = new NativeEventEmitter(WatchCommandBridge);

    // Listen for watch command events from native code
    const subscription = eventEmitter.addListener('watchCommand', (event) => {
      const { command } = event;

      if (!command) {
        console.log('[WatchCommandHandler] No command in event');
        return;
      }

      console.log('[WatchCommandHandler] Received command:', command);

      // Execute the appropriate action based on command
      switch (command) {
        case 'pause':
          if (timerState.isRunning && !timerState.isPaused) {
            console.log('[WatchCommandHandler] Pausing timer');
            pauseTimer();
          }
          break;

        case 'play':
          if (timerState.isPaused) {
            console.log('[WatchCommandHandler] Resuming timer');
            resumeTimer();
          }
          break;

        case 'skip':
          if (timerState.isRunning) {
            console.log('[WatchCommandHandler] Skipping block');
            skipBlock();
          }
          break;

        default:
          console.log('[WatchCommandHandler] Unknown command:', command);
      }
    });

    console.log('[WatchCommandHandler] Listening for watch commands');

    // Cleanup
    return () => {
      subscription.remove();
      console.log('[WatchCommandHandler] Stopped listening for watch commands');
    };
  }, [timerState, pauseTimer, resumeTimer, skipBlock]);

  // This component doesn't render anything
  return null;
}

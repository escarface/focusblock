// FocusBlocks Timer/Today Screen
import React, { useLayoutEffect, useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TouchableOpacity,
  Modal,
  Platform,
  ActionSheetIOS,
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useApp } from '../contexts/AppContext';
import {
  CircularProgress,
  BlockCard,
  SymbolIcon,
  EmptyState,
} from '../components';
import { formatDuration, formatTime } from '../utils';
import { timerService } from '../services/TimerService';
import { notificationService } from '../services/NotificationService';
import { listItemEntering } from '../utils/animations';
import { categories, tagColors } from '../theme';

export default function TimerScreen({ navigation }) {
  const { colors, spacing, isDark } = useTheme();
  const {
    blocks,
    timerState,
    updateTimerState,
    clearTimerState,
    updateBlock,
    addSession,
    settings,
    getPendingBlocks,
  } = useApp();
  const insets = useSafeAreaInsets();

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [displayElapsed, setDisplayElapsed] = useState(0);
  const [notificationId, setNotificationId] = useState(null);
  const [previewBlock, setPreviewBlock] = useState(null);
  const timerInitialized = useRef(false);
  const handleCompleteRef = useRef(null);
  const handleTickRef = useRef(null);
  const hapticStyles = useRef({
    start: Haptics.ImpactFeedbackStyle.Medium,
    pause: Haptics.ImpactFeedbackStyle.Light,
    reset: Haptics.ImpactFeedbackStyle.Light,
    skip: Haptics.ImpactFeedbackStyle.Medium,
  });

  const triggerHaptic = useCallback(async (key) => {
    if (process.env.EXPO_OS !== 'ios') return;
    try {
      await Haptics.impactAsync(hapticStyles.current[key]);
    } catch (error) {
      console.error('Timer haptics failed:', error);
    }
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: 'Today',
      headerLargeTitle: true,
      headerShadowVisible: false,
      headerLargeTitleShadowVisible: false,
      headerStyle: { backgroundColor: colors.background },
      headerTitleStyle: { color: colors.textPrimary },
      headerLargeTitleStyle: { color: colors.textPrimary },
      headerRight: () => (
        <Pressable
          onPress={() => navigation.navigate('settings')}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Settings"
          style={({ pressed }) => [
            styles.headerButton,
            pressed && styles.headerButtonPressed,
          ]}
        >
          <SymbolIcon
            name="settings"
            color={colors.textPrimary}
            size={17}
            weight="semibold"
          />
        </Pressable>
      ),
    });
  }, [colors, navigation]);

  // Get today's pending blocks
  const todayBlocks = getPendingBlocks();
  const activeBlock = blocks.find(b => b.id === timerState.blockId);
  const upNextBlocks = todayBlocks.filter(b => b.id !== timerState.blockId);

  // Calculate timer values
  const totalSeconds = activeBlock ? activeBlock.duration * 60 : 0;
  const remainingSeconds = Math.max(0, totalSeconds - displayElapsed);
  const progress = totalSeconds > 0 ? displayElapsed / totalSeconds : 0;

  // Timer tick handler implementation (updates ref)
  useEffect(() => {
    handleTickRef.current = (elapsed, remaining) => {
      setElapsedSeconds(elapsed);
      setDisplayElapsed(elapsed);
    };
  });

  // Stable wrapper that never changes
  const handleTick = useCallback((elapsed, remaining) => {
    handleTickRef.current?.(elapsed, remaining);
  }, []);

  // Timer complete handler implementation (updates ref)
  useEffect(() => {
    handleCompleteRef.current = async () => {
      if (!activeBlock) return;

      // 1. DETENER TIMER INMEDIATAMENTE (prevenir múltiples llamadas)
      timerService.stop();

    try {
      // 2. CRÍTICO: Marcar como completada PRIMERO
      await updateBlock(activeBlock.id, { status: 'completed' });

      // 3. Registrar sesión
      await addSession({
        blockId: activeBlock.id,
        type: 'finish',
        elapsedSeconds: totalSeconds,
      });

    } catch (error) {
      console.error('Error in handleComplete:', error);
    } finally {
      // 6. SIEMPRE limpiar estado (incluso si hay error)
      await clearTimerState();
      setElapsedSeconds(0);
      setDisplayElapsed(0);

      if (notificationId) {
        setNotificationId(null);
      }
    }

      // 8. Auto-start next (fuera del try-catch)
      if (settings.autoStartNext && upNextBlocks.length > 0) {
        setTimeout(() => startBlock(upNextBlocks[0]), 2000);
      }
    };
  }, [activeBlock, totalSeconds, upNextBlocks, settings, notificationId]);

  // Stable wrapper that never changes
  const handleComplete = useCallback(() => {
    return handleCompleteRef.current?.();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      timerService.stop();
    };
  }, []);

  // Restore timer state ONLY on initial mount
  useEffect(() => {
    if (!timerInitialized.current && timerState.isRunning && !timerState.isPaused && activeBlock) {
      // Calculate current elapsed time
      const elapsed = timerService.calculateElapsedSeconds(timerState);
      setElapsedSeconds(elapsed);
      setDisplayElapsed(elapsed);

      // Check if timer should have completed while in background
      if (elapsed >= totalSeconds) {
        // DETENER PRIMERO, luego completar
        timerService.stop();
        handleComplete();
      } else {
        // Resume timer
        timerService.start(timerState, activeBlock.duration, handleTick, handleComplete);
      }
      timerInitialized.current = true;
    }
  }, [timerState.isRunning, timerState.isPaused, activeBlock, timerState.blockId]);

  // Start a block
  const startBlock = async (block) => {
    await triggerHaptic('start');
    // Stop any existing timer
    timerService.stop();

    // Cancel ALL notifications (previous and presented)
    await notificationService.cancelAllNotifications();

    if (notificationId) {
      setNotificationId(null);
    }

    // Set timer state
    const now = new Date().toISOString();
    await updateTimerState({
      blockId: block.id,
      isRunning: true,
      isPaused: false,
      startTimestamp: now,
      pauseTimestamp: null,
      totalPausedSeconds: 0,
      elapsedSeconds: 0,
    });

    // Update block status
    await updateBlock(block.id, { status: 'active' });

    // Record session start
    await addSession({
      blockId: block.id,
      type: 'start',
      elapsedSeconds: 0,
    });

    // Schedule notification
    if (settings.notifications) {
      const id = await notificationService.scheduleTimerNotification(
        block.duration * 60,
        'Focus Block Complete!',
        `${block.title} - Time's up! Great focus session.`
      );
      setNotificationId(id);
    }

    setElapsedSeconds(0);
    setDisplayElapsed(0);

    // Start timer
    const newState = {
      blockId: block.id,
      isRunning: true,
      isPaused: false,
      startTimestamp: now,
      pauseTimestamp: null,
      totalPausedSeconds: 0,
      elapsedSeconds: 0,
    };

    timerService.start(newState, block.duration, handleTick, handleComplete);

    // Mark as initialized to prevent useEffect from interfering
    timerInitialized.current = true;
  };

  // Pause timer
  const pauseTimer = async () => {
    if (!timerState.isRunning || timerState.isPaused) return;

    await triggerHaptic('pause');
    timerService.pause();

    const now = new Date().toISOString();
    await updateTimerState({
      isPaused: true,
      pauseTimestamp: now,
    });

    // Record pause event
    await addSession({
      blockId: timerState.blockId,
      type: 'pause',
      elapsedSeconds,
    });

    // Cancel notification
    if (notificationId) {
      await notificationService.cancelNotification(notificationId);
      setNotificationId(null);
    }
  };

  // Resume timer
  const resumeTimer = async () => {
    if (!timerState.isPaused || !activeBlock) return;

    await triggerHaptic('start');
    // Calculate paused duration
    const pauseStart = new Date(timerState.pauseTimestamp).getTime();
    const now = Date.now();
    const pausedSeconds = Math.floor((now - pauseStart) / 1000);
    const newTotalPausedSeconds = (timerState.totalPausedSeconds || 0) + pausedSeconds;

    const newState = {
      ...timerState,
      isPaused: false,
      pauseTimestamp: null,
      totalPausedSeconds: newTotalPausedSeconds,
    };

    await updateTimerState(newState);

    // Record resume event
    await addSession({
      blockId: timerState.blockId,
      type: 'resume',
      elapsedSeconds,
    });

    // Reschedule notification
    if (settings.notifications) {
      const id = await notificationService.scheduleTimerNotification(
        remainingSeconds,
        'Focus Block Complete!',
        `${activeBlock.title} - Time's up! Great focus session.`
      );
      setNotificationId(id);
    }

    timerService.resume(newState, activeBlock.duration, handleTick, handleComplete);
  };

  // Reset timer
  const resetTimer = async () => {
    if (!activeBlock) return;

    await triggerHaptic('reset');
    timerService.stop();

    // Cancel notification
    if (notificationId) {
      await notificationService.cancelNotification(notificationId);
      setNotificationId(null);
    }

    // Reset block status
    await updateBlock(activeBlock.id, { status: 'pending' });

    // Clear timer state
    await clearTimerState();
    setElapsedSeconds(0);
    setDisplayElapsed(0);
  };

  // Skip to next block
  const skipBlock = async () => {
    if (!activeBlock) return;

    await triggerHaptic('skip');
    // Record skip event
    await addSession({
      blockId: activeBlock.id,
      type: 'skip',
      elapsedSeconds,
    });

    // Stop timer and reset
    timerService.stop();
    if (notificationId) {
      await notificationService.cancelNotification(notificationId);
      setNotificationId(null);
    }

    // Keep block as pending
    await updateBlock(activeBlock.id, { status: 'pending' });
    await clearTimerState();
    setElapsedSeconds(0);
    setDisplayElapsed(0);

    // Start next block if available
    if (upNextBlocks.length > 0) {
      startBlock(upNextBlocks[0]);
    }
  };

  // Navigate to edit block
  const openEditBlock = (block = null) => {
    navigation.navigate('EditBlock', { block });
  };

  // Navigate to block detail
  const openBlockDetail = (block) => {
    navigation.navigate('BlockDetail', { blockId: block.id });
  };

  const previewTagColor = previewBlock
    ? tagColors.find(t => t.id === previewBlock.color)?.color || colors.primary
    : colors.primary;
  const previewCategory = previewBlock
    ? categories.find(c => c.id === previewBlock.category)
    : null;

  const handleBlockContextMenu = useCallback(
    async (block) => {
      if (Platform.OS !== 'ios') return;

      try {
        await Haptics.selectionAsync();
      } catch (error) {
        console.error('Context menu haptics failed:', error);
      }

      const isActive = block.id === timerState.blockId;
      const isRunning = isActive && timerState.isRunning && !timerState.isPaused;
      const isPaused = isActive && timerState.isPaused;
      const primaryActionLabel = isRunning ? 'Pause' : isPaused ? 'Resume' : 'Start';

      const options = ['Preview', primaryActionLabel, 'Open Details', 'Edit', 'Cancel'];
      const cancelButtonIndex = 4;

      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
          userInterfaceStyle: isDark ? 'dark' : 'light',
        },
        (buttonIndex) => {
          if (buttonIndex === 0) {
            setPreviewBlock(block);
          } else if (buttonIndex === 1) {
            if (isRunning) {
              pauseTimer();
            } else if (isPaused) {
              resumeTimer();
            } else {
              startBlock(block);
            }
          } else if (buttonIndex === 2) {
            openBlockDetail(block);
          } else if (buttonIndex === 3) {
            openEditBlock(block);
          }
        }
      );
    },
    [isDark, navigation, openEditBlock, openBlockDetail, pauseTimer, resumeTimer, startBlock, timerState]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={todayBlocks}
        keyExtractor={(item) => item.id}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: spacing.sm,
            paddingBottom: insets.bottom + spacing.xxxl + (spacing.tabBarHeight ?? 80),
            paddingHorizontal: spacing.screenHorizontal,
          },
        ]}
        ListHeaderComponent={
          <>
            {/* Timer Section */}
            <View style={styles.timerSection}>
              <CircularProgress
                size={260}
                strokeWidth={14}
                progress={progress}
                pulse={timerState.isRunning && !timerState.isPaused && !!activeBlock}
              >
                <Text style={[styles.timerText, { color: colors.timerText }]}>
                  {formatTime(remainingSeconds)}
                </Text>
                {timerState.isRunning && !timerState.isPaused && activeBlock && (
                  <>
                    <Text
                      style={[styles.blockTitle, { color: colors.textSecondary }]}
                      numberOfLines={1}
                    >
                      {activeBlock.title}
                    </Text>
                    <View
                      style={[
                        styles.focusBadge,
                        { backgroundColor: colors.blockActive },
                      ]}
                    >
                      <View
                        style={[styles.focusDot, { backgroundColor: colors.primary }]}
                      />
                      <Text
                        style={[styles.focusText, { color: colors.primary }]}
                      >
                        FOCUS MODE
                      </Text>
                    </View>
                  </>
                )}
              </CircularProgress>

              {/* Timer Controls */}
              <View style={styles.controls}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={resetTimer}
                disabled={!activeBlock}
                accessibilityRole="button"
                accessibilityLabel="Reset timer"
                accessibilityState={{ disabled: !activeBlock }}
              >
                  <SymbolIcon
                    name="reset"
                    color={activeBlock ? colors.textSecondary : colors.textMuted}
                    size={28}
                  />
                </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.playButton,
                  { backgroundColor: colors.textPrimary },
                ]}
                onPress={() => {
                  if (!activeBlock && todayBlocks.length > 0) {
                    startBlock(todayBlocks[0]);
                  } else if (timerState.isPaused) {
                    resumeTimer();
                  } else if (timerState.isRunning) {
                    pauseTimer();
                  }
                }}
                disabled={!activeBlock && todayBlocks.length === 0}
                accessibilityRole="button"
                accessibilityLabel={
                  timerState.isRunning && !timerState.isPaused
                    ? 'Pause timer'
                    : timerState.isPaused
                    ? 'Resume timer'
                    : 'Start timer'
                }
                accessibilityState={{
                  disabled: !activeBlock && todayBlocks.length === 0,
                }}
              >
                  <SymbolIcon
                    name={
                      timerState.isRunning && !timerState.isPaused
                        ? 'pause'
                        : 'play'
                    }
                    color={colors.background}
                    size={32}
                  />
                </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlButton}
                onPress={skipBlock}
                disabled={!activeBlock}
                accessibilityRole="button"
                accessibilityLabel="Skip block"
                accessibilityState={{ disabled: !activeBlock }}
              >
                  <SymbolIcon
                    name="skip"
                    color={activeBlock ? colors.textSecondary : colors.textMuted}
                    size={28}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Drag handle indicator */}
            <View style={styles.handleContainer}>
              <View style={[styles.handle, { backgroundColor: colors.border }]} />
            </View>

            {/* Up Next Section */}
            <View style={[
              styles.upNextHeader,
              { marginBottom: Math.min(8 + todayBlocks.length * 4, 24) }
            ]}>
              <Text style={[styles.upNextTitle, { color: colors.textPrimary }]}>
                Up Next
              </Text>
              <View
                style={[
                  styles.countBadge,
                  { backgroundColor: colors.backgroundSecondary },
                ]}
              >
                <Text style={[styles.countText, { color: colors.textSecondary }]}>
                  {todayBlocks.length} blocks
                </Text>
              </View>
            </View>
          </>
        }
        ListEmptyComponent={
          <EmptyState
            title="No blocks yet"
            message="Create your first focus block to get started"
            buttonTitle="Add Block"
            onButtonPress={() => openEditBlock()}
          />
        }
        renderItem={({ item, index }) => (
          <BlockCard
            block={item}
            isActive={item.id === timerState.blockId}
            density="compact"
            entering={listItemEntering(index)}
            onPress={() => openBlockDetail(item)}
            onLongPress={() => handleBlockContextMenu(item)}
            onPlayPress={() => {
              if (item.id === timerState.blockId) {
                if (timerState.isPaused) resumeTimer();
                else if (timerState.isRunning) pauseTimer();
              } else {
                startBlock(item);
              }
            }}
          />
        )}
        showsVerticalScrollIndicator={false}
      />

      <Modal
        visible={!!previewBlock}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewBlock(null)}
      >
        <TouchableOpacity
          style={styles.previewOverlay}
          activeOpacity={1}
          onPress={() => setPreviewBlock(null)}
        >
          {Platform.OS === 'ios' ? (
            <BlurView
              intensity={isDark ? 70 : 60}
              tint={isDark ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.shadow }]} />
          )}
          <TouchableOpacity
            activeOpacity={1}
            style={[
              styles.previewCard,
              {
                backgroundColor: isDark
                  ? 'rgba(26, 26, 26, 0.9)'
                  : 'rgba(255, 255, 255, 0.92)',
              },
            ]}
          >
            <View
              style={[
                styles.previewTag,
                { backgroundColor: previewTagColor },
              ]}
            />
            <Text style={[styles.previewTitle, { color: colors.textPrimary }]}>
              {previewBlock?.title}
            </Text>
            <Text style={[styles.previewMeta, { color: colors.textSecondary }]}>
              {formatDuration(previewBlock?.duration || 0)}
              {previewCategory ? ` • ${previewCategory.label}` : ''}
            </Text>
            {!!previewBlock?.notes && (
              <Text
                style={[styles.previewNotes, { color: colors.textSecondary }]}
                numberOfLines={3}
              >
                {previewBlock.notes}
              </Text>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'visible',
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonPressed: {
    opacity: 0.6,
  },
  timerSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  timerText: {
    fontSize: 64,
    fontWeight: '300',
    letterSpacing: -2,
  },
  blockTitle: {
    fontSize: 16,
    marginTop: 4,
    maxWidth: 180,
    textAlign: 'center',
  },
  focusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderCurve: 'continuous',
    marginTop: 8,
  },
  focusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  focusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    gap: 32,
  },
  controlButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  upNextSection: {
    flex: 1,
    paddingBottom: 100,
  },
  upNextHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // marginBottom is now dynamic based on block count
  },
  upNextTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  countBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderCurve: 'continuous',
  },
  countText: {
    fontSize: 13,
    fontWeight: '500',
  },
  previewOverlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  previewCard: {
    borderRadius: 20,
    borderCurve: 'continuous',
    padding: 20,
  },
  previewTag: {
    width: 36,
    height: 6,
    borderRadius: 3,
    marginBottom: 12,
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  previewMeta: {
    fontSize: 14,
    marginBottom: 12,
  },
  previewNotes: {
    fontSize: 14,
    lineHeight: 20,
  },
});

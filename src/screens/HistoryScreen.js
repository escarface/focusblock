// FocusBlocks History/Statistics Screen
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  Layout,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useApp } from '../contexts/AppContext';
import { SymbolIcon } from '../components';
import {
  formatDuration,
  calculateDayStats,
  calculateGoalProgress,
  getWeekDays,
  formatDateString,
  getCalendarMonth,
} from '../utils';

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const SKELETON_COUNT = 3;

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

const useCountUp = (target, duration = 500) => {
  const [value, setValue] = useState(target);
  const frameRef = useRef(null);

  useEffect(() => {
    const startValue = 0;
    let startTime;

    setValue(startValue);

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min(1, (timestamp - startTime) / duration);
      const eased = easeOutCubic(progress);
      const nextValue = Math.round(startValue + (target - startValue) * eased);
      setValue(nextValue);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [target, duration]);

  return value;
};

function SkeletonBlock({ style, tint }) {
  return (
    <Animated.View
      entering={FadeIn.duration(150)}
      style={[styles.skeletonBlock, { backgroundColor: tint }, style]}
    />
  );
}

export default function HistoryScreen({ navigation }) {
  const { colors, spacing, shadows, isDark } = useTheme();
  const { blocks, sessions, settings, isLoading } = useApp();
  const insets = useSafeAreaInsets();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // 'week' o 'month'


  // Get week days for the calendar
  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate]);

  // Get month data for calendar
  const monthData = useMemo(() => {
    return getCalendarMonth(selectedDate.getFullYear(), selectedDate.getMonth());
  }, [selectedDate]);

  // Calculate stats for selected date
  const dayStats = useMemo(() => {
    return calculateDayStats(sessions, blocks, selectedDate);
  }, [sessions, blocks, selectedDate]);

  // Get completed blocks for selected date
  const completedBlocks = useMemo(() => {
    const dateStr = formatDateString(selectedDate);
    return blocks.filter(
      b => b.scheduledDate === dateStr && b.status === 'completed'
    );
  }, [blocks, selectedDate]);

  const skeletonBlocks = useMemo(
    () => Array.from({ length: SKELETON_COUNT }, (_, index) => ({
      id: `skeleton-${index}`,
      isSkeleton: true,
    })),
    []
  );

  const listData = isLoading ? skeletonBlocks : completedBlocks;

  // Calculate goal progress
  const goalProgress = calculateGoalProgress(dayStats.totalMinutes, settings.dailyGoal);
  const totalMinutesCount = useCountUp(dayStats.totalMinutes);
  const sessionCount = useCountUp(dayStats.sessionCount);
  const skeletonTint = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';

  // Navigate weeks or months
  const goToPreviousWeek = () => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setSelectedDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setSelectedDate(newDate);
  };

  const monthYear = selectedDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={listData}
        keyExtractor={(item) => item.id}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: spacing.md,
            paddingBottom: insets.bottom + spacing.xxxl,
            paddingHorizontal: spacing.screenHorizontal,
          },
        ]}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        ListHeaderComponent={
          <>
            {/* View Mode Toggle */}
            <View
              style={[
                styles.viewModeContainer,
                { backgroundColor: colors.backgroundSecondary },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.viewModeButton,
                  viewMode === 'week' && [
                    styles.viewModeButtonActive,
                    { backgroundColor: colors.primary },
                  ],
                ]}
                onPress={() => setViewMode('week')}
              >
                <Text
                  style={[
                    styles.viewModeText,
                    { color: viewMode === 'week' ? '#FFF' : colors.textSecondary },
                  ]}
                >
                  Week
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.viewModeButton,
                  viewMode === 'month' && [
                    styles.viewModeButtonActive,
                    { backgroundColor: colors.primary },
                  ],
                ]}
                onPress={() => setViewMode('month')}
              >
                <Text
                  style={[
                    styles.viewModeText,
                    { color: viewMode === 'month' ? '#FFF' : colors.textSecondary },
                  ]}
                >
                  Month
                </Text>
              </TouchableOpacity>
            </View>

            {/* Month/Week Navigation */}
            <View style={styles.monthNav}>
              <Text style={[styles.monthText, { color: colors.textPrimary }]}>
                {monthYear.toUpperCase()}
              </Text>
              <View style={styles.navButtons}>
                <TouchableOpacity onPress={goToPreviousWeek} style={styles.navButton}>
                  <SymbolIcon
                    name="chevron-left"
                    color={colors.textSecondary}
                    size={20}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={goToNextWeek} style={styles.navButton}>
                  <SymbolIcon
                    name="chevron-right"
                    color={colors.textSecondary}
                    size={20}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Calendar - Week or Month view */}
            <Animated.View
              key={viewMode}
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(150)}
              layout={Layout.springify().damping(18)}
            >
              {viewMode === 'week' ? (
                <View style={styles.weekCalendar}>
                  {weekDays.map((day, index) => (
                    <TouchableOpacity
                      key={day.dateStr}
                      style={[
                        styles.dayColumn,
                        day.isToday && [
                          styles.todayColumn,
                          { backgroundColor: colors.primary },
                        ],
                        formatDateString(selectedDate) === day.dateStr &&
                          !day.isToday && [
                            styles.selectedColumn,
                            { backgroundColor: colors.backgroundSecondary },
                          ],
                      ]}
                      onPress={() => setSelectedDate(day.date)}
                    >
                      <Text style={[styles.dayLabel, { color: colors.textMuted }]}>
                        {WEEKDAYS[index]}
                      </Text>
                      <Text
                        style={[
                          styles.dayNumber,
                          { color: day.isToday ? '#FFF' : colors.textPrimary },
                        ]}
                      >
                        {day.dayOfMonth}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={styles.monthCalendar}>
                  <View style={styles.monthHeader}>
                    {WEEKDAYS.map((day, i) => (
                      <Text
                        key={i}
                        style={[styles.monthHeaderDay, { color: colors.textMuted }]}
                      >
                        {day}
                      </Text>
                    ))}
                  </View>

                  {monthData.weeks.map((week, weekIndex) => (
                    <View key={weekIndex} style={styles.monthWeek}>
                      {week.map((day, dayIndex) => {
                        if (!day) {
                          return <View key={dayIndex} style={styles.monthDayEmpty} />;
                        }

                        const isSelected = formatDateString(selectedDate) === day.dateStr;
                        const isToday = day.isToday;

                        return (
                          <TouchableOpacity
                            key={day.dateStr}
                            style={[
                              styles.monthDay,
                              isToday && [
                                styles.monthDayToday,
                                { backgroundColor: colors.primary },
                              ],
                              isSelected &&
                                !isToday && [
                                  styles.monthDaySelected,
                                  { backgroundColor: colors.backgroundSecondary },
                                ],
                            ]}
                            onPress={() => setSelectedDate(day.date)}
                          >
                            <Text
                              style={[
                                styles.monthDayText,
                                { color: isToday ? '#FFF' : colors.textPrimary },
                              ]}
                            >
                              {day.dayOfMonth}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  ))}
                </View>
              )}
            </Animated.View>

            {/* Stats Cards */}
            <View style={styles.statsRow}>
              {isLoading ? (
                <>
                  <View
                    style={[
                      styles.statCard,
                      shadows.small,
                      { backgroundColor: colors.surface },
                    ]}
                  >
                    <SkeletonBlock style={styles.statSkeleton} tint={skeletonTint} />
                    <SkeletonBlock style={styles.statValueSkeleton} tint={skeletonTint} />
                  </View>
                  <View
                    style={[
                      styles.statCard,
                      shadows.small,
                      { backgroundColor: colors.surface },
                    ]}
                  >
                    <SkeletonBlock style={styles.statSkeleton} tint={skeletonTint} />
                    <SkeletonBlock style={styles.statValueSkeleton} tint={skeletonTint} />
                  </View>
                </>
              ) : (
                <>
                  <View
                    style={[
                      styles.statCard,
                      shadows.small,
                      { backgroundColor: colors.surface },
                    ]}
                  >
                    <View style={styles.statHeader}>
                      <View
                        style={[
                          styles.statIcon,
                          { backgroundColor: colors.primary + '20' },
                        ]}
                      >
                        <SymbolIcon name="timer" color={colors.primary} size={18} />
                      </View>
                      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                        TOTAL FOCUS
                      </Text>
                    </View>
                    <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                      {formatDuration(totalMinutesCount)}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statCard,
                      shadows.small,
                      { backgroundColor: colors.surface },
                    ]}
                  >
                    <View style={styles.statHeader}>
                      <View
                        style={[
                          styles.statIcon,
                          { backgroundColor: colors.success + '20' },
                        ]}
                      >
                        <SymbolIcon
                          name="checkCircle"
                          color={colors.success}
                          size={18}
                        />
                      </View>
                      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                        SESSIONS
                      </Text>
                    </View>
                    <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                      {sessionCount}
                    </Text>
                  </View>
                </>
              )}
            </View>

            {/* Daily Goal */}
            <View
              style={[
                styles.goalCard,
                shadows.small,
                { backgroundColor: colors.surface },
              ]}
            >
              <View style={styles.goalHeader}>
                <View>
                  <Text style={[styles.goalTitle, { color: colors.textPrimary }]}>
                    Daily Goal
                  </Text>
                  <Text style={[styles.goalSubtitle, { color: colors.textSecondary }]}>
                    Keep up the rhythm
                  </Text>
                </View>
                <Text style={[styles.goalPercentage, { color: colors.primary }]}>
                  {goalProgress}%
                </Text>
              </View>
              <View style={[styles.goalBarBg, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.goalBarFill,
                    { backgroundColor: colors.primary, width: `${goalProgress}%` },
                  ]}
                />
              </View>
            </View>

            {/* Completed Blocks */}
            <View style={styles.completedSection}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Completed Blocks
              </Text>
            </View>
          </>
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No completed blocks for this day
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          if (item.isSkeleton) {
            return (
              <View style={[styles.completedBlock, { backgroundColor: colors.surface }]}>
                <View style={styles.completedInfo}>
                  <SkeletonBlock style={styles.skeletonIcon} tint={skeletonTint} />
                  <View style={styles.completedText}>
                    <SkeletonBlock style={styles.skeletonTitle} tint={skeletonTint} />
                    <SkeletonBlock style={styles.skeletonMeta} tint={skeletonTint} />
                  </View>
                </View>
                <View style={styles.completedRight}>
                  <SkeletonBlock style={styles.skeletonMeta} tint={skeletonTint} />
                  <SkeletonBlock style={styles.skeletonBadge} tint={skeletonTint} />
                </View>
              </View>
            );
          }

          return (
            <TouchableOpacity
              style={[styles.completedBlock, { backgroundColor: colors.surface }]}
              onPress={() => navigation.navigate('BlockDetail', { blockId: item.id })}
            >
              <View style={styles.completedInfo}>
                <SymbolIcon name="briefcase" color={colors.textMuted} size={18} />
                <View style={styles.completedText}>
                  <Text
                    style={[styles.completedTitle, { color: colors.textPrimary }]}
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>
                  <Text style={[styles.completedMeta, { color: colors.textSecondary }]}>
                    {item.category}
                  </Text>
                </View>
              </View>
              <View style={styles.completedRight}>
                <Text style={[styles.completedDuration, { color: colors.primary }]}>
                  {formatDuration(item.duration)}
                </Text>
                <View style={[styles.checkMark, { backgroundColor: colors.success }]}>
                  <SymbolIcon name="check" color="#FFF" size={12} />
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 0,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  monthText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  navButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  navButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekCalendar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  dayColumn: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderCurve: 'continuous',
    minWidth: 44,
  },
  todayColumn: {
    // background applied inline
  },
  selectedColumn: {
    // background applied inline
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 6,
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: '600',
  },
  dayNumberToday: {
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderCurve: 'continuous',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  goalCard: {
    padding: 16,
    borderRadius: 16,
    borderCurve: 'continuous',
    marginBottom: 16,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  goalSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  goalPercentage: {
    fontSize: 20,
    fontWeight: '700',
  },
  goalBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  goalBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  completedSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  emptyState: {
    padding: 24,
    borderRadius: 16,
    borderCurve: 'continuous',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
  },
  completedBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderCurve: 'continuous',
  },
  completedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  completedText: {
    marginLeft: 12,
    flex: 1,
  },
  completedTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  completedMeta: {
    fontSize: 13,
  },
  completedRight: {
    alignItems: 'flex-end',
  },
  completedDuration: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  checkMark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewModeContainer: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 16,
    borderRadius: 10,
    borderCurve: 'continuous',
    padding: 4,
  },
  viewModeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderCurve: 'continuous',
    alignItems: 'center',
  },
  viewModeButtonActive: {
    // backgroundColor aplicado dinámicamente
  },
  viewModeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  monthCalendar: {
    marginBottom: 24,
  },
  monthHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  monthHeaderDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
  },
  monthWeek: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  monthDay: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderCurve: 'continuous',
    margin: 2,
  },
  monthDayEmpty: {
    flex: 1,
    aspectRatio: 1,
  },
  monthDayToday: {
    // backgroundColor aplicado dinámicamente
  },
  monthDaySelected: {
    // backgroundColor aplicado dinámicamente
  },
  monthDayText: {
    fontSize: 14,
    fontWeight: '500',
  },
  skeletonBlock: {
    borderRadius: 8,
  },
  statSkeleton: {
    height: 14,
    width: '55%',
    marginBottom: 12,
  },
  statValueSkeleton: {
    height: 26,
    width: '45%',
  },
  skeletonIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  skeletonTitle: {
    height: 14,
    width: '70%',
    marginBottom: 6,
  },
  skeletonMeta: {
    height: 12,
    width: '50%',
  },
  skeletonBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginTop: 6,
  },
});

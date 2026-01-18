// FocusBlocks Block Card Component
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTheme } from '../contexts/ThemeContext';
import { SymbolIcon } from './SymbolIcon';
import { formatDuration, formatScheduledTime } from '../utils';
import { tagColors, categories } from '../theme';
import { cardEntering, cardExiting } from '../utils/animations';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function BlockCard({
  block,
  isActive = false,
  onPress,
  onPlayPress,
  showPlayButton = true,
  style,
  index = 0,
}) {
  const { colors, spacing } = useTheme();

  const tagColor = tagColors.find(t => t.id === block.color)?.color || colors.primary;
  const category = categories.find(c => c.id === block.category);

  const getCategoryIcon = () => {
    switch (block.category) {
      case 'work':
        return 'briefcase';
      case 'admin':
        return 'mail';
      case 'personal':
        return 'restaurant';
      case 'strategy':
        return 'list';
      default:
        return 'briefcase';
    }
  };

  return (
    <AnimatedTouchable
      entering={cardEntering}
      exiting={cardExiting}
      style={[
        styles.container,
        {
          backgroundColor: isActive ? colors.blockActive : colors.blockDefault,
          borderLeftColor: tagColor,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {showPlayButton && (
        <TouchableOpacity
          style={[
            styles.playButton,
            {
              backgroundColor: isActive ? tagColor : colors.backgroundSecondary,
            },
          ]}
          onPress={onPlayPress}
          activeOpacity={0.7}
        >
          <SymbolIcon
            name={isActive ? 'pause' : getCategoryIcon()}
            color={isActive ? '#FFF' : colors.textSecondary}
            size={20}
          />
        </TouchableOpacity>
      )}

      <View style={styles.content}>
        <Text
          style={[styles.title, { color: colors.textPrimary }]}
          numberOfLines={1}
        >
          {block.title}
        </Text>
        <View style={styles.details}>
          {block.scheduledTime && (
            <Text style={[styles.time, { color: colors.textSecondary }]}>
              {formatScheduledTime(block.scheduledTime)}
            </Text>
          )}
          {block.scheduledTime && (
            <Text style={[styles.dot, { color: colors.textMuted }]}>•</Text>
          )}
          {isActive ? (
            <Text style={[styles.activeLabel, { color: tagColor }]}>
              ACTIVE NOW
            </Text>
          ) : (
            <Text style={[styles.duration, { color: colors.textSecondary }]}>
              {formatDuration(block.duration)}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.rightContent}>
        {block.status === 'completed' ? (
          <View
            style={[styles.completedBadge, { backgroundColor: colors.success }]}
          >
            <SymbolIcon name="check" color="#FFF" size={14} />
          </View>
        ) : (
          <Text style={[styles.category, { color: colors.textMuted }]}>
            {category?.label}
          </Text>
        )}
      </View>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderCurve: 'continuous',
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    fontSize: 13,
  },
  dot: {
    marginHorizontal: 6,
    fontSize: 13,
  },
  duration: {
    fontSize: 13,
  },
  activeLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  rightContent: {
    alignItems: 'flex-end',
  },
  category: {
    fontSize: 12,
  },
  completedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

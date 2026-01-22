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
  onLongPress,
  delayLongPress = 350,
  onPlayPress,
  showPlayButton = true,
  density = 'default', // default, compact
  entering,
  exiting,
  style,
  index = 0,
}) {
  const { colors, spacing } = useTheme();

  const tagColor = tagColors.find(t => t.id === block.color)?.color || colors.primary;
  const category = categories.find(c => c.id === block.category);
  const isCompact = density === 'compact';
  const contentSpacing = isCompact ? spacing.sm : spacing.md;
  const cardPadding = isCompact ? spacing.cardPaddingCompact : spacing.cardPadding;
  const playButtonSize = isCompact ? 36 : 44;
  const titleSize = isCompact ? 15 : 16;
  const metaSize = isCompact ? 12 : 13;
  const accessibilityLabel = `${block.title}. ${formatDuration(block.duration)}. ${category?.label || 'Block'}`;

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
      entering={entering ?? cardEntering}
      exiting={exiting ?? cardExiting}
      style={[
        styles.container,
        {
          backgroundColor: isActive ? colors.blockActive : colors.blockDefault,
          borderLeftColor: tagColor,
          borderColor: isActive ? tagColor : colors.border,
          borderRadius: spacing.cardRadius,
          padding: cardPadding,
          gap: contentSpacing,
          marginBottom: spacing.sm,
        },
        style,
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={delayLongPress}
      activeOpacity={0.7}
      accessibilityRole={onPress || onLongPress ? 'button' : undefined}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={onLongPress ? 'Long press for more options' : undefined}
    >
      {showPlayButton && (
        <TouchableOpacity
          style={[
            styles.playButton,
            {
              backgroundColor: isActive ? tagColor : colors.backgroundSecondary,
              width: playButtonSize,
              height: playButtonSize,
              borderRadius: isCompact
                ? spacing.buttonRadiusSmall
                : spacing.cardRadiusSmall,
            },
          ]}
          onPress={onPlayPress}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={isActive ? 'Pause block' : 'Start block'}
        >
          <SymbolIcon
            name={isActive ? 'pause' : getCategoryIcon()}
            color={isActive ? '#FFF' : colors.textSecondary}
            size={isCompact ? 18 : 20}
          />
        </TouchableOpacity>
      )}

      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            { color: colors.textPrimary, fontSize: titleSize, marginBottom: spacing.xxs },
          ]}
          numberOfLines={1}
        >
          {block.title}
        </Text>
        <View style={styles.details}>
          {block.scheduledTime && (
            <Text
              style={[styles.time, { color: colors.textSecondary, fontSize: metaSize }]}
            >
              {formatScheduledTime(block.scheduledTime)}
            </Text>
          )}
          {block.scheduledTime && (
            <Text style={[styles.dot, { color: colors.textMuted, fontSize: metaSize }]}>
              •
            </Text>
          )}
          {isActive ? (
            <Text style={[styles.activeLabel, { color: tagColor }]}>
              ACTIVE NOW
            </Text>
          ) : (
            <Text
              style={[styles.duration, { color: colors.textSecondary, fontSize: metaSize }]}
            >
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
    borderRadius: 0,
    borderCurve: 'continuous',
    borderLeftWidth: 4,
    borderWidth: 1,
  },
  playButton: {
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
    marginBottom: 0,
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

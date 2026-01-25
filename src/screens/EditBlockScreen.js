// FocusBlocks Edit/Create Block Screen
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  Layout,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useApp } from '../contexts/AppContext';
import { Button, SymbolIcon } from '../components';
import { tagColors, categories, durationPresets } from '../theme';
import { validateBlockTitle, validateDuration } from '../utils';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

function DurationOption({ value, selected, onPress, colors }) {
  const scale = useSharedValue(selected ? 1.06 : 1);

  useEffect(() => {
    scale.value = withTiming(selected ? 1.06 : 1, {
      duration: 180,
      easing: Easing.out(Easing.quad),
    });
  }, [scale, selected]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedTouchable
      layout={Layout.springify().damping(18)}
      style={[
        styles.durationOption,
        animatedStyle,
        {
          backgroundColor: selected ? colors.backgroundSecondary : 'transparent',
          borderColor: selected ? colors.border : 'transparent',
        },
      ]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Text
        style={[
          styles.durationText,
          { color: selected ? colors.primary : colors.textSecondary },
          selected && styles.durationTextActive,
        ]}
      >
        {value}
      </Text>
    </AnimatedTouchable>
  );
}

export default function EditBlockScreen({ navigation, route }) {
  const { colors, spacing, shadows, isDark } = useTheme();
  const { addBlock, updateBlock } = useApp();
  const insets = useSafeAreaInsets();

  const editBlock = route?.params?.block;
  const projectId = route?.params?.projectId;
  const isEditing = !!editBlock;

  const [title, setTitle] = useState(editBlock?.title || '');
  const [duration, setDuration] = useState(editBlock?.duration || 25);
  const [customDurationText, setCustomDurationText] = useState('');
  const [isEditingCustom, setIsEditingCustom] = useState(false);
  const [selectedColor, setSelectedColor] = useState(editBlock?.color || 'orange');
  const [selectedCategory, setSelectedCategory] = useState(editBlock?.category || 'work');
  const [notes, setNotes] = useState(editBlock?.notes || '');
  const [selectedProject, setSelectedProject] = useState(editBlock?.projectId || projectId || null);
  const [titleError, setTitleError] = useState('');
  const [durationError, setDurationError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [loading, setLoading] = useState(false);

  const triggerSelectionHaptic = useCallback(async () => {
    if (process.env.EXPO_OS !== 'ios') return;
    try {
      await Haptics.selectionAsync();
    } catch (error) {
      console.error('Selection haptics failed:', error);
    }
  }, []);

  const triggerErrorHaptic = useCallback(async () => {
    if (process.env.EXPO_OS !== 'ios') return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (error) {
      console.error('Error haptics failed:', error);
    }
  }, []);

  const triggerSuccessHaptic = useCallback(async () => {
    if (process.env.EXPO_OS !== 'ios') return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Success haptics failed:', error);
    }
  }, []);

  const handleSave = async () => {
    const nextTitleError = validateBlockTitle(title) ? '' : 'Please enter a title';
    const nextDurationError = validateDuration(duration)
      ? ''
      : 'Duration must be between 1 and 180 minutes';

    setTitleError(nextTitleError);
    setDurationError(nextDurationError);
    setSaveError('');

    if (nextTitleError || nextDurationError) {
      await triggerErrorHaptic();
      return;
    }

    setLoading(true);

    try {
      const blockData = {
        title: title.trim(),
        duration,
        color: selectedColor,
        category: selectedCategory,
        notes: notes.trim(),
        projectId: selectedProject,
      };

      if (isEditing) {
        await updateBlock(editBlock.id, blockData);
      } else {
        await addBlock(blockData);
      }

      await triggerSuccessHaptic();
      navigation.goBack();
    } catch (err) {
      setSaveError('Failed to save block. Please try again.');
      await triggerErrorHaptic();
    } finally {
      setLoading(false);
    }
  };

  const addDuration = (amount) => {
    const newDuration = Math.min(180, duration + amount);
    setDuration(newDuration);
    setCustomDurationText('');
    setIsEditingCustom(false);
    setDurationError('');
    setSaveError('');
    triggerSelectionHaptic();
  };

  const sheetBackground = Platform.OS === 'ios'
    ? isDark
      ? 'rgba(26, 26, 26, 0.85)'
      : 'rgba(255, 255, 255, 0.88)'
    : colors.background;

  useEffect(() => {
    console.log('EditBlockScreen mounted (inline footer)');
  }, []);

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        { backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.background },
      ]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View
        style={[
          styles.sheet,
          {
            borderColor: colors.border,
            backgroundColor: sheetBackground,
          },
          shadows.large,
        ]}
      >
        {Platform.OS === 'ios' && (
          <BlurView
            intensity={isDark ? 80 : 70}
            tint={isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
        )}
        <View style={styles.sheetContent}>
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              {
                paddingBottom: spacing.lg,
                paddingHorizontal: spacing.screenHorizontal,
              },
            ]}
            scrollIndicatorInsets={{ bottom: insets.bottom }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={[styles.closeButton, { backgroundColor: colors.backgroundSecondary }]}
              >
                <SymbolIcon name="close" color={colors.textSecondary} size={20} />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                {isEditing ? 'Edit Block' : 'New Block'}
              </Text>
              <TouchableOpacity
                onPress={handleSave}
                disabled={loading}
                style={[
                  styles.saveAction,
                  { backgroundColor: colors.backgroundSecondary },
                ]}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Text
                    style={[
                      styles.saveText,
                      { color: loading ? colors.textMuted : colors.primary },
                    ]}
                  >
                    {isEditing ? 'Save' : 'Create'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

              {/* Title Input */}
              <View style={styles.section}>
                <Text style={[styles.label, { color: colors.textPrimary }]}>
                  Enter your Task Title
                </Text>
                <View
                  style={[
                    styles.titleInput,
                    {
                      backgroundColor: colors.surface,
                      borderColor: titleError ? colors.error : colors.border,
                    },
                  ]}
                >
                  <TextInput
                    value={title}
                    onChangeText={(text) => {
                      setTitle(text);
                      setTitleError('');
                      setSaveError('');
                    }}
                    placeholder="Project Planning"
                    placeholderTextColor={colors.textMuted}
                    style={[styles.titleTextInput, { color: colors.textPrimary }]}
                  />
                  <SymbolIcon name="edit" color={colors.textMuted} size={20} />
                </View>
                {!!titleError && (
                  <Animated.Text
                    entering={FadeIn.duration(200)}
                    exiting={FadeOut.duration(150)}
                    selectable
                    style={[styles.fieldError, { color: colors.error }]}
                  >
                    {titleError}
                  </Animated.Text>
                )}
              </View>

              {/* Duration */}
              <View style={styles.section}>
                <View style={styles.durationHeader}>
                  <Text style={[styles.label, { color: colors.textPrimary }]}>
                    Duration
                  </Text>
                  <View
                    style={[
                      styles.minutesBadge,
                      { backgroundColor: colors.backgroundSecondary },
                    ]}
                  >
                    <Text
                      style={[styles.minutesText, { color: colors.textSecondary }]}
                    >
                      MINUTES
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.durationSelector,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      borderRadius: spacing.cardRadiusSmall,
                    },
                  ]}
                >
                  {durationPresets.map((preset) => (
                    <DurationOption
                      key={preset}
                      value={preset}
                      selected={duration === preset}
                      colors={colors}
                      onPress={() => {
                        setDuration(preset);
                        setCustomDurationText('');
                        setIsEditingCustom(false);
                        setDurationError('');
                        setSaveError('');
                        triggerSelectionHaptic();
                      }}
                    />
                  ))}
                </View>

                {/* Duration adjusters */}
                <View style={styles.durationAdjusters}>
                  <TouchableOpacity
                    style={[styles.adjusterButton, { borderColor: colors.border }]}
                    onPress={() => addDuration(5)}
                  >
                    <Text
                      style={[styles.adjusterText, { color: colors.textSecondary }]}
                    >
                      +5m
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.adjusterButton, { borderColor: colors.border }]}
                    onPress={() => addDuration(10)}
                  >
                    <Text
                      style={[styles.adjusterText, { color: colors.textSecondary }]}
                    >
                      +10m
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Custom duration input */}
                <View style={styles.customDurationContainer}>
                  <Text
                    style={[
                      styles.customDurationLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Or enter custom:
                  </Text>
                  <TextInput
                    style={[
                      styles.durationInput,
                      {
                        borderColor: durationError ? colors.error : colors.border,
                        backgroundColor: colors.surface,
                        color: colors.textPrimary,
                      },
                    ]}
                    value={isEditingCustom ? customDurationText : duration.toString()}
                    onChangeText={(text) => {
                      setIsEditingCustom(true);
                      setCustomDurationText(text);
                      setDurationError('');
                      setSaveError('');

                      if (text === '') {
                        return;
                      }

                      const num = parseInt(text, 10);
                      if (!isNaN(num) && num >= 1 && num <= 180) {
                        setDuration(num);
                      }
                    }}
                    onBlur={() => {
                      setIsEditingCustom(false);
                      const num = parseInt(customDurationText, 10);
                      if (customDurationText === '') {
                        setCustomDurationText('');
                        return;
                      }

                      if (isNaN(num) || num < 1) {
                        setCustomDurationText('');
                        setDurationError('Duration must be between 1 and 180 minutes');
                        triggerErrorHaptic();
                        return;
                      }

                      if (num > 180) {
                        setDuration(180);
                      } else {
                        setDuration(num);
                      }
                      setCustomDurationText('');
                    }}
                    onFocus={() => {
                      setIsEditingCustom(true);
                      setCustomDurationText(duration.toString());
                      setSaveError('');
                    }}
                    keyboardType="number-pad"
                    placeholder="25"
                    placeholderTextColor={colors.textMuted}
                    maxLength={3}
                  />
                  <Text
                    style={[styles.minutesSuffix, { color: colors.textSecondary }]}
                  >
                    minutes
                  </Text>
                </View>

                {!!durationError && (
                  <Animated.Text
                    entering={FadeIn.duration(200)}
                    exiting={FadeOut.duration(150)}
                    selectable
                    style={[styles.fieldError, { color: colors.error }]}
                  >
                    {durationError}
                  </Animated.Text>
                )}
              </View>

              {/* Tag Color */}
              <View style={styles.section}>
                <Text style={[styles.label, { color: colors.textPrimary }]}>
                  Tag Color
                </Text>
                <View
                  style={[
                    styles.colorSelector,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  {tagColors.map((tag) => (
                    <TouchableOpacity
                      key={tag.id}
                      style={[
                        styles.colorOption,
                        { backgroundColor: tag.color },
                        selectedColor === tag.id && styles.colorOptionSelected,
                      ]}
                      onPress={() => {
                        setSelectedColor(tag.id);
                        setSaveError('');
                        triggerSelectionHaptic();
                      }}
                    >
                      {selectedColor === tag.id && (
                        <View style={styles.colorSelectedRing} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Category */}
              <View style={styles.section}>
                <Text style={[styles.label, { color: colors.textPrimary }]}>
                  Category
                </Text>
                <View style={styles.categorySelector}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.categoryOption,
                        {
                          backgroundColor:
                            selectedCategory === cat.id
                              ? colors.primary
                              : colors.backgroundSecondary,
                        },
                      ]}
                      onPress={() => {
                        setSelectedCategory(cat.id);
                        setSaveError('');
                        triggerSelectionHaptic();
                      }}
                    >
                      <Text
                        style={[
                          styles.categoryText,
                          {
                            color:
                              selectedCategory === cat.id
                                ? '#FFF'
                                : colors.textSecondary,
                          },
                        ]}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Notes (optional) */}
              <View style={styles.section}>
                <Text style={[styles.label, { color: colors.textPrimary }]}>
                  Notes (optional)
                </Text>
                <TextInput
                  value={notes}
                  onChangeText={(text) => {
                    setNotes(text);
                    setSaveError('');
                  }}
                  placeholder="Add notes..."
                  placeholderTextColor={colors.textMuted}
                  multiline
                  numberOfLines={3}
                  style={[
                    styles.notesInput,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.textPrimary,
                    },
                  ]}
                />
              </View>

            {!!saveError && (
              <Animated.Text
                entering={FadeIn.duration(200)}
                exiting={FadeOut.duration(150)}
                selectable
                style={[styles.errorText, { color: colors.error }]}
              >
                {saveError}
              </Animated.Text>
            )}

            {/* Action Buttons */}
            <View style={[styles.bottomButtons, { marginBottom: insets.bottom }]}>
              <Button
                title={isEditing ? 'Save Changes' : 'Create Block'}
                onPress={handleSave}
                loading={loading}
                size="large"
                style={styles.saveButton}
              />
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={[styles.cancelText, { color: colors.textSecondary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sheet: {
    flex: 1,
    borderRadius: 28,
    borderCurve: 'continuous',
    borderWidth: 1,
  },
  sheetContent: {
    flex: 1,
    position: 'relative',
    overflow: 'visible',
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 16,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  scrollContent: {
    paddingHorizontal: 0,
    paddingTop: 24,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    minHeight: 44,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    left: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveAction: {
    position: 'absolute',
    right: 0,
    minWidth: 72,
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  section: {
    marginBottom: 28,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  titleInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderCurve: 'continuous',
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  titleTextInput: {
    flex: 1,
    fontSize: 16,
  },
  durationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  minutesBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderCurve: 'continuous',
  },
  minutesText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  durationSelector: {
    flexDirection: 'row',
    borderRadius: 0,
    borderCurve: 'continuous',
    borderWidth: 1,
    padding: 4,
    marginBottom: 12,
  },
  durationOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  durationText: {
    fontSize: 20,
    fontWeight: '400',
  },
  durationTextActive: {
    fontWeight: '700',
    fontSize: 24,
  },
  durationAdjusters: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  adjusterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderCurve: 'continuous',
    borderWidth: 1,
  },
  adjusterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  customDurationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  customDurationLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  durationInput: {
    borderWidth: 1,
    borderRadius: 8,
    borderCurve: 'continuous',
    paddingHorizontal: 16,
    paddingVertical: 10,
    width: 70,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
  minutesSuffix: {
    fontSize: 14,
    fontWeight: '500',
  },
  colorSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderCurve: 'continuous',
    borderWidth: 1,
  },
  colorOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: '#FFF',
  },
  colorSelectedRing: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  categorySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderCurve: 'continuous',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  notesInput: {
    borderRadius: 16,
    borderCurve: 'continuous',
    borderWidth: 1,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  fieldError: {
    fontSize: 13,
    marginTop: 8,
  },
  errorText: {
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 16,
  },
  bottomButtons: {
    marginTop: 8,
    paddingTop: 24,
  },
  saveButton: {
    marginBottom: 12,
    width: '100%',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    paddingVertical: 8,
  },
});

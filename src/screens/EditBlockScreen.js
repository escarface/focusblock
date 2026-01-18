// FocusBlocks Edit/Create Block Screen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useApp } from '../contexts/AppContext';
import { Button, SymbolIcon } from '../components';
import { tagColors, categories, durationPresets } from '../theme';
import { validateBlockTitle, validateDuration } from '../utils';

export default function EditBlockScreen({ navigation, route }) {
  const { colors, spacing } = useTheme();
  const { addBlock, updateBlock, projects } = useApp();
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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    // Validate
    if (!validateBlockTitle(title)) {
      setError('Please enter a title');
      return;
    }

    if (!validateDuration(duration)) {
      setError('Duration must be between 1 and 180 minutes');
      return;
    }

    setError('');
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

      navigation.goBack();
    } catch (err) {
      setError('Failed to save block. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addDuration = (amount) => {
    const newDuration = Math.min(180, duration + amount);
    setDuration(newDuration);
    setCustomDurationText('');
    setIsEditingCustom(false);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Handle bar */}
      <View style={styles.handleContainer}>
        <View style={[styles.handle, { backgroundColor: colors.border }]} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            {isEditing ? 'Edit Block' : 'Edit Block'}
          </Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.closeButton, { backgroundColor: colors.backgroundSecondary }]}
          >
            <SymbolIcon name="close" color={colors.textSecondary} size={20} />
          </TouchableOpacity>
        </View>

        {/* Title Input */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.textPrimary }]}>
            What are you working on?
          </Text>
          <View
            style={[
              styles.titleInput,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <TextInput
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                setError('');
              }}
              placeholder="Project Planning"
              placeholderTextColor={colors.textMuted}
              style={[styles.titleTextInput, { color: colors.textPrimary }]}
            />
            <SymbolIcon name="edit" color={colors.textMuted} size={20} />
          </View>
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
              <Text style={[styles.minutesText, { color: colors.textSecondary }]}>
                MINUTES
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.durationSelector,
              { backgroundColor: colors.surface },
            ]}
          >
            {durationPresets.map((preset) => (
              <TouchableOpacity
                key={preset}
                style={[
                  styles.durationOption,
                  duration === preset && {
                    backgroundColor: colors.backgroundSecondary,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => {
                  setDuration(preset);
                  setCustomDurationText('');
                  setIsEditingCustom(false);
                }}
              >
                <Text
                  style={[
                    styles.durationText,
                    { color: duration === preset ? colors.primary : colors.textSecondary },
                    duration === preset && styles.durationTextActive,
                  ]}
                >
                  {preset}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Duration adjusters */}
          <View style={styles.durationAdjusters}>
            <TouchableOpacity
              style={[styles.adjusterButton, { borderColor: colors.border }]}
              onPress={() => addDuration(5)}
            >
              <Text style={[styles.adjusterText, { color: colors.textSecondary }]}>
                +5m
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.adjusterButton, { borderColor: colors.border }]}
              onPress={() => addDuration(10)}
            >
              <Text style={[styles.adjusterText, { color: colors.textSecondary }]}>
                +10m
              </Text>
            </TouchableOpacity>
          </View>

          {/* Custom duration input */}
          <View style={styles.customDurationContainer}>
            <Text style={[styles.customDurationLabel, { color: colors.textSecondary }]}>
              Or enter custom:
            </Text>
            <TextInput
              style={[
                styles.durationInput,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                  color: colors.textPrimary,
                },
              ]}
              value={isEditingCustom ? customDurationText : duration.toString()}
              onChangeText={(text) => {
                setIsEditingCustom(true);
                setCustomDurationText(text);

                // Only update duration if it's a valid number
                if (text === '') {
                  // Allow empty field while typing
                  return;
                }

                const num = parseInt(text, 10);
                if (!isNaN(num) && num >= 1 && num <= 180) {
                  setDuration(num);
                  setError('');
                }
              }}
              onBlur={() => {
                setIsEditingCustom(false);

                // When focus is lost, ensure we have a valid duration
                if (customDurationText === '' || isNaN(parseInt(customDurationText, 10)) || parseInt(customDurationText, 10) < 1) {
                  setCustomDurationText('');
                  // Keep current duration, ensure it's at least 1
                  if (duration < 1) {
                    setDuration(1);
                  }
                } else {
                  const num = parseInt(customDurationText, 10);
                  if (num > 180) {
                    setDuration(180);
                  } else {
                    setDuration(num);
                  }
                  setCustomDurationText('');
                }
              }}
              onFocus={() => {
                setIsEditingCustom(true);
                setCustomDurationText(duration.toString());
              }}
              keyboardType="number-pad"
              placeholder="25"
              placeholderTextColor={colors.textMuted}
              maxLength={3}
            />
            <Text style={[styles.minutesSuffix, { color: colors.textSecondary }]}>
              minutes
            </Text>
          </View>
        </View>

        {/* Tag Color */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.textPrimary }]}>
            Tag Color
          </Text>
          <View
            style={[styles.colorSelector, { backgroundColor: colors.surface }]}
          >
            {tagColors.map((tag) => (
              <TouchableOpacity
                key={tag.id}
                style={[
                  styles.colorOption,
                  { backgroundColor: tag.color },
                  selectedColor === tag.id && styles.colorOptionSelected,
                ]}
                onPress={() => setSelectedColor(tag.id)}
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
                onPress={() => setSelectedCategory(cat.id)}
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
            onChangeText={setNotes}
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

        {/* Error message */}
        {error && (
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        )}
      </ScrollView>

      {/* Bottom buttons */}
      <View
        style={[
          styles.bottomButtons,
          {
            backgroundColor: colors.background,
            paddingBottom: insets.bottom + 16,
            borderTopColor: colors.border,
          },
        ]}
      >
        <Button
          title="Save Block"
          onPress={handleSave}
          loading={loading}
          style={styles.saveButton}
        />
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.cancelText, { color: colors.textSecondary }]}>
            Cancel
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  scrollContent: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  minutesText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  durationSelector: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 4,
    marginBottom: 12,
  },
  durationOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
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
    borderWidth: 1,
  },
  adjusterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  customDuration: {
    textAlign: 'center',
    marginTop: 12,
    fontSize: 14,
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
  },
  colorOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  notesInput: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 16,
  },
  bottomButtons: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  saveButton: {
    marginBottom: 12,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    paddingVertical: 8,
  },
});

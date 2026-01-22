// FocusBlocks Projects Screen
import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Modal,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  Layout,
  SlideInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useApp } from '../contexts/AppContext';
import { Card, Button, SymbolIcon, EmptyState, ConfirmDialog } from '../components';
import { tagColors } from '../theme';
import { listItemEntering } from '../utils/animations';

const SKELETON_COUNT = 3;

function SkeletonBlock({ style, tint }) {
  const opacity = useSharedValue(0.55);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.skeletonBlock,
        { backgroundColor: tint },
        animatedStyle,
        style,
      ]}
    />
  );
}

export default function ProjectsScreen({ navigation }) {
  const { colors, spacing, shadows, isDark } = useTheme();
  const { projects, blocks, addProject, updateProject, deleteProject, isLoading } = useApp();
  const insets = useSafeAreaInsets();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectName, setProjectName] = useState('');
  const [projectColor, setProjectColor] = useState('orange');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [projectError, setProjectError] = useState('');
  const [previewProject, setPreviewProject] = useState(null);

  const getProjectBlockCount = (projectId) => {
    return blocks.filter(b => b.projectId === projectId).length;
  };

  const getProjectCompletedCount = (projectId) => {
    return blocks.filter(b => b.projectId === projectId && b.status === 'completed').length;
  };

  const openCreateModal = useCallback((project = null) => {
    if (project) {
      setEditingProject(project);
      setProjectName(project.name);
      setProjectColor(project.color || 'orange');
    } else {
      setEditingProject(null);
      setProjectName('');
      setProjectColor('orange');
    }
    setProjectError('');
    setShowCreateModal(true);
  }, []);

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingProject(null);
    setProjectName('');
    setProjectColor('orange');
    setProjectError('');
  };

  const handleSaveProject = async () => {
    if (!projectName.trim()) {
      setProjectError('Please enter a project name');
      if (process.env.EXPO_OS === 'ios') {
        try {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } catch (error) {
          console.error('Project haptics failed:', error);
        }
      }
      return;
    }

    if (editingProject) {
      await updateProject(editingProject.id, {
        name: projectName.trim(),
        color: projectColor,
      });
    } else {
      await addProject({
        name: projectName.trim(),
        color: projectColor,
      });
    }

    closeModal();
  };

  const handleDeleteProject = async () => {
    if (deleteConfirm) {
      await deleteProject(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  const openProjectDetail = (project) => {
    navigation.navigate('ProjectDetail', { projectId: project.id });
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: 'Projects',
      headerLargeTitle: true,
      headerShadowVisible: false,
      headerLargeTitleShadowVisible: false,
      headerStyle: { backgroundColor: colors.background },
      headerTitleStyle: { color: colors.textPrimary },
      headerLargeTitleStyle: { color: colors.textPrimary },
      headerRight: () => (
        <Pressable
          onPress={() => openCreateModal()}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Add project"
          style={({ pressed }) => [
            styles.headerButton,
            pressed && styles.headerButtonPressed,
          ]}
        >
          <SymbolIcon
            name="plus"
            color={colors.primary}
            size={18}
            weight="bold"
          />
        </Pressable>
      ),
    });
  }, [colors, navigation, openCreateModal]);

  const skeletonProjects = useMemo(
    () => Array.from({ length: SKELETON_COUNT }, (_, index) => ({
      id: `skeleton-${index}`,
      isSkeleton: true,
    })),
    []
  );

  const data = isLoading ? skeletonProjects : projects;
  const skeletonTint = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';

  const triggerSelectionHaptic = useCallback(async () => {
    if (process.env.EXPO_OS !== 'ios') return;
    try {
      await Haptics.selectionAsync();
    } catch (error) {
      console.error('Project haptics failed:', error);
    }
  }, []);

  const previewTagColor = previewProject
    ? tagColors.find(t => t.id === previewProject.color)?.color || colors.primary
    : colors.primary;

  const handleProjectContextMenu = useCallback(
    async (project) => {
      if (Platform.OS !== 'ios') return;
      await triggerSelectionHaptic();

      const options = ['Preview', 'Open', 'Edit', 'Delete', 'Cancel'];
      const cancelButtonIndex = 4;
      const destructiveButtonIndex = 3;

      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
          destructiveButtonIndex,
          userInterfaceStyle: isDark ? 'dark' : 'light',
        },
        (buttonIndex) => {
          if (buttonIndex === 0) {
            setPreviewProject(project);
          } else if (buttonIndex === 1) {
            openProjectDetail(project);
          } else if (buttonIndex === 2) {
            openCreateModal(project);
          } else if (buttonIndex === 3) {
            setDeleteConfirm(project);
          }
        }
      );
    },
    [isDark, openCreateModal, openProjectDetail, triggerSelectionHaptic]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: spacing.sm,
            paddingBottom: insets.bottom + spacing.xxxl,
            paddingHorizontal: spacing.screenHorizontal,
          },
        ]}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        ListHeaderComponent={<View style={{ height: spacing.sm }} />}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              title="No projects yet"
              message="Create projects to organize your focus blocks"
              buttonTitle="Create Project"
              onButtonPress={() => openCreateModal()}
            />
          ) : null
        }
        ListFooterComponent={
          <View style={styles.allBlocksSection}>
            <Card
              onPress={() => navigation.navigate('ProjectDetail', { projectId: null })}
              variant="elevated"
              padding={false}
              style={[
                styles.allBlocksCard,
                { borderColor: colors.border, padding: spacing.cardPadding },
              ]}
            >
              <View style={styles.allBlocksInfo}>
                <Text style={[styles.allBlocksTitle, { color: colors.textPrimary }]}>
                  All Blocks
                </Text>
                <Text style={[styles.allBlocksCount, { color: colors.textSecondary }]}>
                  {blocks.length} total blocks
                </Text>
              </View>
              <SymbolIcon name="chevron-right" color={colors.textMuted} size={20} />
            </Card>
          </View>
        }
        renderItem={({ item, index }) => {
          if (item.isSkeleton) {
            return (
              <View
                style={[
                  styles.projectSkeleton,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <View style={styles.projectContent}>
                  <View style={styles.projectInfo}>
                    <SkeletonBlock style={styles.skeletonTitle} tint={skeletonTint} />
                    <SkeletonBlock style={styles.skeletonMeta} tint={skeletonTint} />
                  </View>
                  <View style={styles.projectActions}>
                    <SkeletonBlock style={styles.skeletonIcon} tint={skeletonTint} />
                    <SkeletonBlock style={styles.skeletonIcon} tint={skeletonTint} />
                    <SkeletonBlock style={styles.skeletonIcon} tint={skeletonTint} />
                  </View>
                </View>
              </View>
            );
          }

          const tagColor = tagColors.find(t => t.id === item.color)?.color || colors.primary;
          const blockCount = getProjectBlockCount(item.id);
          const completedCount = getProjectCompletedCount(item.id);

          return (
            <Animated.View entering={listItemEntering(index)} layout={Layout.springify().damping(18)}>
              <Card
                onPress={() => openProjectDetail(item)}
                onLongPress={() => handleProjectContextMenu(item)}
                style={[
                  styles.projectCard,
                  {
                    borderLeftColor: tagColor,
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                  },
                ]}
              >
                <View style={styles.projectContent}>
                  <View style={styles.projectInfo}>
                    <Text
                      style={[styles.projectName, { color: colors.textPrimary }]}
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                    <Text style={[styles.projectStats, { color: colors.textSecondary }]}>
                      {blockCount} blocks • {completedCount} completed
                    </Text>
                  </View>

                  <View style={styles.projectActions}>
                    <TouchableOpacity
                      onPress={() => openCreateModal(item)}
                      style={styles.actionButton}
                    >
                      <SymbolIcon name="edit" color={colors.textMuted} size={18} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setDeleteConfirm(item)}
                      style={styles.actionButton}
                    >
                      <SymbolIcon name="trash" color={colors.textMuted} size={18} />
                    </TouchableOpacity>
                    <SymbolIcon name="chevron-right" color={colors.textMuted} size={20} />
                  </View>
                </View>
              </Card>
            </Animated.View>
          );
        }}
      />

      <Modal
        visible={!!previewProject}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewProject(null)}
      >
        <TouchableOpacity
          style={styles.previewOverlay}
          activeOpacity={1}
          onPress={() => setPreviewProject(null)}
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
              {previewProject?.name}
            </Text>
            <Text style={[styles.previewMeta, { color: colors.textSecondary }]}>
              {previewProject
                ? `${getProjectBlockCount(previewProject.id)} blocks • ${getProjectCompletedCount(previewProject.id)} completed`
                : ''}
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Create/Edit Project Modal */}
      <Modal
        visible={showCreateModal}
        animationType="fade"
        transparent
        onRequestClose={closeModal}
      >
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={styles.modalOverlay}
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
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalWrapper}
          >
            <Animated.View
              entering={SlideInUp.duration(260)}
              layout={Layout.springify().damping(18)}
              style={[
                styles.modalSheet,
                {
                  backgroundColor: isDark
                    ? 'rgba(26, 26, 26, 0.9)'
                    : 'rgba(255, 255, 255, 0.94)',
                  borderColor: colors.border,
                },
                shadows.large,
              ]}
            >
              {Platform.OS === 'ios' && (
                <BlurView
                  intensity={isDark ? 70 : 55}
                  tint={isDark ? 'dark' : 'light'}
                  style={StyleSheet.absoluteFill}
                />
              )}
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                    {editingProject ? 'Edit Project' : 'New Project'}
                  </Text>
                  <TouchableOpacity
                    onPress={closeModal}
                    style={[
                      styles.closeButton,
                      { backgroundColor: colors.backgroundSecondary },
                    ]}
                  >
                    <SymbolIcon name="close" color={colors.textSecondary} size={20} />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalBody}>
                  <Text style={[styles.label, { color: colors.textPrimary }]}>
                    Project Name
                  </Text>
                  <TextInput
                    value={projectName}
                    onChangeText={(text) => {
                      setProjectName(text);
                      setProjectError('');
                    }}
                    placeholder="Enter project name"
                    placeholderTextColor={colors.textMuted}
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.surface,
                        borderColor: projectError ? colors.error : colors.border,
                        color: colors.textPrimary,
                      },
                    ]}
                  />
                  {!!projectError && (
                    <Text style={[styles.fieldError, { color: colors.error }]}>
                      {projectError}
                    </Text>
                  )}

                  <Text
                    style={[
                      styles.label,
                      { color: colors.textPrimary, marginTop: spacing.lg },
                    ]}
                  >
                    Color
                  </Text>
                  <View style={styles.colorSelector}>
                    {tagColors.map((tag) => (
                      <TouchableOpacity
                        key={tag.id}
                        style={[
                          styles.colorOption,
                          { backgroundColor: tag.color },
                          projectColor === tag.id && styles.colorOptionSelected,
                        ]}
                        onPress={() => {
                          setProjectColor(tag.id);
                          setProjectError('');
                          triggerSelectionHaptic();
                        }}
                      />
                    ))}
                  </View>
                </View>

                <View
                  style={[
                    styles.modalFooter,
                    { paddingBottom: insets.bottom + spacing.md },
                  ]}
                >
                  <Button
                    title={editingProject ? 'Save Changes' : 'Create Project'}
                    onPress={handleSaveProject}
                    disabled={!projectName.trim()}
                  />
                </View>
              </View>
            </Animated.View>
          </KeyboardAvoidingView>
        </Animated.View>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        visible={!!deleteConfirm}
        title="Delete Project"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? All blocks in this project will also be deleted.`}
        confirmText="Delete"
        onConfirm={handleDeleteProject}
        onCancel={() => setDeleteConfirm(null)}
        destructive
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonPressed: {
    opacity: 0.6,
  },
  projectCard: {
    borderLeftWidth: 4,
  },
  projectSkeleton: {
    borderRadius: 16,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderLeftWidth: 0,
    padding: 16,
  },
  projectContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  projectStats: {
    fontSize: 14,
  },
  projectActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    padding: 4,
  },
  allBlocksSection: {
    marginTop: 32,
  },
  allBlocksCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  allBlocksInfo: {
    flex: 1,
  },
  allBlocksTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  allBlocksCount: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderCurve: 'continuous',
    borderWidth: 1,
    overflow: 'hidden',
  },
  modalContent: {
    paddingTop: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    borderRadius: 16,
    borderCurve: 'continuous',
    borderWidth: 1,
    padding: 16,
    fontSize: 16,
  },
  colorSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  colorOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderCurve: 'continuous',
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: '#FFF',
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  fieldError: {
    fontSize: 13,
    marginTop: 6,
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
  },
  skeletonBlock: {
    borderRadius: 8,
  },
  skeletonTitle: {
    height: 18,
    width: '70%',
    marginBottom: 10,
  },
  skeletonMeta: {
    height: 12,
    width: '50%',
  },
  skeletonIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
});

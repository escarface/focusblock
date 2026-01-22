// FocusBlocks Project Detail Screen
import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActionSheetIOS,
  Modal,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useApp } from '../contexts/AppContext';
import { Header, BlockCard, EmptyState, ConfirmDialog, SymbolIcon } from '../components';
import { categories, tagColors } from '../theme';
import { formatDuration } from '../utils';

export default function ProjectDetailScreen({ navigation, route }) {
  const { colors, isDark } = useTheme();
  const { projects, blocks, deleteBlock, updateBlock, reorderBlocks } = useApp();
  const insets = useSafeAreaInsets();

  const projectId = route?.params?.projectId;
  const project = projectId ? projects.find(p => p.id === projectId) : null;

  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, completed
  const [previewBlock, setPreviewBlock] = useState(null);

  const baseBlocks = useMemo(() => {
    return projectId ? blocks.filter(b => b.projectId === projectId) : blocks;
  }, [blocks, projectId]);

  const projectBlocks = useMemo(() => {
    let filtered = baseBlocks;
    if (filter === 'pending') {
      filtered = filtered.filter(b => b.status !== 'completed');
    } else if (filter === 'completed') {
      filtered = filtered.filter(b => b.status === 'completed');
    }

    return [...filtered].sort((a, b) => a.order - b.order);
  }, [baseBlocks, filter]);

  const pendingCount = useMemo(() => {
    return baseBlocks.filter(b => b.status !== 'completed').length;
  }, [baseBlocks]);

  const completedCount = useMemo(() => {
    return baseBlocks.filter(b => b.status === 'completed').length;
  }, [baseBlocks]);

  const handleDeleteBlock = async () => {
    if (deleteConfirm) {
      await deleteBlock(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  const handleToggleComplete = async (block) => {
    if (block.status === 'completed') {
      await updateBlock(block.id, { status: 'pending' });
    } else {
      await updateBlock(block.id, { status: 'completed' });
    }
  };

  const moveBlockUp = async (block, index) => {
    if (index === 0) return;
    const newOrder = [...projectBlocks];
    const temp = newOrder[index - 1];
    newOrder[index - 1] = newOrder[index];
    newOrder[index] = temp;
    await reorderBlocks(newOrder.map(b => b.id));
  };

  const moveBlockDown = async (block, index) => {
    if (index === projectBlocks.length - 1) return;
    const newOrder = [...projectBlocks];
    const temp = newOrder[index + 1];
    newOrder[index + 1] = newOrder[index];
    newOrder[index] = temp;
    await reorderBlocks(newOrder.map(b => b.id));
  };

  const openEditBlock = (block = null) => {
    navigation.navigate('EditBlock', { block, projectId });
  };

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

      const toggleLabel = block.status === 'completed' ? 'Mark Pending' : 'Mark Complete';
      const options = ['Preview', 'Open Details', 'Edit', toggleLabel, 'Delete', 'Cancel'];
      const cancelButtonIndex = 5;
      const destructiveButtonIndex = 4;

      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
          destructiveButtonIndex,
          userInterfaceStyle: isDark ? 'dark' : 'light',
        },
        (buttonIndex) => {
          if (buttonIndex === 0) {
            setPreviewBlock(block);
          } else if (buttonIndex === 1) {
            openBlockDetail(block);
          } else if (buttonIndex === 2) {
            openEditBlock(block);
          } else if (buttonIndex === 3) {
            handleToggleComplete(block);
          } else if (buttonIndex === 4) {
            setDeleteConfirm(block);
          }
        }
      );
    },
    [handleToggleComplete, isDark, openBlockDetail, openEditBlock]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={project?.name || 'All Blocks'}
        leftAction={() => navigation.goBack()}
        rightAction={() => openEditBlock()}
        rightIcon="plus"
      />

      <FlatList
        data={projectBlocks}
        keyExtractor={(item) => item.id}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        initialNumToRender={12}
        maxToRenderPerBatch={12}
        windowSize={7}
        removeClippedSubviews
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListHeaderComponent={
          <>
            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
                <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                  {pendingCount}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Pending
                </Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
                <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                  {completedCount}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Completed
                </Text>
              </View>
            </View>

            {/* Filter tabs */}
            <View style={[styles.filterTabs, { backgroundColor: colors.backgroundSecondary }]}>
              {[
                { id: 'all', label: 'All' },
                { id: 'pending', label: 'Pending' },
                { id: 'completed', label: 'Completed' },
              ].map((tab) => (
                <TouchableOpacity
                  key={tab.id}
                  style={[
                    styles.filterTab,
                    filter === tab.id && { backgroundColor: colors.surface },
                  ]}
                  onPress={() => setFilter(tab.id)}
                >
                  <Text
                    style={[
                      styles.filterTabText,
                      { color: filter === tab.id ? colors.textPrimary : colors.textSecondary },
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        }
        ListEmptyComponent={
          <EmptyState
            title="No blocks yet"
            message={filter !== 'all' ? 'No blocks match this filter' : 'Create your first block to get started'}
            buttonTitle={filter === 'all' ? 'Add Block' : undefined}
            onButtonPress={filter === 'all' ? () => openEditBlock() : undefined}
          />
        }
        renderItem={({ item, index }) => (
          <View style={styles.blockItem}>
            <BlockCard
              block={item}
              onPress={() => openBlockDetail(item)}
              onLongPress={() => handleBlockContextMenu(item)}
              showPlayButton={false}
              style={styles.blockCard}
            />
            <View style={styles.blockActions}>
              <TouchableOpacity
                style={[styles.reorderButton, { backgroundColor: colors.backgroundSecondary }]}
                onPress={() => moveBlockUp(item, index)}
                disabled={index === 0}
              >
                <SymbolIcon
                  name="up"
                  color={index === 0 ? colors.textMuted : colors.textSecondary}
                  size={16}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.reorderButton, { backgroundColor: colors.backgroundSecondary }]}
                onPress={() => moveBlockDown(item, index)}
                disabled={index === projectBlocks.length - 1}
              >
                <SymbolIcon
                  name="down"
                  color={index === projectBlocks.length - 1 ? colors.textMuted : colors.textSecondary}
                  size={16}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.success }]}
                onPress={() => handleToggleComplete(item)}
              >
                <SymbolIcon
                  name={item.status === 'completed' ? 'reset' : 'check'}
                  color="#FFF"
                  size={16}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.backgroundSecondary }]}
                onPress={() => openEditBlock(item)}
              >
                <SymbolIcon name="edit" color={colors.textSecondary} size={16} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.error }]}
                onPress={() => setDeleteConfirm(item)}
              >
                <SymbolIcon name="trash" color="#FFF" size={16} />
              </TouchableOpacity>
            </View>
          </View>
        )}
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
            <View style={[styles.previewTag, { backgroundColor: previewTagColor }]} />
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

      {/* Delete Confirmation */}
      <ConfirmDialog
        visible={!!deleteConfirm}
        title="Delete Block"
        message={`Are you sure you want to delete "${deleteConfirm?.title}"?`}
        confirmText="Delete"
        onConfirm={handleDeleteBlock}
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
    paddingHorizontal: 20,
    paddingBottom: 0,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
  },
  filterTabs: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 12,
    marginBottom: 20,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  blocksList: {
    gap: 8,
  },
  blockItem: {
    marginBottom: 8,
  },
  blockCard: {
    marginBottom: 0,
  },
  blockActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    paddingHorizontal: 4,
  },
  reorderButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
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

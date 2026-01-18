// FocusBlocks Project Detail Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useApp } from '../contexts/AppContext';
import { Header, BlockCard, EmptyState, ConfirmDialog, SymbolIcon } from '../components';

export default function ProjectDetailScreen({ navigation, route }) {
  const { colors } = useTheme();
  const { projects, blocks, deleteBlock, updateBlock, reorderBlocks } = useApp();
  const insets = useSafeAreaInsets();

  const projectId = route?.params?.projectId;
  const project = projectId ? projects.find(p => p.id === projectId) : null;

  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, completed

  // Get blocks for this project (or all blocks if no project)
  let projectBlocks = projectId
    ? blocks.filter(b => b.projectId === projectId)
    : blocks;

  // Apply filter
  if (filter === 'pending') {
    projectBlocks = projectBlocks.filter(b => b.status !== 'completed');
  } else if (filter === 'completed') {
    projectBlocks = projectBlocks.filter(b => b.status === 'completed');
  }

  // Sort by order
  projectBlocks = projectBlocks.sort((a, b) => a.order - b.order);

  const pendingCount = (projectId ? blocks.filter(b => b.projectId === projectId) : blocks)
    .filter(b => b.status !== 'completed').length;
  const completedCount = (projectId ? blocks.filter(b => b.projectId === projectId) : blocks)
    .filter(b => b.status === 'completed').length;

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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={project?.name || 'All Blocks'}
        leftAction={() => navigation.goBack()}
        rightAction={() => openEditBlock()}
        rightIcon="plus"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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

        {/* Blocks list */}
        {projectBlocks.length === 0 ? (
          <EmptyState
            title="No blocks yet"
            message={filter !== 'all' ? 'No blocks match this filter' : 'Create your first block to get started'}
            buttonTitle={filter === 'all' ? 'Add Block' : undefined}
            onButtonPress={filter === 'all' ? () => openEditBlock() : undefined}
          />
        ) : (
          <View style={styles.blocksList}>
            {projectBlocks.map((block, index) => (
              <View key={block.id} style={styles.blockItem}>
                <BlockCard
                  block={block}
                  onPress={() => openBlockDetail(block)}
                  showPlayButton={false}
                  style={styles.blockCard}
                />
                <View style={styles.blockActions}>
                  <TouchableOpacity
                    style={[styles.reorderButton, { backgroundColor: colors.backgroundSecondary }]}
                    onPress={() => moveBlockUp(block, index)}
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
                    onPress={() => moveBlockDown(block, index)}
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
                    onPress={() => handleToggleComplete(block)}
                  >
                    <SymbolIcon
                      name={block.status === 'completed' ? 'reset' : 'check'}
                      color="#FFF"
                      size={16}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: colors.backgroundSecondary }]}
                    onPress={() => openEditBlock(block)}
                  >
                    <SymbolIcon name="edit" color={colors.textSecondary} size={16} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: colors.error }]}
                    onPress={() => setDeleteConfirm(block)}
                  >
                    <SymbolIcon name="trash" color="#FFF" size={16} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

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
    paddingBottom: 100,
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
    marginBottom: 8,
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
});

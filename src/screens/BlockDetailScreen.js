// FocusBlocks Block Detail Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useApp } from '../contexts/AppContext';
import { Header, Button, SymbolIcon, ConfirmDialog } from '../components';
import { formatDuration, formatTime } from '../utils';
import { tagColors, categories } from '../theme';

export default function BlockDetailScreen({ navigation, route }) {
  const { colors } = useTheme();
  const { blocks, sessions, projects, updateBlock, deleteBlock } = useApp();

  const blockId = route?.params?.blockId;
  const allowEdit = route?.params?.allowEdit !== false;
  const block = blocks.find(b => b.id === blockId);
  const project = block?.projectId ? projects.find(p => p.id === block.projectId) : null;

  const [deleteConfirm, setDeleteConfirm] = useState(false);

  if (!block) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Block Not Found" leftAction={() => navigation.goBack()} />
        <View style={styles.centerContent}>
          <Text style={[styles.notFoundText, { color: colors.textSecondary }]}>
            This block no longer exists.
          </Text>
        </View>
      </View>
    );
  }

  const tagColor = tagColors.find(t => t.id === block.color)?.color || colors.primary;
  const category = categories.find(c => c.id === block.category);

  // Get sessions for this block
  const blockSessions = sessions
    .filter(s => s.blockId === blockId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const handleToggleComplete = async () => {
    if (block.status === 'completed') {
      await updateBlock(block.id, { status: 'pending' });
    } else {
      await updateBlock(block.id, { status: 'completed' });
    }
  };

  const handleDelete = async () => {
    await deleteBlock(block.id);
    navigation.goBack();
  };

  const openEditBlock = () => {
    if (!allowEdit) return;
    navigation.navigate('EditBlock', { block });
  };

  const formatSessionTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatSessionDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getSessionTypeLabel = (type) => {
    switch (type) {
      case 'start': return 'Started';
      case 'pause': return 'Paused';
      case 'resume': return 'Resumed';
      case 'finish': return 'Completed';
      case 'skip': return 'Skipped';
      default: return type;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Block Details"
        leftAction={() => navigation.goBack()}
        rightAction={allowEdit ? openEditBlock : undefined}
        rightIcon={allowEdit ? 'edit' : undefined}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Block Info Card */}
        <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
          <View style={[styles.colorBar, { backgroundColor: tagColor }]} />
          <View style={styles.infoContent}>
            <Text style={[styles.blockTitle, { color: colors.textPrimary }]}>
              {block.title}
            </Text>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <SymbolIcon name="timer" color={colors.textSecondary} size={18} />
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  {formatDuration(block.duration)}
                </Text>
              </View>

              <View
                style={[styles.categoryBadge, { backgroundColor: colors.backgroundSecondary }]}
              >
                <Text style={[styles.categoryText, { color: colors.textSecondary }]}>
                  {category?.label || 'Work'}
                </Text>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      block.status === 'completed' ? colors.success : colors.primary,
                  },
                ]}
              >
                <Text style={styles.statusText}>
                  {block.status === 'completed' ? 'Completed' : 'Pending'}
                </Text>
              </View>
            </View>

            {project && (
              <View style={styles.projectRow}>
                <SymbolIcon name="briefcase" color={colors.textMuted} size={16} />
                <Text style={[styles.projectName, { color: colors.textMuted }]}>
                  {project.name}
                </Text>
              </View>
            )}

            {block.notes && (
              <View style={styles.notesSection}>
                <Text style={[styles.notesLabel, { color: colors.textSecondary }]}>
                  Notes
                </Text>
                <Text style={[styles.notesText, { color: colors.textPrimary }]}>
                  {block.notes}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <Button
            title={block.status === 'completed' ? 'Reopen Block' : 'Mark Complete'}
            onPress={handleToggleComplete}
            variant={block.status === 'completed' ? 'outline' : 'primary'}
            style={styles.actionButton}
          />
          <Button
            title="Delete"
            onPress={() => setDeleteConfirm(true)}
            variant="secondary"
            style={[styles.actionButton, { backgroundColor: colors.error + '20' }]}
            textStyle={{ color: colors.error }}
          />
        </View>

        {/* Session History */}
        {blockSessions.length > 0 && (
          <View style={styles.sessionsSection}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Session History
            </Text>

            {blockSessions.map((session, index) => (
              <View
                key={session.id}
                style={[styles.sessionItem, { borderLeftColor: colors.border }]}
              >
                <View style={styles.sessionInfo}>
                  <Text style={[styles.sessionType, { color: colors.textPrimary }]}>
                    {getSessionTypeLabel(session.type)}
                  </Text>
                  <Text style={[styles.sessionTime, { color: colors.textSecondary }]}>
                    {formatSessionDate(session.timestamp)} at {formatSessionTime(session.timestamp)}
                  </Text>
                </View>
                {session.elapsedSeconds > 0 && (
                  <Text style={[styles.sessionDuration, { color: colors.textMuted }]}>
                    {formatTime(session.elapsedSeconds)}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Delete Confirmation */}
      <ConfirmDialog
        visible={deleteConfirm}
        title="Delete Block"
        message={`Are you sure you want to delete "${block.title}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(false)}
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
    paddingBottom: 40,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    fontSize: 16,
  },
  infoCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  colorBar: {
    height: 4,
  },
  infoContent: {
    padding: 20,
  },
  blockTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 15,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFF',
  },
  projectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  projectName: {
    fontSize: 14,
  },
  notesSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  notesLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 15,
    lineHeight: 22,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
  },
  sessionsSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 16,
    paddingVertical: 12,
    borderLeftWidth: 2,
    marginBottom: 8,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionType: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  sessionTime: {
    fontSize: 13,
  },
  sessionDuration: {
    fontSize: 14,
    fontWeight: '500',
  },
});

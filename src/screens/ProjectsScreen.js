// FocusBlocks Projects Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useApp } from '../contexts/AppContext';
import { Card, Button, SymbolIcon, EmptyState, ConfirmDialog } from '../components';
import { tagColors } from '../theme';

export default function ProjectsScreen({ navigation }) {
  const { colors } = useTheme();
  const { projects, blocks, addProject, updateProject, deleteProject } = useApp();
  const insets = useSafeAreaInsets();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectName, setProjectName] = useState('');
  const [projectColor, setProjectColor] = useState('orange');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const getProjectBlockCount = (projectId) => {
    return blocks.filter(b => b.projectId === projectId).length;
  };

  const getProjectCompletedCount = (projectId) => {
    return blocks.filter(b => b.projectId === projectId && b.status === 'completed').length;
  };

  const openCreateModal = (project = null) => {
    if (project) {
      setEditingProject(project);
      setProjectName(project.name);
      setProjectColor(project.color || 'orange');
    } else {
      setEditingProject(null);
      setProjectName('');
      setProjectColor('orange');
    }
    setShowCreateModal(true);
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingProject(null);
    setProjectName('');
    setProjectColor('orange');
  };

  const handleSaveProject = async () => {
    if (!projectName.trim()) return;

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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Projects
          </Text>
          <TouchableOpacity
            onPress={() => openCreateModal()}
            style={[styles.addButton, { backgroundColor: colors.primary }]}
          >
            <SymbolIcon name="plus" color="#FFF" size={20} />
          </TouchableOpacity>
        </View>

        {projects.length === 0 ? (
          <EmptyState
            title="No projects yet"
            message="Create projects to organize your focus blocks"
            buttonTitle="Create Project"
            onButtonPress={() => openCreateModal()}
          />
        ) : (
          <View style={styles.projectsList}>
            {projects.map((project) => {
              const tagColor = tagColors.find(t => t.id === project.color)?.color || colors.primary;
              const blockCount = getProjectBlockCount(project.id);
              const completedCount = getProjectCompletedCount(project.id);

              return (
                <Card
                  key={project.id}
                  onPress={() => openProjectDetail(project)}
                  style={[styles.projectCard, { borderLeftColor: tagColor }]}
                >
                  <View style={styles.projectContent}>
                    <View style={styles.projectInfo}>
                      <Text
                        style={[styles.projectName, { color: colors.textPrimary }]}
                        numberOfLines={1}
                      >
                        {project.name}
                      </Text>
                      <Text style={[styles.projectStats, { color: colors.textSecondary }]}>
                        {blockCount} blocks • {completedCount} completed
                      </Text>
                    </View>

                    <View style={styles.projectActions}>
                      <TouchableOpacity
                        onPress={() => openCreateModal(project)}
                        style={styles.actionButton}
                      >
                        <SymbolIcon name="edit" color={colors.textMuted} size={18} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setDeleteConfirm(project)}
                        style={styles.actionButton}
                      >
                        <SymbolIcon name="trash" color={colors.textMuted} size={18} />
                      </TouchableOpacity>
                      <SymbolIcon name="chevron-right" color={colors.textMuted} size={20} />
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>
        )}

        {/* All Blocks Section */}
        <View style={styles.allBlocksSection}>
          <TouchableOpacity
            style={[styles.allBlocksCard, { backgroundColor: colors.surface }]}
            onPress={() => navigation.navigate('ProjectDetail', { projectId: null })}
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
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Create/Edit Project Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              {editingProject ? 'Edit Project' : 'New Project'}
            </Text>
            <TouchableOpacity
              onPress={closeModal}
              style={[styles.closeButton, { backgroundColor: colors.backgroundSecondary }]}
            >
              <SymbolIcon name="close" color={colors.textSecondary} size={20} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Text style={[styles.label, { color: colors.textPrimary }]}>
              Project Name
            </Text>
            <TextInput
              value={projectName}
              onChangeText={setProjectName}
              placeholder="Enter project name"
              placeholderTextColor={colors.textMuted}
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                },
              ]}
            />

            <Text style={[styles.label, { color: colors.textPrimary, marginTop: 24 }]}>
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
                  onPress={() => setProjectColor(tag.id)}
                />
              ))}
            </View>
          </View>

          <View style={[styles.modalFooter, { paddingBottom: insets.bottom + 16 }]}>
            <Button
              title={editingProject ? 'Save Changes' : 'Create Project'}
              onPress={handleSaveProject}
              disabled={!projectName.trim()}
            />
          </View>
        </View>
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
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  projectsList: {
    gap: 12,
  },
  projectCard: {
    borderLeftWidth: 4,
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
    borderRadius: 16,
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
  modalContainer: {
    flex: 1,
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  modalTitle: {
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
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    borderRadius: 16,
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
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
});

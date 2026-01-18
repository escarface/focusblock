// FocusBlocks Storage Service
// AsyncStorage-based persistence layer

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  USER: '@focusblocks_user',
  PROJECTS: '@focusblocks_projects',
  BLOCKS: '@focusblocks_blocks',
  SESSIONS: '@focusblocks_sessions',
  SETTINGS: '@focusblocks_settings',
  TIMER_STATE: '@focusblocks_timer_state',
};

const normalizeBoolean = (value, fallback = false) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
  }
  return fallback;
};

const normalizeNumber = (value, fallback) => {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

// Generic storage helpers
const getItem = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error(`Error reading ${key}:`, error);
    return null;
  }
};

const setItem = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing ${key}:`, error);
    return false;
  }
};

const removeItem = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing ${key}:`, error);
    return false;
  }
};

// User storage
export const getUser = () => getItem(STORAGE_KEYS.USER);
export const setUser = (user) => setItem(STORAGE_KEYS.USER, user);
export const removeUser = () => removeItem(STORAGE_KEYS.USER);

// Projects storage
export const getProjects = async () => {
  const projects = await getItem(STORAGE_KEYS.PROJECTS);
  return projects || [];
};

export const setProjects = (projects) => setItem(STORAGE_KEYS.PROJECTS, projects);

export const addProject = async (project) => {
  const projects = await getProjects();
  projects.push(project);
  await setProjects(projects);
  return project;
};

export const updateProject = async (projectId, updates) => {
  const projects = await getProjects();
  const index = projects.findIndex(p => p.id === projectId);
  if (index !== -1) {
    projects[index] = { ...projects[index], ...updates, updatedAt: new Date().toISOString() };
    await setProjects(projects);
    return projects[index];
  }
  return null;
};

export const deleteProject = async (projectId) => {
  const projects = await getProjects();
  const filtered = projects.filter(p => p.id !== projectId);
  await setProjects(filtered);
  // Also delete blocks associated with this project
  const blocks = await getBlocks();
  const filteredBlocks = blocks.filter(b => b.projectId !== projectId);
  await setBlocks(filteredBlocks);
  return true;
};

// Blocks storage
export const getBlocks = async () => {
  const blocks = await getItem(STORAGE_KEYS.BLOCKS);
  return blocks || [];
};

export const setBlocks = (blocks) => setItem(STORAGE_KEYS.BLOCKS, blocks);

export const addBlock = async (block) => {
  const blocks = await getBlocks();
  blocks.push(block);
  await setBlocks(blocks);
  return block;
};

export const updateBlock = async (blockId, updates) => {
  const blocks = await getBlocks();
  const index = blocks.findIndex(b => b.id === blockId);
  if (index !== -1) {
    blocks[index] = { ...blocks[index], ...updates, updatedAt: new Date().toISOString() };
    await setBlocks(blocks);
    return blocks[index];
  }
  return null;
};

export const deleteBlock = async (blockId) => {
  const blocks = await getBlocks();
  const filtered = blocks.filter(b => b.id !== blockId);
  await setBlocks(filtered);
  return true;
};

export const getBlocksForDate = async (date) => {
  const blocks = await getBlocks();
  const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
  return blocks.filter(b => b.scheduledDate === dateStr).sort((a, b) => a.order - b.order);
};

export const getBlocksByProject = async (projectId) => {
  const blocks = await getBlocks();
  return blocks.filter(b => b.projectId === projectId);
};

export const reorderBlocks = async (orderedBlockIds) => {
  const blocks = await getBlocks();
  orderedBlockIds.forEach((id, index) => {
    const block = blocks.find(b => b.id === id);
    if (block) {
      block.order = index;
    }
  });
  await setBlocks(blocks);
  return blocks;
};

// Sessions storage
export const getSessions = async () => {
  const sessions = await getItem(STORAGE_KEYS.SESSIONS);
  return sessions || [];
};

export const setSessions = (sessions) => setItem(STORAGE_KEYS.SESSIONS, sessions);

export const addSession = async (session) => {
  const sessions = await getSessions();
  sessions.push(session);
  await setSessions(sessions);
  return session;
};

export const getSessionsForBlock = async (blockId) => {
  const sessions = await getSessions();
  return sessions.filter(s => s.blockId === blockId);
};

export const getSessionsForDate = async (date) => {
  const sessions = await getSessions();
  const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
  return sessions.filter(s => s.timestamp.startsWith(dateStr));
};

export const getSessionsForDateRange = async (startDate, endDate) => {
  const sessions = await getSessions();
  return sessions.filter(s => {
    const sessionDate = s.timestamp.split('T')[0];
    return sessionDate >= startDate && sessionDate <= endDate;
  });
};

// Settings storage
export const getSettings = async () => {
  const settings = await getItem(STORAGE_KEYS.SETTINGS);
  const fallback = {
    notifications: true,
    darkMode: false,
    dailyGoal: 360,
    autoStartNext: false,
  };

  if (!settings || typeof settings !== 'object') {
    return fallback;
  }

  return {
    ...fallback,
    ...settings,
    notifications: normalizeBoolean(settings.notifications, fallback.notifications),
    darkMode: normalizeBoolean(settings.darkMode, fallback.darkMode),
    autoStartNext: normalizeBoolean(settings.autoStartNext, fallback.autoStartNext),
    dailyGoal: normalizeNumber(settings.dailyGoal, fallback.dailyGoal),
  };
};

export const setSettings = (settings) => setItem(STORAGE_KEYS.SETTINGS, settings);

export const updateSettings = async (updates) => {
  const settings = await getSettings();
  const newSettings = {
    ...settings,
    ...updates,
    notifications: normalizeBoolean(
      updates.notifications ?? settings.notifications,
      settings.notifications
    ),
    darkMode: normalizeBoolean(
      updates.darkMode ?? settings.darkMode,
      settings.darkMode
    ),
    autoStartNext: normalizeBoolean(
      updates.autoStartNext ?? settings.autoStartNext,
      settings.autoStartNext
    ),
    dailyGoal: normalizeNumber(
      updates.dailyGoal ?? settings.dailyGoal,
      settings.dailyGoal
    ),
  };
  await setSettings(newSettings);
  return newSettings;
};

// Timer state storage (for persistence across app restarts)
export const getTimerState = async () => {
  const state = await getItem(STORAGE_KEYS.TIMER_STATE);
  if (!state || typeof state !== 'object') return null;

  return {
    ...state,
    isRunning: normalizeBoolean(state.isRunning, false),
    isPaused: normalizeBoolean(state.isPaused, false),
    totalPausedSeconds: normalizeNumber(state.totalPausedSeconds, 0),
    elapsedSeconds: normalizeNumber(state.elapsedSeconds, 0),
  };
};

export const setTimerState = (state) => {
  if (!state || typeof state !== 'object') {
    return setItem(STORAGE_KEYS.TIMER_STATE, state);
  }

  const normalized = {
    ...state,
    isRunning: normalizeBoolean(state.isRunning, false),
    isPaused: normalizeBoolean(state.isPaused, false),
    totalPausedSeconds: normalizeNumber(state.totalPausedSeconds, 0),
    elapsedSeconds: normalizeNumber(state.elapsedSeconds, 0),
  };

  return setItem(STORAGE_KEYS.TIMER_STATE, normalized);
};
export const clearTimerState = () => removeItem(STORAGE_KEYS.TIMER_STATE);

// Clear all data (for testing/logout)
export const clearAllData = async () => {
  try {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
};

export default {
  getUser,
  setUser,
  removeUser,
  getProjects,
  setProjects,
  addProject,
  updateProject,
  deleteProject,
  getBlocks,
  setBlocks,
  addBlock,
  updateBlock,
  deleteBlock,
  getBlocksForDate,
  getBlocksByProject,
  reorderBlocks,
  getSessions,
  setSessions,
  addSession,
  getSessionsForBlock,
  getSessionsForDate,
  getSessionsForDateRange,
  getSettings,
  setSettings,
  updateSettings,
  getTimerState,
  setTimerState,
  clearTimerState,
  clearAllData,
};

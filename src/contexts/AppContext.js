// FocusBlocks App Context
// Global state management for the app

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import * as storage from '../storage';
import { createBlock, createProject, createSession, createUser } from '../models';
import { timerService } from '../services/TimerService';
import { SharedDataService } from '../services/SharedDataService';

// Safe boolean conversion that handles string "true"/"false"
const toBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  return false;
};

// Initial state
const initialState = {
  isLoading: true,
  isAuthenticated: false,
  user: null,
  projects: [],
  blocks: [],
  sessions: [],
  settings: {
    notifications: true,
    darkMode: false,
    dailyGoal: 360,
    autoStartNext: false,
  },
  timerState: {
    blockId: null,
    isRunning: false,
    isPaused: false,
    startTimestamp: null,
    pauseTimestamp: null,
    totalPausedSeconds: 0,
    elapsedSeconds: 0,
  },
};

// Action types
const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_USER: 'SET_USER',
  LOGOUT: 'LOGOUT',
  SET_PROJECTS: 'SET_PROJECTS',
  ADD_PROJECT: 'ADD_PROJECT',
  UPDATE_PROJECT: 'UPDATE_PROJECT',
  DELETE_PROJECT: 'DELETE_PROJECT',
  SET_BLOCKS: 'SET_BLOCKS',
  ADD_BLOCK: 'ADD_BLOCK',
  UPDATE_BLOCK: 'UPDATE_BLOCK',
  DELETE_BLOCK: 'DELETE_BLOCK',
  SET_SESSIONS: 'SET_SESSIONS',
  ADD_SESSION: 'ADD_SESSION',
  SET_SETTINGS: 'SET_SETTINGS',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  SET_TIMER_STATE: 'SET_TIMER_STATE',
  UPDATE_TIMER_STATE: 'UPDATE_TIMER_STATE',
  HYDRATE_STATE: 'HYDRATE_STATE',
};

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };

    case ACTIONS.SET_USER:
      return { ...state, user: action.payload, isAuthenticated: !!action.payload };

    case ACTIONS.LOGOUT:
      return { ...initialState, isLoading: false };

    case ACTIONS.SET_PROJECTS:
      return { ...state, projects: action.payload };

    case ACTIONS.ADD_PROJECT:
      return { ...state, projects: [...state.projects, action.payload] };

    case ACTIONS.UPDATE_PROJECT:
      return {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.payload.id ? { ...p, ...action.payload } : p
        ),
      };

    case ACTIONS.DELETE_PROJECT:
      return {
        ...state,
        projects: state.projects.filter(p => p.id !== action.payload),
        blocks: state.blocks.filter(b => b.projectId !== action.payload),
      };

    case ACTIONS.SET_BLOCKS:
      return { ...state, blocks: action.payload };

    case ACTIONS.ADD_BLOCK:
      return { ...state, blocks: [...state.blocks, action.payload] };

    case ACTIONS.UPDATE_BLOCK:
      return {
        ...state,
        blocks: state.blocks.map(b =>
          b.id === action.payload.id ? { ...b, ...action.payload } : b
        ),
      };

    case ACTIONS.DELETE_BLOCK:
      return { ...state, blocks: state.blocks.filter(b => b.id !== action.payload) };

    case ACTIONS.SET_SESSIONS:
      return { ...state, sessions: action.payload };

    case ACTIONS.ADD_SESSION:
      return { ...state, sessions: [...state.sessions, action.payload] };

    case ACTIONS.SET_SETTINGS:
      return { ...state, settings: action.payload };

    case ACTIONS.UPDATE_SETTINGS:
      return { ...state, settings: { ...state.settings, ...action.payload } };

    case ACTIONS.SET_TIMER_STATE:
      return { ...state, timerState: action.payload };

    case ACTIONS.UPDATE_TIMER_STATE:
      return { ...state, timerState: { ...state.timerState, ...action.payload } };

    case ACTIONS.HYDRATE_STATE:
      return { ...state, ...action.payload, isLoading: false };

    default:
      return state;
  }
}

// Context
const AppContext = createContext(null);

// Provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize app state from storage
  useEffect(() => {
    async function loadData() {
      try {
        const [user, projects, blocks, sessions, settings, timerState] = await Promise.all([
          storage.getUser(),
          storage.getProjects(),
          storage.getBlocks(),
          storage.getSessions(),
          storage.getSettings(),
          storage.getTimerState(),
        ]);

        dispatch({
          type: ACTIONS.HYDRATE_STATE,
          payload: {
            user,
            isAuthenticated: !!user,
            projects: projects || [],
            blocks: blocks || [],
            sessions: sessions || [],
            settings: {
              ...initialState.settings,
              ...(settings || {}),
              notifications: toBoolean(settings?.notifications ?? initialState.settings.notifications),
              darkMode: toBoolean(settings?.darkMode ?? initialState.settings.darkMode),
              autoStartNext: toBoolean(settings?.autoStartNext ?? initialState.settings.autoStartNext),
              dailyGoal: Number(settings?.dailyGoal) || initialState.settings.dailyGoal,
            },
            timerState: timerState ? {
              ...initialState.timerState,
              ...timerState,
              isRunning: toBoolean(timerState.isRunning),
              isPaused: toBoolean(timerState.isPaused),
              totalPausedSeconds: Number(timerState.totalPausedSeconds) || 0,
              elapsedSeconds: Number(timerState.elapsedSeconds) || 0,
            } : initialState.timerState,
          },
        });
      } catch (error) {
        console.error('Error loading data:', error);
        dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      }
    }

    loadData();
  }, []);

  // User actions
  const login = useCallback(async (email) => {
    const user = createUser({ email, name: email.split('@')[0] });
    await storage.setUser(user);
    dispatch({ type: ACTIONS.SET_USER, payload: user });
    return user;
  }, []);

  const updateUser = useCallback(async (updates) => {
    const updatedUser = { ...state.user, ...updates };
    await storage.setUser(updatedUser);
    dispatch({ type: ACTIONS.SET_USER, payload: updatedUser });
    return updatedUser;
  }, [state.user]);

  const logout = useCallback(async () => {
    await storage.clearAllData();
    dispatch({ type: ACTIONS.LOGOUT });
  }, []);

  // Project actions
  const addProject = useCallback(async (data) => {
    const project = createProject(data);
    await storage.addProject(project);
    dispatch({ type: ACTIONS.ADD_PROJECT, payload: project });
    return project;
  }, []);

  const updateProject = useCallback(async (projectId, updates) => {
    const project = await storage.updateProject(projectId, updates);
    if (project) {
      dispatch({ type: ACTIONS.UPDATE_PROJECT, payload: project });
    }
    return project;
  }, []);

  const deleteProject = useCallback(async (projectId) => {
    await storage.deleteProject(projectId);
    dispatch({ type: ACTIONS.DELETE_PROJECT, payload: projectId });
  }, []);

  // Block actions
  const addBlock = useCallback(async (data) => {
    const blocks = state.blocks.filter(b => b.scheduledDate === (data.scheduledDate || new Date().toISOString().split('T')[0]));
    const block = createBlock({ ...data, order: blocks.length });
    await storage.addBlock(block);
    dispatch({ type: ACTIONS.ADD_BLOCK, payload: block });
    return block;
  }, [state.blocks]);

  const updateBlock = useCallback(async (blockId, updates) => {
    const block = await storage.updateBlock(blockId, updates);
    if (block) {
      dispatch({ type: ACTIONS.UPDATE_BLOCK, payload: block });
    }
    return block;
  }, []);

  const deleteBlock = useCallback(async (blockId) => {
    await storage.deleteBlock(blockId);
    dispatch({ type: ACTIONS.DELETE_BLOCK, payload: blockId });
  }, []);

  const completeBlock = useCallback(async (blockId) => {
    await updateBlock(blockId, { status: 'completed' });
  }, [updateBlock]);

  const reopenBlock = useCallback(async (blockId) => {
    await updateBlock(blockId, { status: 'pending' });
  }, [updateBlock]);

  const reorderBlocks = useCallback(async (orderedBlockIds) => {
    const updatedBlocks = await storage.reorderBlocks(orderedBlockIds);
    dispatch({ type: ACTIONS.SET_BLOCKS, payload: updatedBlocks });
  }, []);

  // Session actions
  const addSession = useCallback(async (data) => {
    const session = createSession(data);
    await storage.addSession(session);
    dispatch({ type: ACTIONS.ADD_SESSION, payload: session });
    return session;
  }, []);

  // Settings actions
  const updateSettings = useCallback(async (updates) => {
    const settings = await storage.updateSettings(updates);
    dispatch({ type: ACTIONS.UPDATE_SETTINGS, payload: updates });
    return settings;
  }, []);

  // Timer actions
  const updateTimerState = useCallback(async (updates) => {
    const newState = { ...state.timerState, ...updates };
    await storage.setTimerState(newState);
    dispatch({ type: ACTIONS.UPDATE_TIMER_STATE, payload: updates });

    // Sync to shared container for iOS widget and Apple Watch
    const activeBlock = state.blocks.find(b => b.id === newState.blockId);
    SharedDataService.updateTimerState(newState, activeBlock);

    return newState;
  }, [state.timerState, state.blocks]);

  const clearTimerState = useCallback(async () => {
    // Asegurar que el servicio también se detenga
    timerService?.stop();

    // Sync cleared state to widget/watch
    SharedDataService.updateTimerState(initialState.timerState, null);

    await storage.clearTimerState();
    dispatch({ type: ACTIONS.SET_TIMER_STATE, payload: initialState.timerState });
  }, []);

  // Helper getters
  const getBlocksForDate = useCallback((date) => {
    const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
    return state.blocks
      .filter(b => b.scheduledDate === dateStr)
      .sort((a, b) => a.order - b.order);
  }, [state.blocks]);

  const getBlocksByProject = useCallback((projectId) => {
    return state.blocks.filter(b => b.projectId === projectId);
  }, [state.blocks]);

  const getTodayBlocks = useCallback(() => {
    return getBlocksForDate(new Date().toISOString().split('T')[0]);
  }, [getBlocksForDate]);

  const getPendingBlocks = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return state.blocks
      .filter(b => b.scheduledDate === today && b.status !== 'completed')
      .sort((a, b) => a.order - b.order);
  }, [state.blocks]);

  const getCompletedBlocksForDate = useCallback((date) => {
    const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
    return state.blocks.filter(b => b.scheduledDate === dateStr && b.status === 'completed');
  }, [state.blocks]);

  const value = {
    ...state,
    // User
    login,
    updateUser,
    logout,
    // Projects
    addProject,
    updateProject,
    deleteProject,
    // Blocks
    addBlock,
    updateBlock,
    deleteBlock,
    completeBlock,
    reopenBlock,
    reorderBlocks,
    getBlocksForDate,
    getBlocksByProject,
    getTodayBlocks,
    getPendingBlocks,
    getCompletedBlocksForDate,
    // Sessions
    addSession,
    // Settings
    updateSettings,
    // Timer
    updateTimerState,
    clearTimerState,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Custom hook to use the context
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;

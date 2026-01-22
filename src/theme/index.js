// FocusBlocks Theme - Main Export
export { lightColors, darkColors, getColors } from './colors';
export { typography } from './typography';
export { spacing, shadows } from './spacing';

// Category configurations
export const categories = [
  { id: 'work', label: 'Work', icon: 'briefcase' },
  { id: 'admin', label: 'Admin', icon: 'mail' },
  { id: 'personal', label: 'Personal', icon: 'restaurant' },
  { id: 'strategy', label: 'Strategy', icon: 'list' },
  { id: 'learning', label: 'Learning', icon: 'book' },
  { id: 'creative', label: 'Creative', icon: 'brush' },
];

// Tag colors with their IDs
export const tagColors = [
  { id: 'yellow', color: '#E5B85C' },
  { id: 'pink', color: '#D4918A' },
  { id: 'green', color: '#8BA888' },
  { id: 'orange', color: '#D9704A' },
  { id: 'gray', color: '#9B9082' },
];

// Duration presets
export const durationPresets = [15, 25, 30];
export const durationMin = 1;
export const durationMax = 180;

// Default settings
export const defaultSettings = {
  notifications: true,
  darkMode: false,
  dailyGoal: 360, // 6 hours in minutes
  autoStartNext: false,
};

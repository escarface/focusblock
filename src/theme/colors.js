// FocusBlocks Color Theme
// Based on reference designs - warm, earthy tones with orange accent

export const lightColors = {
  // Primary colors
  primary: '#D9704A',        // Coral (light)
  primaryLight: '#E68D6A',   // Lighter coral for highlights
  primaryDark: '#C85E3B',    // Darker coral for pressed states

  // Background colors
  background: '#F5F1ED',     // Beige
  backgroundSecondary: '#EFE7DF', // Subtle card backdrop
  surface: '#FFFFFF',        // Pure white for inputs/cards

  // Text colors
  textPrimary: '#2F2B27',    // Warm near-black
  textSecondary: '#7D756C',  // Secondary text
  textMuted: '#A79F95',      // Placeholder text
  textOnPrimary: '#FFFFFF',  // White text on primary buttons

  // Category/tag colors
  tagYellow: '#E5B85C',      // Yellow/gold tag
  tagPink: '#D4918A',        // Pink/rose tag
  tagGreen: '#8BA888',       // Sage green tag
  tagOrange: '#D9704A',      // Orange tag (same as primary)
  tagGray: '#9B9082',        // Taupe/gray tag

  // Status colors
  success: '#8BA888',        // Green for completed
  error: '#D4918A',          // Pink/red for errors
  warning: '#E5B85C',        // Yellow for warnings

  // UI elements
  border: '#E4DAD0',         // Light border color
  divider: '#EBE2D8',        // Divider lines
  shadow: 'rgba(0, 0, 0, 0.08)', // Shadow color

  // Interaction states
  state: {
    pressed: 'rgba(0, 0, 0, 0.06)',
    pressedStrong: 'rgba(0, 0, 0, 0.12)',
    disabledBackground: '#E8DED4',
    disabledText: '#A7A099',
    focusRing: '#D9704A',
  },

  // Timer specific
  timerRing: '#D4714A',      // Orange ring
  timerBackground: '#E3D7CD', // Light ring background
  timerText: '#2F2B27',      // Timer text

  // Block card backgrounds
  blockActive: '#FBE8DD',    // Light coral for active block
  blockDefault: '#F1E9E1',   // Subtle neutral for inactive blocks
};

export const darkColors = {
  // Primary colors
  primary: '#E5A63D',        // Coral (dark)
  primaryLight: '#F0B84A',
  primaryDark: '#D4952C',

  // Background colors
  background: '#1A1A1A',     // Dark
  backgroundSecondary: '#232323', // Slightly lighter
  surface: '#2C2C2C',        // Card surface

  // Text colors
  textPrimary: '#F3EEE7',    // Off-white for main text
  textSecondary: '#A9A39B',  // Muted text
  textMuted: '#6E675F',      // Very muted text
  textOnPrimary: '#1A1A1A',  // Dark text on primary buttons

  // Category/tag colors - slightly brighter for dark mode
  tagYellow: '#E5B85C',
  tagPink: '#D4918A',
  tagGreen: '#8BA888',
  tagOrange: '#E5A63D',
  tagGray: '#9B9082',

  // Status colors
  success: '#8BA888',
  error: '#D4918A',
  warning: '#E5B85C',

  // UI elements
  border: '#363636',
  divider: '#2E2E2E',
  shadow: 'rgba(0, 0, 0, 0.4)',

  // Interaction states
  state: {
    pressed: 'rgba(255, 255, 255, 0.08)',
    pressedStrong: 'rgba(255, 255, 255, 0.14)',
    disabledBackground: '#2A2A2A',
    disabledText: '#6E675F',
    focusRing: '#E5A63D',
  },

  // Timer specific
  timerRing: '#E5A63D',
  timerBackground: '#3A3A3A',
  timerText: '#F3EEE7',

  // Block card backgrounds
  blockActive: '#3A2E1F',
  blockDefault: '#2C2C2C',
};

export const getColors = (isDark) => isDark ? darkColors : lightColors;

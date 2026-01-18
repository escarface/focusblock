// FocusBlocks Color Theme
// Based on reference designs - warm, earthy tones with orange accent

export const lightColors = {
  // Primary colors
  primary: '#D4714A',        // Main orange accent
  primaryLight: '#E8956E',   // Lighter orange for highlights
  primaryDark: '#B85A3A',    // Darker orange for pressed states

  // Background colors
  background: '#FAF6F1',     // Warm off-white background
  backgroundSecondary: '#F5EEE6', // Slightly darker for cards
  surface: '#FFFFFF',        // Pure white for inputs/cards

  // Text colors
  textPrimary: '#3D3D3D',    // Dark gray for main text
  textSecondary: '#8B8B8B',  // Medium gray for secondary text
  textMuted: '#B5B5B5',      // Light gray for placeholder text
  textOnPrimary: '#FFFFFF',  // White text on primary buttons

  // Category/tag colors
  tagYellow: '#E5B85C',      // Yellow/gold tag
  tagPink: '#D4918A',        // Pink/rose tag
  tagGreen: '#8BA888',       // Sage green tag
  tagOrange: '#D4714A',      // Orange tag (same as primary)
  tagGray: '#9B9082',        // Taupe/gray tag

  // Status colors
  success: '#8BA888',        // Green for completed
  error: '#D4918A',          // Pink/red for errors
  warning: '#E5B85C',        // Yellow for warnings

  // UI elements
  border: '#E5DED4',         // Light border color
  divider: '#EAE4DB',        // Divider lines
  shadow: 'rgba(0, 0, 0, 0.08)', // Shadow color

  // Timer specific
  timerRing: '#D4714A',      // Orange ring
  timerBackground: '#E5DED4', // Light gray ring background
  timerText: '#3D3D3D',      // Timer text

  // Block card backgrounds
  blockActive: '#FCEADE',    // Light orange for active block
  blockDefault: '#F5F2ED',   // Light gray for inactive blocks
};

export const darkColors = {
  // Primary colors
  primary: '#E5A63D',        // Bright orange/gold for dark mode
  primaryLight: '#F0B84A',
  primaryDark: '#D4952C',

  // Background colors
  background: '#1A1612',     // Very dark brown
  backgroundSecondary: '#252019', // Slightly lighter
  surface: '#2E2820',        // Card surface

  // Text colors
  textPrimary: '#F5F0E8',    // Off-white for main text
  textSecondary: '#A89F94',  // Muted text
  textMuted: '#6B635A',      // Very muted text
  textOnPrimary: '#1A1612',  // Dark text on primary buttons

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
  border: '#3D352C',
  divider: '#352E25',
  shadow: 'rgba(0, 0, 0, 0.3)',

  // Timer specific
  timerRing: '#E5A63D',
  timerBackground: '#3D352C',
  timerText: '#F5F0E8',

  // Block card backgrounds
  blockActive: '#3D2E1A',
  blockDefault: '#2E2820',
};

export const getColors = (isDark) => isDark ? darkColors : lightColors;

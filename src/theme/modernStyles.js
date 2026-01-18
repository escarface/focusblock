// Modern Expo Styling Constants
// Following Apple Human Interface Guidelines

export const SHADOWS = {
  // Small shadow for subtle elevation
  sm: {
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
  },

  // Medium shadow for cards
  md: {
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
  },

  // Large shadow for modals and floating elements
  lg: {
    boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
  },

  // Extra large shadow for prominent elements
  xl: {
    boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)',
  },
};

export const BORDER_STYLES = {
  // Continuous curve for rounded corners (Apple's design language)
  continuous: {
    borderCurve: 'continuous',
  },

  // Standard radius values
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 9999,
  },
};

// Combined card styles
export const CARD_STYLES = {
  sm: {
    borderRadius: BORDER_STYLES.radius.md,
    borderCurve: 'continuous',
    ...SHADOWS.sm,
  },
  md: {
    borderRadius: BORDER_STYLES.radius.lg,
    borderCurve: 'continuous',
    ...SHADOWS.md,
  },
  lg: {
    borderRadius: BORDER_STYLES.radius.xl,
    borderCurve: 'continuous',
    ...SHADOWS.lg,
  },
};

// Button styles
export const BUTTON_STYLES = {
  primary: {
    borderRadius: BORDER_STYLES.radius.md,
    borderCurve: 'continuous',
    ...SHADOWS.sm,
  },
  circular: {
    borderRadius: BORDER_STYLES.radius.full,
    borderCurve: 'continuous',
    ...SHADOWS.md,
  },
};

export default {
  SHADOWS,
  BORDER_STYLES,
  CARD_STYLES,
  BUTTON_STYLES,
};

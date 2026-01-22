// FocusBlocks Spacing System
// Consistent spacing values for layout

export const spacing = {
  // Base unit: 4px
  unit: 4,
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,

  // Screen padding
  screenHorizontal: 24,
  screenVertical: 24,

  // Gaps
  gapSm: 12,
  gapMd: 16,
  gapLg: 24,

  // Card/container
  cardPadding: 16,
  cardPaddingCompact: 12,
  cardRadius: 16,
  cardRadiusLarge: 20,
  cardRadiusSmall: 12,

  // Input fields
  inputPadding: 16,
  inputRadius: 16,
  inputHeight: 56,

  // Buttons
  buttonPaddingVertical: 14,
  buttonPaddingHorizontal: 20,
  buttonPaddingSmallVertical: 10,
  buttonPaddingSmallHorizontal: 16,
  buttonPaddingLargeVertical: 18,
  buttonPaddingLargeHorizontal: 24,
  buttonRadius: 12,
  buttonRadiusSmall: 10,
  buttonRadiusPill: 999,
  buttonHeightSmall: 36,
  buttonHeightMedium: 44,
  buttonHeightLarge: 52,

  // Icons
  iconSmall: 20,
  iconMedium: 24,
  iconLarge: 32,

  // Bottom tabs
  tabBarHeight: 80,
  tabBarPadding: 8,

  // Status bar
  statusBarHeight: 44,
};

export const shadows = {
  small: {
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.06)',
  },
  medium: {
    boxShadow: '0 6px 14px rgba(0, 0, 0, 0.12)',
  },
  large: {
    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.16)',
  },
};

export default spacing;

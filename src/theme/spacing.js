// FocusBlocks Spacing System
// Consistent spacing values for layout

export const spacing = {
  // Base unit: 4px
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,

  // Screen padding
  screenHorizontal: 20,
  screenVertical: 16,

  // Card/container
  cardPadding: 16,
  cardRadius: 16,
  cardRadiusLarge: 24,
  cardRadiusSmall: 12,

  // Input fields
  inputPadding: 16,
  inputRadius: 16,

  // Buttons
  buttonPadding: 16,
  buttonRadius: 16,
  buttonRadiusSmall: 12,
  buttonRadiusPill: 50,

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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
};

export default spacing;

// FocusBlocks Typography
// Clean, modern font system

import { Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

export const typography = {
  fontFamily,

  // Font weights
  fontWeights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  // Font sizes
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    timer: 64,       // Large timer display
    timerSmall: 48,  // Smaller timer
  },

  // Line heights
  lineHeights: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },

  // Pre-defined text styles
  styles: {
    // Headings
    h1: {
      fontFamily,
      fontSize: 32,
      fontWeight: '700',
      letterSpacing: -0.5,
    },
    h2: {
      fontFamily,
      fontSize: 24,
      fontWeight: '600',
      letterSpacing: -0.3,
    },
    h3: {
      fontFamily,
      fontSize: 20,
      fontWeight: '600',
    },
    h4: {
      fontFamily,
      fontSize: 17,
      fontWeight: '600',
    },

    // Body text
    bodyLarge: {
      fontFamily,
      fontSize: 17,
      fontWeight: '400',
      lineHeight: 24,
    },
    body: {
      fontFamily,
      fontSize: 15,
      fontWeight: '400',
      lineHeight: 22,
    },
    bodySmall: {
      fontFamily,
      fontSize: 13,
      fontWeight: '400',
      lineHeight: 18,
    },

    // Labels
    label: {
      fontFamily,
      fontSize: 13,
      fontWeight: '500',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    labelSmall: {
      fontFamily,
      fontSize: 11,
      fontWeight: '500',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },

    // Timer
    timer: {
      fontFamily,
      fontSize: 64,
      fontWeight: '300',
      letterSpacing: -2,
    },
    timerSmall: {
      fontFamily,
      fontSize: 48,
      fontWeight: '300',
      letterSpacing: -1,
    },

    // Buttons
    button: {
      fontFamily,
      fontSize: 17,
      fontWeight: '600',
    },
    buttonSmall: {
      fontFamily,
      fontSize: 15,
      fontWeight: '500',
    },

    // Caption
    caption: {
      fontFamily,
      fontSize: 12,
      fontWeight: '400',
    },
  },
};

export default typography;

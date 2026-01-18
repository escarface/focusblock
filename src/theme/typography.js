// FocusBlocks Typography
// Clean, modern font system

import { Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

export const typography = {
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
      fontSize: 32,
      fontWeight: '700',
      letterSpacing: -0.5,
    },
    h2: {
      fontSize: 24,
      fontWeight: '600',
      letterSpacing: -0.3,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600',
    },
    h4: {
      fontSize: 17,
      fontWeight: '600',
    },

    // Body text
    bodyLarge: {
      fontSize: 17,
      fontWeight: '400',
      lineHeight: 24,
    },
    body: {
      fontSize: 15,
      fontWeight: '400',
      lineHeight: 22,
    },
    bodySmall: {
      fontSize: 13,
      fontWeight: '400',
      lineHeight: 18,
    },

    // Labels
    label: {
      fontSize: 13,
      fontWeight: '500',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    labelSmall: {
      fontSize: 11,
      fontWeight: '500',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },

    // Timer
    timer: {
      fontSize: 64,
      fontWeight: '300',
      letterSpacing: -2,
    },
    timerSmall: {
      fontSize: 48,
      fontWeight: '300',
      letterSpacing: -1,
    },

    // Buttons
    button: {
      fontSize: 17,
      fontWeight: '600',
    },
    buttonSmall: {
      fontSize: 15,
      fontWeight: '500',
    },

    // Caption
    caption: {
      fontSize: 12,
      fontWeight: '400',
    },
  },
};

export default typography;

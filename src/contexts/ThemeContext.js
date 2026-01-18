// FocusBlocks Theme Context
// Handles dark/light mode theming

import React, { createContext, useContext, useMemo } from 'react';
import { useApp } from './AppContext';
import { getColors, lightColors, darkColors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, shadows } from '../theme/spacing';

const ThemeContext = createContext(null);

// Safe boolean conversion that handles string "true"/"false"
const toBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  return false;
};

export function ThemeProvider({ children }) {
  const { settings } = useApp();
  const isDark = toBoolean(settings?.darkMode);

  const theme = useMemo(() => ({
    isDark,
    colors: getColors(isDark),
    typography,
    spacing,
    shadows,
  }), [isDark]);

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export default ThemeContext;

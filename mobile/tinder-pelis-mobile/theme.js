import { DefaultTheme } from 'react-native-paper';

export const designTokens = {
  colors: {
    // primary / accent (used by paper components)
    primary: '#6200ee',
    accent: '#03dac4',

    // gradient tokens for custom gradient buttons
    gradientStart: '#ff8a00', // orange
    gradientEnd: '#ffb347',   // yellowish orange

    // surface / background / typography colors
    background: '#ffffff',
    surface: '#ffffff',
    text: '#1a1a1a',

    // color used for text/icons drawn on top of primary / gradients
    onPrimary: '#ffffff',
  },
  // shape tokens
  roundness: 10,
  // spacing scale
  spacing: { xs: 4, s: 8, m: 16, l: 24 },
  // typographic overrides (used by custom components)
  typography: { buttonWeight: '600' },
};

// Paper theme (used by <Provider theme={theme}>)
export const theme = {
  ...DefaultTheme,
  roundness: designTokens.roundness,
  colors: {
    ...DefaultTheme.colors,
    ...designTokens.colors,
    primary: designTokens.colors.primary,
    accent: designTokens.colors.accent,
    background: designTokens.colors.background,
    surface: designTokens.colors.surface,
    text: designTokens.colors.text,
  },
};
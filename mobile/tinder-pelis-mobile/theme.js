import { DefaultTheme } from 'react-native-paper';

/* =============================
      Parametros modificables
   ============================= */
export const tweak = {
  scaleFactor: 1, // 0.9, 1.1, 1.25 para achicar/agrandar todo

  // texto
  baseFontSize: 18,
  typeScale: 1.125, //no se que es pero chat me dijo que lo ponga

  // espaciado
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl:64,
    xxxl:100
  },

  // redondeamientos
  roundnessBase: 10,
  pillRoundness: 9999,
  cardRadius: 12,

  // para simular elevacion/sombreado
  elevation: {
    low: 1,
    medium: 4,
    high: 8,
  },

  // tamaños
  sizes: {
    buttonHeight: 50,
    inputHeight: 48,
    smallButtonHeight: 36,
    avatarSmall: 24,
    avatarMedium: 40,
    avatarLarge: 64,
    iconSmall: 16,
    iconMedium: 20,
    iconLarge: 28,
  },

  // bordes
  border: {
    thin: 1,
    thick: 2,
  },

  // para cosas translucidas
  subtleOpacity: 0.6,
};

/* ===========================
             Colores
   =========================== */
export const designTokens = {
  colors: {
    // core
    primary: '#ff8a00',
    secondary: '#fcd25eff',
    background: '#120824ff',
    surface: '#240a42ff',
    accent:'#321744ff',
    text: '#e4e0e0ff',
    disabled: '#bdbdbd',

    // info
    success: '#2e7d32',
    warning: '#ebd300ff',
    danger: '#c62828',

  },

  tweak,
};

/* ===========================
            Auxiliares
   =========================== */
function scaled(n) {
  return Math.round((n * (tweak.scaleFactor || 1)) * 100) / 100;
}

function spacing(keyOrValue) {
  if (typeof keyOrValue === 'number') return scaled(keyOrValue);
  return scaled(designTokens.tweak.spacing[keyOrValue] ?? designTokens.tweak.spacing.m);
}

function fontSize(step = 0) {
  const base = tweak.baseFontSize;
  const size = base * Math.pow(tweak.typeScale, step);
  return Math.round(size * (tweak.scaleFactor || 1));
}

const component = {
  roundness: scaled(tweak.roundnessBase),
  cardRadius: scaled(tweak.cardRadius),
  pillRoundness: tweak.pillRoundness, 

  buttonHeight: scaled(tweak.sizes.buttonHeight),
  smallButtonHeight: scaled(tweak.sizes.smallButtonHeight),
  inputHeight: scaled(tweak.sizes.inputHeight),
  avatar: {
    sm: scaled(tweak.sizes.avatarSmall),
    md: scaled(tweak.sizes.avatarMedium),
    lg: scaled(tweak.sizes.avatarLarge),
  },
  icon: {
    sm: scaled(tweak.sizes.iconSmall),
    md: scaled(tweak.sizes.iconMedium),
    lg: scaled(tweak.sizes.iconLarge),
  },

  borderThin: scaled(tweak.border.thin),
  borderThick: scaled(tweak.border.thick),
  elevationLow: scaled(tweak.elevation.low),
  elevationMedium: scaled(tweak.elevation.medium),
  elevationHigh: scaled(tweak.elevation.high),
};

/* ===========================
            El theme
   =========================== */
export const theme = {
  ...DefaultTheme,
  roundness: component.roundness,
  colors: {
    ...DefaultTheme.colors,
    ...designTokens.colors,
    primary: designTokens.colors.primary,
    secondary: designTokens.colors.secondary,
    background: designTokens.colors.background,
    surface: designTokens.colors.surface,
    accent: designTokens.colors.accent,
    text: designTokens.colors.text,
  },

  tokens: {
    spacing: {
      xs: spacing('xs'),
      s: spacing('s'),
      m: spacing('m'),
      l: spacing('l'),
      xl: spacing('xl'),
      xxl: spacing('xxl'),
      xxxl: spacing('xxxl')
    },
    typography: {
      base: fontSize(0),
      small: fontSize(-1),
      body: fontSize(0),
      h1: fontSize(4),
      h2: fontSize(3),
      h3: fontSize(2),
      buttonSize: fontSize(0),
      buttonWeight: '600',
    },

    component,

  },
  sizes: {
    buttonHeight: component.buttonHeight,
    inputHeight: component.inputHeight,
    avatar: component.avatar,
    icon: component.icon,
  },
};

export const helpers = {
  spacing,
  fontSize,
  scaled,
};


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
        Colores (defaults)
   =========================== */
const defaultColors = {
  // core
  primary: 'rgba(255, 138, 0, 1)',
  secondary: 'rgba(251, 195, 76, 1)',
  background: 'rgba(18, 8, 36, 1)',
  surface: 'rgba(33, 5, 65, 1)',
  accent:'rgba(50, 23, 68, 1)',
  text: 'rgba(255, 255, 255, 1)',
  disabled: 'rgba(189, 189, 189, 1)',

  // info
  success: '#2e7d32',
  warning: '#ebd300ff',
  danger: '#c62828',
};

export const designTokens = {
  colors: { ...defaultColors },
  tweak,
};

/* ===========================
            Auxiliares
   =========================== */

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

function parseRgbaSimple(input) {
  if (typeof input !== 'string') throw new Error('Color must be a string');
  const open = input.indexOf('(');
  const close = input.lastIndexOf(')');
  if (open === -1 || close === -1) throw new Error('Invalid color format');
  const inside = input.slice(open + 1, close);
  const parts = inside.split(',').map(s => s.trim());
  if (parts.length !== 3 && parts.length !== 4) throw new Error('Expected 3 or 4 values inside parentheses');
  const r = clamp(Math.round(Number(parts[0])), 0, 255);
  const g = clamp(Math.round(Number(parts[1])), 0, 255);
  const b = clamp(Math.round(Number(parts[2])), 0, 255);
  const a = clamp(parts.length === 4 ? Number(parts[3]) : 1, 0, 1);
  if ([r,g,b].some(n => Number.isNaN(n)) || Number.isNaN(a)) throw new Error('Invalid numeric color components');
  return { r, g, b, a };
}

function fmtRgba({ r, g, b, a }) {
  const aRounded = Math.round(a * 1000) / 1000; 
  return `rgba(${r}, ${g}, ${b}, ${aRounded})`;
}

export function mixColors(colorA, colorB) {
  const A = parseRgbaSimple(colorA);
  const B = parseRgbaSimple(colorB);
  const r = Math.round((A.r + B.r) / 2);
  const g = Math.round((A.g + B.g) / 2);
  const b = Math.round((A.b + B.b) / 2);
  const a = Math.round(((A.a + B.a) / 2) * 1000) / 1000;
  return fmtRgba({ r: clamp(r,0,255), g: clamp(g,0,255), b: clamp(b,0,255), a: clamp(a,0,1) });
}

export function setAlpha(color, newAlpha) {
  const c = parseRgbaSimple(color);
  const a = clamp(Number(newAlpha), 0, 1);
  return fmtRgba({ r: c.r, g: c.g, b: c.b, a: Math.round(a * 1000) / 1000 });
}


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
//======================================
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


const COLOR_KEYS = ['primary','secondary','background','surface','accent','text','disabled','success','warning','danger'];

export function makeTheme(...args) {
  let overrides = {};

  if (args.length === 1 && typeof args[0] === 'object' && args[0] !== null) {
    overrides = args[0];
  } else {
    args.forEach((val, i) => {
      if (val !== undefined) overrides[COLOR_KEYS[i]] = val;
    });
  }

  const colors = { ...defaultColors, ...overrides };

  return {
    ...DefaultTheme,
    roundness: component.roundness,
    colors: {
      ...DefaultTheme.colors,
      ...colors,
      primary: colors.primary,
      secondary: colors.secondary,
      background: colors.background,
      surface: colors.surface,
      accent: colors.accent,
      text: colors.text,
      disabled: colors.disabled,
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
}


export const helpers = {
  spacing,
  fontSize,
  scaled,
};


// ─────────────────────────────────────────────────────────────
// theme.ts  –  Design tokens for StockSuite Pro (Expo / Android)
// ─────────────────────────────────────────────────────────────

export type ThemeKey = 'dark' | 'black' | 'light';

interface Palette {
  // Backgrounds
  appBg: string;
  cardBg: string;
  cardBorder: string;
  inputBg: string;
  inputBorder: string;
  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  // Accents
  accentPrimary: string;   // blue
  accentSecondary: string; // purple
  statusProfit: string;    // green
  statusLoss: string;      // red
  statusWarning: string;   // yellow
  // Nav
  tabBarBg: string;
  tabBarBorder: string;
  tabBarActive: string;
  tabBarInactive: string;
  // Misc
  divider: string;
  profitBg: string;
  lossBg: string;
  overlay: string;
}

const ACCENT_PRIMARY = '#58a6ff';
const ACCENT_SECONDARY = '#bd56eb';
const STATUS_PROFIT = '#3fb950';
const STATUS_LOSS = '#f85149';
const STATUS_WARNING = '#e3b341';

const darkPalette: Palette = {
  appBg: '#0d1117',
  cardBg: '#161b22',
  cardBorder: 'rgba(255,255,255,0.08)',
  inputBg: '#21262d',
  inputBorder: 'rgba(255,255,255,0.15)',
  textPrimary: '#f0f6fc',
  textSecondary: '#c9d1d9',
  textMuted: '#8b949e',
  accentPrimary: ACCENT_PRIMARY,
  accentSecondary: ACCENT_SECONDARY,
  statusProfit: STATUS_PROFIT,
  statusLoss: STATUS_LOSS,
  statusWarning: STATUS_WARNING,
  tabBarBg: '#161b22',
  tabBarBorder: 'rgba(255,255,255,0.08)',
  tabBarActive: ACCENT_PRIMARY,
  tabBarInactive: '#8b949e',
  divider: 'rgba(255,255,255,0.08)',
  profitBg: 'rgba(63,185,80,0.08)',
  lossBg: 'rgba(248,81,73,0.08)',
  overlay: 'rgba(0,0,0,0.6)',
};

const blackPalette: Palette = {
  ...darkPalette,
  appBg: '#000000',
  cardBg: '#0a0a0a',
  cardBorder: 'rgba(255,255,255,0.06)',
  inputBg: '#111111',
  inputBorder: 'rgba(255,255,255,0.12)',
  tabBarBg: '#000000',
  tabBarBorder: 'rgba(255,255,255,0.06)',
};

const lightPalette: Palette = {
  appBg: '#f6f8fa',
  cardBg: '#ffffff',
  cardBorder: 'rgba(0,0,0,0.08)',
  inputBg: '#f3f4f6',
  inputBorder: 'rgba(0,0,0,0.15)',
  textPrimary: '#1c2128',
  textSecondary: '#424a53',
  textMuted: '#656d76',
  accentPrimary: '#0969da',
  accentSecondary: '#8250df',
  statusProfit: '#1a7f37',
  statusLoss: '#cf222e',
  statusWarning: '#9a6700',
  tabBarBg: '#ffffff',
  tabBarBorder: 'rgba(0,0,0,0.08)',
  tabBarActive: '#0969da',
  tabBarInactive: '#656d76',
  divider: 'rgba(0,0,0,0.08)',
  profitBg: 'rgba(26,127,55,0.08)',
  lossBg: 'rgba(207,34,46,0.08)',
  overlay: 'rgba(0,0,0,0.4)',
};

export const THEMES: Record<ThemeKey, Palette> = {
  dark: darkPalette,
  black: blackPalette,
  light: lightPalette,
};

// ─── Typography ───────────────────────────────────────────────
export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  mono: 'monospace',
};

export const FONT_SIZES = {
  xs: 11,
  sm: 12,
  base: 14,
  md: 16,
  lg: 16,
  xl: 18,
  xxl: 22,
  xxxl: 28,
};

export const FONT_WEIGHTS = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

// ─── Spacing ─────────────────────────────────────────────────
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

// ─── Border radius ───────────────────────────────────────────
export const RADIUS = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  full: 9999,
};

// ─── Chart colours (cyclic) ──────────────────────────────────
export const CHART_COLORS = [
  '#58a6ff',
  '#bd56eb',
  '#3fb950',
  '#f85149',
  '#e3b341',
  '#8b949e',
  '#1f6feb',
  '#ff7b72',
  '#ffa657',
];

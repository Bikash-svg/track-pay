import type { TokenName } from './types';
export { TOKEN_NAMES } from './types';

export type Palette = {
  readonly [K in TokenName]: string;
};

export const dark: Palette = {
  canvas: '#07090e',
  card: '#131924',
  container: '#0f131c',
  interactive: '#0f131c',
  border: '#232936',
  primary: '#38bdf8',
  onPrimary: '#07090e',
  positive: '#34d399',
  caution: '#fbbf24',
  negative: '#f87171',
  text: '#f8fafc',
  textSecondary: '#94a3b8',
  textMuted: '#7f8da3',
  positiveTint: 'rgba(52,211,153,0.12)',
  cautionTint: 'rgba(251,191,36,0.12)',
  negativeTint: 'rgba(248,113,113,0.12)',
  scrim: 'rgba(7,9,14,0.75)',
  fontDisplay: 'JetBrainsMono_700Bold',
  fontHeading: 'PlusJakartaSans_700Bold',
  fontBody: 'PlusJakartaSans_400Regular',
  fontNumeric: 'JetBrainsMono_600SemiBold',
};

export const light: Palette = {
  canvas: '#f8fafc',
  card: '#ffffff',
  container: '#f1f5f9',
  interactive: '#f1f5f9',
  border: '#e2e8f0',
  primary: '#0284c7',
  onPrimary: '#ffffff',
  positive: '#059669',
  caution: '#b45309',
  negative: '#b91c1c',
  text: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#52627a',
  positiveTint: '#ecfdf5',
  cautionTint: '#fffbeb',
  negativeTint: '#fef2f2',
  scrim: 'rgba(15,23,42,0.40)',
  fontDisplay: 'JetBrainsMono_700Bold',
  fontHeading: 'PlusJakartaSans_700Bold',
  fontBody: 'PlusJakartaSans_400Regular',
  fontNumeric: 'JetBrainsMono_600SemiBold',
};

export const tokens = { dark, light };

export type Theme = typeof tokens;

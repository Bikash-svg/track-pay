import type { TokenName } from './types';
export { TOKEN_NAMES } from './types';

export type Palette = {
  readonly [K in TokenName]: string;
};

export const dark: Palette = {
  canvas: '#0a0a0a',
  card: '#1e1e1e',
  interactive: '#2a2a2a',
  border: 'rgba(255,255,255,0.12)',
  primary: '#38bdf8',
  onPrimary: '#000000',
  positive: '#34d399',
  caution: '#fbbf24',
  negative: '#f87171',
  text: '#e5e5e5',
  textSecondary: '#a1a1aa',
  textMuted: '#71717a',
  positiveTint: 'rgba(52,211,153,0.12)',
  cautionTint: 'rgba(251,191,36,0.12)',
  negativeTint: 'rgba(248,113,113,0.12)',
  scrim: 'rgba(6,9,14,0.78)',
};

export const light: Palette = {
  canvas: '#f8fafc',
  card: '#ffffff',
  interactive: '#f1f5f9',
  border: '#e2e8f0',
  primary: '#0369a1',
  onPrimary: '#ffffff',
  positive: '#10b981',
  caution: '#f59e0b',
  negative: '#f43f5e',
  text: '#0f172a',
  textSecondary: '#334155',
  textMuted: '#64748b',
  positiveTint: 'rgba(16,185,129,0.12)',
  cautionTint: 'rgba(245,158,11,0.12)',
  negativeTint: 'rgba(244,63,94,0.12)',
  scrim: 'rgba(15,23,42,0.45)',
};

export const tokens = { dark, light };

export type Theme = typeof tokens;

// A6 level → progress bar fill token. Only used when the bar renders (limit set → level non-null); the null case is defensive and matches 'ok'. Unit-tested in __tests__/barColour.test.ts.
import type { StatsLevel } from '../domain/monthStats';
import type { TokenName } from './types';

export function barColour(level: StatsLevel | null): TokenName {
  if (level === 'over') return 'negative';
  if (level === 'warn') return 'caution';
  return 'primary'; // 'ok' and null fallback
}
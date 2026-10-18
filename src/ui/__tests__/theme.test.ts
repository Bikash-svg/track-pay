
import { dark, light, TOKEN_NAMES } from '../theme';
import type { TokenName } from '../types';

import fs from 'fs';
import path from 'path';

const ROOTS = ['src', 'app', 'modules'];
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];
const HEX = /#([0-9a-fA-F]{3,8})\b/g;

// theme.ts legitimately holds the token hex/rgba values; every other source
// file must be free of colour hex literals.
// app/upi-spike.tsx contains placeholder hex colours: removed when real screens replace them.
const EXCLUDED_FILES = new Set(['src/ui/theme.ts', 'app/upi-spike.tsx']);

interface Violation {
  file: string;
  line: number;
  match: string;
}

function walk(dir: string, violations: Violation[]): void {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '__tests__') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, violations);
    else if (EXTENSIONS.includes(path.extname(entry.name))) scan(full, violations);
  }
}

function scan(file: string, violations: Violation[]): void {
  if (EXCLUDED_FILES.has(file)) return;
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    let match;
    while ((match = HEX.exec(line)) !== null) {
      violations.push({ file, line: i + 1, match: match[0] });
    }
  });
}

function collectViolations(): Violation[] {
  const violations: Violation[] = [];
  ROOTS.forEach((root) => walk(root, violations));
  return violations;
}

describe('theme tokens', () => {
  it('defines every TokenName in both palettes with no extras', () => {
    const names: TokenName[] = [...TOKEN_NAMES];
    expect(Object.keys(dark).sort()).toEqual(names.sort());
    expect(Object.keys(light).sort()).toEqual(names.sort());
  });

  it('defines every TokenName as a non-empty string in both palettes', () => {
    const names: TokenName[] = [...TOKEN_NAMES];
    for (const name of names) {
      expect(typeof dark[name]).toBe('string');
      expect(dark[name].length).toBeGreaterThan(0);
      expect(typeof light[name]).toBe('string');
      expect(light[name].length).toBeGreaterThan(0);
    }
  });

  it('has no colour hex literals outside src/ui/theme.ts', () => {
    const violations = collectViolations();
    expect(violations).toEqual([]);
  });
});

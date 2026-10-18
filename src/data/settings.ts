// Settings key-value store. The only file in src/data that touches storage.
//
// Phase 2.1 will extend this with profile fields (firstName, surname,
// avatarUri, onboarded). Do not pre-add them now.

const PREFIX = 'trackpay:settings';
export const THEME_KEY = `${PREFIX}:theme`;

export type ThemeName = 'dark' | 'light' | 'auto';

// A minimal shape of AsyncStorage the store needs. The real client is the
// default; tests inject a fake through setStorage().
export interface SettingsStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}

// The backing client. Swapped by setStorage() — a test seam so the settings
// tests can run against an in-memory store without touching real storage.
// Lazy: the real client is required on first use, so importing this module
// in jest (which has no native AsyncStorage) does not fail at load time.
let client: SettingsStorage | null = null;

// Test seam. Lets the settings tests inject an in-memory store without
// touching the real AsyncStorage or the native module.
export function setStorage(next: SettingsStorage): void {
  client = next;
}

export function isStorageAvailable(): boolean {
  return client != null;
}

function ensureClient(): SettingsStorage {
  if (client) return client;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require('@react-native-async-storage/async-storage') as {
    default: SettingsStorage;
  };
  client = mod.default;
  return client;
}

// Reads the stored theme. Returns null when nothing is stored or the value
// is not a valid ThemeName — the caller (1.5's ThemeProvider) decides the
// default. Does not catch AsyncStorage errors; let them propagate.
export async function getTheme(): Promise<ThemeName | null> {
  const value = await ensureClient().getItem(THEME_KEY);
  if (value === null) return null;
  if (value === 'dark' || value === 'light' || value === 'auto') {
    return value;
  }
  return null;
}

export async function setTheme(theme: ThemeName): Promise<void> {
  await ensureClient().setItem(THEME_KEY, theme);
}
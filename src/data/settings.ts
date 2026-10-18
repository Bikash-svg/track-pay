// Settings key-value store. The only file in src/data that touches storage.
//
// Theme (dark/light/auto) and profile (firstName, surname, avatarUri,
// onboarded, preferredUpiPackage) live here. Profile was added in Phase 2.1;
// the keys are additive, so no migration was needed (see the 1.5a log).

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
  const value = await getItem(THEME_KEY);
  if (value === null) return null;
  if (value === 'dark' || value === 'light' || value === 'auto') {
    return value;
  }
  return null;
}

export async function setTheme(theme: ThemeName): Promise<void> {
  await setItem(THEME_KEY, theme);
}

// --- Internal helpers. Both getters and setters funnel through these two
// functions, so the single setStorage() seam is the only way to swap the
// backing client (see 1.5a). getItem/setItem reject on a real storage
// error, exactly like the direct ensureClient() calls above used to. ---

function getItem(key: string): Promise<string | null> {
  return ensureClient().getItem(key);
}

function setItem(key: string, value: string): Promise<void> {
  return ensureClient().setItem(key, value);
}

// --- Profile (Phase 2.1). Additive keys, so no migration: there is no old
// profile shape to migrate from. getProfile reads one namespaced key and
// falls back to DEFAULT_PROFILE for anything it cannot interpret.
//
// Forward-compatibility: JSON with extra fields not in Profile is ignored
// silently, so a future version that adds fields can still be read here.
// Wrong-typed or missing fields fall back per-field to the default.
// Malformed JSON returns DEFAULT_PROFILE rather than throwing.
// A null value from storage also returns DEFAULT_PROFILE (no write).

export interface Profile {
  readonly firstName: string | null;
  readonly surname: string | null;
  readonly avatarUri: string | null;
  readonly onboarded: boolean;
  readonly preferredUpiPackage: string | null;
}

export const PROFILE_KEY = `${PREFIX}:profile`;

export const DEFAULT_PROFILE: Profile = {
  firstName: null,
  surname: null,
  avatarUri: null,
  onboarded: false,
  preferredUpiPackage: null,
};

function coerceProfile(parsed: unknown): Profile {
  const o = (parsed ?? {}) as Record<string, unknown>;
  return {
    firstName: typeof o.firstName === 'string' ? o.firstName : null,
    surname: typeof o.surname === 'string' ? o.surname : null,
    avatarUri: typeof o.avatarUri === 'string' ? o.avatarUri : null,
    onboarded: typeof o.onboarded === 'boolean' ? o.onboarded : false,
    preferredUpiPackage:
      typeof o.preferredUpiPackage === 'string' ? o.preferredUpiPackage : null,
  };
}

export async function getProfile(): Promise<Profile> {
  const raw = await getItem(PROFILE_KEY);
  if (raw == null) return DEFAULT_PROFILE;
  try {
    return coerceProfile(JSON.parse(raw));
  } catch {
    return DEFAULT_PROFILE;
  }
}

export async function setProfile(profile: Profile): Promise<void> {
  await setItem(PROFILE_KEY, JSON.stringify(profile));
}
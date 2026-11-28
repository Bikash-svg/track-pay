// Settings key-value store. The only file in src/data that touches storage.
//
// Theme (dark/light/auto) and profile (firstName, surname, avatarUri,
// onboarded, preferredUpiPackage) live here. Profile was added in Phase 2.1;
// the keys are additive, so no migration was needed (see the 1.5a log).

const PREFIX = 'trackpay:settings';
export const THEME_KEY = `${PREFIX}:theme`;
export const LIMIT_KEY = `${PREFIX}:limit`;
export const REMINDER_TIMES_KEY = `${PREFIX}:reminderTimes`;
export const QUIET_HOURS_KEY = `${PREFIX}:quietHours`;
export const LOCK_SCREEN_DETAILS_KEY = `${PREFIX}:lockScreenDetails`;
export const BACKUP_REMINDER_KEY = `${PREFIX}:backupReminder`;

export type ThemeName = 'dark' | 'light' | 'auto';

// A minimal shape of AsyncStorage the store needs. The real client is the
// default; tests inject a fake through setStorage().
export interface SettingsStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
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

function removeItem(key: string): Promise<void> {
  return ensureClient().removeItem(key);
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

// --- Monthly limit (Step 7.3). Optional: null means no limit. Stored as a
// decimal string of integer paise; an absent or unparsable value means off.
export async function getLimit(): Promise<number | null> {
  const raw = await getItem(LIMIT_KEY);
  if (!raw) return null;
  const val = parseInt(raw, 10);
  return isNaN(val) ? null : val;
}

export async function setLimit(value: number | null): Promise<void> {
  if (value === null) {
    await removeItem(LIMIT_KEY);
  } else {
    await setItem(LIMIT_KEY, String(value));
  }
}

// --- Reminders (Step 7.5). Writes settings only; scheduling is Phase 8.
//
// Daily reminder times default to 10:00, 14:00, 18:00, 21:00 (1-6 times).
// Quiet hours default to 23:00-07:00.
// Lock-screen details default to off.
// Backup reminder defaults to on.
// Limit alerts are always on (read-only row, not a switch).
export type QuietHours = {
  readonly from: string; // "HH:MM"
  readonly to: string; // "HH:MM"
};

const DEFAULT_REMINDER_TIMES = ['10:00', '14:00', '18:00', '21:00'];
const DEFAULT_QUIET_HOURS: QuietHours = { from: '23:00', to: '07:00' };

export async function getReminderTimes(): Promise<string[]> {
  const raw = await getItem(REMINDER_TIMES_KEY);
  if (!raw) return DEFAULT_REMINDER_TIMES;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_REMINDER_TIMES;
  } catch {
    return DEFAULT_REMINDER_TIMES;
  }
}

export async function setReminderTimes(times: string[]): Promise<void> {
  await setItem(REMINDER_TIMES_KEY, JSON.stringify(times));
}

export async function getQuietHours(): Promise<QuietHours> {
  const raw = await getItem(QUIET_HOURS_KEY);
  if (!raw) return DEFAULT_QUIET_HOURS;
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed?.from === 'string' && typeof parsed?.to === 'string') {
      return parsed;
    }
    return DEFAULT_QUIET_HOURS;
  } catch {
    return DEFAULT_QUIET_HOURS;
  }
}

export async function setQuietHours(qh: QuietHours): Promise<void> {
  await setItem(QUIET_HOURS_KEY, JSON.stringify(qh));
}

export async function getLockScreenDetails(): Promise<boolean> {
  const raw = await getItem(LOCK_SCREEN_DETAILS_KEY);
  return raw === 'true';
}

export async function setLockScreenDetails(value: boolean): Promise<void> {
  await setItem(LOCK_SCREEN_DETAILS_KEY, String(value));
}

export async function getBackupReminder(): Promise<boolean> {
  const raw = await getItem(BACKUP_REMINDER_KEY);
  if (raw === null) return true; // default on
  return raw === 'true';
}

export async function setBackupReminder(value: boolean): Promise<void> {
  await setItem(BACKUP_REMINDER_KEY, String(value));
}
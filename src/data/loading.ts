// Single entry point for "is the app ready to render its real screens?".
//
// Step 2.2's splash gate calls exactly this function. Keeping the read in one
// place means the gate has one thing to await, and a future payments store
// (Phase 3) can be added inside here without touching the gate or the route.
//
// "Database" in the 2.2 build line resolves to that Phase 3 payments store,
// which does not exist yet. Today this loads settings/theme and profile only.

import { DEFAULT_PROFILE, type Profile, type ThemeName, getProfile, getTheme } from './settings';

export interface AppData {
  readonly theme: ThemeName | null;
  readonly profile: Profile;
}

// Reads theme and profile in parallel. Never throws: a storage failure or an
// unexpected error falls back to { theme: null, profile: DEFAULT_PROFILE }
// and the gate keeps going (it renders the child with the dark default).
export async function loadAppData(): Promise<AppData> {
  try {
    const [theme, profile] = await Promise.all([getTheme(), getProfile()]);
    return { theme, profile };
  } catch (err) {
    if (__DEV__) console.warn('loadAppData: load failed, using defaults', err);
    return { theme: null, profile: DEFAULT_PROFILE };
  }
}
import {
  getTheme,
  setTheme,
  setStorage,
  THEME_KEY,
  type ThemeName,
  getProfile,
  setProfile,
  DEFAULT_PROFILE,
  PROFILE_KEY,
} from '../settings';

// An in-memory AsyncStorage stand-in. The real client is the native module,
// which is not usable in jest; setStorage() swaps it for this.
function makeStore() {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => Promise.resolve(store.get(key) ?? null),
    setItem: (key: string, value: string) =>
      Promise.resolve(void store.set(key, value)),
    store,
  };
}

describe('settings store', () => {
  beforeEach(() => {
    const fake = makeStore();
    setStorage(fake);
  });

  it('getTheme returns null when nothing is stored', async () => {
    expect(await getTheme()).toBeNull();
  });

  it('round-trips a theme: setTheme then getTheme', async () => {
    await setTheme('light');
    expect(await getTheme()).toBe('light');

    await setTheme('auto');
    expect(await getTheme()).toBe('auto');

    await setTheme('dark');
    expect(await getTheme()).toBe('dark');
  });

  it('returns null for an invalid stored value', async () => {
    const fake = makeStore();
    setStorage(fake);
    await fake.store.set(THEME_KEY, 'not-a-theme');
    expect(await getTheme()).toBeNull();
  });

  it('namespaces the theme key', () => {
    expect(THEME_KEY).toBe('trackpay:settings:theme');
  });

  it('getProfile returns DEFAULT_PROFILE when nothing is stored', async () => {
    expect(await getProfile()).toEqual(DEFAULT_PROFILE);
  });

  it('setProfile + getProfile round-trip preserves all five fields', async () => {
    const profile = {
      firstName: 'Bikash',
      surname: 'Murmu',
      avatarUri: null,
      onboarded: true,
      preferredUpiPackage: 'com.phonepe.app',
    };
    await setProfile(profile);
    expect(await getProfile()).toEqual(profile);

    await setProfile(DEFAULT_PROFILE);
    expect(await getProfile()).toEqual(DEFAULT_PROFILE);
  });

  it('getProfile returns DEFAULT_PROFILE for invalid JSON at PROFILE_KEY', async () => {
    const fake = makeStore();
    setStorage(fake);
    await fake.store.set(PROFILE_KEY, 'not-json');
    expect(await getProfile()).toEqual(DEFAULT_PROFILE);
  });

  it('getProfile falls back to defaults for missing or wrong-typed fields', async () => {
    const fake = makeStore();
    setStorage(fake);
    await fake.store.set(
      PROFILE_KEY,
      JSON.stringify({
        firstName: 123, // wrong type -> null
        // surname missing -> null
        onboarded: 'yes', // wrong type -> false
        extraField: 'ignored', // forward-compat: unknown fields are dropped
      }),
    );
    expect(await getProfile()).toEqual({
      firstName: null,
      surname: null,
      avatarUri: null,
      onboarded: false,
      preferredUpiPackage: null,
    });
  });

  it('theme and profile keys do not collide', async () => {
    await setTheme('light');
    await setProfile({
      firstName: 'Bikash',
      surname: null,
      avatarUri: null,
      onboarded: true,
      preferredUpiPackage: null,
    });
    expect(await getTheme()).toBe('light');
    expect(await getProfile()).toEqual({
      firstName: 'Bikash',
      surname: null,
      avatarUri: null,
      onboarded: true,
      preferredUpiPackage: null,
    });
  });
});
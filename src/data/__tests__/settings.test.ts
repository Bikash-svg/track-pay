import {
  getTheme,
  setTheme,
  setStorage,
  THEME_KEY,
  type ThemeName,
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
});
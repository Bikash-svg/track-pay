import {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { dark, light, type Theme } from './theme';
import { getTheme, setTheme as setThemeInStorage, type ThemeName } from '../data/settings';

// Direct UI -> Data import is a temporary 1.5 shortcut. The canonical path is
// UI -> Stores -> Domain -> Data; stores for settings are not built yet.
// Revisit when src/stores lands (Phase 2.1 or 3).

type EffectiveTheme = 'dark' | 'light';

interface ThemeContextValue {
  readonly theme: ThemeName;
  readonly effectiveTheme: EffectiveTheme;
  readonly tokens: Theme['dark'];
  readonly setTheme: (next: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { readonly children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>('dark'); // D4 default
  const osScheme = useColorScheme(); // always called; re-renders only on OS change

  const effectiveTheme: EffectiveTheme =
    theme === 'auto' ? (osScheme === 'light' ? 'light' : 'dark') : theme;

  const tokens = useMemo(() => (effectiveTheme === 'dark' ? dark : light), [effectiveTheme]);

  // First-mount seed. A one-frame flash is possible if the stored value is
  // non-dark; Step 2.2 (splash gate) will hold the app until settings load,
  // eliminating it.
  const seed = useRef(false);
  useEffect(() => {
    if (seed.current) return;
    seed.current = true;
    (async () => {
      try {
        const stored = await getTheme();
        if (stored == null) {
          await setThemeInStorage('dark'); // persist the D4 default explicitly
        } else {
          setThemeState(stored);
        }
      } catch {
        // Storage failed: keep the in-memory 'dark' default. Never crash.
        if (__DEV__) console.warn('theme seed: storage read failed, defaulting to dark');
      }
    })();
  }, []);

  const setTheme = useCallback(
    (next: ThemeName) => {
      if (next === theme) return; // no-op guard
      setThemeState(next);
      setThemeInStorage(next).catch((err) => {
        // Storage write is fire-and-forget; surface the rejection in the dev
        // log instead of letting it become an unhandled rejection.
        if (__DEV__) console.warn('setTheme: storage write failed', err);
      });
    },
    [theme],
  );

  return (
    <ThemeContext.Provider value={{ theme, effectiveTheme, tokens, setTheme }}>
      {children}
      <StatusBar style={effectiveTheme === 'dark' ? 'light' : 'dark'} />
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (ctx === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
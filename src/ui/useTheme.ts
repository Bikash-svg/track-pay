import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { dark, light, type Theme } from './theme';

type ThemeName = 'dark' | 'light';

interface ThemeContextValue {
  readonly theme: ThemeName;
  readonly tokens: Theme['dark'];
  readonly setTheme: (next: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { readonly children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeName>('dark');
  const tokens = useMemo(() => (theme === 'dark' ? dark : light), [theme]);
  return (
    <ThemeContext.Provider value={{ theme, tokens, setTheme }}>
      {children}
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

import React, { useState } from 'react';
import type { ReactNode } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { loadAppData } from '../data/loading';
import { Splash } from './Splash';

// Step 2.2's gate. Renders <Splash> until loadAppData() resolves, then
// renders the children. Extracted from the root layout so the gate itself
// is unit-testable (a test can mount <SplashGate> and control the mock).

// The OS splash is held by app/_layout.tsx's module-scope
// preventAutoHideAsync() call; this component hides it as soon as the gate
// resolves. hideAsync fires on both the success and the failure path, so the
// OS splash can never be left up on a load failure.
export function SplashGate({ children }: { readonly children: ReactNode }) {
  const [loaded, setLoaded] = useState(false);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadAppData();
      } catch (err) {
        if (__DEV__) console.warn('SplashGate: load failed, rendering anyway', err);
      } finally {
        if (!cancelled) setLoaded(true);
        // Always hide the OS splash, whatever happened above.
        await SplashScreen.hideAsync().catch(() => {});
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return loaded ? <>{children}</> : <Splash />;
}
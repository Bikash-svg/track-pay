import React, { createContext, useContext, useState } from 'react';
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

// SplashGate only gates loading. The onboarded branch (2.4) is enforced
// inside app/(tabs)/_layout.tsx, where the Stack is guaranteed mounted --
// returning <Redirect> instead of <Stack> at this level stalls navigation
// (the redirect fires into no mounted navigator) and loops the splash.
// The flag is exposed through context so the tab layout can consume it.
//
// The context is settable on purpose. onboarding writes onboarded=true back
// here (setOnboarded) right after setProfile resolves and before
// router.replace('/'), so the tabs layout re-renders with onboarded=true and
// renders <Tabs> instead of bouncing back to <Redirect>. Without that write
// the data layer has onboarded=true but the React state still reads false.

interface OnboardedValue {
  readonly onboarded: boolean;
  readonly setOnboarded: (next: boolean) => void;
}

const OnboardedContext = createContext<OnboardedValue | null>(null);

function useOnboardedContext(): OnboardedValue {
  const ctx = useContext(OnboardedContext);
  if (ctx === null) {
    throw new Error('useOnboarded must be used within a SplashGate');
  }
  return ctx;
}

export function useOnboarded(): boolean {
  return useOnboardedContext().onboarded;
}

export function useSetOnboarded(): (next: boolean) => void {
  return useOnboardedContext().setOnboarded;
}

export function SplashGate({ children }: { readonly children: ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  // 2.4's onboarded branch. Defaults to false, which is the correct first-launch
  // answer: DEFAULT_PROFILE.onboarded === false, so a failed load still routes
  // to onboarding rather than straight into Home.
  const [onboarded, setOnboardedState] = useState(false);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await loadAppData();
        if (!cancelled) setOnboardedState(data.profile.onboarded);
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

  return loaded ? (
    <OnboardedContext.Provider
      value={{ onboarded, setOnboarded: setOnboardedState }}
    >
      {children}
    </OnboardedContext.Provider>
  ) : (
    <Splash />
  );
}
import React from 'react';
const rtr = require('react-test-renderer');
const { act, create } = rtr;
import { Text } from '../Text';
import { ThemeProvider } from '../useTheme';
import { SplashGate, useOnboarded, useSetOnboarded } from '../SplashGate';

// The gate's contract (2.2 + 2.4): render <Splash> until loadAppData()
// resolves, always hide the OS splash -- including when the load fails -- and
// then expose the onboarded flag through a settable context. The 2.4 branch
// itself (returning <Redirect> from the tab layout) is device-verified: it
// needs a mounted navigator, which this isolated test has not got.
//
// The child carries a marker string rather than the bare word "child": the
// rendered tree always contains the JSON key "children", so asserting on
// "child" alone is a false positive.

jest.mock('../../data/loading', () => ({
  loadAppData: jest.fn(),
}));
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(),
  // hideAsync returns a Promise in production; the mock must too, because the
  // gate calls hideAsync().catch(() => {}).
  hideAsync: jest.fn().mockResolvedValue(undefined),
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { loadAppData } = require('../../data/loading') as {
  loadAppData: jest.Mock;
};
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { hideAsync } = require('expo-splash-screen') as {
  hideAsync: jest.Mock;
};

const ONBOARDED_PROFILE = {
  firstName: null,
  surname: null,
  avatarUri: null,
  onboarded: true,
  preferredUpiPackage: null,
};

const NOT_ONBOARDED_PROFILE = {
  firstName: null,
  surname: null,
  avatarUri: null,
  onboarded: false,
  preferredUpiPackage: null,
};

const ONBOARDED_APPDATA = { theme: null, profile: ONBOARDED_PROFILE };
const NOT_ONBOARDED_APPDATA = { theme: null, profile: NOT_ONBOARDED_PROFILE };

const CHILD_MARKER = '__CHILD_MARKER__';

function renderGate() {
  let root: any;
  act(() => {
    root = create(
      <ThemeProvider>
        <SplashGate>
          <Text>{CHILD_MARKER}</Text>
        </SplashGate>
      </ThemeProvider>,
    );
  });
  return root;
}

async function flush() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe('SplashGate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the splash and not the child while load is pending', async () => {
    let resolve: () => void = () => {};
    const pending = new Promise<void>((r) => {
      resolve = r;
    });
    loadAppData.mockReturnValue(pending);
    const root = renderGate();
    const json = JSON.stringify(root.toJSON());
    expect(json).toContain('Track Pay');
    expect(json).not.toContain(CHILD_MARKER);
    expect(hideAsync).not.toHaveBeenCalled();
    // Resolve and flush so the effect completes and no handle is left open.
    resolve();
    await flush();
  });

  it('renders the child and hides the splash after a successful onboarded load', async () => {
    loadAppData.mockResolvedValue(ONBOARDED_APPDATA);
    const root = renderGate();
    await flush();
    const json = JSON.stringify(root.toJSON());
    expect(json).toContain(CHILD_MARKER);
    expect(json).not.toContain('Track Pay');
    expect(hideAsync).toHaveBeenCalledTimes(1);
  });

  it('exposes onboarded=true and a working setOnboarded after an onboarded load', async () => {
    loadAppData.mockResolvedValue(ONBOARDED_APPDATA);
    let observed: { onboarded: boolean; set: (v: boolean) => void } = {
      onboarded: false,
      set: () => {},
    };
    function Probe() {
      observed.onboarded = useOnboarded();
      observed.set = useSetOnboarded();
      return null;
    }
    let root: any;
    act(() => {
      root = create(
        <ThemeProvider>
          <SplashGate>
            <Probe />
          </SplashGate>
        </ThemeProvider>,
      );
    });
    await flush();
    expect(observed.onboarded).toBe(true);
    expect(typeof observed.set).toBe('function');
    // Writing back (as onboarding does after setProfile resolves) flips the
    // value so the tabs layout re-renders instead of bouncing to <Redirect>.
    act(() => {
      observed.set(false);
    });
    expect(observed.onboarded).toBe(false);
  });

  it('exposes onboarded=false when the profile is not onboarded', async () => {
    loadAppData.mockResolvedValue(NOT_ONBOARDED_APPDATA);
    let observed = false;
    function Probe() {
      observed = useOnboarded();
      return null;
    }
    let root: any;
    act(() => {
      root = create(
        <ThemeProvider>
          <SplashGate>
            <Probe />
          </SplashGate>
        </ThemeProvider>,
      );
    });
    await flush();
    expect(observed).toBe(false);
  });

  it('still hides the splash when the load rejects', async () => {
    loadAppData.mockRejectedValue(new Error('boom'));
    const root = renderGate();
    await flush();
    const json = JSON.stringify(root.toJSON());
    // A failed load leaves onboarded at its default (false) and the OS splash
    // is still hidden.
    expect(json).not.toContain('Track Pay');
    expect(json).toContain(CHILD_MARKER);
    expect(hideAsync).toHaveBeenCalledTimes(1);
  });
});
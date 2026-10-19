import React from 'react';
const rtr = require('react-test-renderer');
const { act, create } = rtr;
import { Text } from '../Text';
import { ThemeProvider } from '../useTheme';
import { SplashGate } from '../SplashGate';

// The gate's contract: render children only after loadAppData() resolves,
// and always hide the OS splash — including when the load fails. This is the
// unit half of Step 2.2; O1 and D7 (airplane mode, no empty Home first) are
// device checks and are not claimed here.
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

  it('renders the child and hides the splash after a successful load', async () => {
    loadAppData.mockResolvedValue({
      theme: null,
      profile: {
        firstName: null,
        surname: null,
        avatarUri: null,
        onboarded: false,
        preferredUpiPackage: null,
      },
    });
    const root = renderGate();
    await flush();
    const json = JSON.stringify(root.toJSON());
    expect(json).toContain(CHILD_MARKER);
    expect(json).not.toContain('Track Pay');
    expect(hideAsync).toHaveBeenCalledTimes(1);
  });

  it('still renders the child and hides the splash when the load rejects', async () => {
    loadAppData.mockRejectedValue(new Error('boom'));
    const root = renderGate();
    await flush();
    const json = JSON.stringify(root.toJSON());
    expect(json).toContain(CHILD_MARKER);
    expect(hideAsync).toHaveBeenCalledTimes(1);
  });
});
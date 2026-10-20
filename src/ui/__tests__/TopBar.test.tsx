import React from 'react';
const rtr = require('react-test-renderer');
const { act, create } = rtr;
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '../useTheme';
import { PendingCountProvider, usePendingCount } from '../PendingCountProvider';
import { TopBar } from '../TopBar';

// TopBar calls router.push on tap; the navigation itself is device-verified
// (device check 6/7). Here we only render, so the router is a stub.
jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
}));

function render(node: React.ReactNode) {
  let root: any;
  act(() => {
    root = create(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 392, height: 844 },
          insets: { top: 24, right: 0, bottom: 0, left: 0 },
        }}
      >
        <ThemeProvider>
          <PendingCountProvider>{node}</PendingCountProvider>
        </ThemeProvider>
      </SafeAreaProvider>,
    );
  });
  return root;
}

describe('TopBar', () => {
  it('renders the app name and Profile, and hides the badge at zero', () => {
    const root = render(<TopBar />);
    const json = JSON.stringify(root.toJSON());
    // App name (left) and Profile button (right) always render.
    expect(json).toContain('Track Pay');
    expect(json).toContain('Profile');
    // The bell always renders; at zero there is no "0" badge.
    expect(json).toContain('🔔');
    expect(json).not.toContain('🔔 0');
  });

  it('shows the pending count on the bell when set above zero', () => {
    let setCount: (n: number) => void = () => {};
    function Probe() {
      const { setPendingCount } = usePendingCount();
      setCount = setPendingCount;
      return null;
    }
    // Probe writes the context; TopBar reads it. Both share one tree.
    const root = render(
      <>
        <Probe />
        <TopBar />
      </>,
    );
    act(() => {
      setCount(3);
    });
    const json = JSON.stringify(root.toJSON());
    expect(json).toContain('🔔 3');
  });

  it('exposes accessibility labels on the bell and Profile', () => {
    const root = render(<TopBar />);
    const json = JSON.stringify(root.toJSON());
    // Bell label carries the pending count; Profile is labelled "Profile".
    expect(json).toContain('accessibilityLabel":"Notifications, 0 pending"');
    expect(json).toContain('accessibilityLabel":"Profile"');
  });
});
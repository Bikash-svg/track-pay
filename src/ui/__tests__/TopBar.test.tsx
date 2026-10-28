import React from 'react';
const rtr = require('react-test-renderer');
const { act, create } = rtr;
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '../useTheme';
import { PendingCountProvider } from '../PendingCountProvider';
import { TopBar } from '../TopBar';

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
  it('renders the app name and Profile button', () => {
    const root = render(<TopBar />);
    const json = JSON.stringify(root.toJSON());
    expect(json).toContain('Track Pay');
    expect(json).toContain('Profile');
  });

  it('exposes an accessibility label on the Profile button', () => {
    const root = render(<TopBar />);
    const json = JSON.stringify(root.toJSON());
    expect(json).toContain('accessibilityLabel":"Profile"');
  });

  it('does not render a bell (removed in Step 4-B.0)', () => {
    const root = render(<TopBar />);
    const json = JSON.stringify(root.toJSON());
    expect(json).not.toContain('🔔');
  });
});
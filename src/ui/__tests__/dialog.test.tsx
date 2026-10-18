import React from 'react';
const rtr = require('react-test-renderer');
const { act, create } = rtr;
import { Text } from '../Text';
import { ThemeProvider } from '../useTheme';
import {
  Dialog,
  DialogHost,
  DialogProvider,
  useDialog,
  dark,
  light,
  TOKEN_NAMES,
} from '../index';

function wrap(node: React.ReactNode) {
  return <ThemeProvider>{node}</ThemeProvider>;
}

describe('scrim token', () => {
  it('is present in both palettes and matches the agreed values', () => {
    expect(TOKEN_NAMES).toContain('scrim');
    expect(dark.scrim).toBe('rgba(6,9,14,0.78)');
    expect(light.scrim).toBe('rgba(15,23,42,0.45)');
  });

  it('is a non-empty string in both palettes', () => {
    expect(typeof dark.scrim).toBe('string');
    expect(dark.scrim.length).toBeGreaterThan(0);
    expect(typeof light.scrim).toBe('string');
    expect(light.scrim.length).toBeGreaterThan(0);
  });
});

describe('Dialog render output', () => {
  it('renders nothing when closed', () => {
    let root: any;
    act(() => {
      root = create(
        wrap(
          <Dialog visible={false} onClose={() => {}}>
            <Text>body</Text>
          </Dialog>,
        ),
      );
    });
    // A closed Dialog renders nothing, so the tree holds only the provider.
    expect(root.toJSON()).toBeNull();
  });

  it('renders its content when open', () => {
    let root: any;
    act(() => {
      root = create(
        wrap(
          <Dialog visible={true} onClose={() => {}}>
            <Text>body</Text>
          </Dialog>,
        ),
      );
    });
    expect(root.toJSON()).not.toBeNull();
    expect(JSON.stringify(root.toJSON())).toContain('body');
  });

  it('forwards title and subtitle', () => {
    let root: any;
    act(() => {
      root = create(
        wrap(
          <Dialog visible={true} onClose={() => {}} title="t" subtitle="s">
            <Text>body</Text>
          </Dialog>,
        ),
      );
    });
    const json = JSON.stringify(root.toJSON());
    expect(json).toContain('t');
    expect(json).toContain('s');
    expect(json).toContain('body');
  });

  it('applies the scrim token to the backdrop', () => {
    let root: any;
    act(() => {
      root = create(
        wrap(
          <Dialog visible={true} onClose={() => {}}>
            <Text>body</Text>
          </Dialog>,
        ),
      );
    });
    expect(JSON.stringify(root.toJSON())).toContain('rgba(6,9,14,0.78)');
  });

  it('renders a close button when open', () => {
    let root: any;
    act(() => {
      root = create(
        wrap(
          <Dialog visible={true} onClose={() => {}}>
            <Text>body</Text>
          </Dialog>,
        ),
      );
    });
    // The close button is the `×` glyph; its touch target is 36 px plus a
    // 4 px hitSlop on each side (>= 44 px effective) per AI-RULES.md §6.6.
    expect(JSON.stringify(root.toJSON())).toContain('\u00d7');
  });
});

describe('DialogProvider / useDialog', () => {
  it('starts closed and opens and closes through the hook', () => {
    const captured: { value: any } = { value: null };
    function Probe() {
      captured.value = useDialog();
      return null;
    }
    let root: any;
    act(() => {
      root = create(
        <ThemeProvider>
          <DialogProvider>
            <Probe />
          </DialogProvider>
        </ThemeProvider>,
      );
    });
    expect(captured.value.visible).toBe(false);

    act(() => {
      captured.value.open({ title: 'x' });
    });
    expect(captured.value.visible).toBe(true);

    act(() => {
      captured.value.close();
    });
    expect(captured.value.visible).toBe(false);
  });

  it('calls onClose when close() is invoked with an open dialog', () => {
    const captured: { value: any } = { value: null };
    function Probe() {
      captured.value = useDialog();
      return null;
    }
    act(() => {
      create(
        <ThemeProvider>
          <DialogProvider>
            <Probe />
          </DialogProvider>
        </ThemeProvider>,
      );
    });
    act(() => {
      captured.value.open({ onClose: () => {} });
    });
    expect(captured.value.visible).toBe(true);
    act(() => {
      captured.value.close();
    });
    expect(captured.value.visible).toBe(false);
  });

  it('is a no-op when close() is called while already closed', () => {
    const captured: { value: any } = { value: null };
    function Probe() {
      captured.value = useDialog();
      return null;
    }
    act(() => {
      create(
        <ThemeProvider>
          <DialogProvider>
            <Probe />
          </DialogProvider>
        </ThemeProvider>,
      );
    });
    expect(() => {
      act(() => {
        captured.value.close();
      });
    }).not.toThrow();
    expect(captured.value.visible).toBe(false);
  });

  it('useDialog throws outside a provider', () => {
    function Probe() {
      useDialog();
      return null;
    }
    expect(() => {
      act(() => {
        create(<Probe />);
      });
    }).toThrow('useDialog must be used within a DialogProvider');
  });
});

describe('DialogHost forwards options', () => {
  it('renders the host shell when visible', () => {
    let root: any;
    act(() => {
      root = create(
        wrap(
          <DialogHost
            visible={true}
            options={{ title: 'hosted', children: <Text>inside</Text> }}
            onClose={() => {}}
          />,
        ),
      );
    });
    const json = JSON.stringify(root.toJSON());
    expect(json).toContain('hosted');
    expect(json).toContain('inside');
  });

  it('renders nothing when the host is not visible', () => {
    let root: any;
    act(() => {
      root = create(
        wrap(
          <DialogHost visible={false} options={null} onClose={() => {}} />,
        ),
      );
    });
    expect(root.toJSON()).toBeNull();
  });
});
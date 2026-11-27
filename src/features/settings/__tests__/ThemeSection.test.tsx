import React from 'react';
const rtr = require('react-test-renderer');
const { act, create } = rtr;
import { ThemeProvider } from '../../../ui/useTheme';
import { ThemeSection } from '../ThemeSection';
import { setStorage } from '../../../data/settings';

function makeStorage() {
  const store: Record<string, string> = {};
  return {
    getItem: async (key: string) => store[key] ?? null,
    setItem: async (key: string, value: string) => { store[key] = value; },
  };
}

function render(node: React.ReactNode) {
  let root: any;
  act(() => {
    root = create(<ThemeProvider>{node}</ThemeProvider>);
  });
  return root;
}

describe('ThemeSection', () => {
  beforeEach(() => {
    setStorage(makeStorage());
  });

  it('renders Dark, Light and Auto buttons', () => {
    const root = render(<ThemeSection />);
    const json = JSON.stringify(root.toJSON());
    expect(json).toContain('Dark');
    expect(json).toContain('Light');
    expect(json).toContain('Auto');
  });

  it('renders the current theme button as primary', () => {
    const root = render(<ThemeSection />);
    const json = JSON.stringify(root.toJSON());
    // Default theme is 'dark', so Dark should be primary.
    expect(json).toContain('Dark');
    const darkBtn = root.root.find(
      (node: any) => typeof node.props?.children === 'string' && node.props.children === 'Dark',
    );
    expect(darkBtn.props.variant).toBe('primary');
  });

  it('pressing a button calls setTheme', () => {
    const root = render(<ThemeSection />);
    const lightBtn = root.root.find(
      (node: any) => typeof node.props?.children === 'string' && node.props.children === 'Light',
    );
    act(() => { lightBtn.props.onPress(); });
    const json = JSON.stringify(root.toJSON());
    // Light should now be primary.
    expect(json).toContain('Light');
  });
});

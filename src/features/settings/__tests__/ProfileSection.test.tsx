import React from 'react';
const rtr = require('react-test-renderer');
const { act, create } = rtr;
import { ThemeProvider } from '../../../ui/useTheme';
import { ProfileSection } from '../ProfileSection';
import { setStorage } from '../../../data/settings';

function makeStorage() {
  const store: Record<string, string> = {};
  return {
    getItem: async (key: string) => store[key] ?? null,
    setItem: async (key: string, value: string) => { store[key] = value; },
    removeItem: async (key: string) => { delete store[key]; },
  };
}

function render(node: React.ReactNode) {
  let root: any;
  act(() => {
    root = create(<ThemeProvider>{node}</ThemeProvider>);
  });
  return root;
}

describe('ProfileSection', () => {
  beforeEach(() => {
    setStorage(makeStorage());
  });

  it('renders loading then profile', async () => {
    const root = render(<ProfileSection />);
    // Wait for async load
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    const json = JSON.stringify(root.toJSON());
    expect(json).toContain('No name set');
  });

  it('shows edit button', async () => {
    const root = render(<ProfileSection />);
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    const json = JSON.stringify(root.toJSON());
    expect(json).toContain('Edit profile');
  });

  // Collect the plain-text children of a node without stringifying the whole
  // ReactTestInstance (which contains circular context references).
  function nodeText(node: any): string {
    if (typeof node === 'string') return node;
    if (!node || typeof node !== 'object') return '';
    if (typeof node.props?.children === 'string') return node.props.children;
    let out = '';
    const kids = Array.isArray(node.props?.children) ? node.props.children : [node.props?.children];
    for (const k of kids) out += nodeText(k);
    return out;
  }

  it('enters edit mode on button press', async () => {
    const root = render(<ProfileSection />);
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    const editBtn = root.root.find(
      (node: any) =>
        typeof node.props?.onPress === 'function' && nodeText(node).includes('Edit profile'),
    );
    expect(editBtn).toBeTruthy();
    act(() => { editBtn.props.onPress(); });
    const json = JSON.stringify(root.toJSON());
    expect(json).toContain('First name');
    expect(json).toContain('Surname');
  });
});

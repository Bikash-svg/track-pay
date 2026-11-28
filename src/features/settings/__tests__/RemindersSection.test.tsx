import React from 'react';
const rtr = require('react-test-renderer');
const { act, create } = rtr;
import { TextInput, Switch } from 'react-native';
import { ThemeProvider } from '../../../ui/useTheme';
import { RemindersSection } from '../RemindersSection';
import { setStorage } from '../../../data/settings';

let store: Record<string, string> = {};

function makeStorage() {
  store = {};
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

function allText(root: any): string {
  return root.root
    .findAll(
      (node: any) => typeof node.type === 'string' && node.type === 'Text',
      { deep: true },
    )
    .map((node: any) =>
      Array.isArray(node.props.children)
        ? node.props.children.join('')
        : String(node.props.children ?? ''),
    )
    .join(' | ');
}

function findFirstSwitch(root: any): any {
  const switches = root.root.findAll(
    (node: any) => node.type === Switch && typeof node.props?.onValueChange === 'function',
  );
  expect(switches.length).toBeGreaterThan(0);
  return switches[0];
}

describe('RemindersSection', () => {
  beforeEach(() => {
    setStorage(makeStorage());
    jest.clearAllMocks();
  });

  it('renders daily reminders switch', () => {
    const root = render(<RemindersSection />);
    const text = allText(root);
    expect(text).toContain('Daily reminders');
    const switcher = findFirstSwitch(root);
    expect(switcher).toBeTruthy();
  });

  it('default times are 10:00, 14:00, 18:00, 21:00', async () => {
    const root = render(<RemindersSection />);
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    const text = allText(root);
    expect(text).toContain('10:00');
    expect(text).toContain('14:00');
    expect(text).toContain('18:00');
    expect(text).toContain('21:00');
  });

  it('toggle off hides time pills', async () => {
    const root = render(<RemindersSection />);
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    const switcher = findFirstSwitch(root);
    act(() => { switcher.props.onValueChange(false); });
    const text = allText(root);
    expect(text).not.toContain('10:00');
    expect(text).not.toContain('14:00');
    expect(text).not.toContain('18:00');
    expect(text).not.toContain('21:00');
  });

  it('quiet hours renders default times', async () => {
    const root = render(<RemindersSection />);
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    const text = allText(root);
    expect(text).toContain('23:00');
    expect(text).toContain('07:00');
  });

  it('limit alerts row shows always on', async () => {
    const root = render(<RemindersSection />);
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    const text = allText(root);
    expect(text).toContain('Limit alerts at 80% and 100% are always on while a limit is set.');
  });

  it('add time button renders', () => {
    const root = render(<RemindersSection />);
    const text = allText(root);
    expect(text).toContain('Add time');
  });
});

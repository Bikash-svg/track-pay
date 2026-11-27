import React from 'react';
const rtr = require('react-test-renderer');
const { act, create } = rtr;
import { TextInput, Switch } from 'react-native';
import { ThemeProvider } from '../../../ui/useTheme';
import { LimitSection } from '../LimitSection';
import { setStorage, LIMIT_KEY } from '../../../data/settings';

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

describe('LimitSection', () => {
  beforeEach(() => {
    setStorage(makeStorage());
  });

  it('renders switch with limit off by default', () => {
    const root = render(<LimitSection />);
    const text = allText(root);
    expect(text).toContain('Limit per month');
    expect(text).not.toContain('+₹2,000');
  });

  it('toggle on shows input and quick steps', () => {
    const root = render(<LimitSection />);
    const switcher = root.root.find(
      (node: any) => node.type === Switch && typeof node.props?.onValueChange === 'function',
    );
    act(() => { switcher.props.onValueChange(true); });
    const text = allText(root);
    expect(text).toContain('+₹2,000');
    expect(text).toContain('+₹5,000');
    expect(text).toContain('−₹1,000');
  });

  it('quick step then save stores correct paise', () => {
    const root = render(<LimitSection />);
    const switcher = root.root.find(
      (node: any) => node.type === Switch && typeof node.props?.onValueChange === 'function',
    );
    act(() => { switcher.props.onValueChange(true); });
    const plus2k = root.root.find(
      (node: any) =>
        typeof node.props?.onPress === 'function' && nodeText(node).includes('+₹2,000'),
    );
    act(() => { plus2k.props.onPress(); });
    const saveBtn = root.root.find(
      (node: any) =>
        typeof node.props?.onPress === 'function' && nodeText(node).includes('Save'),
    );
    act(() => { saveBtn.props.onPress(); });
    return new Promise<void>((resolve) => {
      setTimeout(async () => {
        expect(store[LIMIT_KEY]).toBe('200000');
        resolve();
      }, 50);
    });
  });

  it('quick step updates the input value', () => {
    const root = render(<LimitSection />);
    const switcher = root.root.find(
      (node: any) => node.type === Switch && typeof node.props?.onValueChange === 'function',
    );
    act(() => { switcher.props.onValueChange(true); });

    // Find the TextInput host component and read its value prop
    const findInput = () =>
      root.root.find((node: any) => node.type === TextInput);

    let textInput = findInput();
    expect(textInput.props.value).toBe('0');

    const plus2k = root.root.find(
      (node: any) =>
        typeof node.props?.onPress === 'function' && nodeText(node).includes('+₹2,000'),
    );
    act(() => { plus2k.props.onPress(); });
    textInput = findInput();
    expect(textInput.props.value).toBe('2000');

    const plus5k = root.root.find(
      (node: any) =>
        typeof node.props?.onPress === 'function' && nodeText(node).includes('+₹5,000'),
    );
    act(() => { plus5k.props.onPress(); });
    textInput = findInput();
    expect(textInput.props.value).toBe('7000');

    const minus1k = root.root.find(
      (node: any) =>
        typeof node.props?.onPress === 'function' && nodeText(node).includes('−₹1,000'),
    );
    act(() => { minus1k.props.onPress(); });
    textInput = findInput();
    expect(textInput.props.value).toBe('6000');
  });

  it('toggle off removes the stored limit', async () => {
    const root = render(<LimitSection />);
    const switcher = root.root.find(
      (node: any) => node.type === Switch && typeof node.props?.onValueChange === 'function',
    );
    act(() => { switcher.props.onValueChange(true); });
    act(() => { switcher.props.onValueChange(false); });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    expect(store[LIMIT_KEY]).toBeUndefined();
  });
});

import React from 'react';
const rtr = require('react-test-renderer');
const { act, create } = rtr;
import { Alert } from 'react-native';
import { ThemeProvider } from '../../../ui/useTheme';
import { DataSection } from '../DataSection';
import { setStorage } from '../../../data/settings';
import { setPaymentsSeed, PaymentsProvider } from '../../../data/payments';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';

// Mock expo-file-system/legacy
jest.mock('expo-file-system/legacy', () => ({
  cacheDirectory: 'file:///data/user/0/com.bkas.trackpay/cache/',
  writeAsStringAsync: jest.fn().mockResolvedValue(undefined),
  readAsStringAsync: jest.fn().mockResolvedValue(''),
}));

// Mock expo-document-picker
jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn().mockResolvedValue({ canceled: true, assets: [] }),
}));

// Mock async-storage (used by payments.tsx)
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

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
    root = create(
      <ThemeProvider>
        <PaymentsProvider>{node}</PaymentsProvider>
      </ThemeProvider>
    );
  });
  return root;
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

describe('DataSection', () => {
  beforeEach(() => {
    setStorage(makeStorage());
    setPaymentsSeed([]);
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders Export, Import and PDF buttons', () => {
    const root = render(<DataSection />);
    const text = allText(root);
    expect(text).toContain('Export data');
    expect(text).toContain('Import data');
    expect(text).toContain('Monthly PDF statement');
  });

  it('renders last export time', () => {
    const root = render(<DataSection />);
    const text = allText(root);
    expect(text).toContain('Last export:');
    expect(text).toContain('Never');
  });

  it('export shows warning dialog', () => {
    const root = render(<DataSection />);
    const exportBtn = root.root.find(
      (node: any) =>
        typeof node.props?.onPress === 'function' &&
        typeof node.props?.children === 'string' &&
        node.props.children === 'Export data',
    );
    act(() => { exportBtn.props.onPress(); });
    const alertMock = Alert.alert as jest.Mock;
    expect(alertMock).toHaveBeenCalled();
    const [title, message] = alertMock.mock.calls[0];
    expect(title).toContain('Export data');
    expect(message).toContain('not encrypted');
  });

  it('import with invalid file shows error', async () => {
    (DocumentPicker.getDocumentAsync as any).mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: 'file:///invalid.json' }],
    });
    (FileSystem.readAsStringAsync as any).mockResolvedValueOnce('not valid json');

    const root = render(<DataSection />);
    const importBtn = root.root.find(
      (node: any) =>
        typeof node.props?.onPress === 'function' &&
        typeof node.props?.children === 'string' &&
        node.props.children === 'Import data',
    );
    act(() => { importBtn.props.onPress(); });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    const alertMock = Alert.alert as jest.Mock;
    expect(alertMock).toHaveBeenCalledWith(
      'Error',
      'This file could not be read. Nothing was changed.',
    );
  });

  it('import with newer schema version is refused', async () => {
    (DocumentPicker.getDocumentAsync as any).mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: 'file:///newer.json' }],
    });
    (FileSystem.readAsStringAsync as any).mockResolvedValueOnce(
      JSON.stringify({ version: 999, payments: [], exportedAt: Date.now() }),
    );

    const root = render(<DataSection />);
    const importBtn = root.root.find(
      (node: any) =>
        typeof node.props?.onPress === 'function' &&
        typeof node.props?.children === 'string' &&
        node.props.children === 'Import data',
    );
    act(() => { importBtn.props.onPress(); });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    const alertMock = Alert.alert as jest.Mock;
    expect(alertMock).toHaveBeenCalledWith(
      'Error',
      'This file is from a newer version of Track Pay',
    );
  });
});

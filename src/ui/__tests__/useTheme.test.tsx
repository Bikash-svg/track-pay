import React from 'react';
const rtr = require('react-test-renderer');
const { act, create } = rtr;

// jest-expo mocks useColorScheme for us
// (react-native/jest/setup.js:122 -> mocks/useColorScheme.js, returns 'light').
const rn = require('react-native');
const useColorSchemeMock = rn.useColorScheme as unknown as jest.Mock;

import { ThemeProvider, useTheme } from '../useTheme';
import { dark, light } from '../theme';
import * as Settings from '../../data/settings';

// The real client needs the native module, which jest does not have, so the
// settings calls the seed and the toggles make are faked here.
jest.mock('../../data/settings', () => ({
  getTheme: jest.fn(),
  setTheme: jest.fn(),
}));

const getThemeMock = jest.mocked(Settings.getTheme);
const setThemeInStorageMock = jest.mocked(Settings.setTheme);
// The real setTheme is async and always resolves; mirror that so the
// fire-and-forget .catch() in useTheme has a Promise to attach to.
// (mockReset() in beforeEach wipes this, so it is re-applied there.)
function resetSettingsMocks() {
  getThemeMock.mockReset();
  setThemeInStorageMock.mockReset();
  setThemeInStorageMock.mockResolvedValue(undefined);
}

function makeProbe() {
  let captured: any;
  function Probe() {
    captured = useTheme();
    return null;
  }
  return { Probe, getCaptured: () => captured };
}

describe('useTheme auto resolution', () => {
  beforeEach(() => {
    useColorSchemeMock.mockReset();
    resetSettingsMocks();
  });

  it('auto + OS light resolves to light', async () => {
    useColorSchemeMock.mockReturnValue('light');
    getThemeMock.mockResolvedValue('auto');
    const { Probe, getCaptured } = makeProbe();
    await act(async () => {
      create(<ThemeProvider>{<Probe />}</ThemeProvider>);
    });
    expect(getCaptured().theme).toBe('auto');
    expect(getCaptured().effectiveTheme).toBe('light');
    expect(getCaptured().tokens).toBe(light);
  });

  it('auto + OS dark resolves to dark', async () => {
    useColorSchemeMock.mockReturnValue('dark');
    getThemeMock.mockResolvedValue('auto');
    const { Probe, getCaptured } = makeProbe();
    await act(async () => {
      create(<ThemeProvider>{<Probe />}</ThemeProvider>);
    });
    expect(getCaptured().effectiveTheme).toBe('dark');
    expect(getCaptured().tokens).toBe(dark);
  });

  it('auto + no OS scheme falls back to dark', async () => {
    useColorSchemeMock.mockReturnValue(null);
    getThemeMock.mockResolvedValue('auto');
    const { Probe, getCaptured } = makeProbe();
    await act(async () => {
      create(<ThemeProvider>{<Probe />}</ThemeProvider>);
    });
    expect(getCaptured().effectiveTheme).toBe('dark');
  });

  it('explicit light ignores the OS scheme', async () => {
    useColorSchemeMock.mockReturnValue('dark');
    getThemeMock.mockResolvedValue('light');
    const { Probe, getCaptured } = makeProbe();
    await act(async () => {
      create(<ThemeProvider>{<Probe />}</ThemeProvider>);
    });
    expect(getCaptured().theme).toBe('light');
    expect(getCaptured().effectiveTheme).toBe('light');
  });
});

describe('useTheme persistence and seed', () => {
  beforeEach(() => {
    useColorSchemeMock.mockReset();
    resetSettingsMocks();
  });

  it('seeds dark on first mount when nothing is stored, exactly once', async () => {
    getThemeMock.mockResolvedValue(null);
    const { Probe, getCaptured } = makeProbe();
    let root: any;
    await act(async () => {
      root = create(<ThemeProvider>{<Probe />}</ThemeProvider>);
    });
    expect(getThemeMock).toHaveBeenCalledTimes(1);
    expect(setThemeInStorageMock).toHaveBeenCalledTimes(1);
    expect(setThemeInStorageMock).toHaveBeenCalledWith('dark');
    expect(getCaptured().theme).toBe('dark');

    // Re-render must not re-seed.
    await act(async () => {
      root.update(<ThemeProvider>{<Probe />}</ThemeProvider>);
    });
    expect(setThemeInStorageMock).toHaveBeenCalledTimes(1);
  });

  it('adopts the stored theme and does not write on first mount', async () => {
    getThemeMock.mockResolvedValue('light');
    const { Probe, getCaptured } = makeProbe();
    await act(async () => {
      create(<ThemeProvider>{<Probe />}</ThemeProvider>);
    });
    expect(getCaptured().theme).toBe('light');
    expect(setThemeInStorageMock).not.toHaveBeenCalled();
  });

  it('a user toggle persists to storage', async () => {
    getThemeMock.mockResolvedValue('dark');
    const { Probe, getCaptured } = makeProbe();
    await act(async () => {
      create(<ThemeProvider>{<Probe />}</ThemeProvider>);
    });
    setThemeInStorageMock.mockClear();
    await act(async () => {
      getCaptured().setTheme('light');
    });
    expect(getCaptured().theme).toBe('light');
    expect(getCaptured().effectiveTheme).toBe('light');
    expect(setThemeInStorageMock).toHaveBeenCalledTimes(1);
    expect(setThemeInStorageMock).toHaveBeenCalledWith('light');
  });

  it('toggling to the current value is a no-op', async () => {
    getThemeMock.mockResolvedValue('dark');
    const { Probe, getCaptured } = makeProbe();
    await act(async () => {
      create(<ThemeProvider>{<Probe />}</ThemeProvider>);
    });
    setThemeInStorageMock.mockClear();
    await act(async () => {
      getCaptured().setTheme('dark');
    });
    expect(setThemeInStorageMock).not.toHaveBeenCalled();
    expect(getCaptured().theme).toBe('dark');
  });
});

describe('useTheme render output', () => {
  beforeEach(() => {
    useColorSchemeMock.mockReset();
    resetSettingsMocks();
  });

  it('starts dark and toggling light flips the tokens', async () => {
    useColorSchemeMock.mockReturnValue('dark');
    getThemeMock.mockResolvedValue(null);
    const { Probe, getCaptured } = makeProbe();
    await act(async () => {
      create(<ThemeProvider>{<Probe />}</ThemeProvider>);
    });
    expect(getCaptured().tokens.primary).toBe(dark.primary);

    await act(async () => {
      getCaptured().setTheme('light');
    });
    expect(getCaptured().theme).toBe('light');
    expect(getCaptured().effectiveTheme).toBe('light');
    expect(getCaptured().tokens.primary).toBe(light.primary);
  });

  it('auto follows the OS scheme at render time', async () => {
    useColorSchemeMock.mockReturnValue('light');
    getThemeMock.mockResolvedValue('auto');
    const { Probe, getCaptured } = makeProbe();
    await act(async () => {
      create(<ThemeProvider>{<Probe />}</ThemeProvider>);
    });
    expect(getCaptured().theme).toBe('auto');
    expect(getCaptured().effectiveTheme).toBe('light');
    expect(getCaptured().tokens).toBe(light);
  });
});
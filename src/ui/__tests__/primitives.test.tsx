import React from 'react';
const rtr = require('react-test-renderer');
const { act, create } = rtr;
import { ThemeProvider, useTheme, copy } from '../index';
import { formatMoney } from '../Money';

describe('formatMoney', () => {
  it('formats integer paise as whole rupees', () => {
    expect(formatMoney(12345)).toBe('₹123');
    expect(formatMoney(6000)).toBe('₹60');
    expect(formatMoney(0)).toBe('₹0');
  });
});

describe('copy', () => {
  it('exposes exact copy strings', () => {
    expect(copy.appName).toBe('Track Pay');
  });
});

describe('useTheme', () => {
  it('provides dark tokens by default', () => {
    let captured: any;
    function Probe() {
      const { theme, tokens, setTheme } = useTheme();
      captured = { theme, tokens, setTheme };
      return null;
    }
    act(() => {
      create(
        <ThemeProvider>
          <Probe />
        </ThemeProvider>,
      );
    });
    expect(captured.theme).toBe('dark');
    expect(captured.tokens.primary).toBe('#38bdf8');
    act(() => {
      captured.setTheme('light');
    });
    expect(captured.theme).toBe('light');
    expect(captured.tokens.primary).toBe('#0369a1');
  });
});

import React from 'react';
const rtr = require('react-test-renderer');
const { act, create } = rtr;
import { ThemeProvider } from '../../../ui/useTheme';
import { Button } from '../../../ui/Button';
import { setStorage } from '../../../data/settings';
import { ExportChoices } from '../ExportChoices';

function render(node: React.ReactNode) {
  let root: any;
  act(() => {
    root = create(<ThemeProvider>{node}</ThemeProvider>);
  });
  return root;
}

beforeEach(() => {
  jest.clearAllMocks();
  setStorage({
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
  });
});

describe('ExportChoices', () => {
  it('renders the two export choices', () => {
    const root = render(<ExportChoices onBackup={() => {}} onPdf={() => {}} />);

    const buttons = root.root.findAllByType(Button);
    expect(buttons).toHaveLength(2);
    const text = JSON.stringify(root.toJSON());
    expect(text).toContain('Backup file');
    expect(text).toContain('Monthly PDF statement');
  });

  it('tapping each choice calls its handler', () => {
    const onBackup = jest.fn();
    const onPdf = jest.fn();
    const root = render(
      <ExportChoices onBackup={onBackup} onPdf={onPdf} />,
    );

    const buttons = root.root.findAllByType(Button);
    act(() => {
      buttons[0].props.onPress();
    });
    expect(onBackup).toHaveBeenCalledTimes(1);
    expect(onPdf).not.toHaveBeenCalled();

    act(() => {
      buttons[1].props.onPress();
    });
    expect(onPdf).toHaveBeenCalledTimes(1);
  });
});

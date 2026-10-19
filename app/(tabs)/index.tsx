import React, { useState } from 'react';
import { Button } from '../../src/ui/Button';
import { Field } from '../../src/ui/Field';
import { Screen } from '../../src/ui/Screen';
import { Text } from '../../src/ui/Text';
import { SpendCard } from '../../src/ui/SpendCard';
import { useDialog } from '../../src/ui/DialogProvider';
import { useTheme } from '../../src/ui/useTheme';
import { computeMonthStats } from '../../src/domain/monthStats';

const DEV_PRESETS = [
  { label: 'Default (0 / null)', spent: 0, limit: null },
  { label: 'A9 example (₹3,630 / ₹15,000)', spent: 363000, limit: 1500000 },
  { label: '80% (₹12,000 / ₹15,000)', spent: 1200000, limit: 1500000 },
  { label: 'Over (₹15,150 / ₹15,000)', spent: 1515000, limit: 1500000 },
  { label: 'No limit (₹3,630 / null)', spent: 363000, limit: null },
] as const;

export default function HomeScreen() {
  const [spent, setSpent] = useState(0);
  const [limit, setLimit] = useState<number | null>(null);
  const now = new Date();
  const stats = computeMonthStats({ spent, limit, now });
  const month = now.toLocaleString('en-IN', { month: 'long' });

  return (
    <Screen>
      <SpendCard stats={stats} month={month} />
      {__DEV__ && (
        <DevSection
          spent={spent}
          limit={limit}
          onSetSpent={setSpent}
          onSetLimit={setLimit}
        />
      )}
    </Screen>
  );
}

function DevSection({ spent, limit, onSetSpent, onSetLimit }: {
  spent: number;
  limit: number | null;
  onSetSpent: (n: number) => void;
  onSetLimit: (n: number | null) => void;
}) {
  const { open, close } = useDialog();
  const { theme, effectiveTheme, setTheme } = useTheme();

  return (
    <>
      <Text variant="muted">Dev: spent {spent} · limit {limit ?? 'null'}</Text>
      {DEV_PRESETS.map((preset) => (
        <Button
          key={preset.label}
          variant={spent === preset.spent && limit === preset.limit ? 'primary' : 'secondary'}
          accessibilityLabel={`Set dev state: ${preset.label}`}
          onPress={() => { onSetSpent(preset.spent); onSetLimit(preset.limit); }}
        >
          {preset.label}
        </Button>
      ))}
      <Text variant="muted">Theme (dev): {theme} · effective {effectiveTheme}</Text>
      <Button variant={theme === 'dark' ? 'primary' : 'secondary'} accessibilityLabel="Set theme to dark (dev)" onPress={() => setTheme('dark')}>Dark</Button>
      <Button variant={theme === 'light' ? 'primary' : 'secondary'} accessibilityLabel="Set theme to light (dev)" onPress={() => setTheme('light')}>Light</Button>
      <Button variant={theme === 'auto' ? 'primary' : 'secondary'} accessibilityLabel="Set theme to auto (dev)" onPress={() => setTheme('auto')}>Auto</Button>
      <Button accessibilityLabel="Show dialog (dev)" onPress={() => open({ title: 'Dialog (dev)', subtitle: 'Centred on small and large phones with the keyboard open.', children: <DevTextField />, primaryAction: <Button variant="primary" onPress={close}>OK</Button> })}>Show dialog (dev)</Button>
    </>
  );
}

function DevTextField() {
  const [text, setText] = useState('');
  return (
    <Field
      label="Type here (dev)"
      value={text}
      onChangeText={setText}
      accessibilityLabel="Dev text field"
    />
  );
}
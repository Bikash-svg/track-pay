import React, { useState } from 'react';
import { Button } from '../../src/ui/Button';
import { Field } from '../../src/ui/Field';
import { Screen } from '../../src/ui/Screen';
import { Text } from '../../src/ui/Text';
import { SpendCard } from '../../src/ui/SpendCard';
import { Banner } from '../../src/ui/Banner';
import { useDialog } from '../../src/ui/DialogProvider';
import { useTheme } from '../../src/ui/useTheme';
import { router } from 'expo-router';
import { copy } from '../../src/ui/copy';
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
  const [pendingCount, setPendingCount] = useState(0);
  const now = new Date();
  const stats = computeMonthStats({ spent, limit, now });
  const month = now.toLocaleString('en-IN', { month: 'long' });

  // Banner placement is temporary (between SpendCard and DevSection).
  // Step 3.4 will reposition below quick actions per DESIGN.md §1.
  return (
    <Screen>
      <SpendCard stats={stats} month={month} />
      {pendingCount > 0 && (
        <Banner
          action={
            <Button
              variant="text"
              onPress={() => router.push('/pending')}
              accessibilityLabel={copy.review}
            >
              {copy.review}
            </Button>
          }
        >
          {copy.paymentNeedsConfirming(pendingCount)}
        </Banner>
      )}
      {__DEV__ && (
        <DevSection
          spent={spent}
          limit={limit}
          pendingCount={pendingCount}
          onSetSpent={setSpent}
          onSetLimit={setLimit}
          onSetPendingCount={setPendingCount}
        />
      )}
    </Screen>
  );
}

function DevSection({
  spent,
  limit,
  pendingCount,
  onSetSpent,
  onSetLimit,
  onSetPendingCount,
}: {
  spent: number;
  limit: number | null;
  pendingCount: number;
  onSetSpent: (n: number) => void;
  onSetLimit: (n: number | null) => void;
  onSetPendingCount: (n: number) => void;
}) {
  const { open, close } = useDialog();
  const { theme, effectiveTheme, setTheme } = useTheme();

  return (
    <>
      <Text variant="muted">Dev: spent {spent} · limit {limit ?? 'null'}</Text>
      <Text variant="muted">Pending (dev): {pendingCount}</Text>
      <Button
        variant={pendingCount === 0 ? 'primary' : 'secondary'}
        accessibilityLabel="Set dev pending count to 0"
        onPress={() => onSetPendingCount(0)}
      >
        0 pending
      </Button>
      <Button
        variant={pendingCount === 1 ? 'primary' : 'secondary'}
        accessibilityLabel="Set dev pending count to 1"
        onPress={() => onSetPendingCount(1)}
      >
        1 pending
      </Button>
      <Button
        variant={pendingCount === 3 ? 'primary' : 'secondary'}
        accessibilityLabel="Set dev pending count to 3"
        onPress={() => onSetPendingCount(3)}
      >
        3 pending
      </Button>
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
      <Button
        variant={theme === 'dark' ? 'primary' : 'secondary'}
        accessibilityLabel="Set theme to dark (dev)"
        onPress={() => setTheme('dark')}
      >
        Dark
      </Button>
      <Button
        variant={theme === 'light' ? 'primary' : 'secondary'}
        accessibilityLabel="Set theme to light (dev)"
        onPress={() => setTheme('light')}
      >
        Light
      </Button>
      <Button
        variant={theme === 'auto' ? 'primary' : 'secondary'}
        accessibilityLabel="Set theme to auto (dev)"
        onPress={() => setTheme('auto')}
      >
        Auto
      </Button>
      <Button
        accessibilityLabel="Show dialog (dev)"
        onPress={() =>
          open({
            title: 'Dialog (dev)',
            subtitle: 'Centred on small and large phones with the keyboard open.',
            children: <DevTextField />,
            primaryAction: <Button variant="primary" onPress={close}>OK</Button>,
          })
        }
      >
        Show dialog (dev)
      </Button>
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
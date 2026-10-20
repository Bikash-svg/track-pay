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
import { View } from 'react-native';

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

  return (
    <Screen>
      <SpendCard stats={stats} month={month} />

      {/* Quick actions (DESIGN.md §1 item 2) */}
      <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
        <View style={{ flex: 1 }}>
          <Button variant="primary" onPress={() => router.push('/scanner')} accessibilityLabel={copy.scanQR}>
            {copy.scanQR}
          </Button>
        </View>
        <View style={{ flex: 1 }}>
          <Button variant="primary" onPress={() => router.push('/pay-to-friend')} accessibilityLabel={copy.payToFriend}>
            {copy.payToFriend}
          </Button>
        </View>
      </View>

      {/* Pay button — purpose undecided (new BUILD-TODO open question #12) */}
      {/* BUILD-TODO open question #12 — Pay button purpose undecided. Disabled until Phase 4 defines its flow. */}
      <Button variant="secondary" disabled onPress={() => {}}>
        {copy.pay}
      </Button>

      {/* Add payment already made (DESIGN.md §1 item 3) */}
      <Button variant="secondary" onPress={() => router.push('/add-payment')} accessibilityLabel={copy.addPaymentAlreadyMade}>
        {copy.addPaymentAlreadyMade}
      </Button>

      {/* Banner (DESIGN.md §1 item 4) — moved from 3.3's temporary spot */}
      {pendingCount > 0 && (
        <Banner action={<Button variant="text" onPress={() => router.push('/pending')} accessibilityLabel={copy.review}>{copy.review}</Button>}>
          {copy.paymentNeedsConfirming(pendingCount)}
        </Banner>
      )}

      {__DEV__ && (
        <DevSection spent={spent} limit={limit} onSetSpent={setSpent} onSetLimit={setLimit} pendingCount={pendingCount} onSetPendingCount={setPendingCount} />
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
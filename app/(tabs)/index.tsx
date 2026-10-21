import React, { useState } from 'react';
import { Button } from '../../src/ui/Button';
import { Field } from '../../src/ui/Field';
import { Screen } from '../../src/ui/Screen';
import { Text } from '../../src/ui/Text';
import { SpendCard } from '../../src/ui/SpendCard';
import { Banner } from '../../src/ui/Banner';
import { useDialog } from '../../src/ui/DialogProvider';
import { usePendingCount } from '../../src/ui/PendingCountProvider';
import { useTheme } from '../../src/ui/useTheme';
import { router } from 'expo-router';
import { copy } from '../../src/ui/copy';
import { computeMonthStats } from '../../src/domain/monthStats';
import { dateLabel } from '../../src/domain/dateLabel';
import { PayRow } from '../../src/ui/PayRow';
import { usePayments } from '../../src/data/payments';
import { PayToFriendDialog } from '../../src/ui/PayToFriendDialog';
import { View } from 'react-native';

const DEV_PRESETS = [
  { label: 'Default (0 / null)', spent: 0, limit: null },
  { label: 'A9 example (₹3,630 / ₹15,000)', spent: 363000, limit: 1500000 },
  { label: '80% (₹12,000 / ₹15,000)', spent: 1200000, limit: 1500000 },
  { label: 'Over (₹15,150 / ₹15,000)', spent: 1515000, limit: 1500000 },
  { label: 'No limit (₹3,630 / null)', spent: 363000, limit: null },
] as const;

const DEV_PAYMENT_PRESETS = [
  { label: '0 payments', count: 0 },
  { label: '2 payments', count: 2 },
  { label: '4 payments', count: 4 },
  { label: '6 payments', count: 6 },
] as const;

const DEV_SAMPLE_PAYMENTS = [
  { avatarLetter: 'C', name: 'Cafe Mocha', amountPaise: 6000, category: 'Food', status: 'Done' as const, daysAgo: 0 },
  { avatarLetter: 'B', name: 'Bikash Murmu', amountPaise: 4000, category: 'Other', status: 'Pending' as const, daysAgo: 1 },
  { avatarLetter: 'T', name: 'Tea Stall', amountPaise: 2000, category: 'Food', status: 'Done' as const, daysAgo: 3 },
  { avatarLetter: 'A', name: 'Auto Rickshaw', amountPaise: 8000, category: 'Transport', status: 'Done' as const, daysAgo: 10 },
  { avatarLetter: 'N', name: 'Navi Kiosk', amountPaise: 15000, category: 'Shopping', status: 'Failed' as const, daysAgo: 40 },
  { avatarLetter: 'F', name: 'Friend', amountPaise: 50000, category: 'Other', status: 'Done' as const, daysAgo: 400 },
];

export default function HomeScreen() {
  const [spent, setSpent] = useState(0);
  const [limit, setLimit] = useState<number | null>(null);
  const { pendingCount, setPendingCount } = usePendingCount();
  const [devPaymentCount, setDevPaymentCount] = useState(0);
  const { payments, addFriendPayment } = usePayments();
  const { open, close } = useDialog();
  const now = new Date();
  const stats = computeMonthStats({ spent, limit, now });
  const month = now.toLocaleString('en-IN', { month: 'long' });

  const handleSaveFriend = (input: {
    amountPaise: number;
    payeeName: string;
    preferredUpiPackage: string;
  }) => {
    addFriendPayment(input);
    setPendingCount(pendingCount + 1);
    close();
    if (__DEV__) console.warn('[4.1 dev] Saved friend payment pending');
  };

  const recentPayments = payments.slice(0, 4);
  const showRealPayments = recentPayments.length > 0;

  return (
    <Screen padTop={false}>
      <SpendCard stats={stats} month={month} />

      {/* Quick actions (DESIGN.md §1 item 2) */}
      <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
        <View style={{ flex: 1 }}>
          <Button variant="primary" onPress={() => router.push('/scanner')} accessibilityLabel={copy.scanQR}>
            {copy.scanQR}
          </Button>
        </View>
        <View style={{ flex: 1 }}>
          <Button
            variant="primary"
            onPress={() =>
              open({
                title: copy.payToFriend,
                children: (
       <PayToFriendDialog
         onSave={handleSaveFriend}
         onCancel={close}
       />
                ),
              })
            }
            accessibilityLabel={copy.payToFriend}
          >
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

      {/* Recent Payments (DESIGN.md §1 item 5) — after the Banner, before DevSection */}
      <Text variant="secondary">{copy.recentPayments}</Text>
      {showRealPayments ? (
        recentPayments.map((p) => (
          <PayRow
            key={p.id}
            avatarLetter={(p.payeeName || 'F')[0].toUpperCase()}
            name={p.label ?? p.payeeName}
            amountPaise={p.amountPaise}
            category={p.category}
            status={
              p.status === 'success'
                ? 'Done'
                : p.status === 'failed'
                  ? 'Failed'
                  : 'Pending'
            }
            date={dateLabel(new Date(p.createdAt), now)}
            accessibilityLabel={`${p.payeeName}, ${p.category}`}
            onPress={
              // Done-when "tapping a row opens Edit" is Step 4.8's; dev-gated
              // no-op today, no onPress in a release build.
              __DEV__
                ? () => {
                    console.warn('[3.5 dev] Row tap — Edit ships in Phase 4.8');
                  }
                : undefined
            }
          />
        ))
      ) : devPaymentCount === 0 ? (
        <Text variant="muted">{copy.noPayments}</Text>
      ) : (
        DEV_SAMPLE_PAYMENTS.slice(0, Math.min(devPaymentCount, 4)).map((p, i) => {
          const rowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - p.daysAgo);
          return (
            <PayRow
              key={i}
              avatarLetter={p.avatarLetter}
              name={p.name}
              amountPaise={p.amountPaise}
              category={p.category}
              status={p.status}
              date={dateLabel(rowDate, now)}
              accessibilityLabel={`${p.name}, ${p.category}`}
              onPress={
                // Done-when "tapping a row opens Edit" is Step 4.8's; dev-gated
                // no-op today, no onPress in a release build.
                __DEV__
                  ? () => {
                      console.warn('[3.5 dev] Row tap — Edit ships in Phase 4.8');
                    }
                  : undefined
              }
            />
          );
        })
      )}
      <Button variant="text" onPress={() => router.push('/history')} accessibilityLabel={copy.seeAll}>
        {copy.seeAll}
      </Button>

      {__DEV__ && (
        <DevSection
          spent={spent}
          limit={limit}
          onSetSpent={setSpent}
          onSetLimit={setLimit}
          pendingCount={pendingCount}
          onSetPendingCount={setPendingCount}
          devPaymentCount={devPaymentCount}
          onSetDevPaymentCount={setDevPaymentCount}
        />
      )}
    </Screen>
  );
}

function DevSection({
  spent,
  limit,
  pendingCount,
  devPaymentCount,
  onSetDevPaymentCount,
  onSetSpent,
  onSetLimit,
  onSetPendingCount,
}: {
  spent: number;
  limit: number | null;
  pendingCount: number;
  devPaymentCount: number;
  onSetDevPaymentCount: (n: number) => void;
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
      <Text variant="muted">Payments (dev): {devPaymentCount}</Text>
      {DEV_PAYMENT_PRESETS.map((preset) => (
        <Button
          key={preset.label}
          variant={devPaymentCount === preset.count ? 'primary' : 'secondary'}
          accessibilityLabel={`Set dev payment count to ${preset.count}`}
          onPress={() => onSetDevPaymentCount(preset.count)}
        >
          {preset.label}
        </Button>
      ))}
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
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Button } from '../../src/ui/Button';
import { Chip } from '../../src/ui/Chip';
import { Field } from '../../src/ui/Field';
import { Screen } from '../../src/ui/Screen';
import { Text } from '../../src/ui/Text';
import { SpendCard } from '../../src/ui/SpendCard';
import { useDialog } from '../../src/ui/DialogProvider';
import { usePendingCount } from '../../src/ui/PendingCountProvider';
import { useTheme } from '../../src/ui/useTheme';
import { router } from 'expo-router';
import { copy } from '../../src/ui/copy';
import { computeMonthStats } from '../../src/domain/monthStats';
import { dateLabel } from '../../src/domain/dateLabel';
import { PayRow } from '../../src/ui/PayRow';
import { usePayments } from '../../src/data/payments';
import { PaymentFormDialog } from '../../src/ui/PaymentFormDialog';
import { getProfile } from '../../src/data/settings';
import { greeting } from '../../src/domain/greeting';

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
  const [firstName, setFirstName] = useState<string | null>(null);
  const [devSpent, setDevSpent] = useState(0);
  const [devLimit, setDevLimit] = useState<number | null>(null);
  const { pendingCount, setPendingCount } = usePendingCount();
  const [devPaymentCount, setDevPaymentCount] = useState(0);
  const { payments, addPayment, updatePayment } = usePayments();
  const { open, close } = useDialog();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const spent = payments
    .filter((payment) => payment.status === 'success' && new Date(payment.createdAt) >= monthStart)
    .reduce((sum, payment) => sum + payment.amountPaise, 0);
  const limit: number | null = null;
  const stats = computeMonthStats({ spent, limit, now });
  const month = now.toLocaleString('en-IN', { month: 'long' });

  useEffect(() => {
    let mounted = true;
    void getProfile().then((profile) => {
      if (mounted) setFirstName(profile.firstName);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const recentPayments = payments.slice(0, 5);
  const showRealPayments = recentPayments.length > 0;

  return (
    <Screen padTop={false}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text>{greeting(now, firstName)}</Text>
        <Chip>{month}</Chip>
      </View>
      <SpendCard stats={stats} month={month} />

      <Button variant="primary" disabled accessibilityLabel="Add from screenshot — coming soon">
        {copy.addFromScreenshot}
      </Button>
      <Button
        variant="secondary"
        onPress={() => open({
          children: (
            <PaymentFormDialog
              mode="add"
              onSaved={async (input) => { await addPayment(input); close(); }}
              onCancel={close}
            />
          ),
        })}
      >
        {copy.addManually}
      </Button>
      <Text variant="muted">{copy.shareHint}</Text>

      {/* This month at a glance slot — Step 5.9 */}

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
            date={dateLabel(new Date(p.paidAt ?? p.createdAt), now)}
            notVerified={!p.reviewed}
            accessibilityLabel={`${p.payeeName}, ${p.category}`}
            onPress={
              // Done-when "tapping a row opens Edit" is Step 4.8's; dev-gated
              // no-op today, no onPress in a release build.
              __DEV__
                ? () => open({
                    children: (
                      <PaymentFormDialog
                        mode="edit"
                        initial={p}
                        onSaved={async (input) => { await updatePayment(p.id, input); close(); }}
                        onCancel={close}
                      />
                    ),
                  })
                : undefined
            }
          />
        ))
      ) : devPaymentCount === 0 ? (
        <Text variant="muted">{copy.noPayments}</Text>
      ) : (
        DEV_SAMPLE_PAYMENTS.slice(0, Math.min(devPaymentCount, 5)).map((p, i) => {
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
      <Button variant="text" onPress={() => router.push('/history')} accessibilityLabel={copy.history}>
        {copy.history}
      </Button>

      {__DEV__ && (
        <DevSection
          spent={devSpent}
          limit={devLimit}
          onSetSpent={setDevSpent}
          onSetLimit={setDevLimit}
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
  const { addPayment } = usePayments();
  const { theme, effectiveTheme, setTheme } = useTheme();

  return (
    <>
      <Text variant="muted">Dev: spent {spent} · limit {limit ?? 'null'}</Text>
      <Text variant="muted">Pending (dev): {pendingCount}</Text>
      <Text variant="muted">Payments (dev): {devPaymentCount}</Text>
      <Button
        accessibilityLabel="Add payment (dev)"
        onPress={() =>
          open({
            children: (
              <PaymentFormDialog
                mode="add"
                onSaved={async (input) => { await addPayment(input); close(); }}
                onCancel={close}
              />
            ),
          })
        }
      >
        Add payment (dev)
      </Button>
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

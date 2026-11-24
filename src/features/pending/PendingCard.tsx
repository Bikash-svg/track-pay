import React, { useCallback, useState } from 'react';
import { Image, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, router } from 'expo-router';
import { Screen, Text, Button, Field, Chip, copy } from '../../ui';
import { useTheme } from '../../ui/useTheme';
import { loadAll, removeOne, markVerified, type PendingItem } from '../../data/pendingItems';
import { usePayments } from '../../data/payments';
import { badgeLabel } from './badgeLabel';
import { scanOne } from './scanEngine';
import { validateAmount, validatePayee, validatePaidAt, CATEGORIES, type PaymentCategory } from '../../domain/paymentForm';

export type PendingCardProps = { id?: string };

const formatDateForInput = (date: Date | null): string => {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

const parseDateFromInput = (input: string): Date => {
  const now = new Date();
  const match = input.match(/^(\d{4})-(\d{2})-(\d{2})(?:\s+(\d{2}):(\d{2}))?$/);
  if (!match) return now;
  const [, yearStr, monthStr, dayStr, hourStr, minuteStr] = match;
  return new Date(
    parseInt(yearStr, 10),
    parseInt(monthStr, 10) - 1,
    parseInt(dayStr, 10),
    hourStr ? parseInt(hourStr, 10) : 0,
    minuteStr ? parseInt(minuteStr, 10) : 0,
  );
};

function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

export function PendingCard({ id: idProp }: PendingCardProps = {}) {
  const params = useLocalSearchParams<{ id: string }>();
  const id = idProp ?? params.id;
  const { addPayment } = usePayments();
  const [item, setItem] = useState<PendingItem | null | undefined>(undefined);
  const [scanning, setScanning] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const [amount, setAmount] = useState('');
  const [payee, setPayee] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [category, setCategory] = useState<PaymentCategory>('Other');
  const [amountError, setAmountError] = useState('');
  const [dateError, setDateError] = useState('');

  const reload = useCallback(() => {
    let cancelled = false;
    void loadAll()
      .then((rows) => {
        if (cancelled) return;
        const found = rows.find((r) => r.id === id) ?? null;
        setItem(found);
        if (found && found.status === 'scanned' && found.scanResult) {
          setAmount(String(found.scanResult.amountPaise / 100));
          setPayee(found.scanResult.payeeName ?? '');
          setDateInput(formatDateForInput(found.scanResult.paidAt ? new Date(found.scanResult.paidAt) : null));
          setCategory('Other');
          setAmountError('');
          setDateError('');
        }
      })
      .catch(() => {
        if (!cancelled) setItem(null);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  useFocusEffect(reload);

  const handleScan = async () => {
    if (!item) return;
    setScanning(true);
    try {
      await scanOne(item.id);
      reload();
    } finally {
      setScanning(false);
    }
  };

  const handleDiscard = async () => {
    if (!item) return;
    await removeOne(item.id);
    goBack();
  };

  const handleVerify = async () => {
    if (!item || !item.scanResult) return;
    const amtResult = validateAmount(amount);
    if (!amtResult.ok) {
      setAmountError(amtResult.errors[0].message);
      return;
    }
    const date = parseDateFromInput(dateInput);
    const dateResult = validatePaidAt(date, new Date());
    if (!dateResult.ok) {
      setDateError(dateResult.errors[0].message);
      return;
    }
    const payeeResult = validatePayee(payee);
    setVerifying(true);
    try {
      const input = {
        amountPaise: amtResult.value,
        payeeName: payeeResult.ok ? payeeResult.value : 'Unknown',
        label: null,
        category,
        createdAt: dateResult.value,
        paidAt: item.scanResult.paidAt ? new Date(item.scanResult.paidAt) : null,
        source: 'receipt' as const,
        reviewed: true,
      };
      const payment = await addPayment(input);
      await markVerified(item.id, payment.id);
      goBack();
    } finally {
      setVerifying(false);
    }
  };

  if (item === undefined) {
    return (
      <Screen>
        <Text>{copy.pending.loading}</Text>
      </Screen>
    );
  }

  if (item === null) {
    return (
      <Screen>
        <Text>{copy.pending.notFound}</Text>
        <Button onPress={goBack}>{copy.pending.back}</Button>
      </Screen>
    );
  }

  return (
    <Screen>
      <Image
        source={{ uri: item.imagePath }}
        style={{ width: '100%', height: 280, resizeMode: 'contain' }}
      />
      <Text>{badgeLabel(item.status)}</Text>

      {item.status === 'unscanned' && (
        <View>
          <Button disabled={scanning} onPress={handleScan}>
            {scanning ? copy.pending.startScanning : copy.pending.scan}
          </Button>
          <Button onPress={handleDiscard}>{copy.pending.discard}</Button>
          <Button onPress={goBack}>{copy.pending.back}</Button>
        </View>
      )}

      {item.status === 'scanning' && (
        <View>
          <Text>{copy.pending.badge.scanning}</Text>
        </View>
      )}

      {item.status === 'error' && (
        <View>
          <Text>{item.error}</Text>
          <Button disabled={scanning} onPress={handleScan}>
            {copy.pending.scanAgain}
          </Button>
          <Button onPress={handleDiscard}>{copy.pending.discard}</Button>
          <Button onPress={goBack}>{copy.pending.back}</Button>
        </View>
      )}

      {item.status === 'scanned' && item.scanResult && (
        <View>
          {item.scanResult.duplicateOfPaymentId ? (
            <Text>{copy.pending.duplicateWarning}</Text>
          ) : null}
          <Field
            label="Amount"
            value={amount}
            onChangeText={(v: string) => {
              setAmount(v);
              setAmountError('');
            }}
          />
          {amountError ? <Text>{amountError}</Text> : null}
          <Field label="Payee" value={payee} onChangeText={setPayee} />
          <Field
            label="Date"
            value={dateInput}
            onChangeText={(v: string) => {
              setDateInput(v);
              setDateError('');
            }}
          />
          {dateError ? <Text>{dateError}</Text> : null}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {CATEGORIES.map((c) => (
              <Chip key={c} selected={category === c} onPress={() => setCategory(c as PaymentCategory)}>
                {c}
              </Chip>
            ))}
          </View>
          <Button disabled={verifying} onPress={handleVerify}>
            {copy.pending.verify}
          </Button>
          <Button onPress={handleDiscard}>{copy.pending.discard}</Button>
          <Button onPress={goBack}>{copy.pending.back}</Button>
        </View>
      )}

      {item.status === 'verified' && (
        <View>
          <Text>{badgeLabel(item.status)}</Text>
          <Button onPress={goBack}>{copy.pending.back}</Button>
        </View>
      )}
    </Screen>
  );
}

export default PendingCard;

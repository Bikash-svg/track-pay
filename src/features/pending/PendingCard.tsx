import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Dimensions, FlatList, Image, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useLocalSearchParams, router } from 'expo-router';
import { Screen, Text, Button, Field, Chip, copy } from '../../ui';
import { useTheme } from '../../ui/useTheme';
import { useDialog } from '../../ui/DialogProvider';
import { PaymentFormDialog } from '../../ui/PaymentFormDialog';
import { loadAll, removeOne, markVerified, type PendingItem } from '../../data/pendingItems';
import { usePayments } from '../../data/payments';
import { badgeLabel } from './badgeLabel';
import { scanOne } from './scanEngine';
import { validateAmount, validatePayee, validatePaidAt, CATEGORIES, type PaymentCategory } from '../../domain/paymentForm';

export type PendingCardProps = { id?: string };

const screenWidth = Dimensions.get('window').width;

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
  const params = useLocalSearchParams<{ id?: string }>();
  const startId = idProp ?? params.id;
  const { tokens } = useTheme();
  const insets = useSafeAreaInsets();
  const { addPayment, updatePayment, deletePayment, payments } = usePayments();
  const { open, close } = useDialog();
  const [allItems, setAllItems] = useState<PendingItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [manualEntry, setManualEntry] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [verifiedPaymentId, setVerifiedPaymentId] = useState<string | null>(null);

  const [amount, setAmount] = useState('');
  const [payee, setPayee] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [category, setCategory] = useState<PaymentCategory>('Other');
  const [amountError, setAmountError] = useState('');
  const [dateError, setDateError] = useState('');

  const currentItem = allItems[currentIndex] ?? null;
  const verifiedPayment = verifiedPaymentId ? payments.find((p) => p.id === verifiedPaymentId) : undefined;

  const reload = useCallback(() => {
    let cancelled = false;
    void loadAll()
      .then((rows) => {
        if (cancelled) return;
        setAllItems(rows);
        if (startId) {
          const idx = rows.findIndex((r) => r.id === startId);
          if (idx >= 0) setCurrentIndex(idx);
        }
        if (rows.length === 0 && !cancelled) {
          // No items left — go back
          setTimeout(() => goBack(), 0);
        }
      })
      .catch(() => {
        if (!cancelled) setAllItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, [startId]);

  useFocusEffect(reload);

  // Reset form state when currentItem changes or manual entry toggles
  useEffect(() => {
    if (!currentItem) return;
    if (manualEntry) {
      setAmount('');
      setPayee('');
      setDateInput('');
      setCategory('Other');
    } else if (currentItem.status === 'scanned' && currentItem.scanResult) {
      setAmount(String(currentItem.scanResult.amountPaise / 100));
      setPayee(currentItem.scanResult.payeeName ?? '');
      setDateInput(formatDateForInput(currentItem.scanResult.paidAt ? new Date(currentItem.scanResult.paidAt) : null));
      setCategory('Other');
    } else {
      setAmount('');
      setPayee('');
      setDateInput('');
      setCategory('Other');
    }
    setAmountError('');
    setDateError('');
  }, [currentItem?.id, manualEntry]);

  const handleScan = async () => {
    if (!currentItem) return;
    setScanning(true);
    setRetryCount((c) => c + 1);
    try {
      await scanOne(currentItem.id);
      setRetryCount(0);
      await reload();
    } finally {
      setScanning(false);
    }
  };

  const handleEnterManually = () => {
    setManualEntry(true);
    setAmount('');
    setPayee('');
    setDateInput('');
    setCategory('Other');
  };

  const handleDiscard = () => {
    if (!currentItem) return;
    Alert.alert(
      copy.pending.deleteReceiptConfirm,
      'This cannot be undone.',
      [
        { text: copy.pending.deleteReceiptCancel, style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await removeOne(currentItem.id);
            if (allItems.length <= 1) {
              goBack();
            } else {
              setCurrentIndex(Math.max(0, currentIndex - 1));
              await reload();
            }
          },
        },
      ]
    );
  };

  const handleVerify = async () => {
    if (!currentItem) return;
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
        paidAt: currentItem.scanResult?.paidAt ? new Date(currentItem.scanResult.paidAt) : null,
        source: (manualEntry ? 'manual' : 'receipt') as 'manual' | 'receipt',
        reviewed: true,
      };
      const payment = await addPayment(input);
      await markVerified(currentItem.id, payment.id);
      setVerifiedPaymentId(payment.id);
      setManualEntry(false);
      await reload();
    } catch {
      // fallthrough — state already reset below
    } finally {
      setVerifying(false);
    }
  };

  const handleEdit = () => {
    if (!verifiedPayment) return;
    open({
      children: (
        <PaymentFormDialog
          mode="edit"
          initial={verifiedPayment}
          onSaved={async (input) => {
            await updatePayment(verifiedPaymentId!, input);
            close();
          }}
          onCancel={close}
        />
      ),
    });
  };

  const handleRemove = async () => {
    if (verifiedPaymentId) await deletePayment(verifiedPaymentId);
    await removeOne(currentItem.id);
    goBack();
  };

  const renderCardContent = (item: PendingItem) => (
    <View style={{ padding: 16, backgroundColor: tokens.canvas }}>
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
          {retryCount >= 3 && (
            <Button onPress={handleEnterManually}>{copy.pending.enterManually}</Button>
          )}
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
          {__DEV__ && item.scanResult?.rawLines && (
            <Text style={{ fontSize: 10, fontFamily: 'monospace' }}>
              {item.scanResult.rawLines.join('\n')}
            </Text>
          )}
          <Button disabled={scanning} onPress={handleScan}>
            {copy.pending.scanAgain}
          </Button>
          {retryCount >= 3 && (
            <Button onPress={handleEnterManually}>{copy.pending.enterManually}</Button>
          )}
          <Button onPress={handleDiscard}>{copy.pending.discard}</Button>
          <Button onPress={goBack}>{copy.pending.back}</Button>
        </View>
      )}

      {item.status === 'scanned' && item.scanResult && (
        <View>
          {item.scanResult.duplicateOfPaymentId && (
            <Text>{copy.pending.duplicateWarning}</Text>
          )}
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
              <Chip
                key={c}
                selected={category === c}
                onPress={() => setCategory(c as PaymentCategory)}
              >
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

      {item.status === 'verified' && verifiedPayment && (
        <View>
          <Text>{badgeLabel(item.status)}</Text>
          <Button onPress={handleEdit}>{copy.pending.editPayment}</Button>
          <Button onPress={handleRemove}>{copy.pending.removePayment}</Button>
          <Button onPress={goBack}>{copy.pending.back}</Button>
        </View>
      )}
    </View>
  );

  if (allItems.length === 0) {
    return (
      <Screen>
        <Text>{copy.pending.notFound}</Text>
        <Button onPress={goBack}>{copy.pending.back}</Button>
      </Screen>
    );
  }

  return (
    <FlatList
      data={allItems}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.id}
      initialScrollIndex={currentIndex}
      getItemLayout={(_, index) => ({ length: screenWidth, offset: screenWidth * index, index })}
      onMomentumScrollEnd={(e) => {
        const newIndex = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
        setCurrentIndex(newIndex);
      }}
      renderItem={({ item }) => (
        <View style={{ width: screenWidth, backgroundColor: tokens.canvas, paddingTop: insets.top }}>
          {renderCardContent(item)}
        </View>
      )}
      contentContainerStyle={{ backgroundColor: tokens.canvas }}
    />
  );
}

export default PendingCard;

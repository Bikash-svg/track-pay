import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import type { TextInput } from 'react-native';
import { Field } from './Field';
import { Text } from './Text';
import { Button } from './Button';
import { copy } from './copy';
import { parseAmount, formatPaise } from '../domain/amount';
import type { UpiParseOk } from '../domain/upiParse';

interface ConfirmPaymentDialogProps {
  readonly result: UpiParseOk;
  readonly onConfirm: (input: { amountPaise: number; label: string | null }) => void;
  readonly onCancel: () => void;
}

export function ConfirmPaymentDialog({ result, onConfirm, onCancel }: ConfirmPaymentDialogProps) {
  const amountRef = useRef<TextInput>(null);
  const [amount, setAmount] = useState(result.amountPaise !== null ? formatPaise(result.amountPaise) : '');
  const [label, setLabel] = useState(result.noteFull ?? '');

  // Auto-focus fix (4.1 known gap viii). setTimeout waits for Modal + KeyboardAvoidingView to settle.
  useEffect(() => {
    const t = setTimeout(() => amountRef.current?.focus(), 150);
    return () => clearTimeout(t);
  }, []);

  const parsed = amount.length > 0 ? parseAmount(amount) : null;
  const amountError = parsed && 'errorKey' in parsed ? copy[parsed.errorKey] : undefined;
  const canSubmit = parsed && 'paise' in parsed;

  const handleMakePayment = () => {
    if (!canSubmit) return;
    onConfirm({ amountPaise: parsed.paise, label: label.trim() || null });
  };

  return (
    <View style={{ gap: 12 }}>
      <View>
        <Text variant="secondary">{result.payeeName}</Text>
        <Text variant="muted">{result.payeeVpa}</Text>
      </View>
      <Field
        ref={amountRef}
        label={copy.amountYouCanChange}
        value={amount}
        onChangeText={setAmount}
        error={amountError}
        accessibilityLabel={copy.amount}
        keyboardType="decimal-pad"
        returnKeyType="next"
        submitBehavior="submit"
      />
      <Field
        label={copy.whatWasThisFor}
        value={label}
        onChangeText={(v) => setLabel(v.slice(0, 60))}
        accessibilityLabel={copy.whatWasThisFor}
        returnKeyType="done"
      />
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
        <Button variant="text" onPress={onCancel}>{copy.cancel}</Button>
        <Button variant="primary" onPress={handleMakePayment} disabled={!canSubmit}>{copy.makePayment}</Button>
      </View>
    </View>
  );
}
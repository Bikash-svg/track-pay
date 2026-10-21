// The "Pay to a friend" dialog content (DESIGN.md §2, "Pay to a friend").
//
// Mounted inside the shared DialogHost by Home's "Pay to a friend" tile. It
// owns the amount, the payee and the UPI app list; it does NOT launch UPI and
// does NOT post a notification — those are 4.3 and 8.3 respectively. Tapping a
// tile saves the payment as pending and closes the dialog, which is the only
// claimable slice of EVALS P7 at this step.
//
// The list is fetched once on mount from the real native module
// (listUpiApps), with a __DEV__ seam so the no-app state is exercisable on a
// phone that has UPI apps installed. isNoApp covers both "no native module"
// (kind: not-found) and "module present, nothing installed" (empty list).
//
// 4.1 known gap viii (auto-focus on dialog open) fixed in 4.3: setTimeout on
// mount focuses the amount field after Modal + KeyboardAvoidingView settle.

import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import type { TextInput } from 'react-native';
import { AmountField } from './AmountField';
import { Field } from './Field';
import { Text } from './Text';
import { Button } from './Button';
import { UpiAppTiles } from './UpiAppTiles';
import { copy } from './copy';
import { parseAmount } from '../domain/amount';
import { normalizeList, isNoApp } from '../domain/upiAppList';
import {
  listUpiApps,
  type ListAppsResult,
  type UpiApp,
} from '../native/upiLauncher';

interface PayToFriendDialogProps {
  readonly onSave: (input: {
    amountPaise: number;
    payeeName: string;
    preferredUpiPackage: string;
  }) => void;
  readonly onCancel: () => void;
}

export function PayToFriendDialog({ onSave, onCancel }: PayToFriendDialogProps) {
  const [amount, setAmount] = useState('');
  const [payeeName, setPayeeName] = useState('');
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [apps, setApps] = useState<readonly UpiApp[]>([]);
  const [noApps, setNoApps] = useState(false);
  // 4.1 focus-advance: the numeric keyboard's Next button moves focus here,
  // and this field's Done button dismisses the keyboard. Held as a ref
  // rather than recreated each render so focus() survives re-renders.
  const payeeRef = useRef<TextInput>(null);
  // 4.3 auto-focus fix (4.1 known gap viii): focus amount field on mount
  const amountRef = useRef<TextInput>(null);

  useEffect(() => {
    let cancelled = false;
    listUpiApps()
      .then((result: ListAppsResult) => {
        if (cancelled) return;
        const list = normalizeList(result);
        setApps(list);
        setNoApps(isNoApp(result));
        setSelectedPackage(list[0]?.packageName ?? null);
      })
      .catch(() => {
        // The native module is present but the query failed: treat it as
        // "no apps" rather than crashing the dialog. The user can still
        // cancel and retry later.
        if (cancelled) return;
        setApps([]);
        setNoApps(true);
        setSelectedPackage(null);
      });
return () => {
       cancelled = true;
     };
   }, []);

  // 4.3 auto-focus fix (4.1 known gap viii): setTimeout waits for Modal + KeyboardAvoidingView to settle
  useEffect(() => {
    const t = setTimeout(() => amountRef.current?.focus(), 150);
    return () => clearTimeout(t);
  }, []);

  const parsed = amount.length > 0 ? parseAmount(amount) : null;
  const amountError =
    parsed && 'errorKey' in parsed ? copy[parsed.errorKey] : undefined;

  const handleTileSelect = (packageName: string) => {
    setSelectedPackage(packageName);
    if (parsed && 'paise' in parsed) {
      onSave({
        amountPaise: parsed.paise,
        payeeName: payeeName.trim(),
        preferredUpiPackage: packageName,
      });
    }
  };

  return (
    <View style={{ gap: 12 }}>
      <AmountField
        ref={amountRef}
        value={amount}
        onChangeText={setAmount}
        error={amountError}
        onNext={() => payeeRef.current?.focus()}
      />
      <Field
        label={copy.toWhom}
        value={payeeName}
        onChangeText={(v) => setPayeeName(v.slice(0, 40))}
        accessibilityLabel={copy.toWhom}
        ref={payeeRef}
        returnKeyType="done"
      />
      {noApps ? (
        <Text variant="muted">{copy.noUpiAppWasFound}</Text>
      ) : (
        <>
          <Text variant="secondary">{copy.payWith}</Text>
          <UpiAppTiles
            apps={apps}
            selectedPackage={selectedPackage}
            onSelect={handleTileSelect}
          />
          <Text variant="muted">{copy.yourUpiAppOpensNext}</Text>
        </>
      )}
      <Button variant="secondary" onPress={onCancel}>
        {copy.cancel}
      </Button>
    </View>
  );
}

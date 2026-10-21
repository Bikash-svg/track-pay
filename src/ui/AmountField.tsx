// The amount input for the Pay to a friend dialog.
//
// A thin wrapper around Field: it asks for a decimal keyboard and labels
// itself "Amount". It holds no validation and no formatting — parseAmount
// in src/domain/amount.ts owns both, so this component stays a pure
// presentational shell (1.2's "none contains business logic" still holds).
//
// 4.1 focus-advance (owner-requested scope exception): `onNext` is wired to
// Field's returnKeyType="next" + submitBehavior="submit", so tapping Next on
// the numeric keyboard calls it instead of submitting. The dialog passes
// onNext={() => payeeRef.current?.focus()}.

import type { TextInput } from 'react-native';
import React from 'react';
import { Field } from './Field';
import { copy } from './copy';

interface AmountFieldProps {
  readonly value: string;
  readonly onChangeText: (v: string) => void;
  readonly error?: string;
  readonly onNext?: () => void;
  // React 19: ref is a normal prop, so this wrapper can forward it straight
  // to Field without forwardRef.
  readonly ref?: React.Ref<TextInput>;
}

export function AmountField({ value, onChangeText, error, onNext, ref }: AmountFieldProps) {
  return (
    <Field
      label={copy.amount}
      value={value}
      onChangeText={onChangeText}
      error={error}
      accessibilityLabel={copy.amount}
      keyboardType="decimal-pad"
      returnKeyType="next"
      submitBehavior="submit"
      onSubmitEditing={onNext}
      ref={ref}
    />
  );
}

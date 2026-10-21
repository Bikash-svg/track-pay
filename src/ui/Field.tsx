import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { TextInputProps } from 'react-native';
import React from 'react';
import { TextInput, View } from 'react-native';
import { Text } from './Text';
import { useTheme } from './useTheme';

interface FieldProps {
  readonly label: string;
  readonly value: string;
  readonly onChangeText: (text: string) => void;
  readonly error?: string;
  readonly accessibilityLabel?: string;
  readonly style?: ViewStyle;
  // 4.1: additive passthrough so AmountField can ask for a decimal keyboard
  // without Field knowing anything about money. Optional, defaults to the
  // TextInput default. Nothing else in Field changes.
  readonly keyboardType?: 'default' | 'numeric' | 'decimal-pad';
  // 4.1 focus-advance (owner-requested scope exception): the keyboard's
  // return-key behaviour and the handler it calls. AmountField wires
  // returnKeyType="next" + submitBehavior="submit" so tapping Next on the
  // numeric keyboard moves focus to "To whom" instead of submitting.
  readonly returnKeyType?: TextInputProps['returnKeyType'];
  readonly submitBehavior?: TextInputProps['submitBehavior'];
  readonly onSubmitEditing?: TextInputProps['onSubmitEditing'];
  // React 19: ref is a normal prop on function components, so Field can be
  // ref'd without forwardRef. The dialog holds the "To whom" ref here.
  readonly ref?: React.Ref<TextInput>;
}

export function Field({
  label,
  value,
  onChangeText,
  error,
  accessibilityLabel,
  style,
  keyboardType,
  returnKeyType,
  submitBehavior,
  onSubmitEditing,
  ref,
}: FieldProps) {
  const { tokens } = useTheme();
  const parts: TextStyle[] = [
    {
      backgroundColor: tokens.interactive,
      borderColor: tokens.border,
      borderWidth: 1,
      color: tokens.text,
      minHeight: 44,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 8,
    },
  ];
  return (
    <View style={[{ marginBottom: 16 }, style]}>
      <Text variant="secondary">{label}</Text>
      <TextInput
        accessible
        accessibilityLabel={accessibilityLabel ?? label}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        returnKeyType={returnKeyType}
        submitBehavior={submitBehavior}
        onSubmitEditing={onSubmitEditing}
        ref={ref}
        style={parts as StyleProp<TextStyle>}
      />
      {error && <Text variant="muted">{error}</Text>}
    </View>
  );
}

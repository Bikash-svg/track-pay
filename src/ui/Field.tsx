import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import React from 'react';
import { TextInput, View } from 'react-native';
import { Text } from './Text';
import { useTheme } from './useTheme';

interface FieldProps {
  readonly label: string;
  readonly value: string;
  readonly onChangeText: (text: string) => void;
  readonly error?: string;
  readonly keyboardType?: string;
  readonly accessibilityLabel?: string;
  readonly style?: StyleProp<ViewStyle>;
}

export function Field({
  label,
  value,
  onChangeText,
  error,
  keyboardType,
  accessibilityLabel,
  style,
}: FieldProps) {
  const { tokens } = useTheme();
  return (
    <View style={[{ marginBottom: 16 }, style]}>
      <Text variant="secondary" style={styles.label}>
        {label}
      </Text>
      <TextInput
        accessible
        accessibilityLabel={accessibilityLabel ?? label}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        style={[
          styles.input,
          {
            backgroundColor: tokens.inputFill,
            borderColor: tokens.border,
            borderWidth: 1,
            color: tokens.text,
            minHeight: 44,
          },
        ]}
      />
      {error && (
        <Text variant="muted" style={styles.error}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = {
  label: { marginBottom: 6 },
  input: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8 },
  error: { marginTop: 4 },
};

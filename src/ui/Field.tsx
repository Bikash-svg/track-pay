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
  readonly accessibilityLabel?: string;
  readonly style?: ViewStyle;
}

export function Field({
  label,
  value,
  onChangeText,
  error,
  accessibilityLabel,
  style,
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
        style={parts as StyleProp<TextStyle>}
      />
      {error && <Text variant="muted">{error}</Text>}
    </View>
  );
}

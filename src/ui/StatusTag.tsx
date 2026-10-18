import type { ViewStyle } from 'react-native';
import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from './useTheme';

export type StatusTagStatus = 'Done' | 'Failed' | 'Pending';

interface StatusTagProps {
  readonly status: StatusTagStatus;
  readonly style?: ViewStyle;
}

const STATUS_CONFIG: Record<StatusTagStatus, { bg: string; color: string }> = {
  Done: { bg: 'positive', color: 'positive' },
  Failed: { bg: 'negative', color: 'negative' },
  Pending: { bg: 'caution', color: 'caution' },
};

export function StatusTag({ status, style }: StatusTagProps) {
  const { tokens } = useTheme();
  const config = STATUS_CONFIG[status];
  const parts: ViewStyle[] = [
    {
      backgroundColor: tokens[config.bg as keyof typeof tokens],
      borderColor: tokens.border,
      borderWidth: 1,
      borderRadius: 999,
      paddingHorizontal: 8,
      paddingVertical: 4,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 24,
    },
  ];
  if (style) parts.push(style);
  return (
    <View style={parts}>
      <Text style={{ color: tokens[config.color as keyof typeof tokens] }}>
        {status}
      </Text>
    </View>
  );
}

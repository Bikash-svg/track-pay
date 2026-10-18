import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from './useTheme';

export type StatusTagStatus = 'Done' | 'Failed' | 'Pending';

interface StatusTagProps {
  readonly status: StatusTagStatus;
  readonly style?: StyleProp<ViewStyle>;
}

const STATUS_CONFIG: Record<StatusTagStatus, { bg: string; color: string }> = {
  Done: { bg: 'positive', color: 'positiveText' },
  Failed: { bg: 'negative', color: 'negativeText' },
  Pending: { bg: 'caution', color: 'cautionText' },
};

export function StatusTag({ status, style }: StatusTagProps) {
  const { tokens } = useTheme();
  const config = STATUS_CONFIG[status];
  return (
    <View
      style={[
        {
          backgroundColor: tokens[config.bg],
          borderColor: tokens.border,
          borderWidth: 1,
          borderRadius: 999,
          paddingHorizontal: 8,
          paddingVertical: 4,
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 24,
        },
        style,
      ]}
    >
      <Text style={[styles.text, { color: tokens[config.color] }]}>
        {status}
      </Text>
    </View>
  );
}

const styles = {
  text: { fontSize: 12, fontWeight: '600' },
};

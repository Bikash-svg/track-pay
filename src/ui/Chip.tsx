import type { StyleProp, ViewStyle } from 'react-native';
import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from './useTheme';

interface ChipProps {
  readonly children: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
}

export function Chip({ children, style }: ChipProps) {
  const { tokens } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: tokens.interactive,
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
      <Text>{children}</Text>
    </View>
  );
}

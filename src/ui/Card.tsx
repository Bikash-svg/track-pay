import type { StyleProp, ViewStyle } from 'react-native';
import React from 'react';
import { View } from 'react-native';
import { useTheme } from './useTheme';

interface CardProps {
  readonly children: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
}

export function Card({ children, style }: CardProps) {
  const { tokens } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: tokens.card,
          borderColor: tokens.borderCard,
          borderWidth: 1,
          borderRadius: 16,
          padding: 16,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

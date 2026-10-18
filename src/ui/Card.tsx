import type { ViewStyle } from 'react-native';
import React from 'react';
import { View } from 'react-native';
import { useTheme } from './useTheme';

interface CardProps {
  readonly children: React.ReactNode;
  readonly style?: ViewStyle;
}

export function Card({ children, style }: CardProps) {
  const { tokens } = useTheme();
  const parts: ViewStyle[] = [
    {
      backgroundColor: tokens.card,
      borderColor: tokens.border,
      borderWidth: 1,
      borderRadius: 16,
      padding: 16,
    },
  ];
  if (style) parts.push(style);
  return <View style={parts}>{children}</View>;
}

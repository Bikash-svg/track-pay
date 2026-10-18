import type { ViewStyle } from 'react-native';
import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from './useTheme';

interface BannerProps {
  readonly children: React.ReactNode;
  readonly style?: ViewStyle;
}

export function Banner({ children, style }: BannerProps) {
  const { tokens } = useTheme();
  const parts: ViewStyle[] = [
    {
      backgroundColor: tokens.cautionTint,
      borderColor: tokens.caution,
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
  ];
  if (style) parts.push(style);
  return (
    <View style={parts}>
      <Text style={{ color: tokens.caution }}>{children}</Text>
    </View>
  );
}

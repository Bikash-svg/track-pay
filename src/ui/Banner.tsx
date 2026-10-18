import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from './useTheme';

interface BannerProps {
  readonly children: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
}

export function Banner({ children, style }: BannerProps) {
  const { tokens } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: tokens.cautionTint,
          borderColor: tokens.caution,
          borderWidth: 1,
          borderRadius: 8,
          padding: 12,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <Text style={[styles.text, { color: tokens.cautionText }]}>
        {children}
      </Text>
    </View>
  );
}

const styles = {
  text: { fontSize: 14 },
};

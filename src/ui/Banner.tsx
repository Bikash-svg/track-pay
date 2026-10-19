import type { ViewStyle } from 'react-native';
import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from './useTheme';

interface BannerProps {
  readonly children: React.ReactNode;
  readonly action?: React.ReactNode;
  readonly style?: ViewStyle;
}

/**
 * Banner primitive (1.2). Optional `action` prop (3.3): when present, renders text + action in a row;
 * when absent, renders centred text (backwards compatible).
 */
export function Banner({ children, action, style }: BannerProps) {
  const { tokens } = useTheme();
  const parts: ViewStyle[] = [
    {
      backgroundColor: tokens.cautionTint,
      borderColor: tokens.caution,
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
    },
  ];
  if (style) parts.push(style);

  if (!action) {
    // Existing behavior: centred text
    parts[0].alignItems = 'center';
    parts[0].justifyContent = 'center';
    return (
      <View style={parts}>
        <Text style={{ color: tokens.caution }}>{children}</Text>
      </View>
    );
  }

  // New behavior: message text (left) + action (right) in a row
  parts[0].flexDirection = 'row';
  parts[0].alignItems = 'center';
  parts[0].justifyContent = 'space-between';
  return (
    <View style={parts}>
      <Text style={{ color: tokens.caution, flex: 1 }}>{children}</Text>
      <View style={{ marginLeft: 12 }}>{action}</View>
    </View>
  );
}
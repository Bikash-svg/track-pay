import type { StyleProp, ViewStyle } from 'react-native';
import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from './useTheme';

interface ScreenProps {
  readonly children: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
}

// Top inset only (2.2a). Tab screens get bottom clearance from TabBar; stack
// pages (pending, scanner) have their header for the top and no bottom content
// yet. If Phase 4.x adds bottom content to a stack page, add a bottomSafeArea
// prop here.
export function Screen({ children, style }: ScreenProps) {
  const { tokens } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={[{ flex: 1, backgroundColor: tokens.canvas, paddingTop: insets.top }, style]}>
      <View style={{ padding: 16 }}>{children}</View>
    </View>
  );
}
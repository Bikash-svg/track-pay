import type { StyleProp, ViewStyle } from 'react-native';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from './useTheme';

interface ScreenProps {
  readonly children: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
  // padTop (3.6): default true applies insets.top. Tab screens pass false
  // because TopBar (in (tabs)/_layout.tsx) handles the top inset — prevents
  // double padding under the bar. Non-tab screens (onboarding) keep default
  // true.
  readonly padTop?: boolean;
}

// Top inset only (2.2a). Tab screens get bottom clearance from TabBar;
// stack pages have no bottom content yet. If Phase 4.x adds bottom content
// to a stack page, add a bottomSafeArea prop here.
export function Screen({ children, style, padTop = true }: ScreenProps) {
  const { tokens } = useTheme();
  const insets = useSafeAreaInsets();
  const topPad = padTop ? insets.top : 0;
  return (
    <View style={[{ flex: 1, backgroundColor: tokens.canvas, paddingTop: topPad }, style]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, padding: 16 }}
      >
        {children}
      </ScrollView>
    </View>
  );
}
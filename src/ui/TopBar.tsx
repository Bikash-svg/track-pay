import React, { type ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from './Text';
import { useTheme } from './useTheme';
import { copy } from './copy';

// 3.6 Top bar. App name (copy.appName = 'Track Pay') left, Profile button right.
// 4-B.0 (2026-10-28): bell removed (D20, item 10). Text-only in Track A; no
// avatar circle, no icons. Handles its own safe-area top inset via insets.top;
// tab screens pass padTop={false} to Screen to avoid double padding.
export function TopBar({ children }: { readonly children?: ReactNode }) {
  const { tokens } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          paddingTop: insets.top,
          paddingHorizontal: 16,
          paddingBottom: 12,
          backgroundColor: tokens.canvas,
          borderBottomColor: tokens.border,
          borderBottomWidth: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text>{copy.appName}</Text>
        <Pressable
          onPress={() => router.push('/settings')}
          accessibilityLabel={copy.profile}
          style={{
            minWidth: 44,
            minHeight: 44,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text>{copy.profile}</Text>
        </Pressable>
      </View>
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}
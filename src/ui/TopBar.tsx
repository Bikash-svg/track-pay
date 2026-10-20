import React, { type ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from './Text';
import { useTheme } from './useTheme';
import { usePendingCount } from './PendingCountProvider';
import { copy } from './copy';

// 3.6 Top bar. App name (copy.appName = 'Track Pay') left, bell + count badge,
// Profile button right. Bell always renders; the badge count shows only when
// pendingCount > 0. Text-only in Track A (no avatar circle, no icons —
// DESIGN.md Track B D4.2 owns visuals). Handles its own safe-area top inset
// via insets.top; tab screens pass padTop={false} to Screen to avoid double
// padding. Bell icon is a Track A placeholder; Track B D2.6 replaces it with a
// lucide icon.
export function TopBar({ children }: { readonly children?: ReactNode }) {
  const { tokens } = useTheme();
  const insets = useSafeAreaInsets();
  const { pendingCount } = usePendingCount();

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
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable
            onPress={() => router.push('/pending')}
            accessibilityLabel={copy.notificationsPending(pendingCount)}
            style={{
              minWidth: 44,
              minHeight: 44,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text>{pendingCount > 0 ? `🔔 ${pendingCount}` : '🔔'}</Text>
          </Pressable>
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
      </View>
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}
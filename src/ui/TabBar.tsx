import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from './Text';
import { useTheme } from './useTheme';

export function TabBar({ state, navigation, descriptors }: BottomTabBarProps) {
  const { tokens } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: tokens.card,
        borderTopColor: tokens.border,
        borderTopWidth: 1,
        paddingVertical: 4,
      }}
    >
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const descriptor = descriptors[route.key];
        const label =
          (descriptor.options.tabBarLabel as string | undefined) ??
          route.name;
        const accessibilityLabel =
          (descriptor.options.tabBarAccessibilityLabel as string | undefined) ??
          label;
        const color = isFocused ? tokens.primary : tokens.textMuted;
        return (
          <Pressable
            key={route.key}
            accessible
            accessibilityRole="tab"
            accessibilityLabel={accessibilityLabel}
            accessibilityState={{ selected: isFocused }}
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            }}
            style={{
              flex: 1,
              minHeight: 44,
              justifyContent: 'center',
              alignItems: 'center',
              paddingVertical: 8,
            }}
          >
            <Text style={{ color, fontWeight: isFocused ? '600' : '400' }}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
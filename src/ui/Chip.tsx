import type { StyleProp, ViewStyle } from 'react-native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from './useTheme';

interface ChipProps {
  readonly children: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
  readonly selected?: boolean;
  readonly onPress?: () => void;
}

export function Chip({ children, style, selected, onPress }: ChipProps) {
  const { tokens } = useTheme();
  const content = (
    <View
      style={[
        {
          backgroundColor: tokens.interactive,
          borderColor: selected ? tokens.primary : tokens.border,
          borderWidth: 1,
          borderRadius: 999,
          paddingHorizontal: 8,
          paddingVertical: 4,
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 24,
        },
        style,
      ]}
    >
      <Text style={{ color: selected ? tokens.primary : tokens.text }}>
        {children}
      </Text>
    </View>
  );

  if (onPress === undefined) return content;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={{ minHeight: 44, minWidth: 44, justifyContent: 'center' }}
    >
      {content}
    </Pressable>
  );
}

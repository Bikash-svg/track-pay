import type { TextStyle, ViewStyle } from 'react-native';
import React from 'react';
import { Pressable, Text } from 'react-native';
import { useTheme } from './useTheme';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'text';

interface ButtonProps {
  readonly variant?: ButtonVariant;
  readonly children: React.ReactNode;
  readonly onPress?: () => void;
  readonly disabled?: boolean;
  readonly accessibilityLabel?: string;
  readonly style?: ViewStyle;
}

export function Button({
  variant = 'primary',
  children,
  onPress,
  disabled = false,
  accessibilityLabel,
  style,
}: ButtonProps) {
  const { tokens } = useTheme();
  const isText = variant === 'text';
  let bg: string;
  let color: string;
  if (isText) {
    bg = 'transparent';
    color = tokens.primary;
  } else if (variant === 'secondary') {
    bg = tokens.interactive;
    color = tokens.text;
  } else if (variant === 'danger') {
    bg = tokens.negative;
    color = tokens.onPrimary;
  } else {
    bg = tokens.primary;
    color = tokens.onPrimary;
  }
  const parts: ViewStyle[] = [
    {
      minHeight: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      paddingHorizontal: 16,
      backgroundColor: disabled ? tokens.interactive : bg,
      opacity: disabled ? 0.4 : undefined,
    },
  ];
  if (style) parts.push(style);
  const textStyle: TextStyle = { color, fontWeight: '600' };
  return (
    <Pressable
      accessible
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={disabled ? undefined : onPress}
      style={parts}
    >
      <Text style={textStyle}>{children}</Text>
    </Pressable>
  );
}

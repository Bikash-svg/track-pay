import type { StyleProp, ViewStyle, TextStyle } from 'react-native';
import React from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import { useTheme } from './useTheme';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'text';

interface ButtonProps {
  readonly variant?: ButtonVariant;
  readonly children: React.ReactNode;
  readonly onPress?: () => void;
  readonly disabled?: boolean;
  readonly accessibilityLabel?: string;
  readonly style?: StyleProp<ViewStyle>;
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
  const base: ViewStyle = {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingHorizontal: 16,
  };
  let bg: string;
  let color: string;
  if (isText) {
    bg = 'transparent';
    color = tokens.primaryText;
  } else if (variant === 'secondary') {
    bg = tokens.ghostFill;
    color = tokens.text;
  } else if (variant === 'danger') {
    bg = tokens.negative;
    color = tokens.onPrimary;
  } else {
    bg = tokens.primary;
    color = tokens.onPrimary;
  }
  const containerStyle: ViewStyle = {
    ...base,
    backgroundColor: disabled ? tokens.interactive : bg,
    opacity: disabled ? 0.4 : undefined,
    ...style,
  };
  const textStyle: TextStyle = { color, fontWeight: '600' };
  return (
    <Pressable
      accessible
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={disabled ? undefined : onPress}
      style={containerStyle}
    >
      <Text style={textStyle}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({});

import type { StyleProp, TextStyle } from 'react-native';
import React from 'react';
import { Text as RNText, type TextStyle as RNTextStyle } from 'react-native';
import { useTheme } from './useTheme';

type TextVariant = 'default' | 'secondary' | 'muted';

interface TextProps {
  readonly children: React.ReactNode;
  readonly style?: StyleProp<TextStyle>;
  readonly variant?: TextVariant;
}

export function Text({ children, style, variant = 'default', ...rest }: TextProps) {
  const { tokens } = useTheme();
  let color: string;
  if (variant === 'secondary') color = tokens.textSecondary;
  else if (variant === 'muted') color = tokens.textMuted;
  else color = tokens.text;
  return (
    <RNText style={[{ color }, style]} {...rest}>
      {children}
    </RNText>
  );
}

export type { RNTextStyle as TextStyle };

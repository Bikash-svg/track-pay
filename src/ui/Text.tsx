import type { StyleProp, TextStyle } from 'react-native';
import React from 'react';
import { Text as RNText } from 'react-native';
import { useTheme } from './useTheme';

type TextVariant = 'default' | 'secondary' | 'muted' | 'heading' | 'display' | 'numeric' | 'body';

interface TextProps {
  readonly children: React.ReactNode;
  readonly style?: StyleProp<TextStyle>;
  readonly variant?: TextVariant;
}

export function Text({ children, style, variant = 'default', ...rest }: TextProps) {
  const { tokens } = useTheme();
  let color: string;
  let fontFamily: string;
  if (variant === 'secondary') {
    color = tokens.textSecondary;
    fontFamily = tokens.fontBody;
  } else if (variant === 'muted') {
    color = tokens.textMuted;
    fontFamily = tokens.fontBody;
  } else if (variant === 'heading') {
    color = tokens.text;
    fontFamily = tokens.fontHeading;
  } else if (variant === 'display') {
    color = tokens.text;
    fontFamily = tokens.fontDisplay;
  } else if (variant === 'numeric') {
    color = tokens.text;
    fontFamily = tokens.fontNumeric;
  } else if (variant === 'body') {
    color = tokens.text;
    fontFamily = tokens.fontBody;
  } else {
    color = tokens.text;
    fontFamily = tokens.fontBody;
  }
  return <RNText style={[{ color, fontFamily }, style]} {...rest}>{children}</RNText>;
}

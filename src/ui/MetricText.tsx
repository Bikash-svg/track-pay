// Metric text for Analytics (Step B D4.4). JetBrains Mono with tabular
// numerals for every amount, percentage, date digit and counter.
// Accepts a value in integer paise and formats it through formatMoney.
//
// All colour and size values come from tokens only.
//
import React from 'react';
import type { StyleProp, TextStyle } from 'react-native';
import { Text } from './Text';
import { formatMoney } from './Money';
import { useTheme } from './useTheme';

type MetricSize = 'hero' | 'medium' | 'small';

interface MetricTextProps {
  readonly value: number; // paise
  readonly size?: MetricSize;
  readonly color?: string;
  readonly style?: StyleProp<TextStyle>;
}

// Font sizes per DESIGN-TOKENS.md type table.
const SIZE_TO_FONT_SIZE: Record<MetricSize, number> = {
  hero: 40,
  medium: 15,
  small: 13,
};

export function MetricText({
  value,
  size = 'medium',
  color,
  style,
}: MetricTextProps) {
  const { tokens } = useTheme();
  const fontSize = SIZE_TO_FONT_SIZE[size];

  return (
    <Text
      variant="numeric"
      style={[
        {
          fontSize,
          color: color ?? tokens.text,
        },
        style,
      ]}
    >
      {formatMoney(value)}
    </Text>
  );
}

import type { StyleProp, TextStyle } from 'react-native';
import React from 'react';
import { Text } from './Text';

export function formatMoney(paise: number): string {
  const rupees = Math.round(paise / 100);
  return `₹${rupees.toLocaleString('en-IN')}`;
}

interface MoneyProps {
  readonly paise: number;
  readonly style?: StyleProp<TextStyle>;
}

export function Money({ paise, style }: MoneyProps) {
  return <Text style={style}>{formatMoney(paise)}</Text>;
}

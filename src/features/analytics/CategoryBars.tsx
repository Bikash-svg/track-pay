// Category totals for Analytics (Step 5.5). Plain Track A: one row per
// category with a proportional bar and the amount. All five categories always
// render, even when their total is zero, so the list never jumps.
//
// All amounts are integer paise. Colour values come from tokens only.

import React from 'react';
import { View } from 'react-native';
import type { Payment } from '../../data/payments';
import { categoryTotals } from '../../domain/analytics';
import { formatMoney } from '../../ui/Money';
import { Text } from '../../ui/Text';
import { useTheme } from '../../ui/useTheme';

interface CategoryBarsProps {
  readonly payments: readonly Payment[];
  readonly year: number;
  readonly month: number;
}

export function CategoryBars({ payments, year, month }: CategoryBarsProps) {
  const { tokens } = useTheme();
  const totals = categoryTotals(payments, year, month);
  const entries = Object.entries(totals);
  const monthlyTotal = entries.reduce((sum, [, value]) => sum + value, 0);
  const maxTotal = Math.max(...entries.map(([, value]) => value), 1);

  return (
    <View>
      <Text>Categories</Text>
      {entries.map(([category, value]) => (
        <View
          key={category}
          testID={`category-row-${category}`}
          style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}
        >
          <Text style={{ width: 80 }}>{category}</Text>
          <View
            style={{
              flex: 1,
              height: 8,
              backgroundColor: tokens.interactive,
              borderRadius: 4,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                height: 8,
                borderRadius: 4,
                backgroundColor: tokens.primary,
                width: `${(value / maxTotal) * 100}%`,
              }}
            />
          </View>
          <Text style={{ width: 80, textAlign: 'right' }}>{formatMoney(value)}</Text>
        </View>
      ))}
      {monthlyTotal === 0 ? (
        <Text variant="muted">No payments this month</Text>
      ) : null}
    </View>
  );
}

// Category totals for Analytics (Step B D4.4). Restyled to the design system:
// one row per category with a proportional bar and the amount in JetBrains
// Mono. All five categories always render, even when their total is zero,
// so the list never jumps. Empty state uses COPY.md exact text.
//
// All amounts are integer paise. Colour values come from tokens only.
//
import React from 'react';
import { View } from 'react-native';
import type { Payment } from '../../data/payments';
import { Card } from '../../ui/Card';
import { categoryTotals } from '../../domain/analytics';
import { MetricText } from '../../ui/MetricText';
import { Text } from '../../ui/Text';
import { useTheme } from '../../ui/useTheme';
import { copy } from '../../ui/copy';

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
    <Card>
      <Text
        style={{
          fontFamily: tokens.fontHeading,
          fontSize: 18,
          fontWeight: '700',
          color: tokens.text,
        }}
      >
        Categories
      </Text>
      {entries.map(([category, value]) => (
        <View
          key={category}
          testID={`category-row-${category}`}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <Text
            style={{
              fontFamily: tokens.fontBody,
              fontSize: 14,
              color: tokens.textSecondary,
              width: 90,
            }}
          >
            {category}
          </Text>
          <View
            style={{
              flex: 1,
              height: 8,
              backgroundColor: tokens.container,
              borderRadius: 4,
              overflow: 'hidden',
              marginHorizontal: 12,
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
          <MetricText
            value={value}
            size="small"
            style={{ width: 70, textAlign: 'right' }}
          />
        </View>
      ))}
      {monthlyTotal === 0 ? (
        <Text variant="muted">{copy.noSpendingThisMonth}</Text>
      ) : null}
    </Card>
  );
}

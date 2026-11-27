// Six-month spending trend for Analytics (Step B D4.4). Restyled to the
// design system: one bar per month (last six, including the current month)
// scaled to the highest month, amounts in JetBrains Mono. The monthly limit
// is shown as text only until Step 7.3 makes it editable.
//
// All amounts are integer paise. Colour values come from tokens only.
//
import React from 'react';
import { View } from 'react-native';
import type { Payment } from '../../data/payments';
import { monthlyTotal } from '../../domain/analytics';
import { Card } from '../../ui/Card';
import { formatMoney } from '../../ui/Money';
import { MetricText } from '../../ui/MetricText';
import { Text } from '../../ui/Text';
import { useTheme } from '../../ui/useTheme';

interface MonthlyTrendProps {
  readonly payments: readonly Payment[];
  readonly limit: number | null;
  readonly now: Date;
}

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function monthShortName(month: number): string {
  return MONTH_NAMES[month] ?? '';
}

export function MonthlyTrend({ payments, limit, now }: MonthlyTrendProps) {
  const { tokens } = useTheme();

  const months: { year: number; month: number; total: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      year: d.getFullYear(),
      month: d.getMonth(),
      total: monthlyTotal(payments, d.getFullYear(), d.getMonth()),
    });
  }

  const maxTotal = Math.max(...months.map((m) => m.total), 1);

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
        Monthly spending
      </Text>
      <View
        testID="trend-bars"
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          height: 80,
        }}
      >
        {months.map((m, index) => (
          <View
            key={`${m.year}-${m.month}`}
            style={{ alignItems: 'center', flex: 1 }}
          >
            <View style={{ height: 60, justifyContent: 'flex-end' }}>
              <View
                testID={`trend-bar-${index}`}
                style={{
                  height: `${(m.total / maxTotal) * 100}%`,
                  backgroundColor: tokens.primary,
                  width: 20,
                  borderRadius: 2,
                }}
              />
            </View>
            <MetricText value={m.total} size="small" />
            <Text
              style={{
                fontFamily: tokens.fontNumeric,
                fontSize: 9,
                color: tokens.textMuted,
                marginTop: 2,
              }}
            >
              {monthShortName(m.month)}
            </Text>
          </View>
        ))}
      </View>
      {limit !== null && limit > 0 ? (
        <Text variant="muted">Limit: {formatMoney(limit)}</Text>
      ) : null}
    </Card>
  );
}

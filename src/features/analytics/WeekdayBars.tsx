// Weekday totals for Analytics (Step B D4.4). Restyled to the design system:
// seven bars, one per weekday, scaled to the highest weekday total. Sunday is
// index 0, matching weekdayTotals(). Amounts in JetBrains Mono.
//
// All amounts are integer paise. Colour values come from tokens only.
//
import React from 'react';
import { View } from 'react-native';
import type { Payment } from '../../data/payments';
import { Card } from '../../ui/Card';
import { weekdayTotals } from '../../domain/analytics';
import { MetricText } from '../../ui/MetricText';
import { Text } from '../../ui/Text';
import { useTheme } from '../../ui/useTheme';
import { copy } from '../../ui/copy';

interface WeekdayBarsProps {
  readonly payments: readonly Payment[];
  readonly year: number;
  readonly month: number;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function WeekdayBars({ payments, year, month }: WeekdayBarsProps) {
  const { tokens } = useTheme();
  const totals = weekdayTotals(payments, year, month);
  const maxTotal = Math.max(...totals, 1);
  const anySpend = totals.some((value) => value > 0);

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
        Weekdays
      </Text>
      <View
        testID="weekday-bars"
        style={{ flexDirection: 'row', justifyContent: 'space-between' }}
      >
        {totals.map((value, index) => (
          <View
            key={DAY_NAMES[index]}
            testID={`weekday-bar-${index}`}
            style={{ alignItems: 'center', flex: 1 }}
          >
            <View style={{ height: 60, justifyContent: 'flex-end' }}>
              <View
                style={{
                  height: `${(value / maxTotal) * 100}%`,
                  backgroundColor: tokens.primary,
                  width: 20,
                  borderRadius: 2,
                }}
              />
            </View>
            <MetricText
              value={value}
              size="small"
              style={{ marginTop: 4 }}
            />
            <Text
              style={{
                fontFamily: tokens.fontNumeric,
                fontSize: 11,
                color: tokens.textMuted,
                marginTop: 2,
              }}
            >
              {DAY_NAMES[index]}
            </Text>
          </View>
        ))}
      </View>
      {!anySpend ? (
        <Text variant="muted">{copy.noSpendingThisMonth}</Text>
      ) : null}
    </Card>
  );
}

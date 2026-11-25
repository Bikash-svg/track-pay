// Weekday totals for Analytics (Step 5.5). Plain Track A: seven bars, one per
// weekday, scaled to the highest weekday total. Sunday is index 0, matching
// weekdayTotals().
//
// All amounts are integer paise. Colour values come from tokens only.

import React from 'react';
import { View } from 'react-native';
import type { Payment } from '../../data/payments';
import { weekdayTotals } from '../../domain/analytics';
import { Text } from '../../ui/Text';
import { useTheme } from '../../ui/useTheme';

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

  return (
    <View>
      <Text>Weekdays</Text>
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
            <Text style={{ fontSize: 10 }}>{DAY_NAMES[index]}</Text>
          </View>
        ))}
      </View>
      {totals.every((value) => value === 0) ? (
        <Text variant="muted">No payments this month</Text>
      ) : null}
    </View>
  );
}

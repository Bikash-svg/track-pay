// Month calendar for Analytics (Step 5.7). Plain Track A: a 7-column grid of
// the month's days. The highest and lowest non-zero spending days are marked
// (highest in the primary colour, lowest in the negative colour) and named in
// the text below. Ties go to the earlier date because the comparisons are
// strict, so the first matching day wins.
//
// All amounts are integer paise. Colour values come from tokens only.

import React from 'react';
import { View } from 'react-native';
import type { Payment } from '../../data/payments';
import { cumulativeSpendPerDay, daysInMonth } from '../../domain/analytics';
import { formatMoney } from '../../ui/Money';
import { Text } from '../../ui/Text';
import { useTheme } from '../../ui/useTheme';

interface MonthCalendarProps {
  readonly payments: readonly Payment[];
  readonly year: number;
  readonly month: number;
}

export function MonthCalendar({ payments, year, month }: MonthCalendarProps) {
  const { tokens } = useTheme();
  const dim = daysInMonth(year, month);
  const cumulative = cumulativeSpendPerDay(payments, year, month);

  // Per-day spend (not cumulative) for marking the highest and lowest days.
  const perDay: number[] = [];
  for (let i = 0; i < dim; i++) {
    perDay[i] = i === 0 ? cumulative[0] : cumulative[i] - cumulative[i - 1];
  }

  // Highest and lowest non-zero days. Strict comparisons keep the earlier day
  // on a tie (EVALS A4).
  let highestDay = -1;
  let lowestDay = -1;
  let highestVal = 0;
  let lowestVal = Infinity;
  for (let i = 0; i < dim; i++) {
    if (perDay[i] > 0) {
      if (perDay[i] > highestVal) {
        highestVal = perDay[i];
        highestDay = i;
      }
      if (perDay[i] < lowestVal) {
        lowestVal = perDay[i];
        lowestDay = i;
      }
    }
  }

  // 7-column grid with leading blanks before the 1st.
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sunday
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= dim; d++) cells.push(d);

  return (
    <View>
      <Text>Calendar</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {cells.map((day, index) => (
          <View
            key={index}
            testID={day !== null ? `calendar-day-${day}` : undefined}
            style={{
              width: '14.28%',
              aspectRatio: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {day !== null ? (
              <Text
                style={{
                  fontWeight:
                    day - 1 === highestDay || day - 1 === lowestDay
                      ? 'bold'
                      : 'normal',
                  color:
                    day - 1 === highestDay
                      ? tokens.primary
                      : day - 1 === lowestDay
                        ? tokens.negative
                        : tokens.text,
                }}
              >
                {day}
              </Text>
            ) : null}
          </View>
        ))}
      </View>
      {highestDay >= 0 ? (
        <Text variant="muted">
          Highest: day {highestDay + 1} ({formatMoney(highestVal)})
        </Text>
      ) : null}
      {lowestDay >= 0 ? (
        <Text variant="muted">
          Lowest: day {lowestDay + 1} ({formatMoney(lowestVal)})
        </Text>
      ) : null}
      {highestDay < 0 ? (
        <Text variant="muted">No payments this month</Text>
      ) : null}
    </View>
  );
}

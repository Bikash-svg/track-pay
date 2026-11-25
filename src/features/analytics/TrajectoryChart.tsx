// Spending trajectory (Step 5.4). Plain React Native views only: no chart
// library, no animation, no hex values. Cumulative spend is drawn as one bar
// per day of the month, with the straight-line ceiling behind it when a limit
// is set. The current day's bar is highlighted. A text summary below the chart
// carries the same information for screen readers.
//
// All amounts are integer paise. The maths lives in src/domain/analytics.ts;
// this component only scales the numbers to pixels.

import React from 'react';
import { View } from 'react-native';
import type { Payment } from '../../data/payments';
import {
  cumulativeSpendPerDay,
  daysInMonth,
  straightLineCeiling,
} from '../../domain/analytics';
import { formatMoney } from '../../ui/Money';
import { Text } from '../../ui/Text';
import { useTheme } from '../../ui/useTheme';

interface TrajectoryChartProps {
  readonly payments: readonly Payment[];
  readonly limit: number | null;
  readonly now: Date;
}

const CHART_HEIGHT = 120;

export function TrajectoryChart({ payments, limit, now }: TrajectoryChartProps) {
  const { tokens } = useTheme();
  const year = now.getFullYear();
  const month = now.getMonth();
  const dim = daysInMonth(year, month);
  const cumulative = cumulativeSpendPerDay(payments, year, month);
  const hasLimit = limit !== null && limit > 0;
  const ceiling = hasLimit ? straightLineCeiling(limit, dim) : [];
  const today = now.getDate();

  // maxVal is at least 1, so the height ratios never divide by zero. It
  // includes the limit so the ceiling line is drawn at the right scale even
  // when cumulative spend is still below it.
  const maxVal = Math.max(
    ...cumulative,
    ...ceiling,
    ...(hasLimit && limit !== null ? [limit] : []),
    1,
  );

  const spentTotal = cumulative.length > 0 ? cumulative[cumulative.length - 1] : 0;
  const ceilingTotal = ceiling.length > 0 ? ceiling[ceiling.length - 1] : 0;

  const summary = hasLimit
    ? `${formatMoney(spentTotal)} spent · ${formatMoney(ceilingTotal)} ceiling · ${dim} days · today is day ${today}`
    : `${formatMoney(spentTotal)} spent · ${dim} days · today is day ${today}`;

  return (
    <View>
      <View
        testID="trajectory-chart"
        style={{ height: CHART_HEIGHT, flexDirection: 'row', alignItems: 'flex-end' }}
        accessible
        accessibilityRole="image"
        accessibilityLabel={summary}
      >
        {cumulative.map((value, index) => {
          const day = index + 1;
          const isToday = day === today;
          const cumulativeHeight = (value / maxVal) * CHART_HEIGHT;
          const ceilingHeight = ((ceiling[index] ?? 0) / maxVal) * CHART_HEIGHT;
          return (
            <View
              key={day}
              testID={`trajectory-day-${day}`}
              style={{
                flex: 1,
                height: CHART_HEIGHT,
                justifyContent: 'flex-end',
                alignItems: 'center',
              }}
            >
              {hasLimit ? (
                <View
                  testID={`trajectory-ceiling-${day}`}
                  style={{
                    width: '60%',
                    height: ceilingHeight,
                    backgroundColor: tokens.border,
                  }}
                />
              ) : null}
              <View
                testID={isToday ? 'trajectory-today' : undefined}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  width: '60%',
                  height: cumulativeHeight,
                  backgroundColor: isToday ? tokens.primary : tokens.textSecondary,
                }}
              />
            </View>
          );
        })}
      </View>
      <Text variant="secondary">{summary}</Text>
    </View>
  );
}

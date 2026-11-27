// Spending trajectory (Step B D4.4). Restyled to the design system:
// cumulative spend drawn as a line against a straight-line ceiling when a
// limit is set. Today marked with a dot. Axis values in JetBrains Mono.
//
// All amounts are integer paise. Colour values come from tokens only.
//
import React from 'react';
import { View } from 'react-native';
import type { Payment } from '../../data/payments';
import {
  cumulativeSpendPerDay,
  daysInMonth,
  straightLineCeiling,
} from '../../domain/analytics';
import { Card } from '../../ui/Card';
import { formatMoney } from '../../ui/Money';
import { MetricText } from '../../ui/MetricText';
import { Text } from '../../ui/Text';
import { useTheme } from '../../ui/useTheme';

interface TrajectoryChartProps {
  readonly payments: readonly Payment[];
  readonly limit: number | null;
  readonly now: Date;
}

const CHART_HEIGHT = 140;
const LINE_WIDTH = 2;
const DOT_SIZE = 8;

export function TrajectoryChart({ payments, limit, now }: TrajectoryChartProps) {
  const { tokens } = useTheme();
  const year = now.getFullYear();
  const month = now.getMonth();
  const dim = daysInMonth(year, month);
  const cumulative = cumulativeSpendPerDay(payments, year, month);
  const hasLimit = limit !== null && limit > 0;
  const ceiling = hasLimit ? straightLineCeiling(limit, dim) : [];
  const today = now.getDate();

  // maxVal is at least 1, so the height ratios never divide by zero.
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

  // Point positions for the cumulative line: x spread evenly across the
  // width, y measured up from the bottom.
  const points = cumulative.map((value, index) => ({
    x: (index / Math.max(dim - 1, 1)) * 100,
    y: 100 - (value / maxVal) * 100,
  }));

  const ceilingPoints = hasLimit
    ? ceiling.map((value, index) => ({
        x: (index / Math.max(dim - 1, 1)) * 100,
        y: 100 - (value / maxVal) * 100,
      }))
    : [];

  return (
    <Card>
      <View
        testID="trajectory-chart"
        style={{
          height: CHART_HEIGHT,
          position: 'relative',
        }}
        accessible
        accessibilityRole="image"
        accessibilityLabel={summary}
      >
        {hasLimit ? (
          <View
            testID="trajectory-ceiling"
            style={{
              position: 'absolute',
              top: `${ceilingPoints[0]?.y ?? 100}%`,
              left: 0,
              right: 0,
              height: 1,
              backgroundColor: tokens.border,
              borderStyle: 'dashed',
              borderWidth: 1,
            }}
          />
        ) : null}

        {/* Cumulative spend line — drawn as connected segments. */}
        {points.map((point, index) => {
          const isToday = index + 1 === today;
          return (
            <View
              key={index + 1}
              testID={`trajectory-day-${index + 1}`}
              style={{
                position: 'absolute',
                left: `${point.x}%`,
                top: `${point.y}%`,
                width: LINE_WIDTH,
                height: 100 - point.y,
                backgroundColor: isToday ? tokens.primary : tokens.textSecondary,
              }}
            />
          );
        })}

        {/* Today dot on the cumulative line. */}
        {dim > 0 && (
          <View
            testID="trajectory-today"
            style={{
              position: 'absolute',
              left: `${points[today - 1]?.x ?? 0}%`,
              top: `${points[today - 1]?.y ?? 100}%`,
              width: DOT_SIZE,
              height: DOT_SIZE,
              borderRadius: DOT_SIZE / 2,
              backgroundColor: tokens.primary,
              borderWidth: 2,
              borderColor: tokens.card,
            }}
          />
        )}
      </View>
      <Text variant="secondary">{summary}</Text>
    </Card>
  );
}

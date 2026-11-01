// Home spend card (3.2). Renders 'Spend on {Month}' + amount + the privacy
// footnote always. When limit=null, no limit-dependent UI shows. When limit is
// set: limit text, progress bar (fill colour per A6 via barColour), and one of
// overBy/xLeft/leftPerDay.
// Bar width clamps to 100% so the over-limit case doesn't overflow visually.
// Inline barHeight=4 is a Track A compromise — Track B D1.2 migrates inline sizes to tokens.
// No animation (Track A D12).
import React from 'react';
import { View } from 'react-native';
import { Money, formatMoney } from './Money';
import { Text } from './Text';
import { Card } from './Card';
import { barColour } from './barColour';
import { useTheme } from './useTheme';
import type { MonthStats } from '../domain/monthStats';
import { copy } from './copy';

interface SpendCardProps {
  readonly stats: MonthStats;
  readonly month: string;
}

export function SpendCard({ stats, month }: SpendCardProps) {
  const { tokens } = useTheme();
  const { limit, left, allowancePerDay, percentUsed, level } = stats;

  // Early-return for the no-limit view (narrows the nulls to non-null below).
  if (limit === null || left === null || allowancePerDay === null || percentUsed === null || level === null) {
    return (
      <Card>
        <Text>{copy.spendOn(month)}</Text>
        <Money paise={stats.spent} />
        <Text variant="muted">{copy.basedOnPayments}</Text>
      </Card>
    );
  }

  // All limit-dependent locals are non-null from here.
  const clampedPercent = Math.min(percentUsed, 100);
  const over = level === 'over';
  const lastDay = stats.daysElapsed === stats.daysInMonth;

  return (
    <Card>
      <Text>{copy.spendOn(month)}</Text>
      <Money paise={stats.spent} />
      <Text variant="secondary">{copy.limit(formatMoney(limit))}</Text>
      <View
        style={{ height: 4, backgroundColor: tokens.border }}
        accessibilityLabel={`${percentUsed} percent of limit used`}
      >
        <View
          style={{
            height: 4,
            width: `${clampedPercent}%`,
            backgroundColor: tokens[barColour(level)],
          }}
        />
      </View>
      {over ? (
        <Text>{copy.overBy(formatMoney(Math.abs(left)))}</Text>
      ) : lastDay ? (
        <Text>{copy.xLeft(formatMoney(left))}</Text>
      ) : (
        <Text>{copy.leftPerDay(formatMoney(left), formatMoney(allowancePerDay), stats.daysRemaining)}</Text>
      )}
      <Text variant="muted">{copy.basedOnPayments}</Text>
    </Card>
  );
}

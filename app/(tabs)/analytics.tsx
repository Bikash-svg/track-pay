// Analytics screen (Step 5.4). Plain Track A layout: the trajectory chart
// plus a short pace summary. The monthly limit is not editable until Step 7.3,
// so the chart is given `limit = null` here; the ceiling appears as soon as a
// limit is supplied.
import React, { useState } from 'react';
import { Screen } from '../../src/ui/Screen';
import { Text } from '../../src/ui/Text';
import { formatMoney } from '../../src/ui/Money';
import { copy } from '../../src/ui/copy';
import { usePayments } from '../../src/data/payments';
import { TrajectoryChart } from '../../src/features/analytics/TrajectoryChart';
import { CategoryBars } from '../../src/features/analytics/CategoryBars';
import { WeekdayBars } from '../../src/features/analytics/WeekdayBars';
import { TopPayees } from '../../src/features/analytics/TopPayees';
import { MonthlyTrend } from '../../src/features/analytics/MonthlyTrend';
import { MonthCalendar } from '../../src/features/analytics/MonthCalendar';
import { paceSummary } from '../../src/domain/paceSummary';

export default function AnalyticsScreen() {
  const { payments } = usePayments();
  const now = new Date();
  const [displayDate, setDisplayDate] = useState(() => new Date());
  const pace = paceSummary(payments, null, now);
  const versus = pace.versusLastMonth;

  const versusText =
    versus.percentChange === null
      ? `vs last month, same days: — (${formatMoney(Math.abs(versus.diff))})`
      : `vs last month, same days: ${versus.diff > 0 ? '+' : ''}${versus.percentChange}% (${formatMoney(Math.abs(versus.diff))})`;

  return (
    <Screen padTop={false}>
      <Text>Analytics</Text>
      <Text variant="muted">{copy.basedOnPayments}</Text>

      <TrajectoryChart payments={payments} limit={null} now={now} />

      <Text>{`Daily average ${formatMoney(pace.dailyAverage)}`}</Text>
      <Text>{`Projected month end ${formatMoney(pace.projectedMonthEnd)} (estimate)`}</Text>
      <Text>{versusText}</Text>

      <CategoryBars
        payments={payments}
        year={now.getFullYear()}
        month={now.getMonth()}
      />
      <WeekdayBars
        payments={payments}
        year={now.getFullYear()}
        month={now.getMonth()}
      />
      <TopPayees
        payments={payments}
        year={now.getFullYear()}
        month={now.getMonth()}
      />
      <MonthlyTrend payments={payments} limit={null} now={now} />
      <MonthCalendar
        payments={payments}
        displayDate={displayDate}
        today={now}
        onChangeMonth={setDisplayDate}
      />
    </Screen>
  );
}

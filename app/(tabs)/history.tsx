import { Screen } from '../../src/ui/Screen';
import { Text } from '../../src/ui/Text';
import { usePayments } from '../../src/data/payments';
import { groupByMonth } from '../../src/features/history/groupByMonth';
import { MonthGroup } from '../../src/features/history/MonthGroup';

export default function HistoryScreen() {
  const { payments } = usePayments();
  const now = new Date();
  const groups = groupByMonth(payments);

  return (
    <Screen padTop={false}>
      <Text>History</Text>
      {groups.length === 0 ? (
        <Text variant="muted">No payments yet.</Text>
      ) : null}
      {groups.map((g, i) => (
        <MonthGroup
          key={`${g.year}-${g.month}`}
          year={g.year}
          month={g.month}
          payments={g.payments}
          now={now}
          defaultOpen={i === 0}
          onRowPress={() => {
            /* Row actions are owned by a later history step. */
          }}
        />
      ))}
    </Screen>
  );
}

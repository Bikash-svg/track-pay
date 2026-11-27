import { useState } from 'react';
import { Screen } from '../../src/ui/Screen';
import { Text } from '../../src/ui/Text';
import { Field } from '../../src/ui/Field';
import { usePayments } from '../../src/data/payments';
import { groupByMonth } from '../../src/features/history/groupByMonth';
import { searchPayments } from '../../src/features/history/searchPayments';
import { MonthGroup } from '../../src/features/history/MonthGroup';

export default function HistoryScreen() {
  const { payments } = usePayments();
  const [query, setQuery] = useState('');
  const now = new Date();
  const groups = groupByMonth(searchPayments(payments, query));
  const hasQuery = query.trim().length > 0;

  // EVALS H4: month totals ignore the search. They are computed from every
  // payment in the month, not from the filtered rows shown underneath.
  const totalByMonth = new Map(
    groupByMonth(payments).map((g) => [
      `${g.year}-${g.month}`,
      g.payments.reduce((sum, p) => sum + p.amountPaise, 0),
    ]),
  );

  return (
    <Screen padTop={false}>
      <Text>History</Text>
      <Field
        label="Search payee, note or category"
        value={query}
        onChangeText={setQuery}
      />
      {groups.length === 0 && hasQuery ? (
        <Text variant="muted">No payments found.</Text>
      ) : null}
      {groups.length === 0 && !hasQuery ? (
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
          totalPaise={totalByMonth.get(`${g.year}-${g.month}`)}
          onRowPress={() => {
            /* Row actions are owned by a later history step. */
          }}
        />
      ))}
    </Screen>
  );
}

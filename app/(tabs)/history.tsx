import { useState } from 'react';
import { Screen } from '../../src/ui/Screen';
import { Text } from '../../src/ui/Text';
import { Field } from '../../src/ui/Field';
import { Button } from '../../src/ui/Button';
import { useDialog } from '../../src/ui/DialogProvider';
import { usePayments } from '../../src/data/payments';
import { groupByMonth } from '../../src/features/history/groupByMonth';
import { searchPayments } from '../../src/features/history/searchPayments';
import { filterPayments } from '../../src/features/history/filterPayments';
import { ExportChoices } from '../../src/features/history/ExportChoices';
import { MonthGroup } from '../../src/features/history/MonthGroup';
import { useDataActions } from '../../src/features/settings/DataSection';

// Parses a plain YYYY-MM-DD field into a local calendar date. An invalid or
// partial value is ignored (null) rather than throwing, so results update as
// the user types. "To" uses the end of the day so the range includes it.
function parseDateInput(value: string, endOfDay: boolean): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = endOfDay
    ? new Date(year, month, day, 23, 59, 59, 999)
    : new Date(year, month, day, 0, 0, 0, 0);
  // Reject impossible dates such as 2026-02-30.
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

export default function HistoryScreen() {
  const { payments } = usePayments();
  const { open } = useDialog();
  const { handleExportBackup, handlePdfStatement } = useDataActions();
  const [query, setQuery] = useState('');
  const [fromText, setFromText] = useState('');
  const [toText, setToText] = useState('');
  const now = new Date();

  const filtered = filterPayments(searchPayments(payments, query), {
    from: parseDateInput(fromText, false),
    to: parseDateInput(toText, true),
  });
  const groups = groupByMonth(filtered);
  const hasQuery = query.trim().length > 0;
  const rangeIsSet = fromText.trim().length > 0 || toText.trim().length > 0;
  const hasActiveFilter = hasQuery || rangeIsSet;

  // EVALS H4: month totals ignore the search and the date range. They are
  // computed from every payment in the month, not from the filtered rows.
  const totalByMonth = new Map(
    groupByMonth(payments).map((g) => [
      `${g.year}-${g.month}`,
      g.payments.reduce((sum, p) => sum + p.amountPaise, 0),
    ]),
  );

  const clearRange = () => {
    setFromText('');
    setToText('');
  };

  const openExport = () => {
    open({
      title: 'Export',
      children: (
        <ExportChoices
          onBackup={handleExportBackup}
          onPdf={handlePdfStatement}
        />
      ),
    });
  };

  return (
    <Screen padTop={false}>
      <Text>History</Text>
      <Field
        label="Search payee, note or category"
        value={query}
        onChangeText={setQuery}
      />
      <Field
        label="From (YYYY-MM-DD)"
        value={fromText}
        onChangeText={setFromText}
      />
      <Field
        label="To (YYYY-MM-DD)"
        value={toText}
        onChangeText={setToText}
      />
      {rangeIsSet ? (
        <Button variant="text" onPress={clearRange}>
          Clear filter
        </Button>
      ) : null}
      {groups.length === 0 && hasActiveFilter ? (
        <Text variant="muted">No payments found.</Text>
      ) : null}
      {groups.length === 0 && !hasActiveFilter ? (
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
      <Button variant="secondary" onPress={openExport} style={{ marginTop: 16 }}>
        Export data
      </Button>
    </Screen>
  );
}

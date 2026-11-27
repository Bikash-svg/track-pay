import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '../../ui/useTheme';
import { Text } from '../../ui/Text';
import { formatMoney } from '../../ui/Money';
import { PayRow } from '../../ui/PayRow';
import { dateLabel } from '../../domain/dateLabel';
import type { Payment } from '../../data/payments';

interface MonthGroupProps {
  readonly year: number;
  readonly month: number; // 0-indexed
  readonly payments: readonly Payment[];
  readonly now: Date;
  readonly defaultOpen: boolean;
  readonly onRowPress: (payment: Payment) => void;
  // EVALS H4: the month spend always includes every payment in the month,
  // even when the visible rows are narrowed by History search/filters.
  readonly totalPaise?: number;
}

export function MonthGroup({
  year,
  month,
  payments,
  now,
  defaultOpen,
  onRowPress,
  totalPaise,
}: MonthGroupProps) {
  const { tokens } = useTheme();
  const [open, setOpen] = useState(defaultOpen);
  const monthTotal =
    totalPaise ?? payments.reduce((sum, p) => sum + p.amountPaise, 0);
  const monthName = new Date(year, month, 1).toLocaleString('en-IN', {
    month: 'long',
  });

  return (
    <View>
      <Pressable
        testID="month-group-header"
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen(!open)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 44,
          padding: 12,
          borderBottomWidth: 1,
          borderBottomColor: tokens.border,
        }}
      >
        <Text>{`${monthName} ${year}`}</Text>
        <Text>{`Spent ${formatMoney(monthTotal)}`}</Text>
      </Pressable>
      {open &&
        payments.map((p) => (
          <PayRow
            key={p.id}
            avatarLetter={(p.payeeName || 'F')[0].toUpperCase()}
            name={p.label || p.payeeName}
            amountPaise={p.amountPaise}
            status="Done"
            date={dateLabel(new Date(p.createdAt), now)}
            category={p.category}
            notVerified={!p.reviewed}
            onPress={() => onRowPress(p)}
          />
        ))}
    </View>
  );
}

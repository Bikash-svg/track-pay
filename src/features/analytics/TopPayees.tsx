// Top five payees for Analytics (Step 5.6). Plain Track A: a ranked list of
// the month's payees with their total and payment count. Ranking and the
// five-entry cap live in topFivePayees() in src/domain/analytics.ts.
//
// All amounts are integer paise. Colour values come from tokens only.

import React from 'react';
import { View } from 'react-native';
import type { Payment } from '../../data/payments';
import { topFivePayees } from '../../domain/analytics';
import { formatMoney } from '../../ui/Money';
import { Text } from '../../ui/Text';

interface TopPayeesProps {
  readonly payments: readonly Payment[];
  readonly year: number;
  readonly month: number;
}

export function TopPayees({ payments, year, month }: TopPayeesProps) {
  const payees = topFivePayees(payments, year, month);

  return (
    <View>
      <Text>Top payees</Text>
      {payees.length === 0 ? (
        <Text variant="muted">No payments this month</Text>
      ) : null}
      {payees.map((payee, index) => (
        <View
          key={payee.payeeName}
          testID={`top-payee-${index}`}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 4,
          }}
        >
          <Text>{`${index + 1}. ${payee.payeeName}`}</Text>
          <Text>{`${formatMoney(payee.totalPaise)} (${payee.count})`}</Text>
        </View>
      ))}
    </View>
  );
}

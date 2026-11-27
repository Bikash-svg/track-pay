// Top five payees for Analytics (Step B D4.4). Restyled to the design system:
// a ranked list of the month's payees with their total and payment count,
// amounts in JetBrains Mono. Ranking and the five-entry cap live in
// topFivePayees() in src/domain/analytics.ts.
//
// All amounts are integer paise. Colour values come from tokens only.
//
import React from 'react';
import { View } from 'react-native';
import type { Payment } from '../../data/payments';
import { Card } from '../../ui/Card';
import { topFivePayees } from '../../domain/analytics';
import { MetricText } from '../../ui/MetricText';
import { Text } from '../../ui/Text';
import { useTheme } from '../../ui/useTheme';
import { copy } from '../../ui/copy';

interface TopPayeesProps {
  readonly payments: readonly Payment[];
  readonly year: number;
  readonly month: number;
}

export function TopPayees({ payments, year, month }: TopPayeesProps) {
  const { tokens } = useTheme();
  const payees = topFivePayees(payments, year, month);

  return (
    <Card>
      <Text
        style={{
          fontFamily: tokens.fontHeading,
          fontSize: 18,
          fontWeight: '700',
          color: tokens.text,
        }}
      >
        Top payees
      </Text>
      {payees.length === 0 ? (
        <Text variant="muted">{copy.noSpendingThisMonth}</Text>
      ) : null}
      {payees.map((payee, index) => (
        <View
          key={payee.payeeName}
          testID={`top-payee-${index}`}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <Text
            style={{
              fontFamily: tokens.fontBody,
              fontSize: 14,
              color: tokens.textSecondary,
            }}
          >
            {`${index + 1}. ${payee.payeeName}`}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            <MetricText value={payee.totalPaise} size="medium" />
            <Text
              style={{
                fontFamily: tokens.fontNumeric,
                fontSize: 13,
                color: tokens.textMuted,
                marginLeft: 4,
              }}
            >
              {`(${payee.count})`}
            </Text>
          </View>
        </View>
      ))}
    </Card>
  );
}

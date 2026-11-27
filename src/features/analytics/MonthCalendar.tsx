// Month calendar for Analytics (Steps 5.7, 5.8 and B D4.4). Restyled to the
// design system: 7-column grid with month name + total header, per-day totals
// in whole rupees, highest/lowest legend dots, days after today dimmed, and a
// modal card for the tapped day's payments.
//
// The parent owns the displayed month (`displayDate`) so the calendar stays a
// pure view; `onChangeMonth` returns the first day of the new month.
//
// All amounts are integer paise. Colour values come from tokens only.
//
import React, { useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import type { Payment } from '../../data/payments';
import {
  cumulativeSpendPerDay,
  daysInMonth,
  monthlyTotal,
} from '../../domain/analytics';
import { Card } from '../../ui/Card';
import { formatMoney } from '../../ui/Money';
import { MetricText } from '../../ui/MetricText';
import { Text } from '../../ui/Text';
import { useTheme } from '../../ui/useTheme';

interface MonthCalendarProps {
  readonly payments: readonly Payment[];
  readonly displayDate: Date;
  readonly today: Date;
  readonly onChangeMonth: (next: Date) => void;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const DAY_NAMES = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function isSuccess(payment: Payment): boolean {
  return (payment.status as string) === 'success';
}

function monthName(month: number): string {
  return MONTH_NAMES[month] ?? '';
}

function rupees(paise: number): string {
  return Math.round(paise / 100).toString();
}

export function MonthCalendar({
  payments,
  displayDate,
  today,
  onChangeMonth,
}: MonthCalendarProps) {
  const { tokens } = useTheme();
  const year = displayDate.getFullYear();
  const month = displayDate.getMonth();
  const dim = daysInMonth(year, month);
  const cumulative = cumulativeSpendPerDay(payments, year, month);

  const [modalDay, setModalDay] = useState<number | null>(null);
  const [modalPayments, setModalPayments] = useState<Payment[]>([]);

  // Per-day spend (not cumulative) for marking the highest and lowest days
  // and for showing day totals.
  const perDay: number[] = [];
  for (let i = 0; i < dim; i++) {
    perDay[i] = i === 0 ? cumulative[0] : cumulative[i] - cumulative[i - 1];
  }

  // Highest and lowest non-zero days. Strict comparisons keep the earlier day
  // on a tie (EVALS A4).
  let highestDay = -1;
  let lowestDay = -1;
  let highestVal = 0;
  let lowestVal = Infinity;
  for (let i = 0; i < dim; i++) {
    if (perDay[i] > 0) {
      if (perDay[i] > highestVal) {
        highestVal = perDay[i];
        highestDay = i;
      }
      if (perDay[i] < lowestVal) {
        lowestVal = perDay[i];
        lowestDay = i;
      }
    }
  }

  const monthPayments = payments.filter((payment) => {
    if (!isSuccess(payment)) return false;
    const d = new Date(payment.createdAt);
    return d.getFullYear() === year && d.getMonth() === month;
  });
  const spent = monthlyTotal(payments, year, month);

  const handleDayTap = (day: number) => {
    setModalDay(day);
    setModalPayments(
      monthPayments.filter(
        (payment) => new Date(payment.createdAt).getDate() === day,
      ),
    );
  };

  const isTodayInMonth =
    today.getFullYear() === year && today.getMonth() === month;
  const todayDate = isTodayInMonth ? today.getDate() : -1;

  // 7-column grid with leading blanks before the 1st.
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sunday
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= dim; d++) cells.push(d);

  const goToMonth = (delta: number) => {
    setModalDay(null);
    setModalPayments([]);
    onChangeMonth(new Date(year, month + delta, 1));
  };

  return (
    <View>
      <Card>
        <Text style={{ fontFamily: tokens.fontHeading, fontSize: 18, fontWeight: '700' }}>
          Calendar
        </Text>

      {/* Month name + total header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Pressable
            testID="calendar-prev"
            accessibilityRole="button"
            accessibilityLabel="Previous month"
            onPress={() => goToMonth(-1)}
            style={{
              minWidth: 44,
              minHeight: 44,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontFamily: tokens.fontNumeric, fontSize: 18 }}>
              ←
            </Text>
          </Pressable>
          <Text
            style={{
              fontFamily: tokens.fontHeading,
              fontSize: 16,
              fontWeight: '700',
              marginHorizontal: 8,
            }}
          >
            {`${monthName(month)} ${year}`}
          </Text>
          <Pressable
            testID="calendar-next"
            accessibilityRole="button"
            accessibilityLabel="Next month"
            onPress={() => goToMonth(1)}
            style={{
              minWidth: 44,
              minHeight: 44,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontFamily: tokens.fontNumeric, fontSize: 18 }}>
              →
            </Text>
          </Pressable>
        </View>
        <Text style={{ fontFamily: tokens.fontNumeric, fontSize: 13, color: tokens.textMuted }}>
          {`₹${formatMoney(spent).slice(1)}`}
        </Text>
      </View>

      {/* Weekday headers */}
      <View style={{ flexDirection: 'row', marginBottom: 8 }}>
        {DAY_NAMES.map((dayName, index) => (
          <View
            key={dayName}
            style={{
              width: '14.28%',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontFamily: tokens.fontNumeric,
                fontSize: 11,
                color: tokens.textMuted,
              }}
            >
              {dayName}
            </Text>
          </View>
        ))}
      </View>

      {/* Day grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {cells.map((day, index) => {
          if (day === null) {
            return (
              <View
                key={`blank-${index}`}
                style={{ width: '14.28%', aspectRatio: 1 }}
              />
            );
          }
          const dayIndex = day - 1;
          const isToday = day === todayDate;
          const isHighest = dayIndex === highestDay;
          const isLowest = dayIndex === lowestDay;
          const isFuture = isTodayInMonth && day > todayDate;
          const dayTotal = perDay[dayIndex];

          return (
            <Pressable
              key={day}
              testID={`calendar-day-${day}`}
              accessibilityRole="button"
              accessibilityLabel={`Day ${day}`}
              accessibilityState={{ selected: modalDay === day }}
              onPress={() => handleDayTap(day)}
              style={{
                width: '14.28%',
                aspectRatio: 1,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: isToday ? 1 : 0,
                borderColor: isToday ? tokens.primary : 'transparent',
                borderRadius: 12,
                opacity: isFuture ? 0.4 : 1,
              }}
            >
              <View style={{ alignItems: 'center' }} testID={isToday ? 'calendar-today' : undefined}>
                <Text
                  style={{
                    fontFamily: tokens.fontNumeric,
                    fontSize: 14,
                    fontWeight: isToday || isHighest || isLowest ? '700' : '400',
                    color: isHighest
                      ? tokens.primary
                      : isLowest
                        ? tokens.negative
                        : isToday
                          ? tokens.primary
                          : isFuture
                            ? tokens.textMuted
                            : tokens.text,
                  }}
                >
                  {day}
                </Text>
                {dayTotal > 0 && (
                  <Text
                    style={{
                      fontFamily: tokens.fontNumeric,
                      fontSize: 9,
                      color: tokens.textMuted,
                      marginTop: 2,
                    }}
                  >
                    {rupees(dayTotal)}
                  </Text>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Highest/lowest legend */}
      {highestDay >= 0 && lowestDay >= 0 && highestDay !== lowestDay ? (
        <View style={{ flexDirection: 'row', marginTop: 12, marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: tokens.primary,
                marginRight: 4,
              }}
            />
            <Text style={{ fontFamily: tokens.fontBody, fontSize: 12, color: tokens.textSecondary }}>
              Most spent
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: tokens.negative,
                marginRight: 4,
              }}
            />
            <Text style={{ fontFamily: tokens.fontBody, fontSize: 12, color: tokens.textSecondary }}>
              Least spent
            </Text>
          </View>
        </View>
      ) : null}

      <Text variant="muted">
        {`${monthPayments.length} ${
          monthPayments.length === 1 ? 'payment' : 'payments'
        } · ${formatMoney(spent)} spent`}
      </Text>

      {highestDay >= 0 ? (
        <Text variant="muted">
          Highest: day {highestDay + 1} ({formatMoney(highestVal)})
        </Text>
      ) : null}
      {lowestDay >= 0 ? (
        <Text variant="muted">
          Lowest: day {lowestDay + 1} ({formatMoney(lowestVal)})
        </Text>
      ) : null}
      {highestDay < 0 ? (
        <Text variant="muted">No payments this month</Text>
      ) : null}
      </Card>

      {modalDay !== null ? (
        <Modal
          visible
          transparent
          animationType="fade"
          onRequestClose={() => setModalDay(null)}
        >
          <Pressable
            style={{
              flex: 1,
              backgroundColor: tokens.scrim,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={() => setModalDay(null)}
            accessibilityLabel="Close day payments"
          >
            <Pressable
              testID="calendar-day-modal"
              onPress={() => {}}
              style={{
                backgroundColor: tokens.card,
                borderRadius: 12,
                padding: 16,
                width: '80%',
                maxHeight: '60%',
              }}
            >
              <Text
                style={{
                  fontFamily: tokens.fontHeading,
                  fontSize: 18,
                  fontWeight: '700',
                  marginBottom: 8,
                }}
              >
                {`Day ${modalDay}`}
              </Text>
              {modalPayments.length === 0 ? (
                <Text variant="muted">No payments on this day</Text>
              ) : (
                modalPayments.map((payment) => (
                  <View
                    key={payment.id}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginBottom: 4,
                    }}
                  >
                    <Text>{payment.payeeName}</Text>
                    <Text>{formatMoney(payment.amountPaise)}</Text>
                  </View>
                ))
              )}
              <Pressable
                testID="calendar-modal-close"
                accessibilityRole="button"
                accessibilityLabel="Close"
                onPress={() => setModalDay(null)}
                style={{
                  marginTop: 12,
                  alignSelf: 'center',
                  minWidth: 44,
                  minHeight: 44,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text>Close</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
    </View>
  );
}

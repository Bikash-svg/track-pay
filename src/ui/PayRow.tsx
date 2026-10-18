import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import React from 'react';
import { Pressable, View } from 'react-native';
import { Chip } from './Chip';
import { Money } from './Money';
import { StatusTag } from './StatusTag';
import { Text } from './Text';
import { useTheme } from './useTheme';

export type PayRowStatus = 'Done' | 'Failed' | 'Pending';

interface PayRowProps {
  readonly avatarLetter: string;
  readonly name: string;
  readonly amountPaise: number;
  readonly status: PayRowStatus;
  readonly date: string;
  readonly onPress?: () => void;
  readonly accessibilityLabel?: string;
  readonly style?: StyleProp<ViewStyle>;
}

export function PayRow({
  avatarLetter,
  name,
  amountPaise,
  status,
  date,
  onPress,
  accessibilityLabel,
  style,
}: PayRowProps) {
  const { tokens } = useTheme();
  return (
    <Pressable
      accessible
      accessibilityRole="listitem"
      accessibilityLabel={accessibilityLabel ?? name}
      onPress={onPress}
      style={[
        {
          backgroundColor: tokens.card,
          borderColor: tokens.border,
          borderWidth: 1,
          borderRadius: 12,
          flexDirection: 'row',
          alignItems: 'center',
          padding: 12,
          minHeight: 56,
        },
        style,
      ]}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{avatarLetter}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.name}>{name}</Text>
      </View>
      <View style={styles.side}>
        <Money paise={amountPaise} style={styles.amount} />
        <StatusTag status={status} />
        <Text variant="muted" style={styles.date}>
          {date}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = {
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 16 },
  body: { flex: 1 },
  name: { fontSize: 14 },
  side: { alignItems: 'flex-end' },
  amount: { fontSize: 16, marginBottom: 4 },
  date: { fontSize: 12 },
};

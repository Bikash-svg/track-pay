import type { ViewStyle } from 'react-native';
import React from 'react';
import { Pressable, View } from 'react-native';
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
  readonly category?: string;
  readonly onPress?: () => void;
  readonly accessibilityLabel?: string;
  readonly style?: ViewStyle;
}

export function PayRow({
  avatarLetter,
  name,
  amountPaise,
  status,
  date,
  category,
  onPress,
  accessibilityLabel,
  style,
}: PayRowProps) {
  const { tokens } = useTheme();
  const parts: ViewStyle[] = [
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
  ];
  if (style) parts.push(style);
  return (
    <Pressable
      accessible
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? name}
      onPress={onPress}
      style={parts}
    >
      <View style={{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
        <Text>{avatarLetter}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14 }}>{name}</Text>
      </View>
<View style={{ alignItems: 'flex-end' }}>
        <Text>
          <Money paise={amountPaise} />{category ? ` · ${category}` : ''}
        </Text>
        <StatusTag status={status} />
        <Text variant="muted">{date}</Text>
      </View>
    </Pressable>
  );
}

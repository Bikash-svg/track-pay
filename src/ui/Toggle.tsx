import React from 'react';
import { Switch, View } from 'react-native';
import { useTheme } from './useTheme';

interface ToggleProps {
  readonly value: boolean;
  readonly onValueChange: (value: boolean) => void;
  readonly accessibilityLabel: string;
  readonly disabled?: boolean;
}

export function Toggle({
  value,
  onValueChange,
  accessibilityLabel,
  disabled = false,
}: ToggleProps) {
  const { tokens } = useTheme();
  return (
    <View style={styles.container} collapsable={false}>
      <Switch
        accessible
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="switch"
        value={value}
        onValueChange={disabled ? undefined : onValueChange}
        disabled={disabled}
        trackColor={{ false: tokens.border, true: tokens.primary }}
        thumbColor={value ? tokens.onPrimary : tokens.textMuted}
        style={{ minHeight: 44, minWidth: 44 }}
      />
    </View>
  );
}

const styles = {
  container: { padding: 4 },
};

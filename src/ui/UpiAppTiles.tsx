// UPI app tiles for the Pay to a friend dialog.
//
// One tile per installed UPI app: the app's first letter as a monogram plus
// its label. D9: text monograms, never brand logos. The first app is
// pre-selected by the dialog; selecting a different tile is what "pick a UPI
// app" means here — the OS chooser is 4.3's, not this component's.
//
// 44 px touch targets (minHeight/minWidth), a radio role with a selected
// state so screen readers announce the choice, and no business logic.

import { Pressable, View } from 'react-native';
import { Text } from './Text';
import { useTheme } from './useTheme';
import type { UpiApp } from '../native/upiLauncher';

interface UpiAppTilesProps {
  readonly apps: readonly UpiApp[];
  readonly selectedPackage: string | null;
  readonly onSelect: (packageName: string) => void;
}

export function UpiAppTiles({
  apps,
  selectedPackage,
  onSelect,
}: UpiAppTilesProps) {
  const { tokens } = useTheme();

  return (
    <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
      {apps.map((app) => {
        const selected = app.packageName === selectedPackage;
        const monogram = app.label.charAt(0).toUpperCase();
        return (
          <Pressable
            key={app.packageName}
            onPress={() => onSelect(app.packageName)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={app.label}
            style={{
              minHeight: 44,
              minWidth: 44,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 8,
              backgroundColor: selected ? tokens.primary : tokens.interactive,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: 8,
            }}
          >
            <Text
              style={{
                color: selected ? tokens.onPrimary : tokens.text,
                fontWeight: '600',
              }}
            >
              {monogram}
            </Text>
            <Text
              style={{ color: selected ? tokens.onPrimary : tokens.text }}
            >
              {app.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

import type { StyleProp, ViewStyle } from 'react-native';
import React from 'react';
import { SafeAreaView, View } from 'react-native';
import { useTheme } from './useTheme';

interface ScreenProps {
  readonly children: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
}

export function Screen({ children, style }: ScreenProps) {
  const { tokens } = useTheme();
  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: tokens.canvas }, style]}>
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
}

const styles = {
  content: { padding: 16 },
};

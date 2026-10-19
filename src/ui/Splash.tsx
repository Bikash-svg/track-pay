import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Text } from './Text';
import { copy } from './copy';
import { useTheme } from './useTheme';

// Step 2.2's plain splash (Track A, D12). Track B D4.1 replaces the values —
// the glowing brand mark, display type and the smooth width animation live
// there, not here. This exists so the gate has one component to swap for the
// child, and so the design plan edits a single file.

// Indeterminate, not one-shot. A 500 ms fill that ends on its own would look
// "done" while the load was still running, which is the opposite of what the
// gate is for. This bar never completes by itself: the gate swaps it out.
//
// useNativeDriver is false, not true. The native driver can only drive opacity
// and transform; animating the `width` style property on it throws
// "Style property 'width' is not supported by native animated module" at
// anim.start(). JS driver is fine here — the splash is under a second.
const BAR_DURATION = 500;

export function Splash() {
  const { tokens } = useTheme();
  const width = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(width, {
          toValue: 1,
          duration: BAR_DURATION,
          useNativeDriver: false,
        }),
        Animated.timing(width, {
          toValue: 0,
          duration: BAR_DURATION,
          useNativeDriver: false,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [width]);

  const barWidth = width.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View
      style={[styles.root, { backgroundColor: tokens.canvas }]}
      accessibilityLabel={`${copy.appName}, loading`}
    >
      <Text style={styles.title}>{copy.appName}</Text>
      <View
        style={[styles.barTrack, { backgroundColor: tokens.interactive }]}
        accessibilityElementsHidden
      >
        <Animated.View
          style={[styles.barFill, { backgroundColor: tokens.primary, width: barWidth }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    marginBottom: 32,
  },
  barTrack: {
    width: '60%',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    width: '100%',
  },
});
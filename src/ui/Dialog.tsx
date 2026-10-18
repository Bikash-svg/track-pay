import { useCallback, useEffect, type ReactNode } from 'react';
import {
  BackHandler,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { Text } from './Text';
import { useTheme } from './useTheme';

export interface DialogProps {
  readonly visible: boolean;
  readonly title?: string;
  readonly subtitle?: string;
  readonly children?: ReactNode;
  readonly primaryAction?: ReactNode;
  readonly secondaryAction?: ReactNode;
  readonly onClose: () => void;
  readonly closeOnBackdrop?: boolean;
  readonly closeOnBack?: boolean;
  readonly closeButtonLabel?: string;
  readonly testID?: string;
}

/**
 * One reusable centred dialog. Scrim, close button, tap-outside and Back
 * dismiss, scrolls if tall, keyboard-safe.
 *
 * Keyboard-safe is handled by `KeyboardAvoidingView` wrapping the whole
 * modal content: `padding` on iOS, `height` on Android, `keyboardVerticalOffset`
 * 0. The ScrollView inside keeps the dialog centred when it fits above the
 * keyboard (`contentContainerStyle` grows, centres and aligns) and becomes
 * scrollable when the keyboard is open and the dialog is too tall to fit,
 * so a bottom-anchored primary action stays reachable. The earlier manual
 * `Keyboard.addListener('keyboardDidShow', scrollToTop)` was replaced by
 * this — it only scrolled, it never resized, so the OK button was hidden.
 *
 * Track A: function only, plain look. No animation here — motion is owned by
 * Track B (DESIGN-BUILD-PLAN.md D3.4 "Dialog host visuals" and D6.2 "Motion"):
 * the dialog appears instantly and vanishes instantly. When Track B lands it
 * swaps the instant show/hide for a scale 0.95 -> 1 with fade, and gates the
 * whole thing on the reduced-motion setting. Everything this component does
 * today (dismiss on backdrop, dismiss on Back, scroll-if-tall,
 * keyboard-safe) still works after that swap, because it is behaviour, not
 * timing.
 *
 * Reduced motion is already a no-op here: there is nothing to disable. Track
 * B's D3.4/D6.2 gate the enter animation on it; read it there, not here.
 */
export function Dialog({
  visible,
  title,
  subtitle,
  children,
  primaryAction,
  secondaryAction,
  onClose,
  closeOnBackdrop = true,
  closeOnBack = true,
  closeButtonLabel = 'Close',
  testID = 'dialog',
}: DialogProps) {
  const { tokens } = useTheme();

  const onBackdropPress = useCallback(() => {
    if (closeOnBackdrop) onClose();
  }, [closeOnBackdrop, onClose]);

  useEffect(() => {
    if (!closeOnBack || !visible) return undefined;
    const sub = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        onClose();
        return true;
      },
    );
    return () => sub.remove();
  }, [visible, closeOnBack, onClose]);

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      accessibilityViewIsModal
      testID={testID}
      onRequestClose={closeOnBack ? onClose : undefined}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        <Pressable
          style={[
            {
              flex: 1,
              backgroundColor: tokens.scrim,
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
            },
          ]}
          onPress={onBackdropPress}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 420,
              backgroundColor: tokens.card,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: tokens.border,
              maxHeight: '80%',
            }}
          >
            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{
                padding: 24,
                flexGrow: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {title ? (
                <Text style={{ marginBottom: 4 }}>{title}</Text>
              ) : null}
              {subtitle ? (
                <Text variant="secondary" style={{ marginBottom: 16 }}>
                  {subtitle}
                </Text>
              ) : null}
              {children}
            </ScrollView>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={closeButtonLabel}
              hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                width: 36,
                height: 36,
                borderRadius: 18,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: tokens.interactive,
                borderWidth: 1,
                borderColor: tokens.border,
              }}
            >
              <Text variant="muted" style={{ fontSize: 18, lineHeight: 20 }}>
                {'\u00d7'}
              </Text>
            </Pressable>
            {(primaryAction || secondaryAction) && (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  gap: 8,
                  padding: 16,
                  borderTopWidth: 1,
                  borderTopColor: tokens.border,
                }}
              >
                {secondaryAction}
                {primaryAction}
              </View>
            )}
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default Dialog;
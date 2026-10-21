import { View, Pressable, Linking } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useRef, useEffect } from 'react';
import { Text } from '../src/ui/Text';
import { Button } from '../src/ui/Button';
import { Banner } from '../src/ui/Banner';
import { Field } from '../src/ui/Field';
import { useDialog } from '../src/ui/DialogProvider';
import { useTheme } from '../src/ui/useTheme';
import { copy } from '../src/ui/copy';
import { parseUpi, type UpiParseResult } from '../src/domain/upiParse';
import { buildUpiLink } from '../src/domain/upiParse';
import { PayToFriendDialog } from '../src/ui/PayToFriendDialog';
import { ConfirmPaymentDialog } from '../src/ui/ConfirmPaymentDialog';
import { usePayments } from '../src/data/payments';
import { openUpi } from '../src/native/upiLauncher';

export default function ScannerScreen() {
  const { tokens } = useTheme();
  const insets = useSafeAreaInsets();
  const { open, close } = useDialog();
  const { addFriendPayment, addQrPayment } = usePayments();
  const [permission, requestPermission] = useCameraPermissions();
  const [torchOn, setTorchOn] = useState(false);
  const [invalidMsg, setInvalidMsg] = useState<string | null>(null);
  const invalidTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [devString, setDevString] = useState('');

  const handleScan = (result: UpiParseResult) => {
    if (result.kind === 'error') {
      setInvalidMsg(copy.notUpiQR);
      if (invalidTimer.current) clearTimeout(invalidTimer.current);
      invalidTimer.current = setTimeout(() => setInvalidMsg(null), 3000);
      return;
    }
    // Success — open Confirm payment dialog
    open({
      title: copy.confirmPayment,
      children: (
        <ConfirmPaymentDialog
          result={result}
          onCancel={close}
          onConfirm={(input) => handleConfirm(result, input)}
        />
      ),
    });
  };

  const handleConfirm = async (parsedResult: UpiParseResult, input: { amountPaise: number; label: string | null }) => {
    if (parsedResult.kind !== 'ok') return;

    const link = buildUpiLink(parsedResult, input.amountPaise, input.label ?? undefined);

    // Save pending BEFORE launching UPI — P6 depends on the pending row existing if process is killed
    await addQrPayment({
      amountPaise: input.amountPaise,
      payeeName: parsedResult.payeeNameFull,
      payeeVpa: parsedResult.payeeVpa,
      label: input.label,
    });

    // Fire-and-forget UPI launch — no packageName → OS chooser
    void openUpi(link).catch((err) => {
      if (__DEV__) console.warn('[scanner] openUpi failed:', err?.message ?? String(err));
      // Minimal 4.3 fallback; 4.4 upgrades to full exception dialogs
      open({
        title: "Couldn't open UPI app",
        subtitle: 'Nothing was saved. Try again, or choose another UPI app.',
        secondaryAction: <Button variant="text" onPress={close}>Close</Button>,
      });
    });

    // Close Confirm dialog, pop scanner
    close();
    router.back();
  };

  const onBarcodeScanned = ({ data }: { data: string }) => {
    handleScan(parseUpi(data));
  };

  const handleSaveFriend = async (input: { amountPaise: number; payeeName: string; preferredUpiPackage: string }) => {
    await addFriendPayment({
      amountPaise: input.amountPaise,
      payeeName: input.payeeName,
      preferredUpiPackage: input.preferredUpiPackage,
    });
    close();
    router.back();
  };

  useEffect(() => {
    if (permission === null) {
      open({
        title: copy.allowCamera,
        subtitle: copy.cameraIsOnlyUsedToReadUpiQr,
        primaryAction: <Button variant="primary" onPress={() => { close(); requestPermission(); }}>{copy.allow}</Button>,
        secondaryAction: <Button variant="text" onPress={() => { close(); router.back(); }}>{copy.notNow}</Button>,
      });
    }
  }, [permission]);

  // RENDER 1: permission denied → camera-off state
  if (permission && !permission.granted) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: tokens.canvas,
        paddingTop: insets.top + 16,
        paddingHorizontal: 16,
        paddingBottom: insets.bottom + 16,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
      }}>
        <Text>{copy.cameraOff}</Text>
        <Text variant="muted">{copy.turnCameraOnInSettings}</Text>
        <Button variant="primary" onPress={() => Linking.openSettings()}>{copy.openSettings}</Button>
        <Button variant="secondary" onPress={() => open({
          title: copy.payToFriend,
          children: <PayToFriendDialog onSave={handleSaveFriend} onCancel={close} />,
        })}>{copy.enterDetails}</Button>
        <Button variant="text" onPress={() => router.back()}>{copy.notNow}</Button>
      </View>
    );
  }

  // RENDER 2: permission null (dialog shown) or granted → camera
  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      {permission?.granted && (
        <CameraView
          style={{ flex: 1 }}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={onBarcodeScanned}
          enableTorch={torchOn}
        />
      )}
      {/* Top controls */}
      <View style={{ position: 'absolute', top: insets.top + 8, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16 }}>
        <Button variant="text" onPress={() => router.back()} accessibilityLabel="Close scanner">{copy.cancel}</Button>
        <Pressable
          onPress={() => setTorchOn(v => !v)}
          accessibilityRole="button"
          accessibilityLabel={torchOn ? 'Turn torch off' : 'Turn torch on'}
          style={{ minHeight: 44, minWidth: 44, justifyContent: 'center', alignItems: 'center' }}
        >
          <Text>Torch</Text>
        </Pressable>
      </View>
      {/* Center square frame */}
      <View style={{ position: 'absolute', top: '25%', left: '10%', right: '10%', bottom: '35%', borderWidth: 2, borderColor: 'white', borderRadius: 8 }} />
      {/* Hint */}
      <Text style={{ position: 'absolute', top: '60%', left: 0, right: 0, textAlign: 'center', color: 'white' }}>{copy.pointCamera}</Text>
      {/* Invalid QR banner */}
      {invalidMsg && (
        <View style={{ position: 'absolute', top: insets.top + 60, left: 16, right: 16 }}>
          <Banner>{invalidMsg}</Banner>
        </View>
      )}
      {/* Enter details link */}
      <View style={{ position: 'absolute', bottom: insets.bottom + 24, left: 0, right: 0, alignItems: 'center' }}>
        <Button variant="text" onPress={() => open({
          title: copy.payToFriend,
          children: <PayToFriendDialog onSave={handleSaveFriend} onCancel={close} />,
        })}>{copy.enterDetails}</Button>
      </View>
      {/* __DEV__ scan injector */}
      {__DEV__ && (
        <View style={{ position: 'absolute', bottom: insets.bottom + 72, left: 16, right: 16, backgroundColor: 'rgba(0,0,0,0.7)', padding: 8, borderRadius: 8 }}>
          <Field label="Inject UPI string (dev)" value={devString} onChangeText={setDevString} />
          <Button variant="secondary" onPress={() => { if (devString) handleScan(parseUpi(devString)); }}>Simulate scan</Button>
        </View>
      )}
    </View>
  );
}
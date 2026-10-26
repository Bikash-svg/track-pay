// app/share-receipt.tsx — THROWAWAY SPIKE SCREEN (Gate 1)
// Receives shared image via expo-share-intent, displays URI.
// Diagnostics: toast + console log + on-screen state — so a share ALWAYS
// produces a visible/queryable response, even when the intent fails to load.

import { useEffect, useState } from 'react';
import { useShareIntent } from 'expo-share-intent';
import { router } from 'expo-router';
import { ToastAndroid, Platform } from 'react-native';
import { Screen, Text, Button } from '../src/ui';

const TAG = '[share-receipt]';

function toast(msg: string) {
  if (Platform.OS === 'android') {
    try {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    } catch {
      // ignore
    }
  }
}

export default function ShareReceiptScreen() {
  const { hasShareIntent, shareIntent, resetShareIntent, isReady, error } =
    useShareIntent();
  const [imageUri, setImageUri] = useState<string | null>(null);

  // 1) Screen mount — proves the share reached share-receipt at all
  useEffect(() => {
    console.log(`${TAG} MOUNT — share-receipt screen opened`);
    toast('Track Pay: share-receipt opened');
    return () => console.log(`${TAG} unmount`);
  }, []);

  // 2) State changes — shows isReady/hasShareIntent/error transitions
  useEffect(() => {
    console.log(
      `${TAG} STATE isReady=${isReady} hasShareIntent=${hasShareIntent} error=${error ?? 'none'}`
    );
    if (error) {
      console.warn(`${TAG} SHARE ERROR: ${error}`);
      toast(`Share error: ${String(error).slice(0, 60)}`);
    }
  }, [isReady, hasShareIntent, error]);

  // 3) Files arriving
  useEffect(() => {
    if (hasShareIntent && shareIntent?.files?.[0]?.path) {
      const uri = shareIntent.files[0].path;
      console.log(`${TAG} FILE path=${uri}`);
      setImageUri(uri);
      toast('Track Pay: image received');
    } else if (hasShareIntent) {
      console.log(`${TAG} hasShareIntent=true but no files[0].path`);
      toast('Track Pay: share arrived, no file path');
    }
  }, [hasShareIntent, shareIntent]);

  const handleDone = () => {
    console.log(`${TAG} Done tapped`);
    resetShareIntent();
    router.replace('/');
  };

  return (
    <Screen>
      <Text variant="default">Share Receipt (Spike)</Text>

      <Text variant="secondary" style={{ marginTop: 16 }}>
        isReady: {String(isReady)}
      </Text>
      <Text variant="secondary">hasShareIntent: {String(hasShareIntent)}</Text>
      <Text variant="secondary">
        error: {error ? String(error).slice(0, 120) : '(none)'}
      </Text>

      {imageUri && (
        <>
          <Text variant="secondary" style={{ marginTop: 16 }}>
            Received image URI:
          </Text>
          <Text variant="muted" style={{ marginTop: 8, fontSize: 12 }}>
            {imageUri}
          </Text>
        </>
      )}
      {!hasShareIntent && !imageUri && (
        <Text variant="muted" style={{ marginTop: 16 }}>
          Share a receipt image to Track Pay to test the share flow.
        </Text>
      )}
      {(imageUri || hasShareIntent) && (
        <Button variant="secondary" onPress={handleDone} style={{ marginTop: 24 }}>
          Done
        </Button>
      )}
    </Screen>
  );
}
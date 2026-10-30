// app/share-receipt.tsx — THROWAWAY SPIKE SCREEN (Gate 1)
// Receives shared image via expo-share-intent, calls ML Kit OCR, shows raw text.
// Diagnostics: toast + on-screen state. OCR text shown on screen only (no console log).

import { useEffect, useState } from 'react';
import { useShareIntent } from 'expo-share-intent';
import { recognizeText } from 'rn-mlkit-ocr';
import * as FileSystem from 'expo-file-system/legacy';
import { router } from 'expo-router';
import { ToastAndroid, Platform } from 'react-native';
import { Screen, Text, Button } from '../src/ui';

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
  const [ocrText, setOcrText] = useState<string | null>(null);
  const [ocrError, setOcrError] = useState<string | null>(null);

  const filePath = shareIntent?.files?.[0]?.path;

  // 1) Screen mount — proves the share reached share-receipt at all
  useEffect(() => {
    toast('Track Pay: share-receipt opened');
  }, []);

  // 2) State changes — shows isReady/hasShareIntent/error transitions
  useEffect(() => {
    if (error) {
      toast(`Share error: ${String(error).slice(0, 60)}`);
    }
  }, [error]);

  // 3) Files arriving — trigger OCR
  useEffect(() => {
    if (!hasShareIntent || !filePath || imageUri) return;

    setImageUri(filePath);
    toast('Track Pay: image received, running OCR...');

    const stripScheme = (u: string) => u.replace(/^file:\/\//, '');

    (async () => {
      let text = '';
      try {
        // First: try with the file:// scheme (what rn-mlkit-ocr usually wants)
        text = (await recognizeText(filePath, 'latin'))?.text ?? '';
        // If empty, retry with the plain path (some versions expect it stripped)
        if (!text) {
          text = (await recognizeText(stripScheme(filePath), 'latin'))?.text ?? '';
        }
        setOcrText(text);
        toast(text ? 'Track Pay: OCR complete' : 'Track Pay: OCR returned empty');
      } catch (e) {
        setOcrError(e instanceof Error ? e.message : String(e));
        toast('Track Pay: OCR failed');
      } finally {
        // Delete cached image after reading (GUARDRAILS §2.7)
        FileSystem.deleteAsync(filePath, { idempotent: true }).catch(() => {});
      }
    })();
  }, [hasShareIntent, filePath, imageUri]);

  const handleDone = () => {
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

      {ocrText !== null && (
        <>
          <Text variant="secondary" style={{ marginTop: 24 }}>
            RAW OCR TEXT:
          </Text>
          <Text variant="muted" style={{ marginTop: 8, fontSize: 12 }}>
            {ocrText || '(empty — ML Kit returned no text)'}
          </Text>
        </>
      )}

      {ocrError && (
        <Text variant="secondary" style={{ marginTop: 24, color: 'red' }}>
          OCR Error: {ocrError}
        </Text>
      )}

      {!hasShareIntent && !imageUri && ocrText === null && (
        <Text variant="muted" style={{ marginTop: 16 }}>
          Share a receipt image to Track Pay to test the share flow.
        </Text>
      )}

      {(imageUri || ocrText !== null) && (
        <Button variant="secondary" onPress={handleDone} style={{ marginTop: 24 }}>
          Done
        </Button>
      )}
    </Screen>
  );
}
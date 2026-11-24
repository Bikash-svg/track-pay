import { useCallback, useState } from 'react';
import { PermissionsAndroid, Platform, Alert, View, Pressable, Image, ToastAndroid } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { Screen, Text, Button, Chip, copy } from '../../ui';
import { useTheme } from '../../ui/useTheme';
import { loadAll, type PendingItem } from '../../data/pendingItems';
import { badgeLabel } from './badgeLabel';
import { startBatch } from './scanEngine';

function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  if (Platform.Version < 33) return true; // Android < 13 doesn't need this
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    {
      title: 'Notification permission',
      message: 'Track Pay needs notification permission to show scan progress.',
      buttonPositive: 'Allow',
      buttonNegative: 'Deny',
    }
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

export function PendingGrid() {
  const [items, setItems] = useState<PendingItem[] | null>(null);
  const { tokens } = useTheme();
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const reload = useCallback(() => {
    let cancelled = false;
    void loadAll()
      .then((rows) => {
        if (!cancelled) setItems(rows);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useFocusEffect(reload);

  const handleBack = () => {
    if (scanning) {
      Alert.alert('Scan in progress', 'Navigating away will pause the scan. Continue?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Leave', onPress: goBack },
      ]);
    } else {
      goBack();
    }
  };

  const hasUnscanned = items?.some((i) => i.status === 'unscanned') || false;

  const handleStartScan = async () => {
    setScanning(true);
    setProgress({ current: 0, total: 0 });
    try {
      // Request notification permission (Android 13+ only; harmless on other platforms)
      await requestNotificationPermission();

      await startBatch((current, total) => {
        setProgress({ current, total });
      });
      // reload grid after scan
      const rows = await loadAll();
      setItems(rows);
      const scanned = rows.filter((i) => i.status === 'scanned').length;
      const errors = rows.filter((i) => i.status === 'error').length;
      ToastAndroid.show(`Scanned ${scanned}, ${errors} errors`, ToastAndroid.LONG);
    } catch (e) {
      ToastAndroid.show('Scan failed', ToastAndroid.SHORT);
    } finally {
      setScanning(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  if (items === null) {
    return (
      <Screen>
        <Text>{copy.pending.loading}</Text>
      </Screen>
    );
  }

  if (items.length === 0) {
    return (
      <Screen>
        <Text>{copy.pending.empty}</Text>
        <View style={{ marginTop: 16 }}>
          <Button onPress={goBack}>{copy.pending.back}</Button>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <Text>{copy.pending.count(items.length)}</Text>
        <Button variant="text" onPress={handleBack}>
          {copy.pending.back}
        </Button>
      </View>
      <Button disabled={!hasUnscanned || scanning} onPress={handleStartScan}>
        {scanning ? `Scanning ${progress.current}/${progress.total}…` : copy.pending.startScanning}
      </Button>
      {scanning && progress.total > 0 && (
        <View style={{ marginTop: 8, height: 4, backgroundColor: tokens.interactive, borderRadius: 2, overflow: 'hidden' }}>
          <View style={{
            height: 4,
            borderRadius: 2,
            backgroundColor: tokens.primary,
            width: `${(progress.current / progress.total) * 100}%`,
          }} />
        </View>
      )}
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 8,
          marginTop: 16,
        }}
      >
        {items.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => router.push(`/pending/card/${item.id}`)}
            accessibilityRole="button"
            accessibilityLabel={`${badgeLabel(item.status)} — ${copy.pending.thumbnail}`}
            style={{
              width: '31.5%',
              aspectRatio: 1,
              borderRadius: 8,
              overflow: 'hidden',
              backgroundColor: tokens.interactive,
            }}
          >
            <Image
              source={{ uri: item.imagePath }}
              style={{ width: '100%', height: '100%' }}
            />
            <View style={{ position: 'absolute', bottom: 4, left: 4 }}>
              <Chip>{badgeLabel(item.status)}</Chip>
            </View>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

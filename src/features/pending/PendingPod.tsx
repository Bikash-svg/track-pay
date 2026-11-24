import { useCallback, useState } from 'react';
import { Image, Pressable, ScrollView, View, Alert, ToastAndroid, PermissionsAndroid, Platform } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { Card, Text, Button, copy } from '../../ui';
import { useTheme } from '../../ui/useTheme';
import { loadAll, type PendingItem } from '../../data/pendingItems';
import { startBatch } from './scanEngine';

const MAX_THUMBNAILS = 5;

export function PendingPod() {
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

  if (items === null || items.length === 0) return null;

  const preview = items.slice(0, MAX_THUMBNAILS);
  const extra = items.length - preview.length;
  const hasUnscanned = items.some((i) => i.status === 'unscanned');

  async function requestNotificationPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;
    if (Platform.Version < 33) return true;
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

  const handleStartScan = async () => {
    await requestNotificationPermission();
    setScanning(true);
    setProgress({ current: 0, total: 0 });
    try {
      await startBatch((current, total) => {
        setProgress({ current, total });
      });
      // Reload grid after scan
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

  return (
    <Card>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <Text>{copy.pending.count(items.length)}</Text>
        <Button variant="text" onPress={() => router.push('/pending/verify')}>
          {copy.pending.verifyPending}
        </Button>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {preview.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => router.push(`/pending/card/${item.id}`)}
            accessibilityRole="button"
            accessibilityLabel={copy.pending.thumbnail}
            style={{ marginRight: 8 }}
          >
            <Image
              source={{ uri: item.imagePath }}
              style={{
                width: 72,
                height: 72,
                borderRadius: 8,
                backgroundColor: tokens.interactive,
              }}
            />
          </Pressable>
        ))}
        {extra > 0 && (
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 8,
              backgroundColor: tokens.interactive,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text>+{extra}</Text>
          </View>
        )}
      </ScrollView>
      <View style={{ marginTop: 8, padding: 8, backgroundColor: tokens.interactive, borderRadius: 8 }}>
        <Button disabled={!hasUnscanned || scanning} onPress={handleStartScan}>
          {scanning ? `Scanning ${progress.current}/${progress.total}…` : copy.pending.startScanning}
        </Button>
        {scanning && progress.total > 0 && (
          <View style={{ marginTop: 8, height: 4, backgroundColor: tokens.interactive, borderRadius: 2, overflow: 'hidden' }}>
            <View
              style={{
                height: 4,
                borderRadius: 2,
                backgroundColor: tokens.primary,
                width: `${(progress.current / progress.total) * 100}%`,
              }}
            />
          </View>
        )}
      </View>
    </Card>
  );
}

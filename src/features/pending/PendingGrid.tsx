import { useCallback, useState } from 'react';
import { Image, Pressable, View } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { Screen, Text, Button, Chip, copy } from '../../ui';
import { useTheme } from '../../ui/useTheme';
import { loadAll, type PendingItem } from '../../data/pendingItems';
import { badgeLabel } from './badgeLabel';

function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

export function PendingGrid() {
  const [items, setItems] = useState<PendingItem[] | null>(null);
  const { tokens } = useTheme();

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
        <Button variant="text" onPress={goBack}>
          {copy.pending.back}
        </Button>
      </View>
      <Button disabled onPress={() => {}}>
        {copy.pending.startScanning}
      </Button>
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

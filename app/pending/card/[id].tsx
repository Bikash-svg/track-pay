import { useCallback, useState } from 'react';
import { Image } from 'react-native';
import { useFocusEffect, useLocalSearchParams, router } from 'expo-router';
import { Screen, Text, Button, copy } from '../../../src/ui';
import { loadAll, type PendingItem } from '../../../src/data/pendingItems';
import { badgeLabel } from '../../../src/features/pending/badgeLabel';

function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

export default function PendingCardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<PendingItem | null | undefined>(undefined);

  const reload = useCallback(() => {
    let cancelled = false;
    void loadAll()
      .then((rows) => {
        if (!cancelled) setItem(rows.find((r) => r.id === id) ?? null);
      })
      .catch(() => {
        if (!cancelled) setItem(null);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  useFocusEffect(reload);

  if (item === undefined) {
    return (
      <Screen>
        <Text>{copy.pending.loading}</Text>
      </Screen>
    );
  }

  if (item === null) {
    return (
      <Screen>
        <Text>{copy.pending.notFound}</Text>
        <Button onPress={goBack}>{copy.pending.back}</Button>
      </Screen>
    );
  }

  return (
    <Screen>
      <Image
        source={{ uri: item.imagePath }}
        style={{ width: '100%', height: 280, resizeMode: 'contain' }}
      />
      <Text>{badgeLabel(item.status)}</Text>
      <Button onPress={goBack}>{copy.pending.back}</Button>
    </Screen>
  );
}

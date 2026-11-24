import { useCallback, useState } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { Card, Text, Button, copy } from '../../ui';
import { useTheme } from '../../ui/useTheme';
import { loadAll, type PendingItem } from '../../data/pendingItems';

const MAX_THUMBNAILS = 5;

export function PendingPod() {
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

  if (items === null || items.length === 0) return null;

  const preview = items.slice(0, MAX_THUMBNAILS);
  const extra = items.length - preview.length;

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
    </Card>
  );
}

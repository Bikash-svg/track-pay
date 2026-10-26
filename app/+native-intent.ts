// app/+native-intent.ts
// Expo Router + expo-share-intent linking fix for Android
// Redirects share intents to /share-receipt route
// This runs BEFORE React mounts — no hooks, no components

import { getShareExtensionKey } from 'expo-share-intent';

export function redirectSystemPath({
  path,
}: {
  path: string;
  initial: boolean;
}): string {
  try {
    if (path.includes(`dataUrl=${getShareExtensionKey()}`)) {
      return '/share-receipt';
    }
    return path;
  } catch {
    return '/';
  }
}
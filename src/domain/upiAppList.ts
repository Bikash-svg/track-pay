// Collapse the two-probe UPI list from the native module into one UpiApp[].
//
// 0.4's spike found that `listUpiApps()` returns two probes (MATCH_DEFAULT_ONLY
// and flags=0) with two app lists. They can differ on edge devices, so this
// picks one deterministically: matchDefaultOnly is primary because it is the
// same query the OS uses to resolve a "default app"; flagsZero is the
// fallback for devices where the default-only query comes back empty.
//
// Not-found (no native module) and an empty list both collapse to [], which is
// how the dialog's no-UPI-app state is reached. isNoApp() is the predicate
// the dialog checks instead of re-deriving the collapse.
//
// Pure. This is the only domain file that may import types from native: the
// import is type-only, so no platform code runs here.

import type { UpiApp, ListAppsResult } from '../native/upiLauncher';

export function normalizeList(result: ListAppsResult): UpiApp[] {
  if (result.kind !== 'found') return [];
  const primary = result.result.matchDefaultOnly.apps;
  if (primary.length > 0) return primary;
  return result.result.flagsZero.apps;
}

export function isNoApp(result: ListAppsResult): boolean {
  return normalizeList(result).length === 0;
}
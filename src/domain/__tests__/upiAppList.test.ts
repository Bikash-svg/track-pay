import { normalizeList, isNoApp } from '../upiAppList';
import type { ListAppsResult, UpiApp } from '../../native/upiLauncher';

function found(appsA: UpiApp[], appsB: UpiApp[]): ListAppsResult {
  return {
    kind: 'found',
    result: {
      sdkInt: 34,
      matchDefaultOnly: { flags: 1, count: appsA.length, apps: appsA },
      flagsZero: { flags: 0, count: appsB.length, apps: appsB },
    },
  };
}

const gpay: UpiApp = { packageName: 'com.google.upi', label: 'GPay' };
const phonepe: UpiApp = { packageName: 'com.phonepe.app', label: 'PhonePe' };

describe('upiAppList', () => {
  it('found with one app in matchDefaultOnly returns it', () => {
    expect(normalizeList(found([gpay], []))).toEqual([gpay]);
  });

  it('found with matchDefaultOnly empty falls back to flagsZero', () => {
    expect(normalizeList(found([], [gpay, phonepe]))).toEqual([gpay, phonepe]);
  });

  it('found with both empty returns [] and isNoApp is true', () => {
    expect(normalizeList(found([], []))).toEqual([]);
    expect(isNoApp(found([], []))).toBe(true);
  });

  it('not-found returns [] and isNoApp is true', () => {
    expect(normalizeList({ kind: 'not-found' })).toEqual([]);
    expect(isNoApp({ kind: 'not-found' })).toBe(true);
  });
});
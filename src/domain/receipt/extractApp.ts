import type { ReceiptApp, OcrLine } from './types';

const APP_MARKERS: ReadonlyArray<readonly [ReceiptApp, readonly string[]]> = [
  ['phonepe', ['phonepe', 'phone pe']],
  ['navi', ['navi upi', 'navi']],
  ['bhim', ['bhim']],
  ['fampay', ['fampay', 'fam pay', 'paid with fam', 'trio p']],
  ['gpay', ['gpay', 'g pay', 'google pay']],
  ['paytm', ['paytm', 'pay tm']],
  ['slice', ['slice']],
  ['supermoney', ['supermoney', 'super money', 'super.money']],
  ['bharatpe', ['bharatpe', 'bharat pe']],
  ['amazonpay', ['amazon pay', 'amazonpay']],
  ['mobikwik', ['mobikwik']],
  ['cred', ['cred upi']],
];

export function extractApp(lines: readonly OcrLine[]): ReceiptApp {
  const text = lines.map((line) => line.text).join(' ').toLowerCase();
  for (const [app, markers] of APP_MARKERS) {
    for (const marker of markers) {
      if (text.includes(marker)) return app;
    }
  }
  return 'unknown';
}

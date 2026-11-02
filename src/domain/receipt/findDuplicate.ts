import type { ParsedReceipt } from './parseReceipt';

export type PaymentLike = {
  readonly id: string;
  readonly amountPaise: number;
  readonly payeeName: string;
  readonly paidAt: number | null;
  readonly createdAt: number;
  readonly upiRef: string | null;
};

export const DUPLICATE_TIME_WINDOW_MS = 120_000;

export function findDuplicate<T extends PaymentLike>(
  existing: readonly T[],
  parsed: ParsedReceipt,
): T | null {
  if (parsed.upiRef) {
    const match = existing.find((p) => p.upiRef === parsed.upiRef);
    if (match) return match;
  }

  if (parsed.paidAt) {
    const parsedPaidAtMs = parsed.paidAt.getTime();
    const match = existing.find((p) => {
      if (p.amountPaise !== parsed.amountPaise) return false;
      if (p.payeeName !== parsed.payeeName) return false;
      const pTime = p.paidAt ?? p.createdAt;
      return Math.abs(pTime - parsedPaidAtMs) <= DUPLICATE_TIME_WINDOW_MS;
    });
    if (match) return match;
  }

  return null;
}

import {
  detectAmountPaise,
  detectPaidAt,
  detectPayee,
  detectUpiRef,
} from './parseReceipt';

export type FieldCount = {
  amount: boolean;
  payee: boolean;
  paidAt: boolean;
  upiRef: boolean;
  total: number;
};

export function countFields(ocrText: string, referenceDate: Date): FieldCount {
  const amount = detectAmountPaise(ocrText) !== null;
  const payee = detectPayee(ocrText) !== 'Unknown';
  const paidAt = detectPaidAt(ocrText, referenceDate) !== null;
  const upiRef = detectUpiRef(ocrText) !== null;
  return {
    amount,
    payee,
    paidAt,
    upiRef,
    total: [amount, payee, paidAt, upiRef].filter(Boolean).length,
  };
}

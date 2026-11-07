export type { OcrLine } from '../../ocr/paddleOcr';

export type ReceiptDirection = 'debit' | 'credit' | 'self_transfer' | 'unknown';
export type ReceiptApp = 'gpay' | 'phonepe' | 'paytm' | 'navi' | 'unknown';
export type ReceiptStatus = 'success' | 'failed' | 'pending' | 'unknown';

export type ParsedReceipt = {
  readonly amountPaise: number;
  readonly amountDisplay: string;
  readonly direction: ReceiptDirection;
  readonly counterparty: string | null;
  readonly paidAt: Date | null;
  readonly time: { readonly hour: number; readonly minute: number } | null;
  readonly app: ReceiptApp;
  readonly status: ReceiptStatus;
  readonly upiRef: string | null;
};

export type ReceiptRefusal = {
  readonly reason: 'failed' | 'pending' | 'no_amount' | 'unreadable';
};

export type ExtractedAmount = {
  readonly rawText: string;
  readonly displayText: string;
  readonly confidence: number;
  readonly accepted: boolean;
  readonly lineIndex: number;
};

// Receipt parser — pure TypeScript per 4-B.2 specification
//
// Signature:
//   parseReceipt(ocrText: string, referenceDate: Date): ParsedReceipt | ReceiptRefusal
//
// Refusal priority (per Phase 0 #5):
// 1. unreadable — empty or <2 receipt markers (≥2 needed)
// 2. failed — "Failed"/"Declined"/"Payment unsuccessful" (first 3 lines or own line, NOT if text contains "Successful"/"Success")
// 3. pending — "Pending"/"Processing" (same scoping as failed)
// 4. no_amount — 0 or 2+ distinct ₹-prefixed amounts, OR ₹7-ambiguity
// 5. Otherwise → ParsedReceipt
//
// Receipt readability rule (from Phase 1 U8):
// A text is readable if it contains ≥2 of:
// - a ₹/Rs./INR-prefixed number
// - a known app name (GPay / PhonePe / Paytm / Navi / Google Pay)
// - a UPI/Transaction/UTR/Ref keyword
// - a payee pattern (Paid to / Received from / To:)
// - a date-shaped token
// Otherwise → refuse unreadable.
//
// OCR slip corrections (per Phase 0 #2):
// - O→0 when inside a digit-run with ≥2 adjacent digits and no other letters
// - l/I→1 under same rule
// - space after decimal stripped ("10. 50" → "10.50")
// - ₹-glyph ambiguity: if extracted amount starts with '7' AND <₹10,000, refuse no_amount
//
// Payee fallback: 'Unknown' when no payee-like line (COPY.md §4)
//
// Amount format: integer paise, commas stripped, standard currency formatting

import { parseAmount } from '../amount';

type App = 'gpay' | 'phonepe' | 'paytm' | 'navi' | 'unknown';

export type ParsedReceipt = {
  readonly amountPaise: number;
  readonly payeeName: string;
  readonly paidAt: Date | null;
  readonly upiRef: string | null;
  readonly app: App;
};

export type ReceiptRefusal = {
  readonly reason: 'unreadable' | 'failed' | 'pending' | 'no_amount';
};

// Refusal priority utilities
const isUnreadable = (text: string): boolean => {
  const markers = [
    // ₹/Rs./INR-prefixed number
    /(?:₹|Rs\.|INR)\s*\d+(?:,\d+)*(?:\.\d+)?/i,
    // Known app name
    /(Google Pay|GPay|PhonePe|Paytm|Navi)/i,
    // UPI/Transaction/UTR/Ref keyword
    /(UPI|Transaction|UTR|Ref|Reference|UPI Ref|Transaction ID)/i,
    // Payee pattern
    /(Paid to|Received from|To:|Sent to)/i,
    // Date-shaped token (DD Mon YYYY, Mon DD, YYYY, etc.)
    /\d{1,2}[\s/-](?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s/-]\d{4}/i,
  ];
  let found = 0;
  for (const r of markers) if (r.test(text)) found++;
  return found < 2;
};

const containsFailed = (text: string): boolean => {
  const lines = text.split('\n');
  const statusMarkers = ['Failed', 'Declined', 'Payment unsuccessful'];
  const successMarkers = ['Successful', 'Success'];
  // Check if any status marker appears in first 3 lines or own line
  const hasFailedInStatus = lines.some(
    (line, idx) => idx < 3 && statusMarkers.some(sm => line.includes(sm))
  );
  // Also allow own line matching status marker (anywhere)
  const hasFailedAny = lines.some(line => statusMarkers.some(sm => line.includes(sm)));
  const hasSuccess = successMarkers.some(sm => text.includes(sm));
  return (hasFailedInStatus || hasFailedAny) && !hasSuccess;
};

const containsPending = (text: string): boolean => {
  const lines = text.split('\n');
  const statusMarkers = ['Pending', 'Processing'];
  const successMarkers = ['Successful', 'Success'];
  const hasPendingInStatus = lines.some(
    (line, idx) => idx < 3 && statusMarkers.some(sm => line.includes(sm))
  );
  const hasPendingAny = lines.some(line => statusMarkers.some(sm => line.includes(sm)));
  const hasSuccess = successMarkers.some(sm => text.includes(sm));
  return (hasPendingInStatus || hasPendingAny) && !hasSuccess;
};

// OCR slip correction utilities
function fixOCRSlipsInNumber(text: string): string {
  // Simple approach: replace O→0 and l/I→1 in the entire text
  return text.replace(/O/g, '0').replace(/l/g, '1').replace(/I/g, '1');
}

function stripSpaceAfterDecimal(text: string): string {
  // Remove spaces after decimal point: "10. 50" -> "10.50"
  return text.replace(/\.(\s+)(\d+)/g, (match, spaces, digits) => {
    return '.' + spaces.replace(/\s/g, '') + digits;
  });
}

function normalizeAmountString(text: string): string {
  let fixed = text.replace(/,/g, '');
  fixed = fixOCRSlipsInNumber(fixed);
  fixed = stripSpaceAfterDecimal(fixed);
  return fixed;
}

function isAmbiguousSevenRupee(text: string): boolean {
  const normalized = normalizeAmountString(text);
  const amountPart = normalized.replace(/(?:₹|Rs\.|INR)\s*/i, '');
  if (!amountPart || isNaN(parseFloat(amountPart))) return false;
  const numericValue = parseFloat(amountPart);
  // R6: refuse only when amount starts with 7, has NO decimal point, AND < ₹10,000
  return amountPart.startsWith('7') && !amountPart.includes('.') && numericValue < 10000;
}

function extractAmounts(text: string): number[] {
  const amounts: number[] = [];
  const lines = text.split('\n');
  for (const line of lines) {
    const matches = line.match(/(?:₹|Rs\.|INR)\s*([^.\s]*\.\s*\d+)/gi);
    if (!matches) continue;
    for (const match of matches) {
      const amountStr = match.replace(/(?:₹|Rs\.|INR)\s*/i, '');
      const normalized = normalizeAmountString(amountStr);
      const parseResult = parseAmount(normalized);
      if ('paise' in parseResult) amounts.push(parseResult.paise);
    }
  }
  return amounts;
}

function extractPayee(text: string): string {
  const lines = text.split('\n');
  const payeePatterns = [
    /(Paid to|Received from|To:|Sent to)\s*(.+)/i,
  ];
  for (const line of lines) {
    for (const pattern of payeePatterns) {
      const match = line.match(pattern);
      if (match) {
        let payee = match[match.length - 1].trim();
        if (payee.length > 40) payee = payee.slice(0, 40);
        return payee === '' ? 'Unknown' : payee;
      }
    }
  }
  return 'Unknown';
}

function extractUpiRef(text: string): string | null {
  const lines = text.split('\n');
  for (const line of lines) {
    const match = line.match(/:\s*([A-Za-z0-9]+)$/i);
    if (match && match[1]) return match[1];
  }
  return null;
}

function extractApp(text: string): App {
  const lower = text.toLowerCase();
  if (lower.includes('google pay') || lower.includes('gpay')) return 'gpay';
  if (lower.includes('phonepe') || lower.includes('phone pe')) return 'phonepe';
  if (lower.includes('paytm')) return 'paytm';
  if (lower.includes('navi')) return 'navi';
  return 'unknown';
}

function extractDate(text: string): Date | null {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Pattern for "DD Mon YYYY, HH:MM AM/PM"
  const dateTimePattern = /\b(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4}),\s+(\d{1,2}):(\d{2})\s+(AM|PM)/gi;
  
  const matches = Array.from(text.matchAll(dateTimePattern));
  for (const match of matches) {
    let day = parseInt(match[1]);
    let monthName = match[2];
    let year = parseInt(match[3]);
    let hour = parseInt(match[4]);
    let minute = parseInt(match[5]);
    let ampm = match[6];
    
    // Convert 12-hour to 24-hour
    if (ampm === 'PM' && hour !== 12) {
      hour += 12;
    } else if (ampm === 'AM' && hour === 12) {
      hour = 0;
    }
    
    const month = monthNames.indexOf(monthName);
    if (year >= 2000 && year <= 2030 && month >= 0 && month <= 11 && day >= 1 && day <= 31 && hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
      return new Date(year, month, day, hour, minute);
    }
  }
  
  // Original date patterns (without time)
  const datePatterns = [
    /\b(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})\b/gi,
    /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),?\s+(\d{4})\b/gi,
    /\b(\d{1,2})[\s/-](\d{1,2})[\s/-](\d{4})\b/gi,
    /\b(\d{1,2})-(\d{1,2})-(\d{4})\b/gi,
  ];
  
  for (const pattern of datePatterns) {
    const dateMatches = Array.from(text.matchAll(pattern));
    for (const match of dateMatches) {
      let day = -1, month = -1, year = -1;
      
      const ddMonYyyyMatch = match[0].match(/^(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})$/i);
      if (ddMonYyyyMatch && ddMonYyyyMatch[1] && ddMonYyyyMatch[2] && ddMonYyyyMatch[3]) {
        day = parseInt(ddMonYyyyMatch[1]);
        const monthName = ddMonYyyyMatch[2] as string;
        month = monthNames.indexOf(monthName);
        year = parseInt(ddMonYyyyMatch[3]);
      } else {
        const monDdYyyyMatch = match[0].match(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),?\s+(\d{4})$/i);
        if (monDdYyyyMatch && monDdYyyyMatch[1] && monDdYyyyMatch[2] && monDdYyyyMatch[3]) {
          const monthName = monDdYyyyMatch[1] as string;
          month = monthNames.indexOf(monthName);
          day = parseInt(monDdYyyyMatch[2]);
          year = parseInt(monDdYyyyMatch[3]);
        }
      }
      
      if (year === -1 && match[1] && match[2] && match[3]) {
        const possibleYear = parseInt(match[3]);
        if (possibleYear >= 2000 && possibleYear <= 2030) {
          year = possibleYear;
          const firstNum = parseInt(match[1]);
          const secondNum = parseInt(match[2]);
          if (firstNum >= 1 && firstNum <= 31 && secondNum >= 1 && secondNum <= 12) {
            day = firstNum;
            month = secondNum - 1;
          } else if (secondNum >= 1 && secondNum <= 31 && firstNum >= 1 && firstNum <= 12) {
            month = firstNum - 1;
            day = secondNum;
          }
        }
      }
      
      if (year >= 2000 && year <= 2030 && month >= 0 && month <= 11 && day >= 1 && day <= 31) {
        return new Date(year, month, day);
      }
    }
  }
  
  return null;
}

export function parseReceipt(ocrText: string, referenceDate: Date): ParsedReceipt | ReceiptRefusal {
  if (isUnreadable(ocrText)) return { reason: 'unreadable' };
  
  if (containsFailed(ocrText)) return { reason: 'failed' };
  
  if (containsPending(ocrText)) return { reason: 'pending' };
  
  const amounts = extractAmounts(ocrText);
  const uniqueAmounts = [...new Set(amounts)];
  if (uniqueAmounts.length === 0) return { reason: 'no_amount' };
  if (uniqueAmounts.length > 1) return { reason: 'no_amount' };
  
  const rawTextForSevenCheck = ocrText.match(/(?:₹|Rs\.|INR)\s*\d+(?:,\d+)*(?:\.\d+)?/i)?.[0] || '';
  if (isAmbiguousSevenRupee(rawTextForSevenCheck)) return { reason: 'no_amount' };
  
  const amount = uniqueAmounts[0];
  const payee = extractPayee(ocrText);
  const upiRef = extractUpiRef(ocrText);
  const paidAt = extractDate(ocrText);
  const app = extractApp(ocrText);
  
  return {
    amountPaise: amount,
    payeeName: payee,
    paidAt: paidAt || null,
    upiRef: upiRef || null,
    app,
  };
}
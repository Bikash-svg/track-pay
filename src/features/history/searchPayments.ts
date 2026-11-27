import type { Payment } from '../../data/payments';

const AMOUNT_TOLERANCE_PERCENT = 0.1; // 10%
const AMOUNT_TOLERANCE_MIN_PAISE = 5000; // ₹50

function parseAmountQuery(q: string): number | null {
  // Strip currency symbols and commas.
  const cleaned = q.replace(/[₹,\s]/g, '');
  const num = parseFloat(cleaned);
  if (isNaN(num) || num <= 0) return null;
  return Math.round(num * 100); // convert to paise
}

export function searchPayments(
  payments: readonly Payment[],
  query: string,
): Payment[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...payments];

  const amountQuery = parseAmountQuery(q);

  return payments.filter((p) => {
    const payee = p.payeeName.toLowerCase();
    const note = (p.label ?? '').toLowerCase();
    const category = p.category.toLowerCase();
    if (payee.includes(q) || note.includes(q) || category.includes(q)) {
      return true;
    }

    if (amountQuery !== null) {
      const diff = Math.abs(p.amountPaise - amountQuery);
      const tolerance = Math.max(
        Math.round(amountQuery * AMOUNT_TOLERANCE_PERCENT),
        AMOUNT_TOLERANCE_MIN_PAISE,
      );
      return diff <= tolerance;
    }

    return false;
  });
}

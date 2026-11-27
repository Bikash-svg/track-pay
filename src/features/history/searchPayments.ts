import type { Payment } from '../../data/payments';

export function searchPayments(
  payments: readonly Payment[],
  query: string,
): Payment[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...payments];
  return payments.filter((p) => {
    const payee = p.payeeName.toLowerCase();
    const note = (p.label ?? '').toLowerCase();
    const category = p.category.toLowerCase();
    return payee.includes(q) || note.includes(q) || category.includes(q);
  });
}

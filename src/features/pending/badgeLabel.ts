import type { PendingStatus } from '../../data/pendingItems';
import { copy } from '../../ui';

// Shared by the Verify Pending grid and the pending card so a status has one
// name everywhere (GUARDRAILS §7).
export function badgeLabel(status: PendingStatus): string {
  return copy.pending.badge[status];
}

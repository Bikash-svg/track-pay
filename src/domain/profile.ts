// Name normalisation for the onboarding form (Step 2.3).
//
// Trim then cap at 40 chars (matches DESIGN.md §5's "To whom up to 40 chars"
// for length discipline; layout safety is O5's concern, and the cap is what
// prevents unbounded strings from reaching any Text). Empty after trim →
// null, so both Skip and a cleared field yield null (O4).
//
// No domain-layer dependency: this function does not import anything. It is
// pure TS, like greeting.ts, so it is trivially unit-testable and the tests
// are timezone-independent.

export function sanitizeName(input: string): string | null {
  const trimmed = input.trim();
  if (trimmed.length === 0) return null;
  return trimmed.slice(0, 40);
}
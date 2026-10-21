// 4.2 UPI QR parser (EVALS U1-U9). Strict 'upi://pay' scheme. Amount in integer paise. Detects >2 decimal places by string inspection (not parseFloat rounding). Long names truncated for display (pn 40, tn 60) but stored up to 200; >200 rejected as too-long-name. Never saves, never launches — pure parse only.

export type UpiParseError =
  | 'invalid-scheme'
  | 'missing-pa'
  | 'bad-pa'
  | 'missing-at'
  | 'bad-amount'
  | 'unsupported-currency'
  | 'too-many-decimals'
  | 'too-long-name';

export interface UpiParseOk {
  readonly kind: 'ok';
  readonly payeeName: string;          // truncated to 40 for display
  readonly payeeNameFull: string;      // full up to 200
  readonly payeeVpa: string;
  readonly amountPaise: number | null; // null when am absent (U2)
  readonly note: string | null;        // truncated to 60 for display
  readonly noteFull: string | null;    // full up to 200
}

export interface UpiParseErr {
  readonly kind: 'error';
  readonly reason: UpiParseError;
}

export type UpiParseResult = UpiParseOk | UpiParseErr;

const MAX_NAME_LENGTH = 200;
const DISPLAY_PN_MAX = 40;
const DISPLAY_TN_MAX = 60;

function truncateForDisplay(value: string, max: number): string {
  if (value.length <= max) return value;
  return value.slice(0, max - 1) + '…';
}

function parseQueryString(queryString: string): Record<string, string> {
  const params: Record<string, string> = {};
  for (const pair of queryString.split('&')) {
    const [key, ...rest] = pair.split('=');
    if (key) {
      params[decodeURIComponent(key)] = decodeURIComponent(rest.join('=') || '');
    }
  }
  return params;
}

function validateAmount(am: string): { ok: boolean; paise: number | null; reason?: UpiParseError } {
  if (am === '') {
    return { ok: true, paise: null };
  }
  // Check decimal places by string inspection (not parseFloat rounding)
  const decimalIndex = am.indexOf('.');
  if (decimalIndex !== -1) {
    const decimals = am.length - decimalIndex - 1;
    if (decimals > 2) {
      return { ok: false, paise: null, reason: 'too-many-decimals' };
    }
  }
  const value = parseFloat(am);
  if (isNaN(value) || value <= 0) {
    return { ok: false, paise: null, reason: 'bad-amount' };
  }
  const paise = Math.round(value * 100);
  return { ok: true, paise };
}

// 4.3 reverse of parseUpi: build a upi://pay link from a parsed result with optional amount/note overrides. URL-encodes pn and tn. Omits am when amount is null or 0 (U2 flow — user enters amount in Confirm dialog, but buildUpiLink can also be called with the edited amount). Omits tn when empty. cu is always INR. Round-trip test: parseUpi(buildUpiLink(parseUpi(x))) should equal parseUpi(x) when overrides are undefined.

export function buildUpiLink(
  result: UpiParseOk,
  amountPaiseOverride?: number,
  noteOverride?: string,
): string {
  const params: string[] = [];
  params.push(`pa=${encodeURIComponent(result.payeeVpa)}`);
  if (result.payeeNameFull) params.push(`pn=${encodeURIComponent(result.payeeNameFull)}`);
  const amountPaise = amountPaiseOverride ?? result.amountPaise;
  if (amountPaise !== null && amountPaise > 0) {
    const rupees = (amountPaise / 100).toFixed(2);
    params.push(`am=${rupees}`);
  }
  params.push('cu=INR');
  const note = noteOverride ?? result.noteFull;
  if (note) params.push(`tn=${encodeURIComponent(note)}`);
  return `upi://pay?${params.join('&')}`;
}

export function parseUpi(input: string): UpiParseResult {
  // U8: must start with 'upi://pay' (strict prefix)
  const prefix = 'upi://pay';
  if (!input.startsWith(prefix)) {
    return { kind: 'error', reason: 'invalid-scheme' };
  }

  const queryString = input.slice(prefix.length);
  if (!queryString.startsWith('?')) {
    return { kind: 'error', reason: 'invalid-scheme' };
  }

  const params = parseQueryString(queryString.slice(1));

  // pa: required
  const pa = params.pa;
  if (pa === undefined) {
    return { kind: 'error', reason: 'missing-pa' };
  }
  if (!pa.includes('@')) {
    return { kind: 'error', reason: 'bad-pa' };
  }
  const [account, host] = pa.split('@');
  if (account === '' || host === '') {
    return { kind: 'error', reason: 'missing-at' };
  }

  // cu: if present and !== 'INR' → unsupported-currency
  const cu = params.cu;
  if (cu !== undefined && cu !== 'INR') {
    return { kind: 'error', reason: 'unsupported-currency' };
  }

  // am: absent → amountPaise: null (U2)
  const am = params.am;
  const amountValidation = validateAmount(am ?? '');
  if (!amountValidation.ok) {
    return { kind: 'error', reason: amountValidation.reason! };
  }
  const amountPaise = amountValidation.paise;

  // pn: decode, truncate display to 40. If >200 total → too-long-name
  const pn = params.pn ?? '';
  if (pn.length > MAX_NAME_LENGTH) {
    return { kind: 'error', reason: 'too-long-name' };
  }
  const payeeName = truncateForDisplay(pn, DISPLAY_PN_MAX);
  const payeeNameFull = pn;

  // tn: decode, truncate display to 60. If >200 total → too-long-name
  const tn = params.tn ?? '';
  if (tn.length > MAX_NAME_LENGTH) {
    return { kind: 'error', reason: 'too-long-name' };
  }
  const note = tn === '' ? null : truncateForDisplay(tn, DISPLAY_TN_MAX);
  const noteFull = tn === '' ? null : tn;

  return {
    kind: 'ok',
    payeeName,
    payeeNameFull,
    payeeVpa: pa,
    amountPaise,
    note,
    noteFull,
  };
}
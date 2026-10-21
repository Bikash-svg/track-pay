import { parseUpi, buildUpiLink } from '../upiParse';

describe('parseUpi (EVALS U1-U9)', () => {
  // U1: full URL
  test('U1: full URL with all params', () => {
    const result = parseUpi('upi://pay?pa=shop@bank&pn=Cafe%20Mocha&am=120.00&cu=INR&tn=Lunch');
    expect(result.kind).toBe('ok');
    if (result.kind === 'ok') {
      expect(result.payeeName).toBe('Cafe Mocha');
      expect(result.payeeNameFull).toBe('Cafe Mocha');
      expect(result.payeeVpa).toBe('shop@bank');
      expect(result.amountPaise).toBe(12000);
      expect(result.note).toBe('Lunch');
      expect(result.noteFull).toBe('Lunch');
    }
  });

  // U2: no am
  test('U2: no am parameter', () => {
    const result = parseUpi('upi://pay?pa=shop@bank&pn=Cafe%20Mocha&cu=INR&tn=Lunch');
    expect(result.kind).toBe('ok');
    if (result.kind === 'ok') {
      expect(result.amountPaise).toBeNull();
    }
  });

  // U3a: am=0
  test('U3a: am=0 rejected', () => {
    const result = parseUpi('upi://pay?pa=shop@bank&am=0');
    expect(result).toEqual({ kind: 'error', reason: 'bad-amount' });
  });

  // U3b: am=-5
  test('U3b: am=-5 rejected', () => {
    const result = parseUpi('upi://pay?pa=shop@bank&am=-5');
    expect(result).toEqual({ kind: 'error', reason: 'bad-amount' });
  });

  // U3c: am=abc
  test('U3c: am=abc rejected', () => {
    const result = parseUpi('upi://pay?pa=shop@bank&am=abc');
    expect(result).toEqual({ kind: 'error', reason: 'bad-amount' });
  });

  // U4: am=10.999 (more than 2 decimals)
  test('U4: am=10.999 rejected (too many decimals)', () => {
    const result = parseUpi('upi://pay?pa=shop@bank&am=10.999');
    expect(result).toEqual({ kind: 'error', reason: 'too-many-decimals' });
  });

  // U5: cu=USD
  test('U5: cu=USD rejected', () => {
    const result = parseUpi('upi://pay?pa=shop@bank&cu=USD');
    expect(result).toEqual({ kind: 'error', reason: 'unsupported-currency' });
  });

  // U6a: no pa
  test('U6a: missing pa rejected', () => {
    const result = parseUpi('upi://pay?pn=Test&am=100');
    expect(result).toEqual({ kind: 'error', reason: 'missing-pa' });
  });

  // U6b: pa=shopbank (no @)
  test('U6b: pa without @ rejected', () => {
    const result = parseUpi('upi://pay?pa=shopbank');
    expect(result).toEqual({ kind: 'error', reason: 'bad-pa' });
  });

  // U6c: pa=@bank (empty account)
  test('U6c: pa with empty account rejected', () => {
    const result = parseUpi('upi://pay?pa=@bank');
    expect(result).toEqual({ kind: 'error', reason: 'missing-at' });
  });

  // U7: pn with encoded characters and emoji
  test('U7: pn with encoded chars and emoji decoded correctly', () => {
    const result = parseUpi('upi://pay?pa=shop@bank&pn=Cafe%20Mocha%20%E2%98%95');
    expect(result.kind).toBe('ok');
    if (result.kind === 'ok') {
      expect(result.payeeName).toBe('Cafe Mocha ☕');
      expect(result.payeeNameFull).toBe('Cafe Mocha ☕');
    }
  });

  // U8: not upi://pay
  test('U8: non-upi scheme rejected', () => {
    const result = parseUpi('https://example.com/pay?pa=shop@bank');
    expect(result).toEqual({ kind: 'error', reason: 'invalid-scheme' });
  });

  // U9a: 50-char pn → truncated to 40 for display, full stored
  test('U9a: long pn (50 chars) truncated for display', () => {
    const longName = 'A'.repeat(50);
    const result = parseUpi(`upi://pay?pa=shop@bank&pn=${encodeURIComponent(longName)}`);
    expect(result.kind).toBe('ok');
    if (result.kind === 'ok') {
      expect(result.payeeName).toBe('A'.repeat(39) + '…');
      expect(result.payeeName.length).toBe(40);
      expect(result.payeeNameFull).toBe(longName);
      expect(result.payeeNameFull.length).toBe(50);
    }
  });

  // U9b: 250-char pn → too-long-name
  test('U9b: very long pn (250 chars) rejected', () => {
    const veryLongName = 'A'.repeat(250);
    const result = parseUpi(`upi://pay?pa=shop@bank&pn=${encodeURIComponent(veryLongName)}`);
    expect(result).toEqual({ kind: 'error', reason: 'too-long-name' });
  });
});

describe('buildUpiLink (4.3 reverse of parseUpi)', () => {
  // Round-trip: parseUpi(buildUpiLink(parseUpi(x))) should equal parseUpi(x) when overrides are undefined
  test('round-trip: buildUpiLink then parseUpi preserves all fields', () => {
    const input = 'upi://pay?pa=shop@bank&pn=Cafe%20Mocha&am=120.00&cu=INR&tn=Lunch';
    const parsed = parseUpi(input);
    expect(parsed.kind).toBe('ok');
    if (parsed.kind === 'ok') {
      const link = buildUpiLink(parsed);
      const reparsed = parseUpi(link);
      expect(reparsed.kind).toBe('ok');
      if (reparsed.kind === 'ok') {
        expect(reparsed.payeeName).toBe(parsed.payeeName);
        expect(reparsed.payeeNameFull).toBe(parsed.payeeNameFull);
        expect(reparsed.payeeVpa).toBe(parsed.payeeVpa);
        expect(reparsed.amountPaise).toBe(parsed.amountPaise);
        expect(reparsed.note).toBe(parsed.note);
        expect(reparsed.noteFull).toBe(parsed.noteFull);
      }
    }
  });

  // Override amount: buildUpiLink(parsed, 5000) → parses back with amountPaise 5000
  test('amountPaiseOverride: overrides the amount in the generated link', () => {
    const input = 'upi://pay?pa=shop@bank&pn=Cafe%20Mocha&am=120.00&cu=INR&tn=Lunch';
    const parsed = parseUpi(input);
    expect(parsed.kind).toBe('ok');
    if (parsed.kind === 'ok') {
      const link = buildUpiLink(parsed, 5000); // ₹50.00
      const reparsed = parseUpi(link);
      expect(reparsed.kind).toBe('ok');
      if (reparsed.kind === 'ok') {
        expect(reparsed.amountPaise).toBe(5000);
        expect(reparsed.payeeVpa).toBe(parsed.payeeVpa);
        expect(reparsed.noteFull).toBe(parsed.noteFull);
      }
    }
  });

  // Override note: buildUpiLink(parsed, undefined, 'Coffee') → parses back with noteFull 'Coffee'
  test('noteOverride: overrides the note in the generated link', () => {
    const input = 'upi://pay?pa=shop@bank&pn=Cafe%20Mocha&am=120.00&cu=INR&tn=Lunch';
    const parsed = parseUpi(input);
    expect(parsed.kind).toBe('ok');
    if (parsed.kind === 'ok') {
      const link = buildUpiLink(parsed, undefined, 'Coffee');
      const reparsed = parseUpi(link);
      expect(reparsed.kind).toBe('ok');
      if (reparsed.kind === 'ok') {
        expect(reparsed.noteFull).toBe('Coffee');
        expect(reparsed.amountPaise).toBe(parsed.amountPaise);
        expect(reparsed.payeeVpa).toBe(parsed.payeeVpa);
      }
    }
  });

  // No amount: buildUpiLink(parseUpi('upi://pay?pa=x@y&pn=Shop').ok) → no am= in output
  test('no amount: omits am parameter when amountPaise is null', () => {
    const input = 'upi://pay?pa=shop@bank&pn=Shop';
    const parsed = parseUpi(input);
    expect(parsed.kind).toBe('ok');
    if (parsed.kind === 'ok') {
      const link = buildUpiLink(parsed);
      expect(link).not.toContain('am=');
      // Should still have pa, pn, cu
      expect(link).toContain('pa=shop%40bank');
      expect(link).toContain('pn=Shop');
      expect(link).toContain('cu=INR');
    }
  });
});
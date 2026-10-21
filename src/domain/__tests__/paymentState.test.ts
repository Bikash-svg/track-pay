import { INITIAL_STATUS, isValidTransition } from '../paymentState';

describe('paymentState', () => {
  it('INITIAL_STATUS === pending (S1: a new payment starts as pending)', () => {
    expect(INITIAL_STATUS).toBe('pending');
  });

  it('pending -> success is valid (S2)', () => {
    expect(isValidTransition('pending', 'success')).toBe(true);
  });

  it('pending -> failed is valid (S2)', () => {
    expect(isValidTransition('pending', 'failed')).toBe(true);
  });

  it('success -> failed is valid (S3: a user correction)', () => {
    expect(isValidTransition('success', 'failed')).toBe(true);
  });

  it('pending -> pending is invalid: that is not a change', () => {
    expect(isValidTransition('pending', 'pending')).toBe(false);
  });
});
import { barColour } from '../barColour';

describe('barColour (A6 intent)', () => {
  it('ok returns primary', () => { expect(barColour('ok')).toBe('primary'); });
  it('warn returns caution', () => { expect(barColour('warn')).toBe('caution'); });
  it('over returns negative', () => { expect(barColour('over')).toBe('negative'); });
  it('null fallback returns primary', () => { expect(barColour(null)).toBe('primary'); });
});
import { describe, expect, it } from 'vitest';
import { isKnownHash, resolveSectionId } from '../../src/scripts/sections';

describe('section URL resolution', () => {
  it('resolves all published sections, including the direct-only portfolio URL', () => {
    expect(
      ['#home', '#about', '#portofolio', '#contact'].map(resolveSectionId),
    ).toEqual(['home', 'about', 'portofolio', 'contact']);
  });

  it('falls back to Home for missing, malformed, or inactive hashes', () => {
    expect(
      ['', '#', '#portfolio', '#%zz', '#unknown'].map(resolveSectionId),
    ).toEqual(['home', 'home', 'home', 'home', 'home']);
    expect(isKnownHash('#portofolio')).toBe(true);
    expect(isKnownHash('#portfolio')).toBe(false);
  });
});

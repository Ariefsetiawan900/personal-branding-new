import { describe, expect, it } from 'vitest';
import { resolveSiteConfig } from '../../src/config/site';

describe('site configuration', () => {
  it('allows offline local builds and prevents indexing by default', () => {
    expect(resolveSiteConfig()).toEqual({
      url: 'http://localhost:4321',
      indexable: false,
      isProduction: false,
    });
  });

  it('uses the final canonical origin in production', () => {
    expect(
      resolveSiteConfig({
        SITE_URL: 'https://arief.example/',
        VERCEL_ENV: 'production',
      }),
    ).toEqual({
      url: 'https://arief.example',
      indexable: true,
      isProduction: true,
    });
  });

  it('never indexes previews even with a production canonical URL', () => {
    expect(
      resolveSiteConfig({
        SITE_URL: 'https://arief.example',
        VERCEL_ENV: 'preview',
      }).indexable,
    ).toBe(false);
  });

  it.each([
    '',
    'invalid',
    'http://arief.example',
    'https://localhost',
    'https://127.0.0.1',
    'https://192.168.1.1',
    'https://[::1]',
    'https://arief.example/path',
    'https://arief.example?query=1',
    'https://arief.example/#home',
    'https://user:pass@arief.example',
  ])('rejects invalid production origin %s', (SITE_URL) => {
    expect(() =>
      resolveSiteConfig({ SITE_URL, DEPLOY_ENV: 'production' }),
    ).toThrow(/SITE_URL/);
  });

  it('rejects malformed optional local configuration', () => {
    expect(() => resolveSiteConfig({ SITE_URL: 'not a URL' })).toThrow(
      /SITE_URL/,
    );
  });
});

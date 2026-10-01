export interface SiteEnvironment {
  SITE_URL?: string;
  DEPLOY_ENV?: string;
  VERCEL_ENV?: string;
}

export interface SiteConfig {
  url: string;
  indexable: boolean;
  isProduction: boolean;
}

/** Resolve a canonical origin and fail closed for production publication. */
export function resolveSiteConfig(env: SiteEnvironment = {}): SiteConfig {
  const isProduction =
    env.VERCEL_ENV === 'production' || env.DEPLOY_ENV === 'production';
  const isPreview =
    env.VERCEL_ENV === 'preview' || env.DEPLOY_ENV === 'preview';
  const rawUrl = env.SITE_URL?.trim();
  if (!rawUrl && isProduction) {
    throw new Error(
      'SITE_URL is required before production deployment. Set the final HTTPS origin.',
    );
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl || 'http://localhost:4321');
  } catch {
    throw new Error('SITE_URL must be an absolute HTTP(S) origin.');
  }
  if (
    !['http:', 'https:'].includes(parsed.protocol) ||
    parsed.username ||
    parsed.password ||
    parsed.pathname !== '/' ||
    parsed.search ||
    parsed.hash
  ) {
    throw new Error(
      'SITE_URL must be an HTTP(S) origin without credentials, path, query, or hash.',
    );
  }

  const hostname = parsed.hostname.toLowerCase();
  const isLocal =
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    !hostname.includes('.') ||
    /^127\./.test(hostname) ||
    hostname === '0.0.0.0' ||
    hostname.startsWith('[') ||
    /^10\./.test(hostname) ||
    /^192\.168\./.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(hostname);
  if (isProduction && (parsed.protocol !== 'https:' || isLocal)) {
    throw new Error('Production SITE_URL must use HTTPS and a public domain.');
  }

  return {
    url: parsed.origin,
    indexable: isProduction && !isPreview,
    isProduction,
  };
}

export function getSiteConfig(): SiteConfig {
  return resolveSiteConfig({
    SITE_URL: process.env.SITE_URL ?? import.meta.env.SITE_URL,
    DEPLOY_ENV: process.env.DEPLOY_ENV ?? import.meta.env.DEPLOY_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV ?? import.meta.env.VERCEL_ENV,
  });
}

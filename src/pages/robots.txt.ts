import type { APIRoute } from 'astro';
import { getSiteConfig } from '../config/site';

export const GET: APIRoute = () => {
  const site = getSiteConfig();
  const body = site.indexable
    ? `User-agent: *\nAllow: /\nSitemap: ${site.url}/sitemap.xml\n`
    : 'User-agent: *\nDisallow: /\n';
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};

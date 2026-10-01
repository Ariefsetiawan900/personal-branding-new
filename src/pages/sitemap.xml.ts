import type { APIRoute } from 'astro';
import { getSiteConfig } from '../config/site';

export const GET: APIRoute = () => {
  const site = getSiteConfig();
  const entries = site.indexable ? `<url><loc>${site.url}/</loc></url>` : '';
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}</urlset>\n`,
    {
      headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    },
  );
};

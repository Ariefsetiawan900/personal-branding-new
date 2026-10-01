import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { defineConfig } from 'astro/config';
import { resolveSiteConfig } from './src/config/site';

if (existsSync('.env')) loadEnvFile('.env');
const site = resolveSiteConfig(process.env);

export default defineConfig({
  site: site.url,
  output: 'static',
  devToolbar: { enabled: false },
  markdown: { syntaxHighlight: false },
  build: { inlineStylesheets: 'never' },
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "base-uri 'self'",
        "object-src 'none'",
        "form-action 'none'",
        "img-src 'self' data:",
        "font-src 'self' https://fonts.gstatic.com",
        "connect-src 'self'",
      ],
      scriptDirective: { resources: ["'self'"] },
      styleDirective: { resources: ["'self'", 'https://fonts.googleapis.com'] },
    },
  },
});

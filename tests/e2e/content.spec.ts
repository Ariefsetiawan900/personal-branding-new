import { expect, test } from '@playwright/test';
import { expectSection, ready } from './helpers';

test('CV, social names, and external-link protections are preserved', async ({
  page,
  request,
}) => {
  await ready(page, '#about');
  const cv = page.getByRole('link', { name: 'Download CV' });
  await expect(cv).toHaveAttribute('href', /^\/cv\/.+\.pdf$/);
  await expect(cv).toHaveAttribute('target', '_blank');
  const cvUrl = await cv.getAttribute('href');
  expect(cvUrl).not.toBeNull();
  const response = await request.get(cvUrl!);
  expect(response.ok()).toBe(true);
  expect(response.headers()['content-type']).toContain('application/pdf');
  await page.getByRole('link', { name: 'Contact Me', exact: true }).click();
  await expectSection(page, 'contact');
  for (const name of ['Instagram', 'LinkedIn', 'GitHub']) {
    await expect(
      page.locator('.social-links').getByRole('link', { name, exact: true }),
    ).toBeVisible();
  }
  for (const link of await page.locator('a[target="_blank"]').all()) {
    await expect(link).toHaveAttribute('rel', /\bnoopener\b/);
    await expect(link).toHaveAttribute('rel', /\bnoreferrer\b/);
  }
});

test('metadata, structured data, sitemap, robots, and custom 404 are served', async ({
  page,
  request,
}) => {
  await ready(page);
  await expect(page).toHaveTitle('Arief Setiawan | Fullstack Developer');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    'Personal Web Arief Setiawan',
  );
  const canonical = await page
    .locator('link[rel="canonical"]')
    .getAttribute('href');
  expect(canonical).toMatch(/^https?:\/\//);
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
    'content',
    canonical!,
  );
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    'content',
    'summary_large_image',
  );
  const structured: { '@type': string }[] = JSON.parse(
    await page.locator('script[type="application/ld+json"]').innerText(),
  );
  expect(structured.map((item) => item['@type'])).toEqual([
    'Person',
    'WebSite',
  ]);
  const robots = await request.get('/robots.txt');
  expect(robots.ok()).toBe(true);
  expect(await robots.text()).toContain('User-agent:');
  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.ok()).toBe(true);
  expect(await sitemap.text()).toContain('<urlset');
  const notFound = await page.goto('/this-page-does-not-exist');
  expect(notFound?.status()).toBe(404);
  await expect(page.getByText('Page Not Found', { exact: true })).toBeVisible();
});

test('built CSP permits scripts, styles, images, JSON-LD and declares font origins', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => {
    const violations: string[] = [];
    Object.assign(window, { __cspViolations: violations });
    document.addEventListener('securitypolicyviolation', (event) => {
      violations.push(`${event.violatedDirective}: ${event.blockedURI}`);
    });
  });
  await ready(page, '#portofolio');
  await page
    .locator('.portofolio-item-thumbnail img')
    .evaluateAll(async (images: HTMLImageElement[]) => {
      await Promise.all(images.map((image) => image.decode()));
    });
  await page.locator('.view-project-btn').first().click();
  await expect(
    page.getByRole('dialog', { name: 'Staycation 2020' }),
  ).toBeVisible();
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(
    1,
  );
  const csp = await page
    .locator('meta[http-equiv="Content-Security-Policy"]')
    .getAttribute('content');
  expect(csp).toMatch(/font-src[^;]*fonts\.gstatic\.com/);
  expect(csp).toMatch(/style-src[^;]*fonts\.googleapis\.com/);
  expect(
    await page.evaluate(
      () =>
        (window as Window & { __cspViolations?: string[] }).__cspViolations ??
        [],
    ),
  ).toEqual([]);
  expect(errors).toEqual([]);
});

for (const width of [360, 390, 575, 576, 767, 768, 991, 992, 1440]) {
  test(`sections do not overflow horizontally at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await ready(page);
    for (const id of ['home', 'about', 'portofolio', 'contact']) {
      await page.evaluate((hash) => {
        location.hash = hash;
      }, id);
      await expectSection(page, id);
      const sizes = await page.evaluate(() => ({
        page: document.documentElement.scrollWidth,
        viewport: document.documentElement.clientWidth,
      }));
      expect(sizes.page).toBeLessThanOrEqual(sizes.viewport + 1);
    }
  });
}

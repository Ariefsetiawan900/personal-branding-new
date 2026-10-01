import { expect, test, type Page } from '@playwright/test';
import { disableExternalFonts } from './helpers';

async function expectReadableFallback(page: Page): Promise<void> {
  await expect(
    page.getByRole('heading', { name: 'Arief Setiawan', exact: true }),
  ).toBeVisible();
  await expect(page.locator('#about')).toBeVisible();
  await expect(page.locator('#education')).toBeVisible();
  await expect(page.locator('#experience')).toBeVisible();
  await expect(page.locator('#contact')).toBeVisible();
  await expect(page.locator('.page-loader')).toBeHidden();
  await expect(page.getByRole('link', { name: 'Download CV' })).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Instagram', exact: true }),
  ).toBeVisible();
}

test('core content and both timelines remain readable without JavaScript', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL,
  });
  try {
    const page = await context.newPage();
    await disableExternalFonts(page);
    await page.goto('/');
    await expectReadableFallback(page);
  } finally {
    await context.close();
  }
});

test('a failed application script cannot leave a loader covering the content', async ({
  page,
}) => {
  await disableExternalFonts(page);
  await page.route(/\/_astro\/.*\.js(?:\?|$)/, (route) => route.abort());
  await page.goto('/');
  await expectReadableFallback(page);
});

import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { ready } from './helpers';

async function checkAccessibility(page: Page): Promise<void> {
  const popupContent = page.locator('.portofolio-popup.open .pp-content');
  if (await popupContent.count()) {
    await expect(popupContent).toHaveCSS('opacity', '1');
  }
  const result = await new AxeBuilder({ page }).analyze();
  expect(
    result.violations.filter(
      ({ impact }) => impact === 'serious' || impact === 'critical',
    ),
  ).toEqual([]);
}

for (const id of ['home', 'about', 'contact', 'portofolio']) {
  test(`${id} has no serious or critical accessibility violations`, async ({
    page,
  }) => {
    await ready(page, `#${id}`);
    await checkAccessibility(page);
    if (id === 'about') {
      await page.getByRole('tab', { name: 'Experience' }).click();
      await checkAccessibility(page);
    }
  });
}

test('navigation and both project dialogs pass accessibility checks', async ({
  page,
}) => {
  // Three full axe scans can exceed the default test budget under parallel CI.
  test.setTimeout(90_000);
  await ready(page, '#portofolio');
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await checkAccessibility(page);
  await page.keyboard.press('Escape');
  for (const button of await page.locator('.view-project-btn').all()) {
    await button.click();
    await checkAccessibility(page);
    await page.keyboard.press('Escape');
  }
});

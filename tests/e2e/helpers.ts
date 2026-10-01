import { expect, type Page } from '@playwright/test';

export async function disableExternalFonts(page: Page): Promise<void> {
  // Visual parity separately verifies real Poppins. Functional tests avoid an
  // unrelated Google Fonts request delaying the browser load event.
  await page.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, (route) =>
    route.abort(),
  );
}

export async function ready(page: Page, hash = ''): Promise<void> {
  await disableExternalFonts(page);
  await page.goto(`/${hash}`);
  await expect(page.locator('html')).toHaveClass(/enhanced/);
  await expect(page.locator('.page-loader')).toBeHidden();
}

export async function expectSection(page: Page, id: string): Promise<void> {
  await expect(page.locator('section.active')).toHaveCount(1);
  await expect(page.locator('section.active')).toHaveAttribute('id', id);
  await expect(page.locator(`#${id}`)).toBeVisible();
  await expect(page.locator('.overlay')).not.toHaveClass(/active/);
  await expect(page.locator('body')).not.toHaveClass(/hide-scrolling/);
}

export async function menuTo(page: Page, name: string): Promise<void> {
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page
    .locator('#primary-navigation')
    .getByRole('link', { name, exact: true })
    .click();
}

export async function expectFocusWithin(
  page: Page,
  selector: string,
): Promise<void> {
  await expect
    .poll(() =>
      page.evaluate(
        (scope) => document.activeElement?.closest(scope) !== null,
        selector,
      ),
    )
    .toBe(true);
}

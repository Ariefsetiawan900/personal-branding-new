import { writeFile } from 'node:fs/promises';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

const legacyURL = 'http://127.0.0.1:4180';
// Shared external Google Fonts and the original static asset server can race
// when nine legacy/modern page pairs initialize together.
test.describe.configure({ mode: 'default' });
const viewports = [
  { width: 1440, height: 900 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
  { width: 360, height: 800 },
  { width: 992, height: 900 },
  { width: 991, height: 900 },
  { width: 767, height: 900 },
  { width: 576, height: 900 },
  { width: 575, height: 900 },
];

async function settle(page: Page): Promise<void> {
  await page.waitForTimeout(650);
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(async () => {
    const visibleImages = [...document.images].filter(
      (image) =>
        image.getClientRects().length > 0 &&
        getComputedStyle(image).visibility === 'visible',
    );
    await Promise.all(visibleImages.map((image) => image.decode()));
  });
}

async function compareScreenshots(
  legacy: Page,
  modern: Page,
  name: string,
  testInfo: TestInfo,
): Promise<void> {
  const [before, after] = await Promise.all([
    legacy.screenshot({ fullPage: true, animations: 'disabled' }),
    modern.screenshot({ fullPage: true, animations: 'disabled' }),
  ]);
  const expected = PNG.sync.read(before);
  const actual = PNG.sync.read(after);
  await testInfo.attach(`${name}-legacy`, {
    body: before,
    contentType: 'image/png',
  });
  await testInfo.attach(`${name}-astro`, {
    body: after,
    contentType: 'image/png',
  });
  expect.soft(actual.width, `${name}: page width`).toBe(expected.width);
  // Mobile Portfolio can differ by one subpixel-rounded line box. Record that
  // height separately, then compare every shared pixel; a larger shift fails.
  expect
    .soft(Math.abs(actual.height - expected.height), `${name}: page height`)
    .toBeLessThanOrEqual(1);
  if (
    actual.width !== expected.width ||
    Math.abs(actual.height - expected.height) > 1
  )
    return;
  const comparedHeight = Math.min(actual.height, expected.height);
  const comparedBytes = actual.width * comparedHeight * 4;
  const diff = new PNG({ width: actual.width, height: comparedHeight });
  const changedPixels = pixelmatch(
    expected.data.subarray(0, comparedBytes),
    actual.data.subarray(0, comparedBytes),
    diff.data,
    actual.width,
    comparedHeight,
    {
      threshold: 0.15,
    },
  );
  const ratio = changedPixels / (actual.width * comparedHeight);
  const report = {
    state: name,
    changedPixels,
    ratio,
    width: actual.width,
    legacyHeight: expected.height,
    astroHeight: actual.height,
  };
  await writeFile(
    testInfo.outputPath(`${name}-comparison.json`),
    JSON.stringify(report, null, 2),
  );
  if (changedPixels > 0) {
    await writeFile(
      testInfo.outputPath(`${name}-difference.png`),
      PNG.sync.write(diff),
    );
    await testInfo.attach(`${name}-difference`, {
      body: PNG.sync.write(diff),
      contentType: 'image/png',
    });
  }
  // This compares immutable legacy markup in the same browser and OS. It never
  // rewrites snapshots; permitted visual changes must be reviewed explicitly.
  // The 0.11% limit admits inspected WebP thumbnail pixels while retaining
  // strict geometry, text, controls, and full-size modal comparisons.
  expect
    .soft(ratio, `${name}: pixel difference ratio`)
    .toBeLessThanOrEqual(0.0011);
}

for (const viewport of viewports) {
  test(`legacy appearance is preserved at ${viewport.width}px`, async ({
    browser,
    baseURL,
  }, testInfo) => {
    test.setTimeout(90_000);
    const context = await browser.newContext({
      viewport,
      deviceScaleFactor: 1,
    });
    const [legacy, modern] = await Promise.all([
      context.newPage(),
      context.newPage(),
    ]);
    try {
      await Promise.all([
        legacy.goto(legacyURL, { waitUntil: 'networkidle' }),
        modern.goto(baseURL!, { waitUntil: 'networkidle' }),
      ]);
      for (const page of [legacy, modern]) {
        await expect(page.locator('.page-loader')).toBeHidden();
        await settle(page);
        const font = await page.evaluate(() => ({
          loaded: document.fonts.check('16px Poppins'),
          declared: [...document.fonts].some(
            (item) => item.family.replaceAll('"', '') === 'Poppins',
          ),
        }));
        expect(
          font,
          'Poppins must be available for valid visual comparison',
        ).toEqual({ loaded: true, declared: true });
      }
      const capture = (name: string) =>
        compareScreenshots(
          legacy,
          modern,
          `${viewport.width}-${name}`,
          testInfo,
        );
      await capture('home');
      const primaryViewport = [1440, 768, 390].includes(viewport.width);
      if (primaryViewport) {
        await Promise.all([
          legacy.locator('.nav-toggler').click(),
          modern.locator('.nav-toggler').click(),
        ]);
        await Promise.all([settle(legacy), settle(modern)]);
        await capture('menu');
        await Promise.all([
          legacy.locator('.nav a[href="#about"]').click(),
          modern.locator('.nav a[href="#about"]').click(),
        ]);
      } else {
        await Promise.all([
          legacy.locator('.home-text a').click(),
          modern.locator('.home-text a').click(),
        ]);
      }
      await Promise.all([settle(legacy), settle(modern)]);
      await capture('about-education');
      await Promise.all([
        legacy.locator('[data-target="#experience"]').click(),
        modern.locator('[data-target="#experience"]').click(),
      ]);
      await capture('about-experience');
      await Promise.all([
        legacy.locator('.about-text a[href="#contact"]').click(),
        modern.locator('.about-text a[href="#contact"]').click(),
      ]);
      await Promise.all([settle(legacy), settle(modern)]);
      await capture('contact');
      if (primaryViewport) {
        // The original has no Portfolio entry point; activate only its dormant
        // markup in the harness without adding controls to either website.
        await legacy.evaluate(() => {
          document.querySelector('section.active')?.classList.remove('active');
          document.querySelector('#portofolio')?.classList.add('active');
          window.scrollTo(0, 0);
        });
        await modern.evaluate(() => {
          location.hash = 'portofolio';
        });
        await Promise.all([settle(legacy), settle(modern)]);
        await capture('portofolio');
        for (let index = 0; index < 2; index++) {
          await Promise.all([
            legacy.locator('.view-project-btn').nth(index).click(),
            modern.locator('.view-project-btn').nth(index).click(),
          ]);
          await Promise.all([settle(legacy), settle(modern)]);
          await capture(`project-${index}`);
          await Promise.all([
            legacy.locator('.pp-close').click(),
            modern.locator('.pp-close').click(),
          ]);
        }
      }
    } finally {
      await context.close();
    }
  });
}

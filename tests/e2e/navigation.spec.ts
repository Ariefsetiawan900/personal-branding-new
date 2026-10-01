import { expect, test } from '@playwright/test';
import { expectFocusWithin, expectSection, menuTo, ready } from './helpers';

test('loader releases the page and original entry points remain available', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await ready(page);
  await expectSection(page, 'home');
  await expect(
    page.getByRole('heading', { name: 'Arief Setiawan', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Fullstack Developer', exact: true }),
  ).toBeVisible();
  await expect(page.locator('.home-img img')).toHaveJSProperty(
    'complete',
    true,
  );
  await expect(page.locator('.home-img img')).not.toHaveJSProperty(
    'naturalWidth',
    0,
  );
  await expect(page.locator('a[href="#portofolio"]')).toHaveCount(0);
  await expect(page.locator('form')).toHaveCount(0);
  await page.getByRole('link', { name: 'More About Me' }).click();
  await expectSection(page, 'about');
  await expect(page).toHaveURL(/#about$/);
  await page.getByRole('link', { name: 'Contact Me', exact: true }).click();
  await expectSection(page, 'contact');
  await menuTo(page, 'Home');
  await expectSection(page, 'home');
  expect(errors).toEqual([]);
});

for (const id of ['home', 'about', 'portofolio', 'contact']) {
  test(`initial #${id} and refresh preserve the requested section`, async ({
    page,
  }) => {
    await ready(page, `#${id}`);
    await expectSection(page, id);
    await page.reload();
    await expect(page.locator('.page-loader')).toBeHidden();
    await expectSection(page, id);
  });
}

test('unknown hashes fall back to Home and hash changes update the section', async ({
  page,
}) => {
  await ready(page, '#missing-section');
  await expectSection(page, 'home');
  await page.evaluate(() => {
    location.hash = 'contact';
  });
  await expectSection(page, 'contact');
  await page.evaluate(() => {
    location.hash = '';
  });
  await expectSection(page, 'home');
});

test('Back and Forward restore sections without stuck overlays', async ({
  page,
}) => {
  await ready(page);
  await page.getByRole('link', { name: 'More About Me' }).click();
  await expectSection(page, 'about');
  await page.getByRole('link', { name: 'Contact Me', exact: true }).click();
  await expectSection(page, 'contact');
  await page.goBack();
  await expectSection(page, 'about');
  await page.goBack();
  await expectSection(page, 'home');
  await page.goForward();
  await expectSection(page, 'about');
});

test('a hash change during animation cancels the stale destination', async ({
  page,
}) => {
  await ready(page);
  await page.getByRole('link', { name: 'More About Me' }).click();
  await page.evaluate(() => {
    location.hash = 'contact';
  });
  await expectSection(page, 'contact');
  // Wait longer than the original 500 ms timer so a stale callback cannot pass.
  await page.waitForTimeout(650);
  await expectSection(page, 'contact');
  await page.evaluate(() => {
    location.hash = 'about';
    location.hash = 'portofolio';
  });
  await expectSection(page, 'portofolio');
});

test('nested link targets participate in delegated navigation', async ({
  page,
}) => {
  await ready(page);
  await page.getByRole('link', { name: 'More About Me' }).evaluate((link) => {
    const label = document.createElement('span');
    label.textContent = link.textContent;
    link.replaceChildren(label);
  });
  await page.locator('.home-text .link-item span').click();
  await expectSection(page, 'about');
});

test('navigation locks the background, traps keyboard focus, and restores it on Escape', async ({
  page,
}) => {
  await ready(page);
  const toggle = page.getByRole('button', { name: 'Open navigation' });
  await toggle.click();
  await expect(
    page.getByRole('button', { name: 'Close navigation' }),
  ).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#primary-navigation')).toHaveAttribute(
    'aria-hidden',
    'false',
  );
  await expect(page.locator('#primary-navigation a')).toHaveText([
    'Home',
    'About',
    'Contact',
  ]);
  await expect(page.locator('#home')).toHaveJSProperty('inert', true);
  await expect(page.locator('body')).toHaveClass(/hide-scrolling/);
  for (let index = 0; index < 8; index++) {
    await page.keyboard.press('Tab');
    await expectFocusWithin(page, '.header');
  }
  for (let index = 0; index < 5; index++) {
    await page.keyboard.press('Shift+Tab');
    await expectFocusWithin(page, '.header');
  }
  await page.keyboard.press('Escape');
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#primary-navigation')).toHaveAttribute(
    'aria-hidden',
    'true',
  );
  await expect(page.locator('#home')).toHaveJSProperty('inert', false);
  await expectSection(page, 'home');
});

test('About tabs support click, Arrow keys, Home, and End', async ({
  page,
}) => {
  await ready(page, '#about');
  const education = page.getByRole('tab', { name: 'Education' });
  const experience = page.getByRole('tab', { name: 'Experience' });
  await expect(education).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#education')).toBeVisible();
  await experience.click();
  await expect(experience).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#experience')).toBeVisible();
  await expect(page.locator('#education')).toBeHidden();
  await experience.press('ArrowRight');
  await expect(education).toBeFocused();
  await expect(education).toHaveAttribute('aria-selected', 'true');
  await education.press('ArrowLeft');
  await expect(experience).toBeFocused();
  await experience.press('Home');
  await expect(education).toBeFocused();
  await education.press('End');
  await expect(experience).toBeFocused();
  await expect(page.locator('#experience')).toBeVisible();
  await expect(page.locator('#experience')).toContainText('Gokomodo');
  await expect(page.locator('#experience')).toContainText(
    'PT. Nastha Global Utama',
  );
});

test('reduced motion disables decorative animation and preserves navigation', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await ready(page);
  const animation = await page.locator('.circle-1').evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      name: style.animationName,
      duration: parseFloat(style.animationDuration),
    };
  });
  expect(animation.name === 'none' || animation.duration <= 0.001).toBe(true);
  await page.getByRole('link', { name: 'More About Me' }).click();
  await expectSection(page, 'about');
  await menuTo(page, 'Contact');
  await expectSection(page, 'contact');
});

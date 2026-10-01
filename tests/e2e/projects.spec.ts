import { expect, test } from '@playwright/test';
import { expectFocusWithin, expectSection, ready } from './helpers';

for (const project of [
  {
    id: 'staycation',
    title: 'Staycation 2020',
    description: 'online rental',
    source: 'https://github.com/Ariefsetiawan900/staycation',
  },
  {
    id: 'melinjo',
    title: 'Melinjo.net',
    description: 'fruits and vegetables',
    source: 'https://github.com/Ariefsetiawan900/melinjo.net-client',
  },
]) {
  test(`${project.title} has safe details, trapped focus, and Escape restores the trigger`, async ({
    page,
  }) => {
    await ready(page, '#portofolio');
    const trigger = page.locator(`button[data-project-id="${project.id}"]`);
    await trigger.click();
    const dialog = page.getByRole('dialog', {
      name: project.title,
      exact: true,
    });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(project.description);
    await expect(dialog.locator('.pp-body a').first()).toHaveAttribute(
      'href',
      project.source,
    );
    await expect(dialog.locator('.pp-thumbnail img')).not.toHaveJSProperty(
      'naturalWidth',
      0,
    );
    await expect(page.locator('.main')).toHaveJSProperty('inert', true);
    await expect(page.locator('body')).toHaveClass(/hide-scrolling/);
    await expect(
      page.getByRole('button', { name: 'Close project' }),
    ).toBeFocused();
    for (const key of ['Shift+Tab', 'Tab', 'Tab', 'Tab', 'Tab']) {
      await page.keyboard.press(key);
      await expectFocusWithin(page, '.portofolio-popup');
    }
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    await expect(page.locator('.main')).toHaveJSProperty('inert', false);
    await expectSection(page, 'portofolio');
  });
}

test('project dialog closes with the close control and backdrop, then opens the other project', async ({
  page,
}) => {
  await ready(page, '#portofolio');
  await page.locator('.view-project-btn').first().click();
  await page.getByRole('button', { name: 'Close project' }).click();
  await expect(page.getByRole('dialog')).toBeHidden();
  await page.locator('.view-project-btn').last().click();
  await expect(
    page.getByRole('dialog', { name: 'Melinjo.net', exact: true }),
  ).toBeVisible();
  await page.locator('.pp-inner').click({ position: { x: 2, y: 2 } });
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.locator('.view-project-btn').last()).toBeFocused();
  await expectSection(page, 'portofolio');
});

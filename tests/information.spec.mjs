import { expect, test } from '@playwright/test';

test('landing information preserves the page and always opens at the top', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('#kontakt a[href="mailto:info@promar.hr"]').first()).toBeVisible();
  await expect(page.locator('a[href="https://app.skorica.com/register"]')).toHaveCount(0);
  for (const [key, name] of [['support','Kontakt i podrška'], ['usage','Pristup i korištenje'], ['privacy','Privatnost i zaštita podataka'], ['cookies','Kolačići']]) {
    const link = page.locator(`footer [data-information="${key}"]`);
    await link.click();
    const dialog = page.getByRole('dialog', { name, exact: true });
    await expect(dialog).toBeVisible();
    expect(new URL(page.url()).pathname).toBe('/');
    expect(await dialog.evaluate(element => element.getBoundingClientRect().top)).toBeLessThanOrEqual(20);
    expect(await dialog.evaluate(element => element.scrollTop)).toBe(0);
    await expect(dialog.getByRole('button', { name: 'Zatvori informacije' })).toBeFocused();
    if (key === 'support') {
      await expect(dialog.getByText('Renato Galeković', { exact: false })).toHaveCount(0);
      await expect(dialog.getByRole('link', { name: 'info@promar.hr', exact: true })).toBeVisible();
    }
    const protections = await dialog.evaluate(element => ({
      select: getComputedStyle(element).userSelect,
      copy: !element.dispatchEvent(new Event('copy', { bubbles: true, cancelable: true })),
      blur: getComputedStyle(element, '::backdrop').backdropFilter,
      overflow: document.body.style.overflow,
    }));
    expect(protections.select).toBe('none');
    expect(protections.copy).toBe(true);
    expect(protections.blur).toContain('blur');
    expect(protections.overflow).toBe('hidden');
    if (key === 'privacy') {
      await dialog.evaluate(element => { element.scrollTop = element.scrollHeight; });
      expect(await dialog.evaluate(element => element.scrollTop)).toBeGreaterThan(0);
    }
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(link).toBeFocused();
    if (key === 'privacy') {
      await link.click();
      await expect(dialog).toBeVisible();
      expect(await dialog.evaluate(element => element.scrollTop)).toBe(0);
      await dialog.getByRole('button', { name: 'Zatvori informacije' }).click();
      await expect(dialog).not.toBeVisible();
    }
  }
  expect(errors).toEqual([]);
});

test('documents and overlays fit a 320px phone', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  for (const key of ['support', 'usage', 'privacy', 'cookies']) {
    expect((await page.goto(`/${key}.html`))?.status()).toBe(200);
    await expect(page.locator('main h1')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  }
  await page.goto('/');
  await page.locator('footer [data-information="privacy"]').click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  const dimensions = await dialog.evaluate(element => ({ top: element.getBoundingClientRect().top, right: element.getBoundingClientRect().right, page: document.documentElement.scrollWidth }));
  expect(dimensions.top).toBeLessThanOrEqual(20);
  expect(dimensions.right).toBeLessThanOrEqual(320);
  expect(dimensions.page).toBeLessThanOrEqual(320);
});

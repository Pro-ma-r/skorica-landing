import { expect, test } from '@playwright/test';

test('sports visuals load and the landing fits phone, tablet and desktop widths', async ({ page }) => {
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    const hero = page.locator('.hero-photo img');
    await expect(hero).toBeVisible();
    await expect.poll(() => hero.evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
    const organizers = page.locator('.organizer-photo img');
    await organizers.scrollIntoViewIfNeeded();
    await expect.poll(() => organizers.evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    const scene = await page.locator('.fixture-card').evaluate(element => ({ left: element.getBoundingClientRect().left, right: element.getBoundingClientRect().right }));
    expect(scene.left).toBeGreaterThanOrEqual(0);
    expect(scene.right).toBeLessThanOrEqual(width);
    await expect(page.locator('a[href="https://app.skorica.com/register"]')).toHaveCount(0);
  }
  for (const file of ['matchday-hero.webp', 'matchday-hero-800.webp', 'competition-organizers.webp', 'competition-organizers-800.webp']) {
    const response = await page.request.get(`/assets/${file}`);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toBe('image/webp');
    expect((await response.body()).length).toBeLessThan(250_000);
  }
});

test('keyboard visitors can skip navigation and read how access is activated', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Preskoči na sadržaj' });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  const question = page.locator('summary').filter({ hasText: 'Kako dobiti pristup Skorici?' });
  await question.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('details[open]')).toContainText('Nakon osobnog dogovora aktiviramo organizaciju');
  await expect(page.locator('#kontakt a[href="mailto:info@promar.hr"]').first()).toBeVisible();
});

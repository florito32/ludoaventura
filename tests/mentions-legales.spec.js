// Mentions légales (obligatoires, LCEN) : un lien visible en bas de page, vers la page du site ludo-aventura.fr.
const { test, expect } = require('@playwright/test');

test('lien Mentions légales dans le pied de page @smoke', async ({ page }) => {
  await page.goto('./');
  const lien = page.locator('footer.pied a', { hasText: 'Mentions légales' });
  await lien.scrollIntoViewIfNeeded();
  await expect(lien).toBeVisible();
  await expect(lien).toHaveAttribute('href', 'https://www.ludo-aventura.fr/pages/mentions-legales');
  // Le pied de page ne fait pas défiler la page de côté.
  const deborde = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(deborde).toBe(false);
});

test('le pied de page reste sur une ligne sur petit téléphone (320 et 360 px)', async ({ page }) => {
  for (const width of [320, 360]) {
    await page.setViewportSize({ width, height: 640 });
    await page.goto('./');
    const h = await page.locator('footer.pied p').evaluate(p => p.offsetHeight);
    expect(h, `pied sur une ligne à ${width} px`).toBeLessThan(40);
  }
});

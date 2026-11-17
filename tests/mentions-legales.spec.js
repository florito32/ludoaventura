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

// v10.6 (backlog ligne 252) : les illustrations du jeu sont créditées à Stuki San dans « Crédits ».
test('Crédits : illustrations du jeu de Stuki San, fenêtre sans débordement', async ({ page }) => {
  await page.goto('./');
  await page.locator('#btn-credits').scrollIntoViewIfNeeded();
  await page.locator('#btn-credits').click();
  const f = page.locator('#credits');
  await expect(f).toBeVisible();
  await expect(f).toContainText('Illustrations du jeu : Stuki San.');
  const b = await f.boundingBox(), v = page.viewportSize();
  expect(b.x).toBeGreaterThanOrEqual(0);
  expect(b.x + b.width).toBeLessThanOrEqual(v.width + 1);
  await page.getByRole('button', { name: 'Fermer' }).click();
  await expect(f).toBeHidden();
});

// Mentions légales (LCEN) : depuis la v10.32 (demande du 23/11/2026), le lien et les crédits ne sont plus dans le pied de page de
// l'accueil : ils sont dans « Mon compte » › « Aide et mentions légales » (voir aussi tests/mon-compte-onglets.spec.js).
const { test, expect } = require('@playwright/test');

async function ouvrirAide(page) {
  await page.addInitScript(() => { try { localStorage.setItem('ludo-vu', '1'); } catch (e) { /* */ } });
  await page.goto('./');
  await page.locator('#btn-parametres').click();
  await page.locator('#onglet-aide').click();
}

test('lien Mentions légales dans « Aide et mentions légales » @smoke', async ({ page }) => {
  await ouvrirAide(page);
  const lien = page.locator('#panneau-aide a', { hasText: 'Mentions légales' });
  await expect(lien).toBeVisible();
  await expect(lien).toHaveAttribute('href', 'https://www.ludo-aventura.fr/pages/mentions-legales');
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
  await ouvrirAide(page);
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

// Parcours principal du site + affichage sur chaque format d'écran.
// Les tests marqués @smoke sont aussi rejoués sur la page en ligne.
const { test, expect } = require('@playwright/test');

test.describe('Page éléphants', () => {
  test('se charge sans erreur JavaScript @smoke', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('./');
    await expect(page).toHaveTitle(/éléphants/i);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('chaque lien du menu mène à sa section', async ({ page }) => {
    await page.goto('./');
    const links = page.locator('nav a[href^="#"]');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const id = (await links.nth(i).getAttribute('href')).slice(1);
      await expect(page.locator(`#${id}`)).toHaveCount(1);
    }
  });

  test('pas de défilement horizontal @smoke', async ({ page }) => {
    await page.goto('./');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

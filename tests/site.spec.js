// Parcours principal du site + affichage sur chaque format d'écran.
// Les tests marqués @smoke sont aussi rejoués sur la page en ligne.
const { test, expect } = require('@playwright/test');

test.describe('Aventure éléphants', () => {
  test('se charge sans erreur JavaScript @smoke', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('elephants/');
    await expect(page).toHaveTitle(/éléphants/i);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('chaque lien du menu mène à sa section', async ({ page }) => {
    await page.goto('elephants/');
    const links = page.locator('nav a[href^="#"]');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const id = (await links.nth(i).getAttribute('href')).slice(1);
      await expect(page.locator(`#${id}`)).toHaveCount(1);
    }
  });

  test('pas de défilement horizontal @smoke', async ({ page }) => {
    await page.goto('elephants/');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe('Accueil Ludoaventura', () => {
  test('présente les aventures et mène aux éléphants @smoke', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('./');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ludoaventura');
    await page.getByRole('link', { name: /Le monde des éléphants/ }).click();
    await expect(page).toHaveURL(/\/elephants\/$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/éléphants/i);
    // Retour à l'accueil depuis l'aventure
    await page.getByRole('link', { name: 'Ludoaventura' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ludoaventura');
    expect(errors).toEqual([]);
  });

  test('pas de défilement horizontal @smoke', async ({ page }) => {
    await page.goto('./');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe('Sources de la page éléphants', () => {
  test('chaque renvoi [n] pointe vers une source existante avec un lien externe', async ({ page }) => {
    await page.goto('elephants/');
    const refs = page.locator('a.ref');
    expect(await refs.count()).toBeGreaterThan(10);
    for (const href of await refs.evaluateAll((els) => els.map((e) => e.getAttribute('href')))) {
      const target = page.locator(href);
      await expect(target).toHaveCount(1);
      expect(await target.locator('a[href^="https://"]').count()).toBeGreaterThan(0);
    }
  });
});

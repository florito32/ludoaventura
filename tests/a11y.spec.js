// Accessibilité : audit axe-core (WCAG 2.1 A et AA) sur l'accueil et le plateau.
const { test, expect } = require('@playwright/test');
const { lancerPartie } = require('./aide');
const AxeBuilder = require('@axe-core/playwright').default;

async function audit(page) {
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  return r.violations.map((v) => `${v.id} (${v.nodes.length}) : ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`);
}

test('aucune violation WCAG A/AA : accueil, préparation et plateau', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');
  expect(await audit(page)).toEqual([]);
  await page.getByRole('button', { name: 'Commencer l\'aventure' }).click();
  await expect(page.getByRole('heading', { name: 'Préparer la partie' })).toBeVisible();
  expect(await audit(page)).toEqual([]);
  await lancerPartie(page, { joueurs: 3, aventure: 'Mayas' });
  expect(await audit(page)).toEqual([]);
});

test('le lien « Aller au contenu » est le premier arrêt clavier', async ({ page }) => {
  test.skip(test.info().project.name !== 'ordinateur', 'navigation clavier testée sur ordinateur');
  await page.goto('./');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Aller au contenu' })).toBeFocused();
});

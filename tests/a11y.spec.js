// Accessibilité : audit axe-core (WCAG 2.1 A et AA) sur l'accueil et le plateau.
const { test, expect } = require('@playwright/test');
const { lancerPartie, valider, cocherTout } = require('./aide');
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
  expect(await audit(page)).toEqual([]); // écran 1 : nombre de joueurs
  await page.getByRole('radio', { name: '2 joueurs' }).check(); // 1 joueur par défaut depuis la v6.20
  await valider(page);
  expect(await audit(page)).toEqual([]); // écran 2 : aventuriers
  await valider(page); await valider(page);
  expect(await audit(page)).toEqual([]); // écran 3 : cartes du joueur
  await cocherTout(page, 2);
  expect(await audit(page)).toEqual([]); // écran 4 : aventure
  await lancerPartie(page, { joueurs: 3, aventure: 'Mayas' });
  expect(await audit(page)).toEqual([]);
});

test('le lien « Aller au contenu » est le premier arrêt clavier', async ({ page }) => {
  test.skip(test.info().project.name !== 'ordinateur', 'navigation clavier testée sur ordinateur');
  await page.goto('./');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Aller au contenu' })).toBeFocused();
});

// v6.37 : écrans des étoiles, de la progression, du défi du jour et fenêtre du coffre.
test('aucune violation WCAG A/AA : Mes étoiles, Progrès, Défi du jour, coffre', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => { try { localStorage.setItem('ludo-vu', '1'); } catch (e) { /* */ } });
  await page.goto('./');
  await page.locator('#btn-etoiles').click();
  await expect(page.getByRole('heading', { name: 'Mes étoiles' })).toBeVisible();
  expect(await audit(page)).toEqual([]);
  await page.getByRole('button', { name: 'Accueil' }).click();
  await page.locator('#btn-progression').click();
  await expect(page.getByRole('heading', { name: 'Ma progression' })).toBeVisible();
  expect(await audit(page)).toEqual([]);
  await page.getByRole('button', { name: 'Accueil' }).click();
  await page.locator('#btn-defi').click();
  await page.locator('label:has(input[name="defi-matiere"][value="maths"])').click();
  await expect(page.getByRole('button', { name: 'Lancer le défi' })).toBeVisible();
  expect(await audit(page)).toEqual([]);
  await page.getByRole('button', { name: 'Accueil' }).click();
  await page.locator('#btn-coffre-haut').click();
  await page.getByRole('button', { name: 'Ouvrir le coffre' }).click();
  await expect(page.getByRole('button', { name: 'Super !' })).toBeVisible();
  expect(await audit(page)).toEqual([]);
});

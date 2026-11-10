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
test('aucune violation WCAG A/AA : accueil, Mes étoiles, Défi du jour, coffre, Ma progression', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => { try { localStorage.setItem('ludo-vu', '1'); } catch (e) { /* */ } });
  await page.goto('./');
  // v6.38 : l'accueil n'a plus que la barre du haut (étoiles, défi du jour, coffre).
  expect(await audit(page)).toEqual([]);
  await page.locator('#btn-etoiles-haut').click();
  await expect(page.getByRole('heading', { name: 'Mes étoiles' })).toBeVisible();
  expect(await audit(page)).toEqual([]);
  await page.getByRole('button', { name: 'Accueil' }).click();
  await page.locator('#btn-defi').click();
  await expect(page.getByRole('button', { name: 'Valider' })).toBeDisabled();
  expect(await audit(page)).toEqual([]);
  await page.locator('label:has(input[name="defi-matiere"][value="maths"])').click();
  await expect(page.getByRole('button', { name: 'Valider' })).toBeEnabled();
  expect(await audit(page)).toEqual([]);
  await page.getByRole('button', { name: 'Accueil' }).click();
  await page.locator('#btn-coffre-haut').click();
  await page.getByRole('button', { name: 'Ouvrir le coffre' }).click();
  await expect(page.getByRole('button', { name: 'Super !' })).toBeVisible();
  expect(await audit(page)).toEqual([]);
  await page.getByRole('button', { name: 'Super !' }).click();
  // Coffre du jour ouvert : le bouton du coffre mène à « Ma progression ».
  await page.locator('#btn-coffre-haut').click();
  await expect(page.getByRole('heading', { name: 'Ma progression' })).toBeVisible();
  expect(await audit(page)).toEqual([]);
});

// v6.42 et v6.43 : fenêtre « Comment gagner des étoiles ? », écran « Partie rapide » et son plateau.
test('aucune violation WCAG A/AA : Comment gagner des étoiles, Partie rapide', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => { try { localStorage.setItem('ludo-vu', '1'); window.AVENTURA_AUTO_DE = 600000; } catch (e) { /* */ } });
  await page.goto('./');
  await page.locator('#btn-etoiles-haut').click();
  await page.getByRole('button', { name: 'Comment gagner des étoiles ?' }).click();
  await expect(page.getByRole('dialog', { name: 'Comment gagner des étoiles ?' })).toBeVisible();
  expect(await audit(page)).toEqual([]);
  await page.getByRole('button', { name: 'J’ai compris' }).click();
  await page.getByRole('button', { name: 'Accueil' }).click();
  await page.getByRole('button', { name: 'Partie rapide' }).click();
  await expect(page.getByRole('heading', { name: 'Partie rapide' })).toBeVisible();
  expect(await audit(page)).toEqual([]);
  await page.getByRole('button', { name: 'Lancer la partie' }).click();
  await page.getByRole('button', { name: 'Question suivante' }).click();
  await expect(page.locator('#carte-piochee')).toBeVisible();
  expect(await audit(page)).toEqual([]);
});

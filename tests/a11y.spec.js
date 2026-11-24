// Accessibilité : audit axe-core (WCAG 2.1 A et AA) sur l'accueil et le plateau.
const { test, expect } = require('@playwright/test');
const { lancerPartie, valider, cocherTout, creerJoueurs } = require('./aide');
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
  expect(await audit(page)).toEqual([]); // étape 1 : qui joue ?
  await creerJoueurs(page, 2);
  await page.locator('[data-ajouter]').click();
  expect(await audit(page)).toEqual([]); // liste des joueurs du compte ouverte
  await page.locator('.cj-profil[data-choisir]:not([disabled])').first().click();
  await valider(page);
  expect(await audit(page)).toEqual([]); // étape 2 : cartes du joueur
  await cocherTout(page, 2);
  expect(await audit(page)).toEqual([]); // étape 3 : aventure
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
test('aucune violation WCAG A/AA : accueil, Mes coffres, Défi du jour, coffre', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => { try { localStorage.setItem('ludo-vu', '1'); } catch (e) { /* */ } });
  await page.goto('./');
  // v10.30 : l'accueil n'a plus que le défi du jour et le compte ; les étoiles sont dans la carte du joueur.
  expect(await audit(page)).toEqual([]);
  await page.locator('#btn-compte').click();
  await page.locator('#onglet-profil').click();
  await page.locator('.joueur-carte').first().getByRole('button', { name: 'Statistiques' }).click();
  expect(await audit(page)).toEqual([]); // carte du joueur : « ? » et bouton coffre
  await page.locator('.joueur-carte').first().getByRole('button', { name: 'Mes coffres' }).click();
  await expect(page.getByRole('heading', { name: 'Mes coffres' })).toBeVisible();
  expect(await audit(page)).toEqual([]);
  await page.getByRole('button', { name: 'Mon compte' }).click();
  await page.locator('#ecran-compte [data-retour-accueil]').click();
  await page.locator('#btn-defi').click();
  await expect(page.getByRole('button', { name: 'Valider' })).toBeDisabled();
  expect(await audit(page)).toEqual([]);
  await page.locator('label:has(input[name="defi-matiere"][value="maths"])').click();
  await expect(page.getByRole('button', { name: 'Valider' })).toBeEnabled();
  expect(await audit(page)).toEqual([]);
  await page.getByRole('button', { name: 'Accueil' }).click();
  await page.locator('#btn-compte').click();
  await page.locator('#onglet-profil').click();
  await page.locator('.joueur-carte [data-act="coffres"]').first().click();
  await page.getByRole('button', { name: 'Ouvrir le coffre' }).click();
  await expect(page.getByRole('button', { name: 'Super !' })).toBeVisible();
  expect(await audit(page)).toEqual([]);
  await page.getByRole('button', { name: 'Super !' }).click();
  // Coffre du jour ouvert : la carte du joueur (Mon compte) est à jour.
  await expect(page.locator('.joueur-carte [data-act="coffres"]')).toHaveCount(0);
  expect(await audit(page)).toEqual([]);
});

// v6.42 et v6.43 : fenêtre « Comment gagner des étoiles ? », écran « Partie rapide » et son plateau.
test('aucune violation WCAG A/AA : Comment gagner des étoiles, Partie rapide', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => { try { localStorage.setItem('ludo-vu', '1'); window.AVENTURA_AUTO_DE = 600000; } catch (e) { /* */ } });
  await page.goto('./');
  await page.locator('#btn-compte').click();
  await page.locator('#onglet-profil').click();
  await page.locator('.joueur-carte').first().getByRole('button', { name: 'Statistiques' }).click();
  await page.locator('.joueur-carte').first().getByRole('button', { name: 'Comment gagner des étoiles ?' }).click(); // v10.36 : le « ? » de la carte
  await expect(page.getByRole('dialog', { name: 'Comment gagner des étoiles ?' })).toBeVisible();
  expect(await audit(page)).toEqual([]);
  await page.getByRole('button', { name: 'J’ai compris' }).click();
  await page.locator('#ecran-compte [data-retour-accueil]').click();
  await page.getByRole('button', { name: 'Partie rapide' }).click();
  await expect(page.getByRole('heading', { name: 'Partie rapide' })).toBeVisible();
  expect(await audit(page)).toEqual([]);
  await page.getByRole('button', { name: 'Lancer la partie' }).click();
  await expect(page.getByRole('dialog', { name: 'Qui joue ?' })).toBeVisible(); // v10.27 : demandé à chaque lancement
  expect(await audit(page)).toEqual([]);
  await page.getByRole('button', { name: 'C’est parti' }).click();
  await page.getByRole('button', { name: /^(Première question|Question suivante)$/ }).click();
  await expect(page.locator('#carte-piochee')).toBeVisible();
  expect(await audit(page)).toEqual([]);
});

// v6.54 : grammaire — écran des jeux, cartes « Relier les paires » (liens en cours) et « Remettre la phrase ».
test('aucune violation WCAG A/AA : réglages de grammaire, cartes Relier et Remettre la phrase', async ({ page }) => {
  const { rapide, versReglages, grammaire, lancer } = require('./aide');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await rapide(page);
  await page.addInitScript(() => { try { localStorage.setItem('ludo-vu', '1'); } catch (e) { /* */ } });
  await page.goto('./');
  await versReglages(page, 1);
  await grammaire(page, { jeux: ['relier'], niveau: 'expert' });
  expect(await audit(page)).toEqual([]);
  await lancer(page);
  await page.getByRole('button', { name: /^(Première question|Question suivante)$/ }).click();
  await page.locator('.gram-relier').waitFor();
  await page.locator('[data-cote="g"][data-i="0"]').click();
  await page.locator('[data-cote="d"][data-i="0"]').click();
  await page.locator('[data-cote="g"][data-i="1"]').click();
  expect(await audit(page)).toEqual([]);
});

// Menu de la partie (v6.22, demande du 04/11/2026) : une icône près du plateau ouvre, au milieu de l'écran,
// « Redémarrer partie », « Modifier les choix » et « Retour à l'accueil ».
const { test, expect } = require('@playwright/test');
const { lancerPartie, lancerLeDe, attendreJoueur, valider, cocherJoueur } = require('./aide');

async function jouerUnTour(page) {
  await page.getByRole('button', { name: 'Piocher une carte' }).click();
  await page.getByRole('button', { name: 'Bonne réponse' }).click();
  await lancerLeDe(page);
}
const menu = (page) => page.locator('#menu-partie');

test('le menu s\'ouvre au milieu de l\'écran avec les 3 choix, et se referme sans toucher à la partie', async ({ page }) => {
  await lancerPartie(page, { joueurs: 2 });
  await page.getByRole('button', { name: 'Menu' }).click();
  await expect(menu(page)).toBeVisible();
  const boutons = menu(page).locator('.menu-actions button');
  await expect(boutons).toHaveText(['Redémarrer partie', 'Modifier les choix', 'Retour à l’accueil']);
  // Au milieu de l'écran, entier, sur tous les formats.
  const b = await menu(page).boundingBox(), v = page.viewportSize();
  expect(b.x).toBeGreaterThanOrEqual(0); expect(b.y).toBeGreaterThanOrEqual(0);
  expect(b.x + b.width).toBeLessThanOrEqual(v.width); expect(b.y + b.height).toBeLessThanOrEqual(v.height);
  expect(Math.abs(b.x + b.width / 2 - v.width / 2)).toBeLessThan(4);
  expect(Math.abs(b.y + b.height / 2 - v.height / 2)).toBeLessThan(4);
  for (const x of await boutons.all()) await expect(x).toBeInViewport({ ratio: 1 });
  await page.getByRole('button', { name: 'Fermer le menu et continuer la partie' }).click();
  await expect(menu(page)).toBeHidden();
  await expect(page.getByRole('button', { name: 'Piocher une carte' })).toBeVisible();
});

test('« Redémarrer partie » : la partie recommence à zéro, sans repasser par la préparation', async ({ page }) => {
  await lancerPartie(page, { joueurs: 2 });
  await jouerUnTour(page);
  await attendreJoueur(page, 'Tom');
  expect(Number(await page.locator('#points').textContent())).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Menu' }).click();
  await page.getByRole('button', { name: 'Redémarrer partie' }).click();
  await expect(menu(page)).toBeHidden();
  await expect(page.getByRole('heading', { name: 'Le plateau' })).toBeVisible();
  await expect(page.locator('#points')).toHaveText('0');
  await expect(page.locator('#tour-nom')).toHaveText('Léa');
  await expect(page.locator('.pion')).toHaveCount(2);
  await expect(page.getByRole('button', { name: 'Piocher une carte' })).toBeVisible();
});

test('« Modifier les choix » : on change l\'aventure, puis la partie reprend là où elle en était', async ({ page }) => {
  test.skip(test.info().project.name === 'telephone-carre', 'parcours identique : 3 formats suffisent');
  await lancerPartie(page, { joueurs: 2 });
  await jouerUnTour(page);
  await attendreJoueur(page, 'Tom');
  const pts = await page.locator('#points').textContent();
  await page.getByRole('button', { name: 'Menu' }).click();
  await page.getByRole('button', { name: 'Modifier les choix' }).click();
  await expect(page.getByRole('heading', { name: 'Préparer la partie' })).toBeVisible();
  await expect(page.locator('#prepa-progres')).toHaveText('Étape 1 sur 4');
  await expect(page.locator('input[name="nb"]:checked')).toHaveValue('2'); // les choix sont gardés
  await page.reload(); // un rechargement garde la modification en cours
  await expect(page.locator('#prepa-retour-texte')).toHaveText('Partie');
  // On avance jusqu'au choix de l'aventure : le dernier bouton reprend la partie.
  const go = page.getByRole('button', { name: 'Reprendre la partie' });
  while (!(await go.isVisible())) await valider(page);
  await page.getByRole('radio', { name: /^Savane/ }).check();
  await go.click();
  await expect(page.getByRole('heading', { name: 'Le plateau' })).toBeVisible();
  await expect(page.locator('#points')).toHaveText(pts);
  await expect(page.locator('#tour-nom')).toHaveText('Tom');
  await expect(page.locator('#rouleau-nom')).toHaveText('Savane');
  await expect(page.locator('#objectif')).toHaveText('42');
  await expect(page.locator('.pion').nth(0)).toHaveAttribute('data-case', '1');
  await expect(page.locator('.pion').nth(1)).toHaveAttribute('data-case', '1');
  await jouerUnTour(page);
  await attendreJoueur(page, 'Léa');
  await expect(page.locator('.pion').nth(0)).toHaveAttribute('data-case', '2');
});

test('« Modifier les choix » : un joueur ajouté joue la manche en cours à son tour ; « ← Partie » revient au jeu', async ({ page }) => {
  test.skip(test.info().project.name !== 'ordinateur', 'logique de reprise : un format suffit');
  await lancerPartie(page, { joueurs: 2 });
  await jouerUnTour(page);
  await attendreJoueur(page, 'Tom');
  const pts = await page.locator('#points').textContent();
  await page.getByRole('button', { name: 'Menu' }).click();
  await page.getByRole('button', { name: 'Modifier les choix' }).click();
  await page.getByRole('radio', { name: /^3 joueurs$/ }).check();
  await valider(page);
  // Aventuriers (le 3e est proposé par défaut) puis réglages des joueurs 1 et 2, déjà faits.
  const progres = page.locator('#prepa-progres');
  while ((await progres.textContent()) !== 'Étape 3 sur 4 · Joueur 3 sur 3') await valider(page);
  await cocherJoueur(page); await valider(page); // le nouveau joueur choisit ses cartes
  await page.getByRole('button', { name: 'Reprendre la partie' }).click();
  await expect(page.locator('.pion')).toHaveCount(3);
  await expect(page.locator('#points')).toHaveText(pts);
  await expect(page.locator('#tour-nom')).toHaveText('Tom');
  await expect(page.locator('#objectif')).toHaveText('45');
  await jouerUnTour(page);
  await attendreJoueur(page, 'Nour'); // le 3e joueur joue cette manche
  await expect(page.locator('.pion').nth(2)).toHaveAttribute('data-case', '1');
  // « ← Partie » depuis le premier écran : retour au jeu, rien ne change.
  await page.getByRole('button', { name: 'Menu' }).click();
  await page.getByRole('button', { name: 'Modifier les choix' }).click();
  await page.getByRole('button', { name: /Partie/ }).click();
  await expect(page.locator('#tour-nom')).toHaveText('Nour');
  await expect(page.getByRole('button', { name: 'Piocher une carte' })).toBeVisible();
});

test('« Retour à l\'accueil » : la partie est arrêtée et tout repart de zéro', async ({ page }) => {
  await lancerPartie(page, { joueurs: 3 });
  await jouerUnTour(page);
  await page.getByRole('button', { name: 'Menu' }).click();
  await page.getByRole('button', { name: 'Retour à l’accueil' }).click();
  await expect(page.getByRole('button', { name: 'Commencer l\'aventure' })).toBeVisible();
  // Un rechargement ne ramène pas la partie arrêtée.
  await page.reload();
  await expect(page.getByRole('button', { name: 'Commencer l\'aventure' })).toBeVisible();
  await page.getByRole('button', { name: 'Commencer l\'aventure' }).click();
  await expect(page.locator('input[name="nb"]:checked')).toHaveValue('1');
});

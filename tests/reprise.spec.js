// La partie continue après un rafraîchissement, un changement de page ou une mise en veille ;
// elle ne repart de l'accueil que si l'onglet est fermé (stockage de session, demande du 02/11/2026).
const { test, expect } = require('@playwright/test');
const { lancerPartie, attendreJoueur, rapide } = require('./aide');

async function unTour(page) {
  await page.getByRole('button', { name: 'Piocher une carte' }).click();
  await page.getByRole('button', { name: 'Bonne réponse' }).click();
  await page.getByRole('button', { name: 'Lancer le dé FORT' }).click();
}

test('rafraîchir la page en pleine partie : on reprend au même joueur, mêmes points, mêmes pions @smoke', async ({ page }) => {
  await lancerPartie(page, { joueurs: 2, aventure: 'Mayas' });
  await unTour(page);
  await attendreJoueur(page, 'Tom');
  const pts = await page.locator('#points').textContent();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Le plateau' })).toBeVisible();
  await expect(page.locator('#tour-nom')).toHaveText('Tom');
  await expect(page.locator('#points')).toHaveText(pts);
  await expect(page.locator('#rouleau-nom')).toHaveText('Mayas');
  await expect(page.locator('.pion')).toHaveCount(2);
  await expect(page.locator('.pion').nth(0)).toHaveAttribute('data-case', '1');
  await expect(page.locator('.pion').nth(1)).toHaveAttribute('data-case', '1');
  // On peut continuer à jouer : la carte suivante de Tom est sa 1re.
  await page.getByRole('button', { name: 'Piocher une carte' }).click();
  await expect(page.locator('#carte-titre')).toContainText('Carte n° 1 de Tom');
});

test('rafraîchir pendant une carte : la même carte reste affichée, avec la réponse si elle était montrée', async ({ page }) => {
  await lancerPartie(page, { joueurs: 1 });
  await page.getByRole('button', { name: 'Piocher une carte' }).click();
  const titre = await page.locator('#carte-titre').textContent();
  const consigne = await page.locator('#carte-consigne').textContent();
  await page.reload();
  await expect(page.locator('#carte-piochee')).toBeVisible();
  await expect(page.locator('#carte-titre')).toHaveText(titre);
  await expect(page.locator('#carte-consigne')).toHaveText(consigne);
  await expect(page.getByRole('button', { name: 'Bonne réponse' })).toBeVisible();
});

test('rafraîchir après « Bonne réponse » : le dé FORT se lance et les points ne sont comptés qu\'une fois', async ({ page }) => {
  await lancerPartie(page, { joueurs: 2 });
  await page.getByRole('button', { name: 'Piocher une carte' }).click();
  await page.getByRole('button', { name: 'Bonne réponse' }).click();
  await page.reload();
  await expect(page.locator('#points')).toHaveText('0');
  await page.getByRole('button', { name: 'Lancer le dé FORT' }).click();
  await attendreJoueur(page, 'Tom');
  const pts = Number(await page.locator('#points').textContent());
  expect(pts).toBeGreaterThanOrEqual(4);
  expect(pts).toBeLessThanOrEqual(6);
});

test('aller sur une autre page puis revenir : la partie continue', async ({ page }) => {
  await lancerPartie(page, { joueurs: 2 });
  await unTour(page);
  await attendreJoueur(page, 'Tom');
  await page.goto('about:blank');
  await page.goBack();
  await expect(page.locator('#tour-nom')).toHaveText('Tom');
  await expect(page.getByRole('heading', { name: 'Le plateau' })).toBeVisible();
});

test('écran mis en veille (page masquée puis réaffichée) : rien ne change', async ({ page }) => {
  await lancerPartie(page, { joueurs: 2 });
  await unTour(page);
  await attendreJoueur(page, 'Tom');
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    document.dispatchEvent(new Event('visibilitychange'));
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(page.locator('#tour-nom')).toHaveText('Tom');
});

test('rafraîchir la préparation garde les choix (joueurs, aventure, cases cochées)', async ({ page }) => {
  await rapide(page);
  await page.goto('./');
  await page.getByRole('button', { name: 'Commencer l\'aventure' }).click();
  await page.getByRole('radio', { name: '3 joueurs' }).check();
  await page.getByRole('radio', { name: /^Savane/ }).check();
  await page.getByRole('checkbox', { name: 'Temps', exact: true }).check();
  await page.getByRole('checkbox', { name: 'Syllabes', exact: true }).check();
  await page.reload();
  await expect(page.getByRole('heading', { name: /Préparer/ })).toBeVisible();
  await expect(page.getByRole('radio', { name: '3 joueurs' })).toBeChecked();
  await expect(page.getByRole('radio', { name: /^Savane/ })).toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'Temps', exact: true })).toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'Syllabes', exact: true })).toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'Lettres', exact: true })).not.toBeChecked();
});

test('fermer la page (nouvel onglet) : on repart de l\'accueil', async ({ page, context }) => {
  await lancerPartie(page, { joueurs: 2 });
  await unTour(page);
  await page.close();
  const nouvelle = await context.newPage();
  await nouvelle.goto('./');
  await expect(nouvelle.getByRole('button', { name: 'Commencer l\'aventure' })).toBeVisible();
  await expect(nouvelle.getByRole('heading', { name: 'Le plateau' })).toBeHidden();
});

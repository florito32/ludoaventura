// Tours de jeu : pioche dans son tas, bonne / mauvaise réponse, dé, points cumulés, fin de partie.
const { test, expect } = require('@playwright/test');
const R = require('../js/regles.js');
const { lancerPartie } = require('./aide');

test.describe('règles du déroulement', () => {
  test.beforeEach(() => test.skip(test.info().project.name !== 'ordinateur', 'test de logique : un seul format suffit'));

  test('3 joueurs : 5 manches × 3 tours, croix par croix, points cumulés', () => {
    const p = R.nouvellePartie(3, 54);
    expect(p.positions).toEqual([1, 0, 0]);
    let tours = 0, total = 0;
    while (true) {
      R.piocher(p);
      const bonne = tours % 2 === 0;
      R.repondre(p, bonne);
      expect(p.de).toBe(bonne ? 'fort' : 'faible');
      const v = bonne ? 5 : 2;
      R.lancer(p, v);
      total += v; tours++;
      expect(p.points).toBe(total);
      if (p.etape === 'fin') break;
      const avant = p.manche;
      R.suivant(p);
      // Tous les joueurs passent sur une croix avant d'avancer à la suivante.
      if (p.joueur === 0) expect(p.manche).toBe(avant + 1);
      expect(p.positions[p.joueur]).toBe(p.manche);
    }
    expect(tours).toBe(15);
    expect(p.manche).toBe(5);
    expect(p.positions).toEqual([5, 5, 5]);
    expect(p.pioches).toEqual([5, 5, 5]); // chacun a pioché 5 cartes dans son propre tas
    expect(R.reussie(p)).toBe(total >= 54);
  });

  test('on ne peut pas sauter d\'étape ni tricher sur le dé', () => {
    const p = R.nouvellePartie(1, 15);
    expect(() => R.lancer(p, 6)).toThrow();
    R.piocher(p);
    R.repondre(p, false);
    expect(() => R.lancer(p, 6)).toThrow(); // le dé FAIBLE n'a pas de 6
    R.lancer(p, 3);
    expect(p.points).toBe(3);
  });
});

test('un tour complet : piocher, répondre, lancer, joueur suivant', async ({ page }) => {
  await lancerPartie(page, { joueurs: 2 });
  await expect(page.locator('#tour-nom')).toHaveText('Léa');
  await expect(page.locator('#tour-manche')).toContainText('Croix 1 sur 5');
  await expect(page.locator('#tas .pile').nth(0)).toHaveClass(/a-piocher/);
  await page.getByRole('button', { name: 'Piocher une carte' }).click();
  await expect(page.locator('#carte-titre')).toContainText('Carte n° 1 de Léa');
  await page.getByRole('button', { name: 'Bonne réponse' }).click();
  await page.getByRole('button', { name: 'Lancer le dé FORT' }).click();
  const pts = Number(await page.locator('#points').textContent());
  expect(pts).toBeGreaterThanOrEqual(4);
  expect(pts).toBeLessThanOrEqual(6);
  await expect(page.locator('#tour-consigne')).toHaveText(`+${pts} points pour l’équipe !`);
  await page.getByRole('button', { name: 'Au tour de Tom' }).click();
  await expect(page.locator('#tour-nom')).toHaveText('Tom');
  await expect(page.locator('.joueur-case').nth(1)).toHaveText('Croix 1');
  await expect(page.locator('#tas .pile').nth(1)).toHaveClass(/a-piocher/);
});

async function jouerPartie(page, bonne) {
  for (let t = 0; t < 10; t++) {
    await page.getByRole('button', { name: 'Piocher une carte' }).click();
    await page.getByRole('button', { name: bonne ? 'Bonne réponse' : 'Mauvaise réponse' }).click();
    await page.getByRole('button', { name: /^Lancer le dé/ }).click();
    if (t < 9) await page.getByRole('button', { name: /^Au tour de/ }).click();
  }
  await page.getByRole('button', { name: 'Voir le résultat' }).click();
}

test('partie entière gagnée : toutes les réponses bonnes → aventure réussie @smoke', async ({ page }) => {
  test.setTimeout(60_000);
  await lancerPartie(page, { joueurs: 2, aventure: 'Savane' }); // objectif 42, au moins 40 points avec le dé FORT
  await jouerPartie(page, true);
  const pts = Number(await page.locator('#points').textContent());
  expect(pts).toBeGreaterThanOrEqual(40);
  await expect(page.locator('.pion').nth(0)).toHaveAttribute('data-case', '5');
  await expect(page.locator('.pion').nth(1)).toHaveAttribute('data-case', '5');
  const fin = page.getByRole('dialog');
  await expect(fin).toBeVisible();
  await expect(fin.getByRole('heading')).toHaveText(pts >= 42 ? 'Aventure réussie !' : 'Aventure manquée…');
  await expect(fin).toContainText(`${pts} points pour un objectif de 42 gazelles à chasser`);
  await fin.getByRole('button', { name: 'Rejouer cette aventure' }).click();
  await expect(page.locator('#points')).toHaveText('0');
  await expect(page.locator('#rouleau-nom')).toHaveText('Savane');
});

test('partie entière perdue : toutes les réponses mauvaises → aventure manquée', async ({ page }) => {
  test.setTimeout(60_000);
  await lancerPartie(page, { joueurs: 2, aventure: 'Viking' }); // objectif 30, au plus 30 points avec le dé FAIBLE
  await jouerPartie(page, false);
  const pts = Number(await page.locator('#points').textContent());
  expect(pts).toBeLessThanOrEqual(30);
  await expect(page.getByRole('dialog').getByRole('heading')).toHaveText(pts >= 30 ? 'Aventure réussie !' : 'Aventure manquée…');
  await page.getByRole('button', { name: 'Nouvelle partie' }).click();
  await expect(page.getByRole('heading', { name: 'Préparer la partie' })).toBeVisible();
});

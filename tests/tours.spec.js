// Tours de jeu : pioche dans son tas, bonne / mauvaise réponse, dé, points cumulés, fin de partie.
const { test, expect } = require('@playwright/test');
const R = require('../js/regles.js');
const { lancerPartie, attendreJoueur, rapide } = require('./aide');

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

test('un tour complet : piocher, répondre, lancer, message écrit puis joueur suivant automatiquement', async ({ page }) => {
  await rapide(page, { pause: 1500 }); // le message « Léa gagne… » reste affiché assez longtemps pour être lu par le test
  await lancerPartie(page, { joueurs: 2 });
  await expect(page.locator('#tour-nom')).toHaveText('Léa');
  // Le tour de jeu n'écrit plus « Croix 1 sur 5 — la prairie » (demande du 02/11/2026).
  await expect(page.locator('#tour')).not.toContainText(/Croix \d sur \d/);
  await page.getByRole('button', { name: 'Piocher une carte' }).click();
  await expect(page.locator('#carte-titre')).toContainText('Carte n° 1 de Léa');
  await page.getByRole('button', { name: 'Bonne réponse' }).click();
  await page.getByRole('button', { name: 'Lancer le dé FORT' }).click();
  const pts = Number(await page.locator('#points').textContent());
  expect(pts).toBeGreaterThanOrEqual(4);
  expect(pts).toBeLessThanOrEqual(6);
  // C'est écrit (consigne + bandeau sur le plateau), puis on passe tout seul au joueur suivant.
  await expect(page.locator('#tour-consigne')).toHaveText(`Léa gagne ${pts} points ! Au tour de Tom.`);
  await attendreJoueur(page, 'Tom');
  await expect(page.locator('.pion').nth(1)).toHaveAttribute('data-case', '1');
});

async function jouerPartie(page, bonne) {
  for (let t = 0; t < 10; t++) {
    await page.getByRole('button', { name: 'Piocher une carte' }).click();
    await page.getByRole('button', { name: bonne ? 'Bonne réponse' : 'Mauvaise réponse' }).click();
    await page.getByRole('button', { name: /^Lancer le dé/ }).click();
    if (t < 9) await page.getByRole('button', { name: 'Piocher une carte' }).waitFor();
  }
  // Après le dernier lancer, le résultat s'affiche tout seul.
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

test('animation de réponse : « Bravo ! » et confettis si bonne, « Oups ! » si mauvaise', async ({ page }) => {
  await lancerPartie(page, { joueurs: 2 });
  await page.getByRole('button', { name: 'Piocher une carte' }).click();
  await page.getByRole('button', { name: 'Bonne réponse' }).click();
  const reaction = page.locator('#reaction');
  await expect(reaction).toHaveClass(/bonne/);
  await expect(reaction).toContainText('Bravo !');
  await expect(reaction.locator('i')).toHaveCount(18);
  await expect(page.locator('.pion').nth(0)).toHaveClass(/saute/);
  await page.getByRole('button', { name: /^Lancer le dé/ }).click();
  await attendreJoueur(page, 'Tom');
  await page.getByRole('button', { name: 'Piocher une carte' }).click();
  await page.getByRole('button', { name: 'Mauvaise réponse' }).click();
  await expect(reaction).toHaveClass(/mauvaise/);
  await expect(reaction).toContainText('Oups !');
  await expect(page.locator('.pion').nth(1)).toHaveClass(/secoue/);
});

test('après l\u2019animation de réponse, le bon dé se lance tout seul (FORT si bonne, FAIBLE si mauvaise)', async ({ page }) => {
  await rapide(page, { autoDe: 300 });
  page.__rapide = true;
  await lancerPartie(page, { joueurs: 2 });
  for (const [reponse, min, max, nom] of [['Bonne réponse', 4, 6, 'Tom'], ['Mauvaise réponse', 1, 3, 'Léa']]) {
    const avant = Number(await page.locator('#points').textContent());
    await page.getByRole('button', { name: 'Piocher une carte' }).click();
    await page.getByRole('button', { name: reponse }).click();
    await expect(page.locator('#tour-consigne')).toContainText('Le dé se lance tout seul');
    // Aucun clic sur « Lancer le dé » : le dé roule seul, les points arrivent et le tour passe.
    await attendreJoueur(page, nom);
    const gain = Number(await page.locator('#points').textContent()) - avant;
    expect(gain).toBeGreaterThanOrEqual(min);
    expect(gain).toBeLessThanOrEqual(max);
  }
});

test('lancer le dé à la main avant le lancer automatique ne le lance pas deux fois', async ({ page }) => {
  await rapide(page, { autoDe: 400 });
  page.__rapide = true;
  await lancerPartie(page, { joueurs: 1 });
  await page.getByRole('button', { name: 'Piocher une carte' }).click();
  await page.getByRole('button', { name: 'Bonne réponse' }).click();
  await page.getByRole('button', { name: 'Lancer le dé FORT' }).click();
  const pts = Number(await page.locator('#points').textContent());
  await page.getByRole('button', { name: 'Piocher une carte' }).waitFor();
  await page.waitForTimeout(800);
  await expect(page.locator('#points')).toHaveText(String(pts));
  await expect(page.getByRole('button', { name: 'Piocher une carte' })).toBeVisible();
});

// Mathématiques (v5.7) : matière choisie à l'étape 3, signes, nombres 1 à 10, niveau = nombre de signes,
// formule à la pioche, réponse écrite par le joueur et corrigée par le jeu, puis dé automatique.
const { test, expect } = require('@playwright/test');
const K = require('../js/calcul.js');
const { rapide, versReglages, valider, maths, cocherJoueur, lancer, lancerLeDe, ouvrirNeuf } = require('./aide');

test.describe('logique des calculs', () => {
  test.beforeEach(() => test.skip(test.info().project.name !== 'ordinateur', 'test de logique : un seul format suffit'));

  test('priorités habituelles : × et ÷ avant + et −', () => {
    expect(K.evaluer([3, 4, 2], ['plus', 'fois'])).toBe(11);
    expect(K.evaluer([10, 4, 2], ['moins', 'divise'])).toBe(8);
    expect(K.evaluer([7, 2], ['divise'])).toBe(3.5);
    // Plus d'une décimale ou résultat négatif : formule refusée.
    expect(K.evaluer([1, 3], ['divise'])).toBeNull();
    expect(K.evaluer([2, 5], ['moins'])).toBeNull();
  });

  test('le niveau donne le nombre de signes ; seulement les signes et nombres choisis ; résultat ≥ 0 à une décimale au plus', () => {
    const attendus = { facile: 1, moyen: 2, difficile: 3, expert: 4 };
    for (const [niveau, n] of Object.entries(attendus)) {
      for (let i = 0; i < 300; i++) {
        const c = K.generer({ signes: ['plus', 'moins', 'fois', 'divise'], nombres: [2, 5, 7, 10], niveau });
        expect(c.operations).toHaveLength(n);
        expect(c.nombres).toHaveLength(n + 1);
        for (const x of c.nombres) expect([2, 5, 7, 10]).toContain(x);
        expect(c.resultat).toBeGreaterThanOrEqual(0);
        expect(Math.round(c.resultat * 10)).toBeCloseTo(c.resultat * 10, 9);
        expect(c.resultat).toBe(K.evaluer(c.nombres, c.operations));
        // Pas de décimale sans division.
        if (!c.operations.includes('divise')) expect(Number.isInteger(c.resultat)).toBe(true);
      }
    }
    const seul = K.generer({ signes: ['fois'], nombres: [3], niveau: 'moyen' });
    expect(seul.formule).toBe('3 × 3 × 3');
    expect(seul.resultatTexte).toBe('27');
  });

  test('réponse écrite : virgule ou point, espaces tolérés', () => {
    expect(K.juste('3,5', 3.5)).toBe(true);
    expect(K.juste('3.5', 3.5)).toBe(true);
    expect(K.juste(' 1 2 ', 12)).toBe(true);
    expect(K.juste('3,4', 3.5)).toBe(false);
    expect(K.juste('trois', 3)).toBe(false);
    expect(K.ecrire(7.6)).toBe('7,6');
  });
});

async function versMaths(page, joueurs = 1) {
  if (!page.__rapide) { await rapide(page); page.__rapide = true; }
  await page.goto('./');
  await versReglages(page, joueurs);
}

test('étape 3 : Mathématiques propose 4 signes, les nombres 1 à 10 et 4 niveaux ; il faut un signe et un nombre', async ({ page }) => {
  await versMaths(page);
  await expect(page.locator('#reglages-maths')).toBeHidden();
  await page.locator('#matieres label', { hasText: 'Mathématiques' }).click();
  await valider(page); // deuxième écran : les réglages de la matière (v5.8)
  await expect(page.locator('#reglages-maths')).toBeVisible();
  await expect(page.locator('#reglages-titre')).toHaveText('Léa (Joueur 1) : Mathématiques');
  await expect(page.locator('#reglages-ortho')).toBeHidden();
  await expect(page.locator('#signes input')).toHaveCount(4);
  await expect(page.locator('#nombres input')).toHaveCount(10);
  await expect(page.locator('#niveau-maths input')).toHaveCount(4);
  await expect(page.locator('#niveau-maths input[value="facile"]')).toBeChecked();
  // Chaque écran de la préparation tient sans défiler.
  const deborde = await page.evaluate(() => document.documentElement.scrollHeight > window.innerHeight + 1);
  expect(deborde).toBe(false);
  const corps = await page.locator('#reglages-joueur').evaluate((e) => e.scrollHeight > e.clientHeight + 1);
  expect(corps).toBe(false);
  await valider(page);
  await expect(page.locator('#packs-alerte')).toHaveText('Léa (Joueur 1) doit choisir au moins un signe.');
  await page.locator('#signes label', { hasText: 'Additionner' }).click();
  await valider(page);
  await expect(page.locator('#packs-alerte')).toHaveText('Léa (Joueur 1) doit choisir au moins un nombre.');
  await page.locator('#nombres label', { hasText: /^\s*4\s*$/ }).click();
  await valider(page);
  await expect(page.getByRole('button', { name: 'Lancer la partie' })).toBeVisible();
});

test('partie en mathématiques : bonne réponse → dé FORT, mauvaise → correction et dé FAIBLE @smoke', async ({ page }) => {
  await versMaths(page);
  await maths(page, { signes: ['plus', 'fois'], nombres: [2, 3], niveau: 'moyen' });
  await lancer(page);
  for (const [bonne, min, max] of [[true, 4, 6], [false, 1, 3]]) {
    await page.getByRole('button', { name: 'Piocher une carte' }).click();
    await expect(page.locator('#carte-mot')).toHaveText(/^\d+\s[+×]\s\d+\s[+×]\s\d+\s=\s\?$/);
    await expect(page.getByLabel('Ta réponse')).toBeFocused();
    // Plus de boutons « Bonne / Mauvaise réponse » : le jeu corrige.
    await expect(page.getByRole('button', { name: 'Bonne réponse' })).toHaveCount(0);
    const res = await page.evaluate(() => window.Aventura.partie.carte.resultatTexte);
    const avant = Number(await page.locator('#points').textContent());
    await page.getByLabel('Ta réponse').fill(bonne ? res : res + '1');
    await page.getByRole('button', { name: 'Valider' }).click();
    await expect(page.locator('#carte-reponse')).toContainText(bonne ? 'Bonne réponse !' : 'La bonne réponse est');
    await expect(page.locator('#carte-reponse')).toContainText('= ' + res);
    await expect(page.locator('#reaction')).toHaveClass(bonne ? /bonne/ : /mauvaise/);
    await expect(page.getByLabel('Ta réponse')).toBeDisabled();
    expect(await page.evaluate(() => window.Aventura.partie.regles.de)).toBe(bonne ? 'fort' : 'faible');
    await lancerLeDe(page);
    await expect.poll(async () => Number(await page.locator('#points').textContent())).toBeGreaterThan(avant);
    const gain = Number(await page.locator('#points').textContent()) - avant;
    expect(gain).toBeGreaterThanOrEqual(min);
    expect(gain).toBeLessThanOrEqual(max);
    await page.getByRole('button', { name: 'Piocher une carte' }).waitFor();
  }
});

test('réponse vide ou qui n\'est pas un nombre : message, rien n\'est compté', async ({ page }) => {
  await versMaths(page);
  await maths(page, { signes: ['divise'], nombres: [7, 2], niveau: 'facile' });
  await lancer(page);
  await page.getByRole('button', { name: 'Piocher une carte' }).click();
  await page.getByRole('button', { name: 'Valider' }).click();
  await expect(page.locator('#carte-reponse')).toHaveText('Écris ta réponse dans la case.');
  await page.getByLabel('Ta réponse').fill('trois');
  await page.getByRole('button', { name: 'Valider' }).click();
  await expect(page.locator('#carte-reponse')).toHaveText('Écris un nombre, par exemple 12 ou 3,5.');
  expect(await page.evaluate(() => window.Aventura.partie.regles.etape)).toBe('repondre');
  // Une division peut donner une décimale : la virgule est acceptée.
  const res = await page.evaluate(() => window.Aventura.partie.carte.resultatTexte);
  await page.getByLabel('Ta réponse').fill(res);
  await page.keyboard.press('Enter');
  await expect(page.locator('#carte-reponse')).toContainText('Bonne réponse !');
});

test('un joueur en mathématiques, l\'autre en orthographe ; « Mêmes réglages pour tous » copie la matière', async ({ page }) => {
  await versMaths(page, 2);
  await maths(page, { signes: ['moins'], nombres: [5, 9] });
  await valider(page);
  await cocherJoueur(page);
  await lancer(page);
  await page.getByRole('button', { name: 'Piocher une carte' }).click();
  await expect(page.getByLabel('Ta réponse')).toBeVisible();
  const res = await page.evaluate(() => window.Aventura.partie.carte.resultatTexte);
  await page.getByLabel('Ta réponse').fill(res);
  await page.getByRole('button', { name: 'Valider' }).click();
  await lancerLeDe(page);
  // Joueur 2 : carte d'orthographe, avec le maître du jeu.
  await page.locator('#tour-nom').filter({ hasText: 'Tom' }).waitFor();
  await page.getByRole('button', { name: 'Piocher une carte' }).click();
  await expect(page.locator('#carte-saisie')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Bonne réponse' })).toBeVisible();

  // Mêmes réglages : la matière et les réglages de calcul sont copiés (nouvelle partie dans l'onglet).
  await ouvrirNeuf(page);
  await versReglages(page, 3);
  await maths(page, { signes: ['plus'], nombres: [1] , niveau: 'expert' });
  await page.getByRole('button', { name: 'Mêmes réglages pour tous' }).click();
  const p = await page.evaluate(() => window.Aventura.partie);
  for (let k = 1; k < 3; k++) {
    expect(p.matiere[k]).toBe('maths');
    expect(p.maths[k]).toEqual({ signes: ['plus'], nombres: [1], niveau: 'expert' });
  }
});

test('rafraîchir après la réponse : la correction reste et les points ne comptent qu\'une fois', async ({ page }) => {
  await versMaths(page);
  await maths(page, { signes: ['plus'], nombres: [3] });
  await lancer(page);
  await page.getByRole('button', { name: 'Piocher une carte' }).click();
  await page.getByLabel('Ta réponse').fill('6');
  await page.getByRole('button', { name: 'Valider' }).click();
  await expect(page.locator('#carte-reponse')).toContainText('Bonne réponse !');
  await page.reload();
  await expect(page.locator('#carte-reponse')).toContainText('Bonne réponse ! 3 + 3 = 6');
  await expect(page.getByLabel('Ta réponse')).toHaveValue('6');
  await lancerLeDe(page);
  await expect.poll(async () => Number(await page.locator('#points').textContent())).toBeGreaterThanOrEqual(4);
  expect(Number(await page.locator('#points').textContent())).toBeLessThanOrEqual(6);
});

// Bug corrigé en v5.8 : une longue formule (niveau Expert) ou la case de réponse élargissaient le panneau,
// et la page défilait de côté sur ordinateur.
test('formule Expert : la page ne défile jamais de côté', async ({ page }) => {
  await versMaths(page);
  await maths(page, { signes: ['plus', 'moins', 'fois', 'divise'], nombres: [10], niveau: 'expert' });
  await lancer(page);
  await page.getByRole('button', { name: 'Piocher une carte' }).click();
  await expect(page.locator('#carte-mot')).toHaveText(/^10(\s[+−×÷]\s10){4}\s=\s\?$/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
  await page.getByLabel('Ta réponse').fill('12345678901234567890');
  await page.getByRole('button', { name: 'Valider' }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
});

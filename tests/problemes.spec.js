// v9.0 (demande du 16/11/2026) : Mathématiques → « Calcul mental » ou « Problèmes » ; problèmes racontés sur les
// thèmes de l'utilisateur ; pavé numérique pour toute réponse en nombre ; question en plein écran sur téléphone et tablette.
const { test, expect } = require('@playwright/test');
const K = require('../js/calcul.js');
const P = require('../js/problemes.js');
const { rapide, versReglages, valider, lancer, cocherJoueur, cocher } = require('./aide');

const REGLAGES = [
  { niveau: 'facile', signes: ['plus', 'moins', 'fois', 'divise'], nombres: [2, 7, 10], nbSignes: [1] },
  { niveau: 'moyen', signes: ['plus', 'moins', 'fois', 'divise'], nombres: [3, 7], dizaines: [20], nbSignes: [1, 2] },
  { niveau: 'moyen', signes: ['divise'], nombres: [1, 2, 7], dizaines: [10], nbSignes: [2] },
  { niveau: 'difficile', signes: ['plus', 'moins', 'fois', 'divise'], nombres: [2, 5, 9], dizaines: [40], centaines: [100], nbSignes: [3] },
  { niveau: 'expert', signes: ['plus', 'moins', 'fois', 'divise'], nombres: [1, 4, 8], dizaines: [10], centaines: [200], milliers: [1000], nbSignes: [2, 3, 4] }
];

test.describe('logique des problèmes', () => {
  test.beforeEach(() => test.skip(test.info().project.name !== 'ordinateur', 'test de logique : un seul format suffit'));

  test('58 thèmes du fichier de l\'utilisateur, tous complets', () => {
    expect(P.THEMES.length).toBe(58);
    for (const t of P.THEMES) {
      for (const k of ['titre', 'intro']) expect(typeof t[k]).toBe('string');
      for (const k of ['o', 'c', 'r', 'uc', 'ur']) expect(t[k]).toHaveLength(2);
      expect(t.u).toHaveLength(3);
      for (const k of ['p', 'm', 'up', 'um']) expect(t[k].length).toBeGreaterThan(0);
    }
  });

  test('chaque énoncé reprend tous les nombres du calcul, sans trou ni faute de liaison', () => {
    for (const r of REGLAGES) {
      for (let i = 0; i < 400; i++) {
        const c = K.generer(r);
        P.habiller(c);
        const t = c.probleme.replace(/ /g, ' ');
        expect(t, c.formule).not.toMatch(/undefined|NaN|null|\bde une\b|\bde [aeiouéèœ]|\s\s|une des 1 parts/);
        expect(t, c.formule).toMatch(/\?$/);
        // Chaque nombre du calcul est écrit dans l'énoncé.
        for (const n of c.nombres) expect(t, c.formule).toContain(K.ecrire(n));
        // Un nombre à virgule n'arrive jamais sur des objets qu'on compte (on passe aux litres, kilos, mètres…).
        if (/,/.test(c.resultatTexte)) expect(t, c.formule).toMatch(/(litre|kilo|mètre|gramme|tonne|centimètre|kilomètre)s? /);
      }
    }
  });

  test('exemples : un produit, un partage, une suite d\'ajouts et de retraits', () => {
    const fois = P.habiller({ nombres: [6, 4], operations: ['fois'] }, Math.random, 9);
    expect(fois.probleme).toContain('Il y a 6 caisses. Dans chaque caisse, il y a 4 pots de miel.');
    expect(fois.probleme).toMatch(/Combien de pots de miel cela fait-il en tout \?$/);
    const part = P.habiller({ nombres: [18, 3], operations: ['divise'] }, Math.random, 9);
    expect(part.probleme).toContain('On partage équitablement 18 pots de miel entre 3 clients.');
    const virgule = P.habiller({ nombres: [7, 2], operations: ['divise'] }, Math.random, 9);
    expect(virgule.probleme).toContain('7 kilos de miel');
    const suite = P.habiller({ nombres: [12, 3, 6, 5], operations: ['plus', 'fois', 'moins'] }, () => 0, 0);
    expect(suite.probleme).toContain('Au départ, il y a 12 pains. Ensuite, le boulanger cuit 3 paniers de 6 pains. Puis les soldats mangent 5 pains.');
    expect(suite.probleme).toMatch(/à la fin \?$/);
  });
});

// Va jusqu'à la première question d'une partie de mathématiques à 1 joueur.
async function partieMaths(page, { type = 'probleme', niveau = 'moyen', signes = ['plus', 'fois'], nombres = [3, 7] } = {}) {
  await rapide(page, { autoDe: 600000 });
  await page.goto('./');
  await versReglages(page, 1);
  await cocher(page, '#matieres', 'maths');
  if (type) await page.getByRole('radio', { name: type === 'probleme' ? 'Problèmes' : 'Calcul mental' }).check();
  await cocher(page, '#niveau-maths', niveau);
  await valider(page);
  await page.locator('#reglages-maths').waitFor();
  for (const s of signes) await page.locator('#signes input[value="' + s + '"]').check();
  for (const n of nombres) await page.locator('#nombres input[value="' + n + '"]').check();
  await lancer(page);
  await page.getByRole('button', { name: /^(Première question|Question suivante)$/ }).click();
}

// Tape un texte sur le pavé numérique.
async function taper(page, texte) {
  for (const ch of texte) await page.locator('#pave [data-touche="' + ch + '"]').click();
}

test.describe('Calcul mental ou Problèmes', () => {
  test('« Calcul mental » est choisi au départ ; « Problèmes » raconte le calcul sur un thème', async ({ page }) => {
    await rapide(page);
    await page.goto('./');
    await versReglages(page, 1);
    await cocher(page, '#matieres', 'maths');
    await expect(page.getByRole('radio', { name: 'Calcul mental' })).toBeChecked();
    await expect(page.getByRole('radio', { name: 'Problèmes' })).not.toBeChecked();
    // L'un ou l'autre : choisir « Problèmes » retire « Calcul mental ».
    await page.getByRole('radio', { name: 'Problèmes' }).check();
    await expect(page.getByRole('radio', { name: 'Calcul mental' })).not.toBeChecked();
    expect(await page.evaluate(() => window.Aventura.partie.maths[0].type)).toBe('probleme');
  });

  test('problème : l\'énoncé sans la formule, réponse au pavé, correction avec le calcul', async ({ page }) => {
    await partieMaths(page);
    const c = await page.evaluate(() => window.Aventura.partie.carte);
    expect(c.probleme).toBeTruthy();
    await expect(page.locator('#carte-titre')).toHaveText('Problème · Moyen');
    await expect(page.locator('#carte-consigne')).toContainText(c.theme);
    await expect(page.locator('#carte-mot')).toBeHidden();
    await taper(page, c.resultatTexte);
    await expect(page.getByLabel('Ta réponse')).toHaveValue(c.resultatTexte);
    await page.getByRole('button', { name: /^(OK|Valider)$/ }).click();
    await expect(page.locator('#carte-reponse')).toContainText('Bonne réponse ! ' + c.resultatTexte + ' (' + c.formule + ' = ' + c.resultatTexte + ')');
  });

  test('calcul mental : toujours la formule', async ({ page }) => {
    await partieMaths(page, { type: 'calcul' });
    await expect(page.locator('#carte-mot')).toBeVisible();
    await expect(page.locator('#carte-mot')).toContainText('= ?');
    await expect(page.locator('#pave')).toBeVisible();
  });
});

test.describe('pavé numérique', () => {
  test('chiffres, virgule (une seule), ⌫ efface le dernier, C efface tout', async ({ page }) => {
    await partieMaths(page, { type: 'calcul' });
    const champ = page.getByLabel('Ta réponse');
    await taper(page, '12');
    await page.getByRole('button', { name: 'Virgule' }).click();
    await page.getByRole('button', { name: 'Virgule' }).click();
    await taper(page, '5');
    await expect(champ).toHaveValue('12,5');
    await page.getByRole('button', { name: 'Effacer le dernier chiffre' }).click();
    await expect(champ).toHaveValue('12,');
    await page.getByRole('button', { name: 'Tout effacer' }).click();
    await expect(champ).toHaveValue('');
    // Virgule en premier : « 0, ».
    await page.getByRole('button', { name: 'Virgule' }).click();
    await expect(champ).toHaveValue('0,');
  });

  test('sur écran tactile, aucun clavier du téléphone : la case ne demande aucun clavier et n\'a pas le curseur', async ({ page }) => {
    await partieMaths(page, { type: 'calcul' });
    const tactile = await page.evaluate(() => matchMedia('(pointer: coarse)').matches);
    if (tactile) {
      await expect(page.getByLabel('Ta réponse')).toHaveAttribute('inputmode', 'none');
      await expect(page.getByLabel('Ta réponse')).not.toBeFocused();
    } else {
      // Ordinateur : le curseur est dans la case, le clavier physique marche aussi.
      await expect(page.getByLabel('Ta réponse')).toBeFocused();
    }
    // Les touches tiennent dans l'écran et ne débordent pas.
    const dehors = await page.evaluate(() => [...document.querySelectorAll('#carte-saisie input, #carte-saisie button')].filter((b) => {
      const r = b.getBoundingClientRect();
      return r.top < -1 || r.bottom > innerHeight + 1 || r.left < -1 || r.right > innerWidth + 1;
    }).map((b) => b.textContent || b.id));
    expect(dehors).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test('orthographe « nombre de lettres » : réponse au pavé aussi', async ({ page }) => {
    await rapide(page, { autoDe: 600000 });
    await page.goto('./');
    await versReglages(page, 1);
    await cocherJoueur(page);
    await lancer(page);
    await page.getByRole('button', { name: /^(Première question|Question suivante)$/ }).click();
    await expect(page.locator('#pave')).toBeVisible();
  });
});

test.describe('question en plein écran', () => {
  test('téléphone et tablette : plus de plateau pendant la question et la correction ; il revient avec le dé', async ({ page }, info) => {
    await partieMaths(page);
    const plein = info.project.name !== 'ordinateur';
    await expect(page.locator('body')).toHaveClass(plein ? /question-plein/ : /^(?!.*question-plein)/);
    if (plein) {
      // L'encadré couvre tout l'écran.
      const r = await page.locator('.panneau').boundingBox();
      const vp = page.viewportSize();
      expect(r.y).toBeLessThanOrEqual(1);
      expect(r.height).toBeGreaterThanOrEqual(vp.height - 2);
    } else {
      await expect(page.locator('.plateau')).toBeInViewport();
    }
    const c = await page.evaluate(() => window.Aventura.partie.carte);
    await taper(page, c.resultatTexte);
    await page.getByRole('button', { name: /^(OK|Valider)$/ }).click();
    // La correction reste en plein écran jusqu'au dé.
    await expect(page.locator('#carte-reponse')).toBeVisible();
    if (plein) await expect(page.locator('body')).toHaveClass(/question-plein/);
    await page.evaluate(() => window.Aventura.lancerDe(window.Aventura.partie.regles.de));
    await expect(page.locator('body')).not.toHaveClass(/question-plein/);
    await expect(page.locator('#de-plateau')).toBeVisible();
  });
});

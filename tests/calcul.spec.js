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
        // (au niveau Facile, ce sont des tables : seul le nombre de la table vient de la liste)
        if (niveau !== 'facile') for (const x of c.nombres) expect([2, 5, 7, 10]).toContain(x);
        else expect([2, 5, 7, 10]).toContain(c.table);
        expect(c.resultat).toBeGreaterThanOrEqual(0);
        expect(Math.round(c.resultat * 10)).toBeCloseTo(c.resultat * 10, 9);
        expect(c.resultat).toBe(K.evaluer(c.nombres, c.operations));
        // Pas de décimale sans division.
        if (!c.operations.includes('divise')) expect(Number.isInteger(c.resultat)).toBe(true);
      }
    }
    const seul = K.generer({ signes: ['fois'], nombres: [3], niveau: 'moyen' }); // 2 signes
    expect(seul.formule).toBe('3 × 3 × 3');
    expect(seul.resultatTexte).toBe('27');
  });

  test('niveau Facile = tables : n × k, n + k, (n + k) − n, (n × k) ÷ n, k de 1 à 10, résultat entier', () => {
    const vus = new Set();
    for (let i = 0; i < 2000; i++) {
      const c = K.generer({ signes: ['plus', 'moins', 'fois', 'divise'], nombres: [2, 9], niveau: 'facile' });
      expect([2, 9]).toContain(c.table);
      expect(c.operations).toHaveLength(1);
      expect(Number.isInteger(c.resultat)).toBe(true);
      expect(c.resultat).toBe(K.evaluer(c.nombres, c.operations));
      const [a, b] = c.nombres, op = c.operations[0], n = c.table;
      if (op === 'plus' || op === 'fois') { expect(a).toBe(n); expect(b).toBeGreaterThanOrEqual(1); expect(b).toBeLessThanOrEqual(10); }
      else { expect(b).toBe(n); expect(c.resultat).toBeGreaterThanOrEqual(1); expect(c.resultat).toBeLessThanOrEqual(10); }
      vus.add(c.formule);
    }
    for (const f of ['2 × 8', '9 × 10', '2 + 1', '16 ÷ 2', '12 − 2']) expect(vus.has(f)).toBe(true);
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

test('étape 3 : Mathématiques et son niveau sur le même écran, puis signes et tables (Facile) ; il faut un signe et une table', async ({ page }) => {
  await versMaths(page);
  await expect(page.locator('#reglage-niveau-maths')).toBeHidden();
  await page.locator('#matieres label', { hasText: 'Mathématiques' }).click();
  // v5.9 : le niveau est proposé tout de suite, sur l'écran de la matière.
  await expect(page.locator('#reglage-niveau-maths')).toBeVisible();
  await expect(page.locator('#niveau-maths input')).toHaveCount(4);
  await expect(page.locator('#niveau-maths input[value="facile"]')).toBeChecked();
  await expect(page.locator('#niveau-maths-aide')).toContainText('les tables');
  await page.locator('#niveau-maths label', { hasText: 'Moyen' }).click();
  await expect(page.locator('#niveau-maths-aide')).toHaveText('Moyen : 2 signes par calcul, au moins 4 nombres.');
  await page.locator('#niveau-maths label', { hasText: 'Facile' }).click();
  await valider(page); // deuxième écran : signes et tables
  await expect(page.locator('#reglages-maths')).toBeVisible();
  await expect(page.locator('#reglages-titre')).toHaveText('Léa (Joueur 1) : Mathématiques');
  await expect(page.locator('#reglages-maths #niveau-maths')).toHaveCount(0);
  await expect(page.locator('#signes input')).toHaveCount(4);
  await expect(page.locator('#nombres input')).toHaveCount(10);
  await expect(page.locator('#nombres-titre')).toContainText('Tables');
  // Chaque écran de la préparation tient sans défiler.
  const deborde = await page.evaluate(() => document.documentElement.scrollHeight > window.innerHeight + 1);
  expect(deborde).toBe(false);
  const corps = await page.locator('#reglages-joueur').evaluate((e) => e.scrollHeight > e.clientHeight + 1);
  expect(corps).toBe(false);
  await valider(page);
  await expect(page.locator('#packs-alerte')).toHaveText('Léa (Joueur 1) doit choisir au moins un signe.');
  await page.getByRole('checkbox', { name: 'Additionner' }).click({ force: true });
  await valider(page);
  await expect(page.locator('#packs-alerte')).toHaveText('Léa (Joueur 1) doit choisir au moins une table.');
  await page.locator('#nombres label', { hasText: /^\s*4\s*$/ }).click();
  await valider(page);
  await expect(page.getByRole('button', { name: 'Lancer la partie' })).toBeVisible();
  // Retour sur Léa à un autre niveau : les nombres ne sont plus des tables.
  await page.getByRole('button', { name: /Retour/ }).click();
  await page.getByRole('button', { name: /Retour/ }).click();
  await page.locator('#niveau-maths label', { hasText: 'Expert' }).click();
  await valider(page);
  await expect(page.locator('#nombres-titre')).toContainText('Unités');
});

// v7.0 (04/11/2026) : signes seuls dans des ronds sur une ligne, dizaines et centaines, « Tout sélectionner »,
// au moins 4 nombres aux niveaux Moyen, Difficile et Expert.
test('signes seuls, dizaines et centaines, « Tout sélectionner », minimum de 4 nombres hors Facile', async ({ page }) => {
  await versMaths(page);
  await maths(page, { signes: [], nombres: [], niveau: 'moyen' });
  // Les signes : le symbole seul, sans le mot, lu quand même par les lecteurs d'écran.
  await expect(page.locator('#signes .pack span')).toHaveText(['+', '−', '×', '÷']);
  await expect(page.getByRole('checkbox', { name: 'Diviser' })).toHaveCount(1);
  const ronds = await page.locator('#signes .pack span').evaluateAll((l) => l.map((e) => { const r = e.getBoundingClientRect(); return [r.y, r.width, r.height]; }));
  for (const r of ronds) { expect(r[0]).toBe(ronds[0][0]); expect(Math.abs(r[1] - r[2])).toBeLessThanOrEqual(1); } // une ligne, des ronds
  // Dizaines et centaines, expliquées au joueur.
  await expect(page.locator('#dizaines input')).toHaveCount(9);
  await expect(page.locator('#centaines input')).toHaveCount(9);
  await expect(page.locator('#dizaines-titre')).toContainText('30 = de 30 à 39');
  await expect(page.locator('#centaines-titre')).toContainText('300 = de 300 à 399');
  await expect(page.getByRole('checkbox', { name: 'Dizaine 30 : nombres de 30 à 39' })).toHaveCount(1);
  // Minimum : 3 nombres ne suffisent pas au niveau Moyen.
  await page.locator('#signes input[value="plus"]').check();
  for (const n of [2, 5]) await page.locator('#nombres input[value="' + n + '"]').check();
  await page.locator('#dizaines input[value="30"]').check();
  await valider(page);
  await expect(page.locator('#packs-alerte')).toHaveText('Léa (Joueur 1) doit choisir au moins 4 nombres (unités, dizaines ou centaines).');
  await page.locator('#centaines input[value="300"]').check();
  expect(await page.evaluate(() => window.Aventura.partie.maths[0])).toMatchObject({ nombres: [2, 5], dizaines: [30], centaines: [300] });
  // « Tout sélectionner » puis « Tout désélectionner » pour chaque groupe.
  for (const [g, nb] of [['nombres', 10], ['dizaines', 9], ['centaines', 9]]) {
    const b = page.getByRole('button', { name: new RegExp('^Tout sélectionner : ' + { nombres: 'unités', dizaines: 'dizaines', centaines: 'centaines' }[g]) });
    await b.click();
    await expect(page.locator('#' + g + ' input:checked')).toHaveCount(nb);
    await page.getByRole('button', { name: new RegExp('^Tout désélectionner : ' + { nombres: 'unités', dizaines: 'dizaines', centaines: 'centaines' }[g]) }).click();
    await expect(page.locator('#' + g + ' input:checked')).toHaveCount(0);
  }
  await page.getByRole('button', { name: /^Tout sélectionner : dizaines/ }).click();
  await valider(page); // 9 dizaines : assez de nombres
  await expect(page.getByRole('button', { name: 'Lancer la partie' })).toBeVisible();
});

test('logique : dizaines et centaines donnent des nombres de leur tranche ; Facile = tables des dizaines', () => {
  test.skip(test.info().project.name !== 'ordinateur', 'test de logique : un seul format suffit');
  const vus = new Set();
  for (let i = 0; i < 500; i++) {
    const c = K.generer({ signes: ['plus'], nombres: [], dizaines: [30], centaines: [300], niveau: 'moyen' });
    for (const x of c.nombres) { expect((x >= 30 && x <= 39) || (x >= 300 && x <= 399)).toBe(true); vus.add(x >= 300 ? 'c' : 'd'); }
    const t = K.generer({ signes: ['fois'], nombres: [], dizaines: [30], niveau: 'facile' });
    expect(t.table).toBeGreaterThanOrEqual(30); expect(t.table).toBeLessThanOrEqual(39);
    expect(t.resultat).toBe(t.table * t.nombres[1]);
  }
  expect(vus.size).toBe(2);
  expect(K.compter({ nombres: [1, 2], dizaines: [10], centaines: [100] })).toBe(4);
  expect(K.minimum('facile')).toBe(1);
  for (const n of ['moyen', 'difficile', 'expert']) expect(K.minimum(n)).toBe(4);
});

test('niveau Facile : la carte est une question de la table choisie', async ({ page }) => {
  await versMaths(page);
  await maths(page, { signes: ['fois'], nombres: [7], niveau: 'facile' });
  await lancer(page);
  await page.getByRole('button', { name: 'Piocher une carte' }).click();
  await expect(page.locator('#carte-mot')).toHaveText(/^7\s×\s([1-9]|10)\s=\s\?$/);
  await expect(page.locator('#carte-titre')).toContainText('table de 7');
});

test('partie en mathématiques : bonne réponse → dé FORT, mauvaise → correction et dé FAIBLE @smoke', async ({ page }) => {
  await versMaths(page);
  await maths(page, { signes: ['plus', 'fois'], nombres: [2, 3, 4, 5], niveau: 'moyen' });
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
  await maths(page, { signes: ['plus'], nombres: [1, 2, 3, 4], niveau: 'expert' });
  await page.getByRole('button', { name: 'Mêmes réglages pour tous' }).click();
  const p = await page.evaluate(() => window.Aventura.partie);
  for (let k = 1; k < 3; k++) {
    expect(p.matiere[k]).toBe('maths');
    expect(p.maths[k]).toEqual({ signes: ['plus'], nombres: [1, 2, 3, 4], dizaines: [], centaines: [], niveau: 'expert' });
  }
});

test('rafraîchir après la réponse : la correction reste et les points ne comptent qu\'une fois', async ({ page }) => {
  await versMaths(page);
  await maths(page, { signes: ['plus'], nombres: [3], niveau: 'facile' });
  await lancer(page);
  await page.getByRole('button', { name: 'Piocher une carte' }).click();
  const c = await page.evaluate(() => window.Aventura.partie.carte);
  await page.getByLabel('Ta réponse').fill(c.resultatTexte);
  await page.getByRole('button', { name: 'Valider' }).click();
  await expect(page.locator('#carte-reponse')).toContainText('Bonne réponse !');
  await page.reload();
  await expect(page.locator('#carte-reponse')).toContainText('Bonne réponse ! ' + c.formule + ' = ' + c.resultatTexte);
  await expect(page.getByLabel('Ta réponse')).toHaveValue(c.resultatTexte);
  await lancerLeDe(page);
  await expect.poll(async () => Number(await page.locator('#points').textContent())).toBeGreaterThanOrEqual(4);
  expect(Number(await page.locator('#points').textContent())).toBeLessThanOrEqual(6);
});

// Bug corrigé en v5.8 : une longue formule (niveau Expert) ou la case de réponse élargissaient le panneau,
// et la page défilait de côté sur ordinateur.
test('formule Expert : la page ne défile jamais de côté', async ({ page }) => {
  await versMaths(page);
  // v7.0 : au moins 4 nombres ; les centaines donnent les formules les plus longues.
  await maths(page, { signes: ['plus', 'moins', 'fois', 'divise'], nombres: [], centaines: [600, 700, 800, 900], niveau: 'expert' });
  await lancer(page);
  await page.getByRole('button', { name: 'Piocher une carte' }).click();
  await expect(page.locator('#carte-mot')).toHaveText(/^\d+(\s[+−×÷]\s\d+){1,4}\s=\s\?$/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
  await page.getByLabel('Ta réponse').fill('12345678901234567890');
  await page.getByRole('button', { name: 'Valider' }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
});

// v6.1 : un calcul faux attend « J'ai compris » avant le dé FAIBLE.
test('calcul faux : la correction reste à l\'écran jusqu\'à « J\'ai compris »', async ({ page }) => {
  await rapide(page, { autoDe: 50 });
  page.__rapide = true;
  await versMaths(page);
  await maths(page, { signes: ['fois'], nombres: [3] });
  await lancer(page);
  await page.getByRole('button', { name: 'Piocher une carte' }).click();
  await page.getByLabel('Ta réponse').fill('1000');
  await page.getByRole('button', { name: 'Valider' }).click();
  await expect(page.locator('#carte-reponse')).toContainText('La bonne réponse est');
  await page.waitForTimeout(400);
  expect(Number(await page.locator('#points').textContent())).toBe(0);
  await page.getByRole('button', { name: 'J’ai compris' }).click();
  await expect.poll(async () => Number(await page.locator('#points').textContent())).toBeGreaterThanOrEqual(1);
});

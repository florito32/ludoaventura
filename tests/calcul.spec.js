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

  test('le nombre de signes choisi (jusqu\'au maximum du niveau) ; seulement les signes et nombres choisis ; résultat ≥ 0 à une décimale au plus', () => {
    const attendus = { facile: 1, moyen: 2, difficile: 3, expert: 4 };
    for (const [niveau, n] of Object.entries(attendus)) {
      for (let i = 0; i < 300; i++) {
        const c = K.generer({ signes: ['plus', 'moins', 'fois', 'divise'], nombres: [2, 5, 7, 10], niveau, nbSignes: [n] });
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
  await expect(page.locator('#niveau-maths-aide')).toHaveText('Moyen : les nombres de 1 à 99, jusqu’à 2 signes.');
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

// v6.12 : signes seuls dans des ronds, « Tout sélectionner ». v6.14 (04/11/2026) : le niveau décide des groupes
// de nombres (Facile : unités ; Moyen : + dizaines ; Difficile : + centaines ; Expert : + « 1000+ ») et des
// nombres de signes proposés (1 ; 1–2 ; 1–3 ; 1–4, plusieurs possibles).
test('le niveau montre les groupes de nombres et les nombres de signes possibles ; « Tout sélectionner »', async ({ page }) => {
  await versMaths(page);
  await page.locator('#matieres input[value="maths"]').check();
  const visibles = async (sel) => (await page.locator(sel).evaluateAll((l) => l.filter((e) => e.offsetParent).map((e) => e.textContent.trim())));
  for (const [niveau, nb] of [['facile', ['1']], ['moyen', ['1', '2']], ['difficile', ['1', '2', '3']], ['expert', ['1', '2', '3', '4']]]) {
    await page.locator('#niveau-maths input[value="' + niveau + '"]').check();
    expect(await visibles('#nb-signes .pack')).toEqual(nb);
  }
  // Moyen : 1 et 2 signes cochés ; les dizaines apparaissent, pas les centaines ni « 1000+ ».
  await page.locator('#niveau-maths input[value="moyen"]').check();
  await page.locator('#nb-signes input[value="2"]').check();
  expect(await page.evaluate(() => window.Aventura.partie.maths[0].nbSignes)).toEqual([1, 2]);
  await valider(page);
  await expect(page.locator('#signes .pack span')).toHaveText(['+', '−', '×', '÷']);
  await expect(page.getByRole('checkbox', { name: 'Diviser' })).toHaveCount(1);
  await expect(page.locator('#nombres')).toBeVisible();
  await expect(page.locator('#dizaines')).toBeVisible();
  await expect(page.locator('#dizaines-titre')).toContainText('30 = de 30 à 39');
  await expect(page.locator('#centaines')).toBeHidden();
  await expect(page.locator('#milliers')).toBeHidden();
  // Il faut un signe et au moins un nombre (plus de minimum de 4).
  await page.locator('#signes input[value="fois"]').check();
  await valider(page);
  await expect(page.locator('#packs-alerte')).toHaveText('Léa (Joueur 1) doit choisir au moins un nombre.');
  for (const [g, nb] of [['nombres', 10], ['dizaines', 9]]) {
    const nom = { nombres: 'unités', dizaines: 'dizaines' }[g];
    await page.getByRole('button', { name: 'Tout sélectionner : ' + nom }).click();
    await expect(page.locator('#' + g + ' input:checked')).toHaveCount(nb);
    await page.getByRole('button', { name: 'Tout désélectionner : ' + nom }).click();
    await expect(page.locator('#' + g + ' input:checked')).toHaveCount(0);
  }
  await page.locator('#dizaines input[value="50"]').check();
  await valider(page);
  await expect(page.getByRole('button', { name: 'Lancer la partie' })).toBeVisible();
  // Retour : Expert montre « 1000+ » ; le nombre de signes 2 reste coché.
  await page.getByRole('button', { name: /Retour/ }).click();
  await page.getByRole('button', { name: /Retour/ }).click();
  await page.locator('#niveau-maths input[value="expert"]').check();
  await expect(page.locator('#nb-signes input[value="2"]')).toBeChecked();
  await valider(page);
  await expect(page.locator('#centaines')).toBeVisible();
  await expect(page.locator('#milliers .pack span')).toHaveText('1000+');
});

test('logique : un nombre de chaque groupe choisi ; groupes différents s\'il y a peu de nombres ; 1000+', () => {
  test.skip(test.info().project.name !== 'ordinateur', 'test de logique : un seul format suffit');
  const vus = new Set();
  for (let i = 0; i < 400; i++) {
    // Moyen, 1 signe, tables 7, 8 et 50 → 7 × 54 ou 8 × 56, jamais 7 × 8.
    const a = K.generer({ niveau: 'moyen', nbSignes: [1], signes: ['fois'], nombres: [7, 8], dizaines: [50] });
    expect(a.nombres).toHaveLength(2);
    expect(a.nombres.filter((x) => x >= 50 && x <= 59)).toHaveLength(1);
    expect(a.nombres.filter((x) => x === 7 || x === 8)).toHaveLength(1);
    // Difficile, 3 signes, 2, 30 et 500 → un nombre de chaque groupe au moins (2 + 35 × 520…), jamais 2 × 2 × 2.
    const b = K.generer({ niveau: 'difficile', nbSignes: [3], signes: ['plus', 'fois'], nombres: [2], dizaines: [30], centaines: [500] });
    expect(b.operations).toHaveLength(3);
    expect(b.nombres).toContain(2);
    expect(b.nombres.some((x) => x >= 30 && x <= 39)).toBe(true);
    expect(b.nombres.some((x) => x >= 500 && x <= 599)).toBe(true);
    // Difficile, 1 signe avec 3 groupes : 2 nombres de groupes différents.
    const c = K.generer({ niveau: 'difficile', nbSignes: [1], signes: ['plus'], nombres: [2], dizaines: [30], centaines: [500] });
    const [x, y] = c.nombres.map((n) => (n >= 500 ? 'c' : n >= 30 ? 'd' : 'u'));
    expect(x).not.toBe(y);
    // Plusieurs nombres de signes : chaque carte en prend un.
    const d = K.generer({ niveau: 'expert', nbSignes: [2, 3], signes: ['plus'], nombres: [4], milliers: [1000] });
    expect([2, 3]).toContain(d.operations.length);
    vus.add(d.operations.length);
    expect(d.nombres.some((n) => n >= 1000 && n <= 9999)).toBe(true);
    // Groupes au-dessus du niveau ignorés : centaines cochées mais niveau Moyen.
    const e = K.generer({ niveau: 'moyen', nbSignes: [2], signes: ['plus'], nombres: [3], centaines: [300] });
    for (const n of e.nombres) expect(n).toBe(3);
  }
  expect(vus).toEqual(new Set([2, 3]));
  expect(K.choixSignes('difficile')).toEqual([1, 2, 3]);
  expect(K.groupes('moyen').map((g) => g.id)).toEqual(['nombres', 'dizaines']);
  expect(K.groupes('expert').map((g) => g.id)).toEqual(['nombres', 'dizaines', 'centaines', 'milliers']);
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
  await maths(page, { signes: ['plus', 'fois'], nombres: [2, 3], niveau: 'moyen', nbSignes: [2] });
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
  await maths(page, { signes: ['plus'], nombres: [1], niveau: 'expert', nbSignes: [3, 4] });
  await page.getByRole('button', { name: 'Mêmes réglages pour tous' }).click();
  const p = await page.evaluate(() => window.Aventura.partie);
  for (let k = 1; k < 3; k++) {
    expect(p.matiere[k]).toBe('maths');
    expect(p.maths[k]).toEqual({ signes: ['plus'], nbSignes: [3, 4], nombres: [1], dizaines: [], centaines: [], milliers: [], niveau: 'expert' });
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
  await maths(page, { signes: ['plus', 'moins', 'fois', 'divise'], nombres: [], centaines: [600, 700, 800, 900], milliers: [1000], niveau: 'expert', nbSignes: [4] });
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

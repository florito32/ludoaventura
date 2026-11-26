// v10.49 (demande du 24/11/2026, backlog lignes 512 à 517) : « Évaluer » une matière.
// 10 questions sans plateau, niveau 1 à 100 qui suit les réponses (pas décroissant), progression donnée à toutes les
// sous-matières : celles qui sont plus basses montent, celles qui sont plus hautes demandent au joueur (garder / prendre).
const { test, expect } = require('@playwright/test');
const { rapide, ouvrirNeuf } = require('./aide');
const E = require('../js/evaluation.js');
const J = require('../js/joueurs.js');

// ---------- Règle des niveaux (logique pure) ----------
// Joue une évaluation avec une suite de réponses ; renvoie les niveaux demandés et la progression trouvée.
function jouer(reponses) {
  const e = E.nouvelle();
  const niveaux = [];
  for (const juste of reponses) { niveaux.push(E.poser(e)); E.repondre(e, juste); }
  return { niveaux, e, progression: E.terminee(e) ? E.progression(e) : null };
}

test('questions 1 à 3 : facile (15), moyenne (50), difficile (85) quelles que soient les réponses @smoke', () => {
  expect(jouer([true, true, true]).niveaux.slice(0, 3)).toEqual([15, 50, 85]);
  expect(jouer([false, false, false]).niveaux.slice(0, 3)).toEqual([15, 50, 85]);
});

test('exemple validé par l’utilisateur : ✓ ✓ ✗ puis ✓ ✗ ✓ ✗ ✓ ✗ ✓ → niveaux 68, 83, 73, 80, 75, 78, 76 et progression 77', () => {
  const r = jouer([true, true, false, true, false, true, false, true, false, true]);
  expect(r.niveaux).toEqual([15, 50, 85, 68, 83, 73, 80, 75, 78, 76]);
  expect(r.progression).toBe(77);
});

test('question 4 : milieu entre le dernier niveau réussi (sans faute depuis le bas) et le premier niveau raté', () => {
  const q4 = (a, b, c) => { const e = E.nouvelle(); [a, b, c].forEach((x) => { E.poser(e); E.repondre(e, x); }); return E.poser(e); };
  expect(q4(true, true, false)).toBe(68);   // entre 50 et 85
  expect(q4(true, false, false)).toBe(33);  // entre 15 et 50
  expect(q4(false, false, false)).toBe(8);  // entre 0 et 15
  expect(q4(true, true, true)).toBe(93);    // entre 85 et 100
  expect(q4(true, false, true)).toBe(33);   // la réussite de la 3e après une faute à la 2e ne compte pas (chance possible)
});

test('les pas diminuent (15, 10, 7, 5, 3, 2), les niveaux restent entre 1 et 100', () => {
  expect(E.PAS).toEqual([15, 10, 7, 5, 3, 2, 1]);
  const haut = jouer(Array(10).fill(true));
  expect(Math.max(...haut.niveaux)).toBeLessThanOrEqual(100);
  expect(haut.progression).toBe(100);
  const bas = jouer(Array(10).fill(false));
  expect(Math.min(...bas.niveaux)).toBeGreaterThanOrEqual(1);
  expect(bas.progression).toBe(1);
});

test('une évaluation compte 10 questions : terminée seulement après la 10e réponse', () => {
  const e = E.nouvelle();
  for (let k = 0; k < 9; k++) { E.poser(e); E.repondre(e, true); }
  expect(E.terminee(e)).toBe(false);
  E.poser(e);
  expect(E.terminee(e)).toBe(false);
  E.repondre(e, false);
  expect(E.terminee(e)).toBe(true);
  expect(E.reussies(e)).toBe(9);
});

test('plan : plus bas → monte, plus haut → demande, pareil → inchangé', () => {
  const subs = [{ id: 'a', nom: 'A' }, { id: 'b', nom: 'B' }, { id: 'c', nom: 'C' }];
  const p = E.plan({ a: 10, b: 90, c: 50 }, subs, 50);
  expect(p.map((x) => x.action)).toEqual(['monte', 'demande', 'egal']);
  expect(p[0]).toMatchObject({ actuel: 10, propose: 50 });
});

// ---------- Joueurs : fixer un niveau et le fusionner ----------
test('fixerScore baisse un niveau et date la décision ; la fusion garde la décision la plus récente', () => {
  const etat = { joueurs: [] };
  const { joueur } = J.creer(etat, 'Léa', 'lea', new Date('2026-11-01T10:00:00Z'));
  J.ajouterPoints(etat, joueur.id, 'maths', 'calcul', 85, new Date('2026-11-02T10:00:00Z'));
  const ancien = JSON.parse(JSON.stringify(joueur)); // l'autre appareil, resté à 85
  expect(J.fixerScore(etat, joueur.id, 'maths', 'calcul', 40, new Date('2026-11-24T10:00:00Z'))).toBe(40);
  expect(joueur.niv['maths.calcul']).toBe(40);
  expect(joueur.nivT['maths.calcul']).toBe('2026-11-24T10:00:00.000Z');
  expect(J.fixerScore(etat, joueur.id, 'maths', 'inconnue', 40)).toBe(-1);
  // Sans la date, le « plus haut des deux » rendrait 85 : avec elle, 40 reste.
  expect(J.fusionner([joueur], [ancien])[0].niv['maths.calcul']).toBe(40);
  expect(J.fusionner([ancien], [joueur])[0].niv['maths.calcul']).toBe(40);
  // Sans décision datée, la règle d'avant ne change pas : le plus haut des deux.
  const a = { id: 'j-1', nom: 'A', perso: 'lea', maj: '1', niv: { 'maths.calcul': 10 } }, b = { id: 'j-1', nom: 'A', perso: 'lea', maj: '2', niv: { 'maths.calcul': 30 } };
  const f = J.fusionner([a], [b])[0];
  expect(f.niv['maths.calcul']).toBe(30);
  expect(f.nivT).toBeUndefined();
});

// ---------- Parcours complet dans le navigateur ----------
const JOUEUR = (niv) => ({ id: 'j-1', nom: 'Léa', perso: 'lea', cree: '2026-11-01T00:00:00Z', maj: '2026-11-01T00:00:00Z', niv });
async function ouvrirCompte(page, niv) {
  await rapide(page, { autoDe: 60, pause: 60 });
  await page.addInitScript((j) => {
    try { localStorage.setItem('ludo-vu', '1'); if (!localStorage.getItem('ludoaventura-etoiles')) localStorage.setItem('ludoaventura-etoiles', JSON.stringify({ v: 1, total: 0, joueurs: [j] })); } catch (x) { /* */ }
  }, JOUEUR(niv));
  await ouvrirNeuf(page);
  await page.locator('#btn-compte').click();
  await page.locator('.joueur-carte').first().getByRole('button', { name: 'Statistiques' }).click();
}
const enregistre = (page) => page.evaluate(() => { const e = JSON.parse(localStorage.getItem('ludoaventura-etoiles')); return { niv: e.joueurs[0].niv, nivT: e.joueurs[0].nivT || {}, st: e.joueurs[0].st || {}, total: e.total }; });
// Répond à la question affichée (calcul ou problème de Maths) : juste, ou volontairement faux ; renvoie le niveau demandé.
async function repondreMaths(page, juste) {
  await page.locator('#reponse-joueur').waitFor({ state: 'visible' });
  const niveau = await page.evaluate(() => window.Aventura.partie.eval.niveau);
  const texte = await page.evaluate((j) => { const r = window.Aventura.partie.carte.resultat; return String(j ? r : r + 7).replace('.', ','); }, juste);
  await page.locator('#reponse-joueur').fill(texte);
  await page.locator('#btn-valider-reponse').click();
  if (!juste) await page.getByRole('button', { name: /J.ai compris/ }).click();
  return niveau;
}
async function evaluerMaths(page, reponses) {
  await page.locator('.joueur-carte').first().getByRole('button', { name: /^Évaluer Maths/ }).click();
  await expect(page.locator('#eval-compte')).toHaveText('Question 1 sur 10');
  const niveaux = [];
  for (let k = 0; k < reponses.length; k++) {
    await expect(page.locator('#eval-compte')).toHaveText('Question ' + (k + 1) + ' sur 10');
    niveaux.push(await repondreMaths(page, reponses[k]));
  }
  return niveaux;
}

test('Évaluer Maths : 10 questions sans plateau, niveaux 15 / 50 / 85 puis ajustés, progression donnée aux deux sous-matières', async ({ page }) => {
  await ouvrirCompte(page, {});
  // Chaque matière a son bouton « Évaluer » (4 matières).
  await expect(page.locator('.joueur-carte').first().getByRole('button', { name: /^Évaluer / })).toHaveCount(4);
  const reponses = [true, true, false, true, false, true, false, true, false, true];
  await page.locator('.joueur-carte').first().getByRole('button', { name: /^Évaluer Maths/ }).click();
  // Sans plateau : le plateau est caché, la question et le numéro sont là.
  await expect(page.locator('#plateau')).toBeHidden();
  await expect(page.locator('#eval-titre')).toHaveText('Évaluation · Maths · Léa');
  const niveaux = [];
  for (let k = 0; k < reponses.length; k++) {
    await expect(page.locator('#eval-compte')).toHaveText('Question ' + (k + 1) + ' sur 10');
    niveaux.push(await repondreMaths(page, reponses[k]));
  }
  expect(niveaux).toEqual([15, 50, 85, 68, 83, 73, 80, 75, 78, 76]);
  // Bilan : 6 réussies sur 10, progression 77 ; les deux sous-matières (à 0) montent d'office.
  await expect(page.locator('#eval-fin')).toBeVisible();
  await expect(page.locator('#eval-fin-texte')).toContainText('6 questions sur 10');
  await expect(page.locator('#eval-fin-texte')).toContainText('77 sur 100');
  await expect(page.locator('#eval-fin-liste li.monte')).toHaveCount(2);
  await page.getByRole('button', { name: 'Enregistrer ma progression' }).click();
  // On revient sur Mon compte, statistiques ouvertes.
  await expect(page.locator('#ecran-compte')).toBeVisible();
  const s = await enregistre(page);
  expect(s.niv).toEqual({ 'maths.calcul': 77, 'maths.probleme': 77 });
  // Ni étoiles, ni statistiques de parties, ni point de niveau en plus.
  expect(s.total).toBe(0);
  expect(s.st).toEqual({});
  await expect(page.locator('.joueur-carte').first().locator('.jm.m-maths .jm-val')).toContainText('Niv. 8');
});

test('Évaluer : une sous-matière déjà plus haute demande « garder » ou « prendre », les plus basses montent', async ({ page }) => {
  await ouvrirCompte(page, { 'maths.calcul': 90, 'maths.probleme': 20 });
  // Progression trouvée : 77. Calcul (90) est plus haut : on demande ; problèmes (20) est plus bas : il monte tout seul.
  await evaluerMaths(page, [true, true, false, true, false, true, false, true, false, true]);
  await expect(page.locator('#eval-fin')).toBeVisible();
  await expect(page.locator('#eval-fin-liste li.monte')).toHaveCount(1);       // problèmes : 20 → 77
  await expect(page.locator('#eval-fin-liste li.demande')).toHaveCount(1);     // calcul : 90 > 77
  await expect(page.locator('#eval-fin-liste li.demande legend')).toContainText('déjà à 90');
  // Par défaut on garde le niveau déjà acquis.
  await expect(page.locator('#eval-fin-liste li.demande input[value="garder"]')).toBeChecked();
  await page.getByRole('button', { name: 'Enregistrer ma progression' }).click();
  await expect(page.locator('#ecran-compte')).toBeVisible();
  const s = await enregistre(page);
  expect(s.niv).toEqual({ 'maths.calcul': 90, 'maths.probleme': 77 });
  expect(s.nivT).toEqual({});
});

test('Évaluer : « Passer à » baisse la sous-matière plus haute, et la décision est datée', async ({ page }) => {
  await ouvrirCompte(page, { 'maths.calcul': 90, 'maths.probleme': 90 });
  await evaluerMaths(page, [true, true, false, true, false, true, false, true, false, true]);
  await expect(page.locator('#eval-fin-liste li.demande')).toHaveCount(2);
  await page.locator('#eval-fin-liste li.demande').first().locator('input[value="prendre"]').check();
  await page.getByRole('button', { name: 'Enregistrer ma progression' }).click();
  await expect(page.locator('#ecran-compte')).toBeVisible();
  const s = await enregistre(page);
  expect(s.niv).toEqual({ 'maths.calcul': 77, 'maths.probleme': 90 });
  expect(Object.keys(s.nivT)).toEqual(['maths.calcul']);
});

test('Évaluer : « Ne rien enregistrer » laisse la progression comme elle était', async ({ page }) => {
  await ouvrirCompte(page, { 'maths.calcul': 30 });
  await evaluerMaths(page, Array(10).fill(false));
  await expect(page.locator('#eval-fin-texte')).toContainText('0 question sur 10');
  await page.getByRole('button', { name: 'Ne rien enregistrer' }).click();
  const s = await enregistre(page);
  expect(s.niv).toEqual({ 'maths.calcul': 30 });
});

test('Évaluer : « Quitter l’évaluation » demande confirmation et n’enregistre rien', async ({ page }) => {
  await ouvrirCompte(page, { 'maths.calcul': 30 });
  await page.locator('.joueur-carte').first().getByRole('button', { name: /^Évaluer Maths/ }).click();
  await repondreMaths(page, true);
  await page.getByRole('button', { name: 'Quitter l’évaluation' }).click();
  await expect(page.locator('#dlg-confirmer')).toBeVisible();
  await page.getByRole('button', { name: 'Oui, quitter' }).click();
  await expect(page.locator('#ecran-accueil')).toBeVisible();
  expect((await enregistre(page)).niv).toEqual({ 'maths.calcul': 30 });
});

test('Évaluer : l’écran ne déborde pas (plateau caché, question visible) sur les 4 formats', async ({ page }) => {
  await ouvrirCompte(page, {});
  await page.locator('.joueur-carte').first().getByRole('button', { name: /^Évaluer Maths/ }).click();
  await page.locator('#reponse-joueur').waitFor({ state: 'visible' });
  const m = await page.evaluate(() => {
    const d = document.documentElement, r = document.querySelector('#eval-entete').getBoundingClientRect(), v = document.querySelector('#carte-piochee').getBoundingClientRect();
    return { debordeX: d.scrollWidth > d.clientWidth + 1, enteteVisible: r.width > 0 && r.left >= 0 && r.right <= window.innerWidth + 1, carteDansEcran: v.left >= -1 && v.right <= window.innerWidth + 1 };
  });
  expect(m.debordeX).toBe(false);
  expect(m.enteteVisible).toBe(true);
  expect(m.carteDansEcran).toBe(true);
});

test('Évaluer : chaque matière (Français, Maths, Histoire, Géographie) pose ses 10 questions sans erreur, du niveau demandé à ±2', async ({ page }) => {
  const erreurs = [];
  page.on('pageerror', (e) => erreurs.push(e.message));
  await ouvrirCompte(page, { 'maths.calcul': 10 });
  for (const m of ['Français', 'Maths', 'Histoire', 'Géographie']) {
    await page.locator('.joueur-carte').first().getByRole('button', { name: new RegExp('^Évaluer ' + m) }).click();
    await expect(page.locator('#eval-compte')).toHaveText('Question 1 sur 10');
    await expect(page.locator('#carte-piochee')).toBeVisible();
    // La partie « évaluation » ne touche ni aux étoiles ni aux statistiques, et ne se reprend pas après un rechargement.
    expect(await page.evaluate(() => !!window.Aventura.partie.eval && window.Aventura.partie.eval.niveau)).toBe(15);
    await page.reload();
    await expect(page.locator('#ecran-accueil')).toBeVisible();
    await page.locator('#btn-compte').click();
    await page.locator('.joueur-carte').first().getByRole('button', { name: 'Statistiques' }).click();
  }
  expect(erreurs).toEqual([]);
});

// v10.39 (demande du 24/11/2026, règles 4, 5 et 6) : quand la progression du profil bouge, et quand elle ne bouge pas.
//  4. un défi du jour, même gagné, ne fait pas bouger la progression ;
//  5. une aventure réussie fait gagner +1 point dans la sous-matière jouée, selon la part individuelle du joueur ;
//  6. une partie ratée ne fait pas bouger la progression (à plusieurs : le +1 suit la part individuelle, l'équipe ne compte pas ;
//     les étoiles, elles, suivent la réussite de la partie).
// Les parties sont « fabriquées » (points posés dans l'historique, partie à l'état « fin »), puis la page est rechargée.
const { test, expect } = require('@playwright/test');
const { rapide, ouvrirNeuf, lancerDefiJour, suivreMaProgression } = require('./aide');

const JOUEURS = [
  { id: 'j-1', nom: 'Léa', perso: 'lea', cree: '2026-11-01T00:00:00Z', maj: '2026-11-01T00:00:00Z', niv: { 'maths.calcul': 40, 'maths.probleme': 40 } },
  { id: 'j-2', nom: 'Hugo', perso: 'tom', cree: '2026-11-01T00:00:00Z', maj: '2026-11-01T00:00:00Z', niv: { 'maths.calcul': 10, 'maths.probleme': 10 } }
];
async function ouvrir(page) {
  await rapide(page);
  await page.addInitScript((j) => {
    try { localStorage.setItem('ludo-vu', '1'); if (!localStorage.getItem('ludoaventura-etoiles')) localStorage.setItem('ludoaventura-etoiles', JSON.stringify({ v: 1, total: 0, joueurs: j })); } catch (x) { /* */ }
  }, JOUEURS);
  await ouvrirNeuf(page);
}
const niveaux = (page) => page.evaluate(() => {
  const e = JSON.parse(localStorage.getItem('ludoaventura-etoiles'));
  return Object.fromEntries(e.joueurs.map((j) => [j.id, { niv: j.niv, st: j.st || {} }]));
});
// Lance une aventure en « Suivre ma progression » (Maths) avec n joueurs, puis la fabrique : points[i] récoltés par chaque joueur.
async function aventureFabriquee(page, n, points) {
  await page.getByRole('button', { name: 'Commencer l\'aventure' }).click();
  await suivreMaProgression(page, 0, 'maths');
  for (let k = 1; k < n; k++) {
    await page.locator('[data-ajouter]').click();
    await page.locator('.cj-profil[data-choisir]:not([disabled])').first().click();
    await suivreMaProgression(page, k, 'maths');
  }
  await page.getByRole('button', { name: 'Choisir l\'aventure' }).click();
  await page.getByRole('radio', { name: /^Viking/ }).check();
  await page.getByRole('button', { name: 'Lancer la partie' }).click();
  await page.getByRole('heading', { name: 'Le plateau' }).waitFor();
  await page.evaluate((pts) => {
    const p = window.Aventura.partie, r = p.regles;
    p.joueurs.forEach((j) => { j.sous = { 'maths.calcul': 3 }; });
    r.historique = pts.map((x, i) => ({ manche: 1, joueur: i, de: 'fort', points: x }));
    r.points = pts.reduce((t, x) => t + x, 0); r.etape = 'fin';
  }, points);
  await page.reload();
  await expect(page.locator('#fin')).toBeVisible();
}
const objectif = (page) => page.evaluate(() => window.Aventura.partie.regles.objectif);

test('règle 6 : une aventure ratée en solo ne change pas la progression du profil', async ({ page }) => {
  await ouvrir(page);
  await aventureFabriquee(page, 1, [0]);
  await expect(page.locator('#fin-titre')).toHaveText('Aventure manquée…');
  const n = await niveaux(page);
  expect(n['j-1'].niv).toEqual({ 'maths.calcul': 40, 'maths.probleme': 40 });
});

test('règle 5 : une aventure réussie en solo fait gagner 1 point dans la sous-matière jouée', async ({ page }) => {
  await ouvrir(page);
  await aventureFabriquee(page, 1, [999]);
  await expect(page.locator('#fin-titre')).toHaveText('Aventure réussie !');
  const n = await niveaux(page);
  expect(n['j-1'].niv).toEqual({ 'maths.calcul': 41, 'maths.probleme': 40 });
});

test('règles 5 et 6 à deux : le point suit la part de chacun (objectif ÷ 2) ; équipe ratée : étoiles perdues, point gardé', async ({ page }) => {
  await ouvrir(page);
  await page.getByRole('button', { name: 'Commencer l\'aventure' }).click();
  await suivreMaProgression(page, 0, 'maths');
  await page.locator('[data-ajouter]').click();
  await page.locator('.cj-profil[data-choisir]:not([disabled])').first().click();
  await suivreMaProgression(page, 1, 'maths');
  await page.getByRole('button', { name: 'Choisir l\'aventure' }).click();
  await page.getByRole('radio', { name: /^Viking/ }).check();
  await page.getByRole('button', { name: 'Lancer la partie' }).click();
  await page.getByRole('heading', { name: 'Le plateau' }).waitFor();
  const obj = await objectif(page);
  // Léa atteint sa part (obj ÷ 2), Hugo non : l'équipe (total < obj) rate l'aventure.
  await page.evaluate((o) => {
    const p = window.Aventura.partie, r = p.regles;
    p.joueurs.forEach((j) => { j.sous = { 'maths.calcul': 3 }; });
    r.historique = [{ manche: 1, joueur: 0, de: 'fort', points: Math.ceil(o / 2) }, { manche: 1, joueur: 1, de: 'fort', points: 1 }];
    r.points = Math.ceil(o / 2) + 1; r.etape = 'fin';
  }, obj);
  await page.reload();
  await expect(page.locator('#fin-titre')).toHaveText('Aventure manquée…');
  const n = await niveaux(page);
  const [a, b] = JOUEURS.map((j) => n[j.id].niv);
  expect(a['maths.calcul']).toBe(41); // Léa a atteint sa part : +1 (choix de l'utilisateur, 24/11/2026)
  expect(b['maths.calcul']).toBe(10); // Hugo n'a pas atteint sa part : rien
  // Les étoiles suivent la réussite de la partie : perdue, personne n'en reçoit.
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('ludoaventura-etoiles')).total)).toBe(0);
});

test('règle 4 : un défi du jour, même gagné, ne fait pas bouger la progression', async ({ page }) => {
  await ouvrir(page);
  await lancerDefiJour(page, 1);
  await page.getByRole('heading', { name: 'Défi solo du jour' }).waitFor();
  await page.evaluate(() => {
    const p = window.Aventura.partie, r = p.regles;
    p.joueurs[0].sous = { 'maths.calcul': 3 };
    r.historique = [{ manche: 1, joueur: 0, de: 'fort', points: r.objectif }];
    r.points = r.objectif; r.etape = 'fin';
  });
  await page.reload();
  await expect(page.locator('#fin-titre')).toHaveText('Aventure réussie !');
  const n = await niveaux(page);
  expect(n['j-1'].niv).toEqual({ 'maths.calcul': 40, 'maths.probleme': 40 });
  expect(n['j-1'].st).toEqual({}); // pas de statistique de partie non plus
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('ludoaventura-etoiles')).total)).toBeGreaterThan(0); // mais les étoiles ×3
});

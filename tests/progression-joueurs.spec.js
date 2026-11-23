// v10.31 (backlog 447, 453, 454) : étoiles, pierres précieuses et coffres joueur par joueur.
const { test, expect } = require('@playwright/test');
const { rapide, lancerPartie, repondre, lancerLeDe, versCarte } = require('./aide');
const J = require('../js/joueurs.js');
const C = require('../js/compte.js');

test.describe('modèle de données (logique)', () => {
  test.beforeEach(() => test.skip(test.info().project.name !== 'ordinateur', 'test de logique : un seul format suffit'));

  test('l\'ancienne progression du compte passe au Joueur 1 (j-1) ; la racine reste la somme des joueurs', () => {
    const etat = { v: 1, total: 42, gemmes: 3, journal: [{ quand: '2026-11-16T10:00:00Z', type: 'partie', n: 42 }], joueurs: [J.creerPremier ? J.creerPremier() : { id: 'j-1', nom: 'Joueur 1', perso: 'lea', niv: {} }] };
    J.migrer(etat);
    const j1 = J.trouver(etat, 'j-1');
    expect(j1.prog.total).toBe(42);
    expect(j1.prog.gemmes).toBe(3);
    expect(j1.prog.journal).toHaveLength(1);
    j1.prog.total += 8;
    const j2 = { id: 'j-2', nom: 'Tom', perso: 'tom', niv: {}, prog: J.progVide() };
    j2.prog.total = 5;
    etat.joueurs.push(j2);
    J.agreger(etat);
    expect(etat.total).toBe(55);
  });

  test('la fusion avec le compte se fait joueur par joueur : les gains de chacun s\'ajoutent sans se mélanger', () => {
    const mk = (a, b) => ({ v: 1, total: a + b, gemmes: 0, joueurs: [
      { id: 'j-1', nom: 'Léa', perso: 'lea', niv: {}, prog: { ...J.progVide(), total: a } },
      { id: 'j-2', nom: 'Tom', perso: 'tom', niv: {}, prog: { ...J.progVide(), total: b } }] });
    const base = { total: 20, gemmes: 0, joueurs: { 'j-1': { total: 10, gemmes: 0 }, 'j-2': { total: 10, gemmes: 0 } } };
    // Appareil : Léa 10 → 15 (+5). Compte : Tom 10 → 18 (+8).
    const r = C.fusionner(mk(15, 10), mk(10, 18), base);
    expect(J.trouver(r, 'j-1').prog.total).toBe(15);
    expect(J.trouver(r, 'j-2').prog.total).toBe(18);
    expect(r.total).toBe(33);
  });
});

async function jouerJusquALaFin(page) {
  const suite = page.getByRole('button', { name: /^(Première question|Question suivante)$/ });
  for (let t = 0; t < 14; t++) {
    await suite.or(page.locator('#fin[open]')).first().waitFor();
    if (await page.locator('#fin').isVisible()) return;
    await suite.click();
    await repondre(page, true);
    await lancerLeDe(page);
  }
}

test('fin de partie à 2 : chaque joueur reçoit ses propres étoiles, visibles seulement dans sa carte de Mon compte @smoke', async ({ page }) => {
  await rapide(page);
  await page.addInitScript(() => { try { localStorage.setItem('ludo-vu', '1'); } catch (e) { /* */ } });
  await lancerPartie(page, { joueurs: 2 });
  await jouerJusquALaFin(page);
  const gagnee = await page.locator('#fin-etoiles ul.fin-etoiles-joueurs').count();
  test.skip(!gagnee, 'partie non gagnée : aucun gain à comparer');
  const lignes = page.locator('#fin-etoiles .fin-etoiles-joueurs > li');
  await expect(lignes).toHaveCount(2);
  const gains = [];
  for (let i = 0; i < 2; i++) gains.push(Number((await lignes.nth(i).locator('.fin-gain strong').textContent()).match(/\d+/)[0]));
  await page.getByRole('button', { name: 'Retour à l’accueil' }).click();
  // Rien de chiffré sur l'accueil.
  await expect(page.locator('#accueil-total, #accueil-badge, #btn-etoiles-haut, #btn-coffre-haut')).toHaveCount(0);
  const c1 = await versCarte(page, 'Léa');
  const c2 = await versCarte(page, 'Tom');
  await expect(c1.locator('.je-ligne')).toContainText(gains[0] + ' étoile');
  await expect(c2.locator('.je-ligne')).toContainText(gains[1] + ' étoile');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
});

test('un autre joueur n\'a rien reçu : sa carte reste à 0 étoile', async ({ page }) => {
  await rapide(page);
  await page.addInitScript(() => { try { localStorage.setItem('ludo-vu', '1'); } catch (e) { /* */ } });
  await page.goto('./');
  await page.evaluate(() => {
    const J = window.Joueurs, c = window.Recompenses.compte;
    J.creer(c.etat, 'Tom', 'tom');
    localStorage.setItem(window.Etoiles.CLE, JSON.stringify(c.etat));
    c.pour('j-1').gagner(12, 'partie', 'test');
  });
  await page.reload();
  const c1 = await versCarte(page);
  await expect(c1.locator('.je-ligne')).toContainText('12 étoiles');
  await expect(page.locator('.joueur-carte').nth(1).locator('.je-ligne')).toContainText('0 étoile');
});

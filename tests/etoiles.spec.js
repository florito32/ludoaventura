// Étoiles, niveaux et coffres (v6.36, demande du 10/11/2026, backlog lignes 164 à 173).
const { test, expect } = require('@playwright/test');
const E = require('../js/etoiles.js');
const { repondre, lancerPartie, lancerLeDe, rapide, ouvrirNeuf } = require('./aide');

// Stockage imité pour les tests de logique.
function memoire() { const m = {}; return { getItem: (k) => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); } }; }
const LE_10 = () => new Date(2026, 10, 10, 10);

test.describe('logique des étoiles', () => {
  test.beforeEach(() => test.skip(test.info().project.name !== 'ordinateur', 'test de logique : un seul format suffit'));

  test('niveaux : 30 étoiles pour le niveau 2, puis 10 de plus à chaque niveau', () => {
    expect([1, 2, 3, 4, 5, 6].map(E.seuil)).toEqual([0, 30, 70, 120, 180, 250]);
    expect(E.niveau(0).niveau).toBe(1);
    expect(E.niveau(29).niveau).toBe(1);
    expect(E.niveau(30).niveau).toBe(2);
    expect(E.niveau(100)).toMatchObject({ niveau: 3, dans: 30, besoin: 50, reste: 20 });
  });

  test('coffre d\'argent tous les 5 niveaux, coffre d\'or tous les 10', () => {
    expect([4, 5, 10, 15, 20, 25].map(E.coffreDuNiveau)).toEqual([null, 'argent', 'or', 'argent', 'or', 'argent']);
    expect(E.prochainCoffre(1)).toBe(5);
    expect(E.prochainCoffre(5)).toBe(10);
  });

  test('coffre du jour : 5 à 20 étoiles, une fois par jour, de nouveau le lendemain', () => {
    let maintenant = LE_10();
    const s = memoire(), c = new E.Compte(s, () => maintenant);
    expect(c.coffresAOuvrir()).toEqual([{ type: 'jour', cle: '2026-11-10' }]);
    expect(c.ouvrir(c.coffresAOuvrir()[0], () => 0).n).toBe(5);
    expect(c.coffresAOuvrir()).toEqual([]);
    expect(c.ouvrir({ type: 'jour', cle: '2026-11-10' }, () => 0)).toBeNull(); // pas deux fois
    maintenant = new Date(2026, 10, 11, 8);
    expect(c.ouvrir(c.coffresAOuvrir()[0], () => 0.9999).n).toBe(20);
    // Gardé dans le stockage : un nouveau compte relit les mêmes étoiles.
    expect(new E.Compte(s, () => maintenant).etat.total).toBe(25);
  });

  test('passer le niveau 5 donne un coffre d\'argent (30 à 60), le niveau 10 un coffre d\'or (80 à 150)', () => {
    const c = new E.Compte(memoire(), LE_10);
    c.ouvrir(c.coffresAOuvrir()[0], () => 0);
    const g = c.gagner(E.seuil(10) - 5, 'partie', 'test');
    expect(g.coffres).toEqual([5, 10]);
    const niveaux = c.coffresAOuvrir();
    expect(niveaux).toEqual([{ type: 'argent', niveau: 5, cle: '5' }, { type: 'or', niveau: 10, cle: '10' }]);
    expect(c.ouvrir(niveaux[0], () => 0).n).toBe(30);
    expect(c.ouvrir(niveaux[1], () => 0.9999).n).toBe(150);
    expect(c.coffresAOuvrir()).toEqual([]);
  });

  test('partie gagnée : 1 étoile par unité, une seule fois ; perdue : rien ; défi : doublé une fois par jour', () => {
    const c = new E.Compte(memoire(), LE_10);
    expect(c.recompenserPartie('a', 18, true, null, 'Viking').gain.n).toBe(18);
    expect(c.recompenserPartie('a', 18, true, null, 'Viking')).toBeNull(); // rechargement de l'écran de fin
    expect(c.recompenserPartie('b', 12, false, null, 'Viking').gain).toBeNull();
    const d = c.recompenserPartie('c', 20, true, 'solo', 'Défi');
    expect(d).toMatchObject({ base: 20, bonus: 20 });
    expect(c.defiDuJour('solo')).toBe(40);
    expect(c.recompenserPartie('d', 20, true, 'solo', 'Défi')).toMatchObject({ base: 20, bonus: 0, defiDejaFait: true });
    expect(c.recompenserPartie('e', 22, true, 'equipe', 'Défi')).toMatchObject({ bonus: 22 });
    expect(c.etat.total).toBe(18 + 40 + 20 + 44);
    expect(c.derniersJours(7).map((j) => j.n)).toEqual([0, 0, 0, 0, 0, 0, 122]);
  });
});

// L'accueil sans la bulle de présentation de Ludo (premier démarrage déjà passé).
async function accueil(page, etoiles) {
  await page.addInitScript((e) => {
    window.AVENTURA_DUREE_COFFRE = 0;
    try { localStorage.setItem('ludo-vu', '1'); if (e && !sessionStorage.getItem('init')) { localStorage.setItem('ludoaventura-etoiles', JSON.stringify(e)); sessionStorage.setItem('init', '1'); } } catch (x) { /* */ }
  }, etoiles || null);
  await page.goto('./');
}

test('accueil : étoiles, niveau et coffre du jour ; le coffre s\'ouvre une fois et les étoiles restent après fermeture @smoke', async ({ page, context }) => {
  await accueil(page);
  const total = page.locator('#accueil-total');
  await expect(total).toHaveText('0');
  await expect(page.locator('#accueil-niveau')).toHaveText('Niveau 1');
  for (const id of ['#btn-etoiles-haut', '#btn-coffre-haut', '#btn-etoiles', '#btn-progression', '#btn-commencer']) {
    await expect(page.locator(id)).toBeInViewport({ ratio: 1 });
  }
  await expect(page.locator('#accueil-badge')).toHaveText('1');
  await page.locator('#btn-coffre-haut').click();
  const coffre = page.getByRole('dialog', { name: 'Coffre du jour' });
  await expect(coffre).toBeVisible();
  await coffre.getByRole('button', { name: 'Ouvrir le coffre' }).click();
  await expect(page.locator('#coffre-gain')).toContainText(/\+\d+ étoiles !/);
  const n = Number((await page.locator('#coffre-gain strong').textContent()).match(/\d+/)[0]);
  expect(n).toBeGreaterThanOrEqual(5); expect(n).toBeLessThanOrEqual(20);
  await coffre.getByRole('button', { name: 'Super !' }).click();
  await expect(coffre).toBeHidden();
  await expect(total).toHaveText(String(n));
  await expect(page.locator('#accueil-badge')).toBeHidden();
  // Fermer et rouvrir le jeu (nouvel onglet) : les étoiles sont gardées sur l'appareil.
  await page.close();
  const p2 = await context.newPage();
  await p2.goto('./');
  await expect(p2.locator('#accueil-total')).toHaveText(String(n));
  await expect(p2.locator('#accueil-badge')).toBeHidden();
});

test('écrans « Mes étoiles » et « Ma progression » : niveau, coffres de niveau, 7 derniers jours ; retour à l\'accueil', async ({ page }) => {
  const auj = await page.evaluate(() => 0).then(() => { const d = new Date(); const z = (x) => (x < 10 ? '0' : '') + x; return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate()); });
  await accueil(page, { v: 1, total: 265, journal: [{ quand: new Date().toISOString(), jour: auj, type: 'partie', n: 18, texte: 'Aventure réussie · Viking' }], parJour: { [auj]: 18 }, coffresJour: {}, coffresNiveau: {}, defis: {}, parties: [] });
  await expect(page.locator('#accueil-niveau')).toHaveText('Niveau 6');
  await expect(page.locator('#accueil-badge')).toHaveText('2'); // coffre du jour + coffre d'argent du niveau 5
  await page.locator('#btn-etoiles').click();
  await expect(page.getByRole('heading', { name: 'Mes étoiles' })).toBeVisible();
  await expect(page.locator('#etoiles-total')).toHaveText('265');
  await expect(page.locator('.chemin-coffres li').first()).toContainText('Niveau 5');
  await expect(page.locator('.journal')).toContainText('Aventure réussie · Viking');
  const largeur = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
  expect(largeur).toBe(true);
  // Ouvrir le coffre d'argent depuis l'écran.
  await page.locator('.chemin-coffres [data-ouvrir]').click();
  await page.getByRole('dialog', { name: /Coffre d’argent/ }).getByRole('button', { name: 'Ouvrir le coffre' }).click();
  const n = Number((await page.locator('#coffre-gain strong').textContent()).match(/\d+/)[0]);
  expect(n).toBeGreaterThanOrEqual(30); expect(n).toBeLessThanOrEqual(60);
  await page.getByRole('button', { name: 'Super !' }).click();
  await expect(page.locator('#etoiles-total')).toHaveText(String(265 + n));
  await expect(page.locator('.chemin-coffres li').first()).toContainText('Ouvert');
  await page.getByRole('button', { name: 'Accueil' }).click();
  await page.locator('#btn-progression').click();
  await expect(page.getByRole('heading', { name: 'Ma progression' })).toBeVisible();
  await expect(page.locator('#progression-jour')).toHaveText('+' + (18 + n));
  await expect(page.locator('.histo li')).toHaveCount(7);
  await expect(page.locator('.taches-jour').first()).toContainText('Coffre du jour');
  // La touche « précédent » du téléphone revient à l'accueil.
  await page.goBack();
  await expect(page.locator('#btn-commencer')).toBeVisible();
});

test('une aventure gagnée rapporte ses unités en étoiles, une seule fois même si on recharge la page', async ({ page }) => {
  await rapide(page);
  await page.addInitScript(() => { try { localStorage.setItem('ludo-vu', '1'); } catch (e) { /* */ } });
  await lancerPartie(page, { joueurs: 1 });
  for (let t = 0; t < 5; t++) {
    await page.getByRole('button', { name: 'Question suivante' }).click();
    await repondre(page, true);
    await lancerLeDe(page);
  }
  const fin = page.locator('#fin');
  await expect(fin).toBeVisible();
  await expect(page.locator('#fin-titre')).toHaveText('Aventure réussie !');
  const pts = await page.evaluate(() => window.Aventura.partie.regles.points);
  await expect(page.locator('#fin-etoiles')).toContainText('+' + pts + ' étoiles');
  expect(await page.evaluate(() => window.Recompenses.compte.etat.total)).toBe(pts);
  await page.reload();
  await expect(page.locator('#fin')).toBeVisible();
  await expect(page.locator('#fin-etoiles')).toContainText('+' + pts + ' étoiles');
  expect(await page.evaluate(() => window.Recompenses.compte.etat.total)).toBe(pts);
});

test('fin de partie : passer le niveau 5 propose d\'ouvrir le coffre d\'argent', async ({ page }) => {
  await rapide(page);
  await page.addInitScript(() => {
    window.AVENTURA_DUREE_COFFRE = 0;
    try { localStorage.setItem('ludo-vu', '1'); if (!localStorage.getItem('ludoaventura-etoiles')) localStorage.setItem('ludoaventura-etoiles', JSON.stringify({ v: 1, total: 175, journal: [], parJour: {}, coffresJour: {}, coffresNiveau: {}, defis: {}, parties: [] })); } catch (e) { /* */ }
  });
  await lancerPartie(page, { joueurs: 1 });
  for (let t = 0; t < 5; t++) {
    await page.getByRole('button', { name: 'Question suivante' }).click();
    await repondre(page, true);
    await lancerLeDe(page);
  }
  await expect(page.locator('#fin-etoiles')).toContainText('Niveau 5 atteint !');
  await page.getByRole('button', { name: 'Ouvrir le coffre d’argent' }).click();
  await page.getByRole('dialog', { name: /Coffre d’argent/ }).getByRole('button', { name: 'Ouvrir le coffre' }).click();
  await expect(page.locator('#coffre-gain')).toContainText(/\+\d+ étoiles/);
});

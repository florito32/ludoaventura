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

  test('coffre simple à chaque niveau (v6.46), argent tous les 5 niveaux, or tous les 10', () => {
    expect([1, 2, 4, 5, 6, 10, 15, 20, 25].map(E.coffreDuNiveau)).toEqual([null, 'simple', 'simple', 'argent', 'simple', 'or', 'argent', 'or', 'argent']);
    expect(E.prochainCoffre(1)).toBe(2);
    expect(E.prochainCoffre(5)).toBe(6);
    expect(E.prochainGrosCoffre(1)).toBe(5);
    expect(E.prochainGrosCoffre(5)).toBe(10);
  });

  test('coffre simple : 10 à 25 étoiles et 1 pierre ; gros coffres : 2 (argent), 3 (or) ; seulement pour les niveaux atteints après la v6.46', () => {
    const c = new E.Compte(memoire(), LE_10);
    expect(c.etat.simplesDepuis).toBe(1);
    const j = c.ouvrir(c.coffresAOuvrir()[0], () => 0);
    expect(j.gemmes).toBe(1);
    c.gagner(E.seuil(3) - 5, 'partie', 'test'); // niveau 3
    expect(c.coffresAOuvrir()).toEqual([{ type: 'simple', niveau: 2, cle: '2' }, { type: 'simple', niveau: 3, cle: '3' }]);
    expect(c.ouvrir(c.coffresAOuvrir()[0], () => 0)).toMatchObject({ n: 10, gemmes: 1, coffre: 'simple' });
    expect(c.ouvrir(c.coffresAOuvrir()[0], () => 0.9999)).toMatchObject({ n: 25, gemmes: 1 });
    expect(c.etat.gemmes).toBe(3);
    // Joueur déjà au niveau 12 avant la v6.46 : pas de coffres simples pour les niveaux passés, seulement les suivants.
    const s = memoire();
    s.setItem(E.CLE, JSON.stringify({ v: 1, total: E.seuil(12), coffresNiveau: { 5: 40, 10: 100 } }));
    const v = new E.Compte(s, LE_10);
    expect(v.etat.simplesDepuis).toBe(12);
    expect(v.coffresAOuvrir().filter((x) => x.niveau)).toEqual([]);
    // simplesDepuis forcé plus haut : le passage de niveau n'annonce pas de coffre simple déjà exclu.
    const w = new E.Compte(memoire(), LE_10); w.etat.simplesDepuis = 20;
    expect(w.gagner(E.seuil(4), 'partie', 'test').coffres).toEqual([]);
    v.gagner(E.seuil(13) - E.seuil(12), 'partie', 'test');
    expect(v.coffresAOuvrir().filter((x) => x.niveau)).toEqual([{ type: 'simple', niveau: 13, cle: '13' }]);
    v.gagner(E.seuil(15) - E.seuil(13), 'partie', 'test');
    const l = v.coffresAOuvrir().filter((x) => x.niveau);
    expect(l.map((x) => x.type)).toEqual(['simple', 'simple', 'argent']);
    v.ouvrir(l[0]); v.ouvrir(l[1]);
    expect(v.ouvrir(l[2]).gemmes).toBe(2);
    expect(v.etat.gemmes).toBe(4);
    // Relu plus tard : le point de départ des coffres simples est gardé.
    expect(new E.Compte(s, LE_10).etat.simplesDepuis).toBe(12);
  });

  test('pierres précieuses : 1 chance sur 3 par partie gagnée, rien si perdue', () => {
    const c = new E.Compte(memoire(), LE_10);
    expect(c.recompenserPartie('a', 10, true, null, 'x', () => 0.1).gemmes).toBe(1);
    expect(c.recompenserPartie('b', 10, true, null, 'x', () => 0.5).gemmes).toBe(0);
    expect(c.recompenserPartie('c', 10, false, null, 'x', () => 0).gemmes).toBe(0);
    expect(c.recompenserPartie('d', 10, true, 'solo', 'x', () => 0.2).gemmes).toBe(1);
    expect(c.etat.gemmes).toBe(2);
    expect(E.CHANCE_GEMME).toBeCloseTo(1 / 3);
    expect(E.GEMMES).toEqual({ jour: 1, simple: 1, argent: 2, or: 3, mega: 5 });
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
    expect(g.coffres).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10]); // v6.46 : un coffre simple à chaque autre niveau
    const niveaux = c.coffresAOuvrir().filter((x) => x.type !== 'simple');
    expect(niveaux).toEqual([{ type: 'argent', niveau: 5, cle: '5' }, { type: 'or', niveau: 10, cle: '10' }]);
    expect(c.ouvrir(niveaux[0], () => 0).n).toBe(30);
    expect(c.ouvrir(niveaux[1], () => 0.9999)).toMatchObject({ n: 150, gemmes: 3 });
    expect(c.coffresAOuvrir().every((x) => x.type === 'simple')).toBe(true);
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

  test('méga coffre (v6.38) : 100 à 200 étoiles chaque fois que le joueur vient 5 jours d\'affilée', () => {
    let maintenant = new Date(2026, 10, 1, 10);
    const lendemain = () => { maintenant = new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate() + 1, 10); };
    const s = memoire(), c = new E.Compte(s, () => maintenant);
    const megas = () => c.coffresAOuvrir().filter((x) => x.type === 'mega');
    for (let j = 1; j <= 4; j++) { expect(c.visite()).toBe(false); expect(c.serie()).toBe(j); lendemain(); }
    expect(c.visite()).toBe(true); // 5e jour d'affilée
    expect(c.visite()).toBe(false); // revenir le même jour ne redonne rien
    expect(megas()).toEqual([{ type: 'mega', cle: '2026-11-05' }]);
    // Pas ouvert le jour même : il reste à ouvrir le lendemain (et la série continue).
    lendemain(); c.visite();
    expect(c.serie()).toBe(6);
    expect(c.versMega()).toMatchObject({ dans: 1, reste: 4 });
    const g = c.ouvrir(megas()[0], () => 0.999);
    expect(g.n).toBe(200);
    expect(g.gemmes).toBe(5); // v6.46 : 5 pierres précieuses dans le méga coffre
    expect(c.ouvrir({ type: 'mega', cle: '2026-11-05' })).toBeNull();
    expect(megas()).toEqual([]);
    expect(c.etat.journal[0]).toMatchObject({ type: 'coffre-mega', n: 200 });
    // Un jour manqué : la série repart de zéro.
    lendemain(); lendemain(); c.visite();
    expect(c.serie()).toBe(1);
    // 10e jour d'affilée : un nouveau méga coffre (gain minimum 100).
    for (let j = 2; j <= 10; j++) { lendemain(); c.visite(); }
    expect(c.serie()).toBe(10);
    expect(megas()).toHaveLength(2);
    expect(c.ouvrir(megas()[0], () => 0).n).toBe(100);
    // Données d'avant la v6.38 (sans visites) : les jours de coffre du jour comptent dans la série.
    const s2 = memoire();
    s2.setItem(E.CLE, JSON.stringify({ v: 1, total: 40, journal: [], parJour: {}, coffresJour: { '2026-11-06': 5, '2026-11-07': 6, '2026-11-08': 7, '2026-11-09': 8 }, coffresNiveau: {}, defis: {}, parties: [] }));
    const c2 = new E.Compte(s2, LE_10);
    expect(c2.visite()).toBe(true);
    expect(c2.serie()).toBe(5);
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
  for (const id of ['#btn-etoiles-haut', '#btn-defi', '#btn-coffre-haut', '#btn-commencer']) {
    await expect(page.locator(id)).toBeInViewport({ ratio: 1 });
  }
  // v6.38 : plus de raccourcis « Mes étoiles » ni « Progrès » (doublons des boutons du haut).
  await expect(page.locator('#btn-etoiles, #btn-progression, .raccourcis')).toHaveCount(0);
  // Les 3 boutons du haut sur une seule ligne, sans se chevaucher ni déborder.
  const boites = await page.evaluate(() => ['btn-etoiles-haut', 'btn-defi', 'btn-coffre-haut'].map((id) => document.getElementById(id).getBoundingClientRect().toJSON()));
  expect(boites[0].right).toBeLessThanOrEqual(boites[1].left + 1);
  expect(boites[1].right).toBeLessThanOrEqual(boites[2].left + 1);
  expect(Math.abs(boites[0].top - boites[1].top)).toBeLessThan(30);
  await expect(page.locator('#accueil-badge')).toHaveText('1');
  await page.locator('#btn-coffre-haut').click();
  const coffre = page.getByRole('dialog', { name: 'Coffre du jour' });
  await expect(coffre).toBeVisible();
  await coffre.getByRole('button', { name: 'Ouvrir le coffre' }).click();
  await expect(page.locator('#coffre-gain')).toContainText(/\+\d+ étoiles !/);
  const n = Number((await page.locator('#coffre-gain strong').textContent()).match(/\d+/)[0]);
  expect(n).toBeGreaterThanOrEqual(5); expect(n).toBeLessThanOrEqual(20);
  // v6.38 : le coffre s'ouvre par devant (le couvercle ouvert apparaît derrière) et les étoiles sortent de l'intérieur.
  await expect(page.locator('#coffre-scene')).toHaveClass(/ouvert/);
  expect(await page.locator('#coffre-volees span').count()).toBeGreaterThanOrEqual(5);
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.querySelector('.couvercle-ouvert')).transform)).toBe('matrix(1, 0, 0, 1, 0, 0)');
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

test('écrans « Mes étoiles » et « Ma progression » : niveau, coffres de niveau, série vers le méga coffre ; retour à l\'accueil', async ({ page }) => {
  const auj = await page.evaluate(() => 0).then(() => { const d = new Date(); const z = (x) => (x < 10 ? '0' : '') + x; return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate()); });
  // simplesDepuis : 99 → pas de coffre simple (v6.46) si le coffre du jour fait passer le niveau 7 (test déterministe).
  await accueil(page, { v: 1, total: 265, journal: [{ quand: new Date().toISOString(), jour: auj, type: 'partie', n: 18, texte: 'Aventure réussie · Viking' }], parJour: { [auj]: 18 }, coffresJour: {}, coffresNiveau: {}, defis: {}, parties: [], simplesDepuis: 99 });
  await expect(page.locator('#accueil-niveau')).toHaveText('Niveau 6');
  await expect(page.locator('#accueil-badge')).toHaveText('2'); // coffre du jour + coffre d'argent du niveau 5
  await page.locator('#btn-etoiles-haut').click();
  await expect(page.getByRole('heading', { name: 'Mes étoiles' })).toBeVisible();
  await expect(page.locator('#etoiles-total')).toHaveText('265');
  await expect(page.locator('.chemin-coffres li').first()).toContainText('Niveau 5');
  // v6.42 : plus de liste « Dernières étoiles gagnées » ; l'explication s'ouvre avec un petit bouton.
  await expect(page.locator('.journal')).toHaveCount(0);
  await expect(page.locator('#etoiles-corps')).not.toContainText('Dernières étoiles');
  await expect(page.locator('#etoiles-corps .regles-etoiles')).toHaveCount(0);
  await page.getByRole('button', { name: 'Comment gagner des étoiles ?' }).click();
  const aide = page.getByRole('dialog', { name: 'Comment gagner des étoiles ?' });
  await expect(aide).toBeVisible();
  await expect(aide).toContainText('Coffre du jour');
  await aide.getByRole('button', { name: 'J’ai compris' }).click();
  await expect(aide).toBeHidden();
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
  // Le bouton du coffre ouvre le coffre du jour ; une fois ouvert, il mène à « Ma progression ».
  await page.locator('#btn-coffre-haut').click();
  await page.getByRole('dialog', { name: 'Coffre du jour' }).getByRole('button', { name: 'Ouvrir le coffre' }).click();
  const nj = Number((await page.locator('#coffre-gain strong').textContent()).match(/\d+/)[0]);
  await page.getByRole('button', { name: 'Super !' }).click();
  await page.locator('#btn-coffre-haut').click();
  await expect(page.getByRole('heading', { name: 'Ma progression' })).toBeVisible();
  await expect(page.locator('#progression-jour')).toHaveText('+' + (18 + n + nj));
  // v6.38 : plus les 7 derniers jours ; la série de jours d'affilée vers le méga coffre à la place.
  await expect(page.locator('.histo')).toHaveCount(0);
  await expect(page.locator('#serie-jours')).toHaveText('1 jour');
  await expect(page.locator('.serie-cases li')).toHaveCount(5);
  await expect(page.locator('.serie-cases li.fait')).toHaveCount(1);
  await expect(page.locator('.taches-jour').first()).toContainText('Coffre du jour');
  // v6.44 : plus d'encadré « Coffres de niveau » dans Ma progression (il est dans Mes étoiles).
  await expect(page.locator('#progression-corps')).not.toContainText('Coffres de niveau');
  await expect(page.locator('#progression-corps .prochain')).toHaveCount(0);
  // La touche « précédent » du téléphone revient à l'accueil.
  await page.goBack();
  await expect(page.locator('#btn-commencer')).toBeVisible();
});

test('une aventure gagnée rapporte ses unités en étoiles, une seule fois même si on recharge la page', async ({ page }) => {
  await rapide(page);
  await page.addInitScript(() => { try { localStorage.setItem('ludo-vu', '1'); } catch (e) { /* */ } });
  await lancerPartie(page, { joueurs: 1 });
  for (let t = 0; t < 5; t++) {
    await page.getByRole('button', { name: /^(Première question|Question suivante)$/ }).click();
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
    await page.getByRole('button', { name: /^(Première question|Question suivante)$/ }).click();
    await repondre(page, true);
    await lancerLeDe(page);
  }
  await expect(page.locator('#fin-etoiles')).toContainText('Niveau 5 atteint !');
  await page.getByRole('button', { name: 'Ouvrir le coffre d’argent' }).click();
  await page.getByRole('dialog', { name: /Coffre d’argent/ }).getByRole('button', { name: 'Ouvrir le coffre' }).click();
  await expect(page.locator('#coffre-gain')).toContainText(/\+\d+ étoiles/);
});

// v6.46 (demande du 10/11/2026, backlog lignes 216 à 218) : coffre simple à chaque niveau et pierres précieuses.
test('coffre simple au passage de niveau et pierres précieuses : accueil, ouverture, Mes étoiles', async ({ page }) => {
  const auj = (() => { const d = new Date(); const z = (x) => (x < 10 ? '0' : '') + x; return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate()); })();
  // Niveau 3 atteint après la v6.46 (coffres simples depuis le niveau 1), coffre du jour déjà ouvert, 4 pierres.
  await accueil(page, { v: 1, total: E.seuil(3), gemmes: 4, simplesDepuis: 1, coffresJour: { [auj]: 10 }, coffresNiveau: {}, parJour: {}, journal: [], defis: {}, parties: [] });
  await expect(page.locator('#accueil-gemmes')).toHaveText('4');
  await expect(page.locator('#btn-etoiles-haut')).toContainText('pierres précieuses');
  // La pastille des étoiles tient dans la barre (pas de débordement horizontal).
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const barre = await page.evaluate(() => { const b = document.querySelector('.accueil-haut').getBoundingClientRect(); return [...document.querySelectorAll('.accueil-haut .pastille')].every((p) => { const r = p.getBoundingClientRect(); return r.left >= b.left - 1 && r.right <= b.right + 1 && r.height < 80; }); });
  expect(barre).toBe(true);
  await expect(page.locator('#accueil-badge')).toHaveText('2'); // coffres simples des niveaux 2 et 3
  await page.locator('#btn-coffre-haut').click();
  const d = page.getByRole('dialog', { name: /Coffre simple/ });
  await expect(d).toBeVisible();
  await d.getByRole('button', { name: 'Ouvrir le coffre' }).click();
  const n = Number((await page.locator('#coffre-gain strong').textContent()).match(/\d+/)[0]);
  expect(n).toBeGreaterThanOrEqual(10); expect(n).toBeLessThanOrEqual(25);
  await expect(page.locator('#coffre-gain')).toContainText('+1 pierre précieuse');
  await page.getByRole('button', { name: 'Coffre suivant' }).click();
  await d.getByRole('button', { name: 'Ouvrir le coffre' }).click();
  await expect(page.locator('#coffre-gain')).toContainText('+1 pierre précieuse');
  await page.getByRole('button', { name: 'Super !' }).click();
  await expect(page.locator('#accueil-gemmes')).toHaveText('6');
  // Mes étoiles : nombre de pierres et chemin des coffres (simple à chaque niveau, gros coffre au niveau 5).
  await page.locator('#btn-etoiles-haut').click();
  await expect(page.locator('#etoiles-gemmes')).toHaveText('6');
  await expect(page.locator('.chemin-coffres li')).toHaveCount(4);
  await expect(page.locator('.chemin-coffres li').first()).toContainText('Ouvert');
  await expect(page.locator('.chemin-coffres')).toContainText('Coffre simple');
  await expect(page.locator('.chemin-coffres')).toContainText('Coffre d’argent');
  await page.getByRole('button', { name: 'Comment gagner des étoiles ?' }).click();
  await expect(page.getByRole('dialog', { name: 'Comment gagner des étoiles ?' })).toContainText('Pierres précieuses');
  await expect(page.getByRole('dialog', { name: 'Comment gagner des étoiles ?' })).toContainText('coffre simple');
});

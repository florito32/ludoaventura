// Partie rapide (v6.43, demande du 10/11/2026, backlog lignes 202 à 205).
const { test, expect } = require('@playwright/test');
const R = require('../js/rapide.js');
const K = require('../js/calcul.js');
const V = require('../js/conjugaison.js');
const A = require('../js/aventures.js');
const { rapide } = require('./aide');

test.describe('tirage de la partie rapide', () => {
  test.beforeEach(() => test.skip(test.info().project.name !== 'ordinateur', 'test de logique : un seul format suffit'));

  test('aventure tirée parmi les 10, aventuriers tous différents, nombre de joueurs respecté', () => {
    const vues = new Set();
    for (let k = 0; k < 300; k++) {
      const nb = 1 + (k % 4);
      const d = R.generer({ joueurs: nb, matieres: ['maths'] });
      expect(A.trouver(d.aventure).id).toBe(d.aventure);
      expect(d.aventuriers).toHaveLength(nb);
      expect(new Set(d.aventuriers).size).toBe(nb);
      vues.add(d.aventure);
    }
    expect(vues.size).toBe(A.LISTE.length); // toutes les aventures peuvent sortir
  });

  test('chaque carte tire une matière choisie, à tous les niveaux ; Français = orthographe ou conjugaison', () => {
    const vu = new Set();
    for (let k = 0; k < 3000; k++) {
      const t = R.carte(['maths', 'francais']);
      vu.add(t.matiere + (t.maths ? ':' + t.maths.niveau : '') + (t.conj ? ':' + t.conj.niveau : ''));
      if (t.maths) { expect(t.maths.signes).toHaveLength(4); expect(K.generer(t.maths).resultatTexte).toBeTruthy(); }
      if (t.conj) { expect(t.conj.temps).toHaveLength(V.TEMPS.length); expect(t.conj.groupes).toEqual([1, 2, 3]); expect(V.generer(t.conj).bonne).toBeTruthy(); }
    }
    for (const n of ['facile', 'moyen', 'difficile', 'expert']) { expect(vu).toContain('maths:' + n); expect(vu).toContain('conjugaison:' + n); }
    expect(vu).toContain('orthographe');
    for (let k = 0; k < 300; k++) expect(R.carte(['maths']).matiere).toBe('maths');
    for (let k = 0; k < 300; k++) expect(['orthographe', 'conjugaison']).toContain(R.carte(['francais']).matiere);
  });
});

test('accueil → Partie rapide : joueurs et matières, la partie se lance directement avec des questions mélangées @smoke', async ({ page }) => {
  await rapide(page);
  await page.addInitScript(() => { try { localStorage.setItem('ludo-vu', '1'); } catch (e) { /* */ } });
  await page.goto('./');
  await page.getByRole('button', { name: 'Partie rapide' }).click();
  await expect(page.getByRole('heading', { name: 'Partie rapide' })).toBeVisible();
  // Aucune matière : on ne peut pas lancer.
  await page.getByRole('button', { name: 'Aucune' }).click();
  await page.getByRole('button', { name: 'Lancer la partie' }).click();
  await expect(page.locator('#rapide-alerte')).toHaveText('Choisis au moins une matière.');
  await page.getByRole('button', { name: 'Toutes les matières' }).click();
  await expect(page.getByRole('checkbox', { name: 'Maths' })).toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'Français' })).toBeChecked();
  await page.getByRole('checkbox', { name: 'Maths' }).uncheck();
  await page.getByRole('radio', { name: '3', exact: true }).check();
  const largeur = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
  expect(largeur).toBe(true);
  await page.getByRole('button', { name: 'Lancer la partie' }).click();
  // Directement sur le plateau : 3 aventuriers tirés au hasard, tous différents.
  await expect(page.getByRole('heading', { name: 'Partie rapide' })).toBeVisible();
  const p = await page.evaluate(() => ({ nb: window.Aventura.partie.joueurs.length, ids: window.Aventura.partie.joueurs.map((j) => j.aventurier.id), rapide: window.Aventura.partie.rapide }));
  expect(p.nb).toBe(3);
  expect(new Set(p.ids).size).toBe(3);
  expect(p.rapide).toEqual({ matieres: ['francais'] });
  // Français seulement : uniquement de l'orthographe et de la conjugaison, de tous les thèmes et tous les temps.
  const tirees = await page.evaluate(() => {
    const j = window.Aventura.partie.joueurs[0], t = [];
    for (let k = 0; k < 200; k++) { const c = window.Aventura.piocherCarte(j); t.push(c.type === 'conjugaison' ? 'conjugaison:' + c.temps : c.type === 'calcul' ? 'calcul' : 'ortho:' + c.pack); }
    return t;
  });
  expect(tirees).not.toContain('calcul');
  expect(tirees.some((t) => t.startsWith('conjugaison:'))).toBe(true);
  expect(new Set(tirees.filter((t) => t.startsWith('ortho:'))).size).toBeGreaterThan(3);
  // Première question : elle s'affiche.
  await page.getByRole('button', { name: 'Question suivante' }).click();
  await expect(page.locator('#carte-piochee')).toBeVisible();
  // Les choix sont gardés pour la prochaine fois ; recharger pendant la partie la reprend en partie rapide.
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Partie rapide' })).toBeVisible();
  expect(await page.evaluate(() => window.Aventura.partie.rapide)).toEqual({ matieres: ['francais'] });
});

test('partie rapide en Maths seulement : que du calcul', async ({ page }) => {
  test.skip(test.info().project.name !== 'ordinateur', 'un seul format suffit');
  await rapide(page);
  await page.addInitScript(() => { try { localStorage.setItem('ludo-vu', '1'); localStorage.setItem('ludoaventura-rapide-choix', JSON.stringify({ joueurs: 1, matieres: ['maths'] })); } catch (e) { /* */ } });
  await page.goto('./');
  await page.getByRole('button', { name: 'Partie rapide' }).click();
  await expect(page.getByRole('radio', { name: '1', exact: true })).toBeChecked();
  await page.getByRole('button', { name: 'Lancer la partie' }).click();
  await expect(page.getByRole('heading', { name: 'Partie rapide' })).toBeVisible();
  const types = await page.evaluate(() => { const j = window.Aventura.partie.joueurs[0], t = new Set(); for (let k = 0; k < 100; k++) t.add(window.Aventura.piocherCarte(j).type); return [...t]; });
  expect(types).toEqual(['calcul']);
});

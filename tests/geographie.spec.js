// Géographie (v7.0, BACKLOG lignes 258 à 262) : matière, niveau, jeux en familles, et les formats de carte
// (relier, choix multiples, question ouverte, remettre dans l'ordre, vrai ou faux, classer), corrigés par le jeu.
const { test, expect } = require('@playwright/test');
const S = require('../js/savoirs.js');
require('../js/geographie.js');
const { rapide, versReglages, valider, lancer, lancerLeDe, ouvrirNeuf } = require('./aide');

const NIVEAUX = ['facile', 'moyen', 'difficile', 'expert'];

test.describe('contenu de géographie', () => {
  test.beforeEach(() => test.skip(test.info().project.name !== 'ordinateur', 'test de logique : un seul format suffit'));

  test('chaque jeu a du contenu à chaque niveau (sauf la carte à toucher, livrée à part) et les cartes sont bien formées', () => {
    for (const j of S.jeuxDe('geographie').filter((x) => x.id !== 'g10')) {
      for (const n of NIVEAUX) {
        for (let k = 0; k < 150; k++) {
          const c = S.generer({ jeux: [j.id], niveau: n }, 'geographie');
          expect(c, j.id + ' ' + n).not.toBeNull();
          if (c.format === 'Q') { expect(c.options).toContain(c.bonne); expect(new Set(c.options).size).toBe(c.options.length); }
          if (c.format === 'R') { expect(new Set(c.droite).size).toBe(c.droite.length); expect(c.gauche.length).toBeLessThanOrEqual(S.TAILLE[n]); }
          if (c.format === 'O') expect(n === 'difficile' || n === 'expert').toBeTruthy();
          if (c.format === 'F') expect([...c.bonnes].sort()).toEqual([...c.elements].sort());
        }
      }
    }
  });

  test('chaque niveau n\'a que son propre contenu (demande de l\'utilisateur)', () => {
    for (const j of S.jeuxDe('geographie')) {
      for (const s of j.series) {
        if (s.k !== 'paires') continue;
        const vus = {};
        for (const n of NIVEAUX) for (const p of (s.niveaux[n] || [])) {
          const cle = JSON.stringify(p);
          expect(vus[cle], j.id + ' : ' + cle + ' en ' + vus[cle] + ' et ' + n).toBeUndefined();
          vus[cle] = n;
        }
      }
    }
  });

  test('question ouverte : accents, majuscules, tirets et article ne comptent pas ; les autres écritures sont acceptées', () => {
    expect(S.ouverteJuste('brasilia', 'Brasília|Brasilia')).toBe(true);
    expect(S.ouverteJuste('St Etienne', 'Saint-Étienne')).toBe(true);
    expect(S.ouverteJuste('caire', 'Le Caire|Caire')).toBe(true);
    expect(S.ouverteJuste('Evry', 'Évry-Courcouronnes|Évry')).toBe(true);
    expect(S.ouverteJuste('Lyon', 'Marseille')).toBe(false);
    expect(S.ouverteJuste('', 'Paris')).toBe(false);
  });

  test('101 départements : numéros et préfectures uniques, 13 régions de métropole', () => {
    const G = require('../js/geographie.js');
    const D = G.DEPARTEMENTS;
    expect(D).toHaveLength(101);
    expect(new Set(D.map((d) => d[0])).size).toBe(101);
    expect(new Set(D.filter((d) => d[0].length < 3).map((d) => d[3])).size).toBe(13);
  });
});

// Va jusqu'au plateau avec 1 joueur en Géographie : niveau et jeux donnés.
async function versGeo(page, { niveau = 'facile', jeux = ['g04'], hasard = null } = {}) {
  await rapide(page);
  await ouvrirNeuf(page);
  await versReglages(page, 1);
  await page.locator('#matieres input[value="geographie"]').check();
  await page.locator('#niveau-savoir input[value="' + niveau + '"]').check();
  await valider(page);
  await page.locator('#savoir-jeux').waitFor();
  for (const j of jeux) await page.locator('#savoir-liste input[value="' + j + '"]').check();
  await lancer(page);
  await page.getByRole('heading', { name: 'Le plateau' }).waitFor();
  // Hasard fixé : le format de la carte ne dépend plus du hasard.
  if (hasard !== null) await page.evaluate((h) => window.Savoirs.regler(() => h), hasard);
}
async function piocher(page) {
  await page.getByRole('button', { name: 'Question suivante' }).click();
  await page.locator('#carte-piochee').waitFor();
  return page.evaluate(() => window.Aventura.partie.carte);
}
async function pasDeDebordement(page) {
  const d = await page.evaluate(() => ({ l: document.documentElement.scrollWidth, v: window.innerWidth }));
  expect(d.l).toBeLessThanOrEqual(d.v);
}

test('écran des réglages : la matière Géographie, son niveau, ses jeux en 3 familles ; « Valider » exige un jeu', async ({ page }) => {
  await rapide(page);
  await ouvrirNeuf(page);
  await versReglages(page, 1);
  await page.locator('#matieres label', { hasText: 'Géographie' }).click();
  await expect(page.locator('#reglage-niveau-savoir')).toBeVisible();
  await expect(page.locator('#niveau-savoir-aide')).toContainText('Facile');
  await page.locator('#niveau-savoir label', { hasText: 'Expert' }).click();
  await expect(page.locator('#niveau-savoir-aide')).toContainText('Expert');
  await valider(page);
  await expect(page.locator('#reglages-titre')).toContainText('Géographie, les jeux');
  await expect(page.locator('#savoir-liste .famille:not([hidden])')).toHaveCount(3);
  await expect(page.locator('#savoir-liste input')).toHaveCount(11);
  // Rien de choisi : « Valider » refuse.
  await valider(page);
  await expect(page.locator('#packs-alerte')).toContainText('au moins un jeu');
  await page.locator('#btn-tout-savoir').click();
  for (const i of await page.locator('#savoir-liste input').all()) await expect(i).toBeChecked();
  const p = await page.evaluate(() => window.Aventura.partie.savoirs[0].geographie);
  expect(p.niveau).toBe('expert');
  expect(p.jeux).toHaveLength(11);
  await pasDeDebordement(page);
  await valider(page);
  await expect(page.getByRole('button', { name: 'Lancer la partie' })).toBeVisible();
});

test('relier : on relie chaque pays à sa capitale, tout juste → dé FORT', async ({ page }) => {
  await versGeo(page, { niveau: 'expert', jeux: ['g04'], hasard: 0 });
  const c = await piocher(page);
  expect(c.format).toBe('R');
  expect(c.gauche).toHaveLength(6);
  await expect(page.locator('#carte-titre')).toHaveText('Pays et capitales · Relier');
  await pasDeDebordement(page);
  for (let i = 0; i < c.gauche.length; i++) {
    await page.locator('.relier-g[data-g="' + i + '"]').click();
    await page.locator('.relier-d[data-d="' + c.bonnes[i] + '"]').click();
  }
  await page.locator('.btn-savoir-ok').click();
  await expect(page.locator('#carte-reponse')).toHaveText('Bravo, tout est bien relié !');
  expect(await page.evaluate(() => window.Aventura.partie.regles.de)).toBe('fort');
  await lancerLeDe(page);
});

test('relier faux : la correction s\'affiche, « J\'ai compris » puis dé FAIBLE', async ({ page }) => {
  await versGeo(page, { niveau: 'facile', jeux: ['g04'], hasard: 0 });
  const c = await piocher(page);
  // Toucher les réponses dans l'ordre affiché relie chaque élément au suivant libre (choisi automatiquement).
  const faux = c.bonnes.slice(1).concat(c.bonnes[0]);
  for (let i = 0; i < c.gauche.length; i++) await page.locator('.relier-d[data-d="' + faux[i] + '"]').click();
  await page.locator('.btn-savoir-ok').click();
  await expect(page.locator('#carte-reponse')).toContainText('Pas tout à fait');
  expect(await page.evaluate(() => window.Aventura.partie.regles.de)).toBe('faible');
  // Le dé attend « J'ai compris » (le temps de lire la correction), puis se lance.
  await page.getByRole('button', { name: 'J’ai compris' }).click();
  await page.waitForFunction(() => window.Aventura.partie.regles.etape !== 'lancer');
});

test('drapeaux : relier des drapeaux (images) à leur pays', async ({ page }) => {
  await versGeo(page, { niveau: 'facile', jeux: ['g05'], hasard: 0 });
  const c = await piocher(page);
  expect(c.format).toBe('R');
  await expect(page.locator('.relier-g img.drapeau')).toHaveCount(3);
  const ok = await page.locator('.relier-g img.drapeau').first().evaluate((img) => img.complete && img.naturalWidth > 0);
  expect(ok).toBe(true);
});

test('choix multiples : toucher la bonne réponse → dé FORT', async ({ page }) => {
  await versGeo(page, { niveau: 'moyen', jeux: ['g04'], hasard: 0.99 });
  const c = await piocher(page);
  expect(c.format).toBe('Q');
  await expect(page.locator('.btn-option')).toHaveCount(4);
  await page.locator('.btn-option', { hasText: c.bonne }).click();
  await expect(page.locator('.btn-option.bonne')).toHaveText(c.bonne);
  expect(await page.evaluate(() => window.Aventura.partie.regles.de)).toBe('fort');
});

test('question ouverte : le joueur écrit la capitale, sans accent → juste', async ({ page }) => {
  await versGeo(page, { niveau: 'difficile', jeux: ['g04'], hasard: 0.99 });
  const c = await piocher(page);
  expect(c.format).toBe('O');
  await expect(page.locator('#carte-saisie')).toBeVisible();
  const texte = c.bonne.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  await page.getByLabel('Ta réponse').fill(texte);
  await page.getByRole('button', { name: 'OK', exact: true }).click();
  await expect(page.locator('#carte-reponse')).toContainText('Bonne réponse');
  expect(await page.evaluate(() => window.Aventura.partie.regles.de)).toBe('fort');
});

test('vrai ou faux : la réponse proposée est vraie → « Vrai » est juste', async ({ page }) => {
  await versGeo(page, { niveau: 'facile', jeux: ['g13'], hasard: 0 });
  const c = await piocher(page);
  expect(c.format).toBe('V');
  await page.locator('.btn-option', { hasText: c.bonne }).click();
  expect(await page.evaluate(() => window.Aventura.partie.regles.de)).toBe('fort');
});

test('remettre dans l\'ordre : sommets du plus bas au plus haut ; rechargement en cours de rangement', async ({ page }) => {
  await versGeo(page, { niveau: 'expert', jeux: ['g09'], hasard: 0 });
  const c = await piocher(page);
  expect(c.format).toBe('F');
  // Les deux premiers éléments, puis on recharge la page : ils restent rangés.
  await page.locator('.ordre-el', { hasText: c.bonnes[0] }).click();
  await page.reload();
  await page.locator('#carte-savoir').waitFor();
  await page.evaluate(() => window.Savoirs.regler(() => 0));
  await expect(page.locator('.ordre-case').first()).toContainText(c.bonnes[0]);
  for (const b of c.bonnes.slice(1)) await page.locator('.ordre-el', { hasText: b }).click();
  await page.locator('.btn-savoir-ok').click();
  await expect(page.locator('#carte-reponse')).toContainText('Bravo, c’est le bon ordre');
  expect(await page.evaluate(() => window.Aventura.partie.regles.de)).toBe('fort');
});

test('classer : voisins de la France ou pas', async ({ page }) => {
  await versGeo(page, { niveau: 'facile', jeux: ['g07'], hasard: 0 });
  const c = await piocher(page);
  expect(c.format).toBe('K');
  await pasDeDebordement(page);
  for (let i = 0; i < c.elements.length; i++) await page.locator('.btn-col[data-i="' + i + '"][data-col="' + c.bonnes[i] + '"]').click();
  await page.locator('.btn-savoir-ok').click();
  await expect(page.locator('#carte-reponse')).toHaveText('Bravo, tout est bien rangé !');
});

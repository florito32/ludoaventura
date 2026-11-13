// Orthographe : 4 niveaux de mots (v6.50, demande du 12/11/2026, backlog lignes 232 et 233).
// Choix de l'utilisateur : Facile = séries 1 et 2 du fichier des cartes, Moyen = série 3,
// Difficile = série 4 et Expert = série 5 (nouveaux mots, outils/mots_niveaux.py).
// Le niveau se choisit sur l'écran de la matière, tout de suite sous « Orthographe / Conjugaison ».
const { test, expect } = require('@playwright/test');
const { rapide, versReglages, valider, ouvrirNeuf } = require('./aide');
const C = require('../js/cartes.js');
const D = require('../js/defis.js');
const P = require('../js/phrases.js');

test.describe('séries de mots', () => {
  test.beforeEach(() => test.skip(test.info().project.name !== 'ordinateur', 'test de logique : un seul format suffit'));

  test('chaque thème proposé a 8 mots Difficile (série 4) et 8 mots Expert (série 5), tous différents', () => {
    const themes = C.FAMILLES.flatMap((f) => f.themes);
    const vus = new Set();
    for (const p of C.PACKS) for (const l of Object.values(p.niveaux)) for (const m of l) {
      if (!themes.includes(p.id)) continue; // packs plus proposés (Lettres, Mots simples…)
      expect(vus.has(m), m + ' en double').toBe(false);
      vus.add(m);
    }
    for (const t of themes) {
      const p = C.PACKS.find((x) => x.id === t);
      expect(p.niveaux['4'], t).toHaveLength(8);
      expect(p.niveaux['5'], t).toHaveLength(8);
      for (const m of [...p.niveaux['4'], ...p.niveaux['5']]) {
        expect(C.INFOS[m], m).toBeTruthy();
        expect(P[m], m).toBeTruthy();
      }
    }
  });

  test('niveaux → séries : Facile 1 et 2, Moyen 3, Difficile 4, Expert 5', () => {
    expect(D.ORTHO.facile.mots).toEqual([1, 2]);
    expect(D.ORTHO.moyen.mots).toEqual([3]);
    expect(D.ORTHO.difficile.mots).toEqual([4]);
    expect(D.ORTHO.expert.mots).toEqual([5]);
  });

  test('les mots Expert sont nettement plus longs que les mots Facile', () => {
    const moyenne = (series) => {
      const l = C.PACKS.filter((p) => C.FAMILLES.some((f) => f.themes.includes(p.id)))
        .flatMap((p) => series.flatMap((s) => p.niveaux[s] || []));
      return l.reduce((a, m) => a + m.replace(/[^\p{L}]/gu, '').length, 0) / l.length;
    };
    expect(moyenne(['5'])).toBeGreaterThan(moyenne(['1', '2']) + 4);
    expect(moyenne(['4'])).toBeGreaterThan(moyenne(['3']));
  });

  test('quelques mots relus : genre, pluriel, lettres muettes, syllabes', () => {
    expect(C.INFOS['CHAUVE-SOURIS']).toMatchObject({ genre: 'f', pluriel: 'CHAUVES-SOURIS' });
    expect(C.INFOS.HAUTBOIS).toMatchObject({ genre: 'm', elision: false, pluriel: 'HAUTBOIS' }); // h aspiré : « le hautbois »
    expect(C.INFOS.HYDRAVION).toMatchObject({ genre: 'm', elision: true });
    expect(C.INFOS.RHINOCÉROS.muettes).toEqual([1]); // le h
    expect(C.INFOS.CAMÉLÉON.syllabes).toBe('CA-MÉ-LÉ-ON');
    expect(C.INFOS.PSYCHOLOGUE.genre).toBeNull(); // même mot au masculin et au féminin : pas de « Le ou la ? »
  });
});

test('le niveau d\'orthographe se choisit sur l\'écran de la matière, et Expert pioche les mots de la série 5', async ({ page }) => {
  await rapide(page);
  await page.goto('./');
  await versReglages(page, 1);
  await expect(page.locator('#niveau-ortho')).toBeHidden();
  await page.locator('#matieres input[value="francais"]').check();
  await page.locator('#francais input[value="orthographe"]').check();
  await expect(page.locator('#niveau-ortho input')).toHaveCount(4);
  await expect(page.locator('#niveau-ortho input[value="facile"]')).toBeChecked();
  await expect(page.locator('#niveau-ortho-aide')).toHaveCount(0); // v8.6
  await expect(page.locator('#niveau-conj')).toBeHidden();
  await page.locator('#niveau-ortho label', { hasText: 'Expert' }).click();
  await expect(page.locator('#niveau-ortho input[value="expert"]')).toBeChecked();
  // Tout tient sans défiler.
  const deborde = await page.evaluate(() => {
    const c = document.querySelector('#reglages-joueur');
    return Math.max(document.documentElement.scrollHeight - innerHeight, c.scrollHeight - c.clientHeight);
  });
  expect(deborde).toBeLessThanOrEqual(1);
  const boutons = await page.locator('#niveau-ortho .pack span').evaluateAll((l) => l.some((e) => e.scrollWidth > e.clientWidth + 1));
  expect(boutons).toBe(false);
  await valider(page);
  // Thèmes puis questions, comme avant.
  await page.locator('#ortho-packs').waitFor();
  await page.locator('#packs input[value="animaux"]').check();
  await valider(page);
  await page.locator('#types-questions input[value="ecrire"]').check();
  await valider(page);
  // Rechargement : le niveau est gardé.
  await page.reload();
  expect(await page.evaluate(() => window.Aventura.partie.orthoNiveau[0])).toBe('expert');
  await page.getByRole('button', { name: 'Lancer la partie' }).click();
  await page.getByRole('heading', { name: 'Le plateau' }).waitFor();
  const tas = await page.evaluate(() => window.Aventura.partie.joueurs[0].tas.map((c) => c.mot));
  const expert = C.PACKS.find((p) => p.id === 'animaux').niveaux['5'];
  expect(tas.length).toBeGreaterThan(0);
  for (const m of tas) expect(expert).toContain(m);
});

test('Moyen pioche la série 3 ; « Mêmes réglages pour tous » copie le niveau', async ({ page }) => {
  await rapide(page);
  await ouvrirNeuf(page);
  await versReglages(page, 2);
  await page.locator('#matieres input[value="francais"]').check();
  await page.locator('#francais input[value="orthographe"]').check();
  await page.locator('#niveau-ortho label', { hasText: 'Moyen' }).click();
  await valider(page);
  await page.locator('#packs input[value="pays"]').check();
  await valider(page);
  await page.locator('#types-questions input[value="nombre"]').check();
  await page.getByRole('button', { name: 'Mêmes réglages pour tous' }).click();
  expect(await page.evaluate(() => window.Aventura.partie.orthoNiveau.slice(0, 2))).toEqual(['moyen', 'moyen']);
  await page.getByRole('button', { name: 'Lancer la partie' }).click();
  await page.getByRole('heading', { name: 'Le plateau' }).waitFor();
  const tas = await page.evaluate(() => window.Aventura.partie.joueurs[1].tas.map((c) => c.mot));
  const serie3 = C.PACKS.find((p) => p.id === 'pays').niveaux['3'];
  expect(tas.sort()).toEqual([...serie3].sort());
});

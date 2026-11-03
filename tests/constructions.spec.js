// Construction de l'aventure : elle avance avec les points et est complète à l'objectif.
const { test, expect } = require('@playwright/test');
const K = require('../js/constructions.js');
const A = require('../js/aventures.js');
const { lancerPartie, lancerLeDe } = require('./aide');

test.describe('règles de la construction', () => {
  test.beforeEach(() => test.skip(test.info().project.name !== 'ordinateur', 'test de logique : un seul format suffit'));

  test('chaque aventure a sa construction, en plusieurs étapes', () => {
    for (const a of A.LISTE) {
      const cst = K.CONSTRUCTIONS[a.id];
      expect(cst, a.id).toBeTruthy();
      expect(cst.etapes.length, a.id).toBeGreaterThanOrEqual(5);
    }
  });

  test('0 étape à 0 point, toutes à l\'objectif, jamais en arrière', () => {
    for (const a of A.LISTE) {
      const n = K.CONSTRUCTIONS[a.id].etapes.length;
      let avant = 0;
      for (let pts = 0; pts <= 60; pts++) {
        const v = K.etapesVisibles(a.id, pts, 54);
        expect(v).toBeGreaterThanOrEqual(avant);
        avant = v;
      }
      expect(K.etapesVisibles(a.id, 0, 54)).toBe(0);
      expect(K.etapesVisibles(a.id, 53, 54)).toBeLessThan(n);
      expect(K.etapesVisibles(a.id, 54, 54)).toBe(n);
      expect(K.etapesVisibles(a.id, 80, 54)).toBe(n);
    }
  });

  test('chaque dessin de construction est un SVG valide', async ({ page }) => {
    await page.goto('./');
    for (const a of A.LISTE) {
      const erreur = await page.evaluate((s) => new DOMParser().parseFromString(s, 'image/svg+xml').querySelector('parsererror')?.textContent || '', K.svg(a.id));
      expect(erreur, a.id).toBe('');
    }
  });
});

test('la pyramide se construit avec les points et est complète à l\'objectif @smoke', async ({ page }) => {
  await lancerPartie(page, { joueurs: 2, aventure: 'Mayas' }); // objectif 36
  const etapes = page.locator('#construction .etape');
  const n = K.CONSTRUCTIONS.mayas.etapes.length;
  await expect(etapes).toHaveCount(n);
  await expect(page.locator('#construction .etape.vue')).toHaveCount(0);
  await page.evaluate(() => window.Aventura.majConstruction(18));
  await expect(page.locator('#construction .etape.vue')).toHaveCount(Math.floor(n / 2));
  await expect(page.locator('#construction')).toHaveAttribute('aria-label', `Construction de la pyramide : ${Math.floor(n / 2)} étapes sur ${n}`);
  await page.evaluate(() => window.Aventura.majConstruction(36));
  await expect(page.locator('#construction .etape.vue')).toHaveCount(n);
  await expect(page.locator('#construction')).toHaveClass(/complete/);
});

test('la construction suit les points gagnés pendant la partie', async ({ page }) => {
  await lancerPartie(page, { joueurs: 1, aventure: 'Viking' }); // objectif 15
  await page.getByRole('button', { name: 'Piocher une carte' }).click();
  await page.getByRole('button', { name: 'Bonne réponse' }).click();
  await lancerLeDe(page);
  const pts = Number(await page.locator('#points').textContent());
  await expect(page.locator('#construction .etape.vue')).toHaveCount(K.etapesVisibles('viking', pts, 15));
});

// v5.5 : graphisme redessiné, progression inchangée (nombre d'étapes figé) et décor propre à chaque histoire.
test('v5.5 : mêmes étapes qu\'avant et un décor (ciel) propre à chaque aventure', () => {
  test.skip(test.info().project.name !== 'ordinateur', 'test de logique : un seul format suffit');
  const attendu = { viking: 13, chevalier: 10, prehistoire: 7, mayas: 7, savane: 10, egypte: 7, chine: 8, 'far-west': 9, druides: 9, incas: 7 };
  for (const [id, n] of Object.entries(attendu)) {
    expect(K.CONSTRUCTIONS[id].etapes.length, id).toBe(n);
    expect(K.CONSTRUCTIONS[id].decor, id).toContain('id="ciel-' + id + '"');
  }
});

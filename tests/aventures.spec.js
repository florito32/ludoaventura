// Aventures : 10 aventures, objectif selon difficulté × joueurs, affichage sur le rouleau.
const { test, expect } = require('@playwright/test');
const A = require('../js/aventures.js');
const { lancerPartie, versReglages, cocherTout } = require('./aide');

test.describe('données des aventures', () => {
  test.beforeEach(() => test.skip(test.info().project.name !== 'ordinateur', 'test de logique : un seul format suffit'));

  test('10 aventures, chacune avec nom, image et difficulté', () => {
    expect(A.LISTE).toHaveLength(10);
    expect(new Set(A.LISTE.map((a) => a.id)).size).toBe(10);
    for (const a of A.LISTE) {
      expect(a.nom).toBeTruthy();
      expect(a.image).toMatch(/^img\/aventures\/[a-z-]+\.svg$/);
      expect(['facile', 'moyen', 'difficile']).toContain(a.difficulte);
    }
  });

  test('chaque illustration d\'aventure est un SVG valide', () => {
    const fs = require('fs');
    for (const a of A.LISTE) {
      const svg = fs.readFileSync(a.image, 'utf8');
      expect(svg, a.image).toMatch(/^<svg[\s\S]*<\/svg>\s*$/);
      // Un attribut répété dans une balise rend le SVG invalide (bug déjà rencontré sur les portraits).
      for (const balise of svg.match(/<[a-zA-Z][^>]*>/g)) {
        const noms = (balise.match(/\s([a-zA-Z:-]+)=/g) || []).map((n) => n.trim());
        expect(new Set(noms).size, a.image + ' : ' + balise).toBe(noms.length);
      }
    }
  });

  test('objectif = 15 / 18 / 21 points par joueur × nombre de joueurs', () => {
    expect(A.objectif(A.trouver('viking'), 1)).toBe(15);
    expect(A.objectif(A.trouver('viking'), 3)).toBe(45);
    expect(A.objectif(A.trouver('mayas'), 2)).toBe(36);
    expect(A.objectif(A.trouver('savane'), 4)).toBe(84);
  });

  test('l\'objectif est toujours atteignable : au plus 6 points × 5 croix par joueur', () => {
    for (const a of A.LISTE) for (let n = 1; n <= 4; n++) {
      expect(A.objectif(a, n)).toBeLessThanOrEqual(30 * n);
      expect(A.objectif(a, n)).toBeGreaterThan(5 * n);
    }
  });
});

test('préparation : 4 choix de joueurs, 10 aventures avec image, objectif mis à jour', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('input[name="nb"]')).toHaveCount(4);
  await versReglages(page, 4);
  await cocherTout(page, 4);
  await expect(page.locator('.aventure')).toHaveCount(10);
  await expect(page.locator('#aventure-detail')).toContainText('60 troncs d’arbre à couper'); // Viking par défaut, 4 joueurs
  await page.getByRole('radio', { name: /^Savane/ }).check();
  // L'objectif est visible à côté du bouton, sans défiler.
  await expect(page.locator('#aventure-detail')).toContainText('84 gazelles à chasser');
  await expect(page.locator('#aventure-detail .detail-objectif')).toBeInViewport();
  // Toutes les images d'aventure se chargent.
  for (const img of await page.locator('.aventure img').all()) {
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate((i) => i.complete && i.naturalWidth > 0)).toBe(true);
  }
});

test('plateau : nom et image de l\'aventure sur le rouleau, objectif affiché @smoke', async ({ page }) => {
  await lancerPartie(page, { joueurs: 3, aventure: 'Mayas' });
  await expect(page.locator('#rouleau-nom')).toHaveText('Mayas');
  const img = page.locator('#rouleau-img');
  await expect(img).toHaveAttribute('src', /mayas/);
  await expect.poll(() => img.evaluate((i) => i.complete && i.naturalWidth > 0)).toBe(true);
  await expect(page.locator('#objectif')).toHaveText('54');
  await expect(page.locator('#objectif-texte')).toHaveText('54 pierres à tailler');
  // Le rouleau reste dans le parchemin du plateau.
  const r = await page.locator('#rouleau').boundingBox();
  const p = await page.locator('#plateau').boundingBox();
  expect(r.x).toBeGreaterThan(p.x + p.width * 0.4);
  expect(r.x + r.width).toBeLessThan(p.x + p.width * 0.6);
  // Le nom tient dans le rouleau.
  const nom = await page.locator('#rouleau-nom').boundingBox();
  expect(nom.width).toBeLessThanOrEqual(r.width);
});

test('plateau : autant de pions que de joueurs choisis, à leur couleur', async ({ page }) => {
  for (const n of [1, 3]) {
    await lancerPartie(page, { joueurs: n });
    await expect(page.locator('.pion')).toHaveCount(n);

  }
  await expect(page.locator('.pion').nth(0)).toHaveClass(/pion-rouge/);
  await expect(page.locator('.pion').nth(2)).toHaveClass(/pion-bleu/);
});

// v5.3 : le cadre rouge de l'aventure choisie était une ombre extérieure, rognée par la grille.
// Il est maintenant dessiné à l'intérieur de la carte (pseudo-élément ::after, ombre « inset »).
test('cadre de l\'aventure choisie entier : dessiné à l\'intérieur de la carte', async ({ page }) => {
  await page.goto('./');
  await versReglages(page, 1);
  await cocherTout(page, 1);
  const choisie = page.locator('.aventure:has(input:checked)');
  await expect(choisie).toHaveCount(1);
  expect(await choisie.evaluate((el) => getComputedStyle(el).boxShadow)).toBe('none');
  expect(await choisie.evaluate((el) => getComputedStyle(el, '::after').boxShadow)).toMatch(/inset/);
  // Une autre aventure choisie : le cadre suit.
  await page.getByRole('radio', { name: /^Savane/ }).check();
  expect(await page.locator('.aventure:has(input:checked)').evaluate((el) => getComputedStyle(el, '::after').boxShadow)).toMatch(/inset/);
});

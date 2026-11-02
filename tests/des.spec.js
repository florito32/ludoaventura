// Dés : faces conformes aux règles, lancer à l'écran.
const { test, expect } = require('@playwright/test');
const Des = require('../js/des.js');
const { lancerPartie } = require('./aide');

test.describe('règles des dés', () => {
  test.beforeEach(() => test.skip(test.info().project.name !== 'ordinateur', 'test de logique : un seul format suffit'));

  test('dé FAIBLE : 2 faces à 1, 2 à 2, 2 à 3', () => {
    expect([...Des.FACES.faible].sort()).toEqual([1, 1, 2, 2, 3, 3]);
  });
  test('dé FORT : 2 faces à 4, 2 à 5, 2 à 6', () => {
    expect([...Des.FACES.fort].sort()).toEqual([4, 4, 5, 5, 6, 6]);
  });
  test('chaque face sort à peu près une fois sur 3 (10 000 lancers)', () => {
    for (const type of ['faible', 'fort']) {
      const compte = {};
      for (let i = 0; i < 10000; i++) { const v = Des.lancer(type); compte[v] = (compte[v] || 0) + 1; }
      const valeurs = Object.keys(compte).map(Number).sort();
      expect(valeurs).toEqual(type === 'faible' ? [1, 2, 3] : [4, 5, 6]);
      for (const v of valeurs) expect(compte[v]).toBeGreaterThan(2900);
    }
  });
});

test('bonne réponse → dé FORT (4 à 6 points), mauvaise → dé FAIBLE (1 à 3 points)', async ({ page }) => {
  await lancerPartie(page);
  let total = 0;
  for (const [reponse, min, max] of [['Bonne réponse', 4, 6], ['Mauvaise réponse', 1, 3]]) {
    await page.getByRole('button', { name: 'Piocher une carte' }).click();
    await page.getByRole('button', { name: reponse }).click();
    await page.getByRole('button', { name: /^Lancer le dé/ }).click();
    await expect(page.locator('#tour-consigne')).toContainText('gagne');
    const pts = Number(await page.locator('#points').textContent());
    expect(pts - total).toBeGreaterThanOrEqual(min);
    expect(pts - total).toBeLessThanOrEqual(max);
    total = pts;
    await page.getByRole('button', { name: 'Piocher une carte' }).waitFor();
  }
});

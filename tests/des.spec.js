// Dés : faces conformes aux règles, lancer à l'écran.
const { test, expect } = require('@playwright/test');
const Des = require('../js/des.js');

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

test('toucher un dé le lance et affiche le résultat', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Commencer l\'aventure' }).click();
  for (const [type, ok] of [['faible', /^Dé FAIBLE : [123] points?$/], ['fort', /^Dé FORT : [456] points$/]]) {
    for (let i = 0; i < 5; i++) {
      await page.locator(`.de-btn[data-de="${type}"]`).click();
      await expect(page.locator('#de-resultat')).toHaveText(ok);
      const v = Number((await page.locator('#de-resultat').textContent()).match(/: (\d)/)[1]);
      // La face dessinée montre autant de points que la valeur annoncée.
      await expect(page.locator(`.de-btn[data-de="${type}"] .de i`)).toHaveCount(v);
    }
  }
});

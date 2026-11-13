// Dés : faces conformes aux règles, lancer à l'écran.
const { test, expect } = require('@playwright/test');
const Des = require('../js/des.js');
const { repondre, lancerPartie, rapide, lancerLeDe } = require('./aide');

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
  await rapide(page, { pause: 1500 }); // le message « Léa coupe … » reste affiché assez longtemps pour être lu par le test
  await lancerPartie(page);
  let total = 0;
  for (const [juste, min, max] of [[true, 4, 6], [false, 1, 3]]) {
    await page.getByRole('button', { name: /^(Première question|Question suivante)$/ }).click();
    await repondre(page, juste);
    if (juste) await lancerLeDe(page);
    else await page.getByRole('button', { name: 'J’ai compris' }).click(); // « J'ai compris » lance le dé FAIBLE
    await expect(page.locator('#tour-consigne')).toContainText(/ coupe \d troncs? !/); // Viking : des troncs, pas des points
    const pts = Number(await page.locator('#points').textContent());
    expect(pts - total).toBeGreaterThanOrEqual(min);
    expect(pts - total).toBeLessThanOrEqual(max);
    total = pts;
    await page.getByRole('button', { name: /^(Première question|Question suivante)$/ }).waitFor();
  }
});

test('le dé roule sur le plateau puis montre, face visible, les points gagnés', async ({ page }) => {
  await page.addInitScript(() => { window.AVENTURA_PAUSE = 80; window.AVENTURA_DUREE_DE = 700; window.AVENTURA_AUTO_DE = 600000; });
  page.__rapide = true; // garder la durée réelle du roulé
  await lancerPartie(page);
  await page.getByRole('button', { name: /^(Première question|Question suivante)$/ }).click();
  await repondre(page, true);
  await lancerLeDe(page);
  const zone = page.locator('#de-plateau');
  await expect(zone).toBeVisible();
  // Pendant que le dé roule, les points ne sont pas encore comptés.
  await expect(page.locator('#points')).toHaveText('0');
  await expect(zone).toHaveClass(/pose/);
  const v = Number(await zone.getAttribute('data-valeur'));
  expect([4, 5, 6]).toContain(v);
  await expect(page.locator('#de-gain')).toHaveText('+' + v);
  expect(Number(await page.locator('#points').textContent())).toBe(v);
  // La face tournée vers le joueur porte bien cette valeur.
  const faceVisible = await page.evaluate(() => {
    const t = document.getElementById('de3d').style.transform;
    const [x, y] = t.match(/-?\d+/g).map(Number).map((a) => ((a % 360) + 360) % 360);
    const o = [[0, 0], [0, 270], [0, 180], [0, 90], [270, 0], [90, 0]];
    const k = o.findIndex(([a, b]) => a === x && b === y);
    return Number(document.querySelectorAll('#de3d .face')[k].dataset.valeur);
  });
  expect(faceVisible).toBe(v);
  // Le dé FORT n'a que des faces 4, 5 et 6.
  const faces = await page.locator('#de3d .face').evaluateAll((f) => f.map((x) => Number(x.dataset.valeur)).sort());
  expect(faces).toEqual([4, 4, 5, 5, 6, 6]);
});

test('v4.4 : les coins du dé restent arrondis (les faces de derrière ne dépassent pas)', async ({ page }) => {
  await lancerPartie(page);
  await page.getByRole('button', { name: /^(Première question|Question suivante)$/ }).click();
  await repondre(page, true);
  await lancerLeDe(page);
  const faces = page.locator('#de3d .face');
  await expect(faces).toHaveCount(6);
  for (const f of await faces.all()) {
    await expect.poll(() => f.evaluate((el) => getComputedStyle(el).backfaceVisibility)).toBe('hidden');
    await expect.poll(() => f.evaluate((el) => parseFloat(getComputedStyle(el).borderTopLeftRadius))).toBeGreaterThan(0);
  }
});

test('v5.1 : les points du dé sont noirs, sur le dé FORT comme sur le dé FAIBLE', async ({ page }) => {
  await lancerPartie(page);
  for (const juste of [true, false]) {
    await page.getByRole('button', { name: /^(Première question|Question suivante)$/ }).click();
    await repondre(page, juste);
    if (juste) await lancerLeDe(page);
    else await page.getByRole('button', { name: 'J’ai compris' }).click(); // « J'ai compris » lance le dé FAIBLE
    const couleurs = await page.locator('#de3d .face i').evaluateAll((p) => [...new Set(p.map((x) => getComputedStyle(x).backgroundColor))]);
    expect(couleurs).toEqual(['rgb(0, 0, 0)']);
    await page.getByRole('button', { name: /^(Première question|Question suivante)$/ }).waitFor();
  }
});

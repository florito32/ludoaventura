// Étape 3 : les écrans de réglages remplissent la place (v6.4, lignes 81 à 85 du backlog) :
// choix centrés, grands, rangés en lignes régulières, sans défiler ni laisser l'écran presque vide.
const { test, expect } = require('@playwright/test');
const { rapide, versReglages, maths, orthographe } = require('./aide');

// Boîtes (x, y, largeur, hauteur) des choix visibles d'un groupe.
async function boites(page, sel) {
  return page.locator(sel + ' .pack span').evaluateAll((l) => l.map((e) => { const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; }));
}
// Rien ne défile, et les choix occupent au moins `part` de la hauteur de la zone des réglages.
async function remplit(page, ecran, part = 0.5) {
  const r = await page.evaluate((sel) => {
    const corps = document.querySelector('#reglages-joueur');
    const packs = [...document.querySelectorAll(sel + ' .pack span')].map((e) => e.getBoundingClientRect());
    const haut = Math.min(...packs.map((b) => b.top)), bas = Math.max(...packs.map((b) => b.bottom));
    const c = corps.getBoundingClientRect();
    return { defile: document.documentElement.scrollHeight > innerHeight + 1 || corps.scrollHeight > corps.clientHeight + 1,
      part: (bas - haut) / c.height, dedans: haut >= c.top - 1 && bas <= c.bottom + 1,
      centre: Math.abs((haut + bas) / 2 - (c.top + c.bottom) / 2) };
  }, ecran);
  expect(r.defile).toBe(false);
  expect(r.dedans).toBe(true);
  expect(r.part).toBeGreaterThan(part);
  return r;
}

test('mathématiques : signes 2 par ligne (+ −, × ÷), nombres 1 à 5 puis 6 à 10, en grand, sans défiler', async ({ page }) => {
  await rapide(page);
  await page.goto('./');
  await versReglages(page, 1);
  await maths(page, { signes: [], nombres: [] });
  const s = await boites(page, '#signes');
  expect(s[0][1]).toBe(s[1][1]); // Additionner et Soustraire sur la même ligne
  expect(s[2][1]).toBe(s[3][1]); // Multiplier et Diviser sur la suivante
  expect(s[2][1]).toBeGreaterThan(s[0][1]);
  const n = await boites(page, '#nombres');
  for (let k = 1; k < 5; k++) { expect(n[k][1]).toBe(n[0][1]); expect(n[k + 5][1]).toBe(n[5][1]); }
  expect(n[5][1]).toBeGreaterThan(n[0][1]);
  expect(n[0][3]).toBeGreaterThanOrEqual(30); // cible tactile confortable (≥ 24 px, WCAG 2.5.8)
  await remplit(page, '#reglages-maths');
  // Les choix restent utilisables.
  await page.locator('#signes label', { hasText: 'Multiplier' }).click();
  await page.locator('#nombres label').nth(9).click();
  expect(await page.evaluate(() => window.Aventura.partie.maths[0])).toMatchObject({ signes: ['fois'], nombres: [10] });
});


test('orthographe : packs et questions en grille régulière qui remplit l\'écran, sans défiler', async ({ page }) => {
  await rapide(page);
  await page.goto('./');
  await versReglages(page, 1);
  await orthographe(page);
  const p = await boites(page, '#packs'), q = await boites(page, '#types-questions');
  // Tous les boutons ont la même taille ; 2 ou 4 par ligne selon la forme de l'écran.
  for (const b of [...p, ...q]) { expect(Math.round(b[2])).toBe(Math.round(p[0][2])); expect(Math.round(b[3])).toBe(Math.round(p[0][3])); }
  const parLigne = p.filter((b) => b[1] === p[0][1]).length;
  expect([2, 4]).toContain(parLigne);
  // Aucun texte ne déborde de son bouton.
  const deborde = await page.locator('#reglages-ortho .pack span').evaluateAll((l) => l.some((e) => e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 1));
  expect(deborde).toBe(false);
  await remplit(page, '#reglages-ortho', 0.55);
  await page.locator('#types-questions label', { hasText: 'Syllabes' }).click();
  expect(await page.evaluate(() => window.Aventura.partie.types[0])).toEqual(['syllabes']);
});

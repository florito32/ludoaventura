// v9.7 (demande du 17/11/2026) : en revenant à l'accueil après une partie gagnée, « ⭐ +N étoiles » reste au centre
// de l'écran (sans encadré) et les étoiles s'envolent vers le compteur, qui grandit au fur et à mesure.
// Durée : 1 seconde pour 10 étoiles. « Rejouer » : pas d'animation, les étoiles sont déjà dans le compte.
const { test, expect } = require('@playwright/test');
const { repondre, lancerPartie, lancerLeDe } = require('./aide');

const ETAT = (total) => JSON.stringify({ v: 1, total, journal: [], parJour: {}, coffresJour: {}, coffresNiveau: {}, defis: {}, parties: [] });

async function gagner(page) {
  await page.addInitScript(() => { try { localStorage.setItem('ludo-vu', '1'); } catch (e) { /* */ } });
  await lancerPartie(page, { joueurs: 1 });
  for (let t = 0; t < 5; t++) {
    await page.getByRole('button', { name: /^(Première question|Question suivante)$/ }).click();
    await repondre(page, true);
    await lancerLeDe(page);
  }
  await expect(page.locator('#fin-titre')).toHaveText('Aventure réussie !');
  return page.evaluate(() => window.Aventura.partie.regles.points);
}

test('accueil : les étoiles gagnées partent du centre vers le compteur, qui grandit pendant n/10 s', async ({ page }) => {
  await page.goto('./');
  await page.evaluate((etat) => {
    localStorage.setItem('ludo-vu', '1');
    localStorage.setItem('ludoaventura-etoiles', etat);
    sessionStorage.setItem('ludoaventura-gain-accueil', JSON.stringify({ n: 20 }));
  }, ETAT(100));
  const debut = Date.now();
  await page.reload();
  const gain = page.locator('.gain-accueil');
  await expect(gain).toBeVisible();
  await expect(gain).toHaveText('+20 étoiles');
  // Pas d'encadré : ni bordure ni fond.
  const style = await gain.evaluate((e) => { const s = getComputedStyle(e); return s.borderTopWidth + ' ' + s.backgroundColor; });
  expect(style).toBe('0px rgba(0, 0, 0, 0)');
  // Au centre de l'écran, sans dépasser.
  const b = await gain.boundingBox(), v = page.viewportSize();
  expect(Math.abs(b.x + b.width / 2 - v.width / 2)).toBeLessThan(4);
  expect(b.x).toBeGreaterThanOrEqual(0);
  expect(b.x + b.width).toBeLessThanOrEqual(v.width);
  // Le compteur part de 80 et passe par des valeurs intermédiaires.
  const total = page.locator('#accueil-total');
  await expect.poll(async () => Number(await total.textContent()), { intervals: [50] }).toBeGreaterThan(80);
  const milieu = Number(await total.textContent());
  expect(milieu).toBeLessThan(100);
  await expect(page.locator('.etoile-volante').first()).toBeAttached();
  await expect(total).toHaveText('100', { timeout: 6000 });
  // 20 étoiles = 2 secondes (après le rechargement et 0,25 s de mise en place).
  expect(Date.now() - debut).toBeGreaterThan(2000);
  await expect(gain).toHaveCount(0);
  await expect(page.locator('.etoile-volante')).toHaveCount(0);
  // Une seule fois : un nouveau rechargement n'anime plus rien.
  await page.reload();
  await expect(total).toHaveText('100');
  await expect(page.locator('.gain-accueil')).toHaveCount(0);
  // Pas de débordement horizontal.
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('fin de partie → « Retour à l’accueil » : animation et total exact', async ({ page }) => {
  const pts = await gagner(page);
  await page.getByRole('button', { name: 'Retour à l’accueil' }).click();
  await expect(page.locator('.gain-accueil')).toHaveText('+' + pts + ' étoiles');
  await expect(page.locator('#accueil-total')).toHaveText(String(pts), { timeout: 8000 });
  await expect(page.locator('.gain-accueil')).toHaveCount(0);
  expect(await page.evaluate(() => window.Recompenses.compte.etat.total)).toBe(pts);
});

test('fin de partie → « Rejouer » : étoiles comptées sans animation', async ({ page }) => {
  const pts = await gagner(page);
  await page.getByRole('button', { name: 'Rejouer cette aventure' }).click();
  await page.getByRole('heading', { name: 'Le plateau' }).waitFor();
  expect(await page.evaluate(() => sessionStorage.getItem('ludoaventura-gain-accueil'))).toBeNull();
  expect(await page.evaluate(() => window.Recompenses.compte.etat.total)).toBe(pts);
  await expect(page.locator('.gain-accueil')).toHaveCount(0);
});

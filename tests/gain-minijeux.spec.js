// v10.62 (demande du 26/11/2026) : quand on finit un mini-jeu et qu'on revient à l'accueil, l'animation des étoiles gagnées
// (« ⭐ +10 étoiles » au centre, étoiles qui volent vers « Mon compte ») se joue, avec le son d'étoile et les vibrations
// (js/recompenses.js → animerGain, js/sons.js). Plusieurs parties de suite = un seul envol du cumul.
const { test, expect } = require('@playwright/test');
const { rapide, creerJoueurs, quiJoue } = require('./aide');

// Imite le vibreur (le navigateur de test n'en a pas) et garde chaque appel.
async function accueil(page) {
  await rapide(page);
  await page.addInitScript(() => {
    window.__vib = [];
    Object.defineProperty(navigator, 'vibrate', { configurable: true, value: (p) => { window.__vib.push(p); return true; } });
    try { localStorage.setItem('ludo-vu', '1'); } catch (e) { /* */ }
  });
  await page.goto('./');
  await creerJoueurs(page, 1);
}
const sons = (page) => page.evaluate(() => window.Sons.historique.filter((h) => h.son === 'etoile').length);
// Fabrique un mot (deux touches), le fait lire, puis « J'ai fini » : fin de partie, +10 étoiles.
async function finirFabrique(page) {
  await page.locator('.baby-touche').first().click();
  await page.locator('.baby-lire').click();
  await page.locator('.baby-fini').click();
  await expect(page.locator('.minijeu-fin')).toContainText('+10 étoiles');
}
async function lancerFabrique(page) {
  await page.locator('#btn-minijeux').click();
  await page.locator('.minijeu-carte[data-jeu="fabrique"]').click();
  await quiJoue(page);
}
const total = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('ludoaventura-etoiles')).total);

test('mini-jeu fini puis « Retour à l’accueil » : « +10 étoiles », étoiles volantes, son et vibrations', async ({ page }) => {
  await accueil(page);
  await lancerFabrique(page);
  await finirFabrique(page);
  expect(await total(page)).toBe(10); // les étoiles sont déjà dans le compte dès la fin de la partie
  // Rien ne vole tant qu'on n'est pas à l'accueil.
  await expect(page.locator('.gain-accueil')).toHaveCount(0);
  expect(await sons(page)).toBe(0);
  await page.locator('#minijeu-accueil').click();
  await expect(page.locator('#ecran-accueil')).toBeVisible();
  const gain = page.locator('.gain-accueil');
  await expect(gain).toBeVisible();
  await expect(gain).toHaveText('+10 étoiles');
  await expect(page.locator('.etoile-volante').first()).toBeAttached();
  await expect(page.locator('#btn-compte')).toHaveClass(/recoit/, { timeout: 4000 });
  // Son d'étoile pendant l'animation et petites vibrations.
  await expect.poll(() => sons(page), { timeout: 4000 }).toBeGreaterThan(3);
  expect(await page.evaluate(() => window.__vib.filter((v) => v > 0).length)).toBeGreaterThan(3);
  // L'animation se termine et ne se rejoue pas.
  await expect(gain).toHaveCount(0, { timeout: 6000 });
  await expect(page.locator('.etoile-volante')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.reload();
  await expect(page.locator('#btn-commencer')).toBeVisible();
  await expect(page.locator('.gain-accueil')).toHaveCount(0);
});

test('plusieurs mini-jeux de suite, retour par la flèche « Accueil » : un seul envol du cumul (+20)', async ({ page }) => {
  await accueil(page);
  await lancerFabrique(page);
  await finirFabrique(page);
  await page.locator('#minijeu-rejouer').click();
  await finirFabrique(page);
  expect(await total(page)).toBe(20);
  await page.locator('#minijeu-liste').click(); // « Autres mini-jeux » : toujours pas à l'accueil, rien ne vole
  await expect(page.locator('.minijeu-carte').first()).toBeVisible();
  await expect(page.locator('.gain-accueil')).toHaveCount(0);
  await page.locator('#ecran-minijeux [data-retour-accueil]').click();
  await expect(page.locator('.gain-accueil')).toHaveText('+20 étoiles');
  await expect(page.locator('.gain-accueil')).toHaveCount(0, { timeout: 6000 });
});

test('mini-jeu abandonné : aucune étoile, aucune animation à l’accueil', async ({ page }) => {
  await accueil(page);
  await lancerFabrique(page);
  await page.locator('#minijeu-retour').click(); // partie abandonnée
  await page.locator('#ecran-minijeux [data-retour-accueil]').click();
  await expect(page.locator('#btn-commencer')).toBeVisible();
  await page.waitForTimeout(700);
  await expect(page.locator('.gain-accueil')).toHaveCount(0);
  expect(await sons(page)).toBe(0);
});

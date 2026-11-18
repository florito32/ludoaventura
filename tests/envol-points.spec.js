// Envol des points (v10.15, backlog ligne 429) : en fin de tour, une forme par point gagné (flamme, pierre…) se pose
// au centre du plateau, puis vole en 1 s vers l'image des points en rétrécissant ; le comptage monte à chaque arrivée.
const { test, expect } = require('@playwright/test');
const Envol = require('../js/envol.js');
const { repondre, lancerPartie, lancerLeDe } = require('./aide');

test.describe('formes de l\'envol', () => {
  test.beforeEach(() => test.skip(test.info().project.name !== 'ordinateur', 'test de logique : un seul format suffit'));

  test('chaque aventure a sa forme, et le sprite d\'index.html la dessine', async ({ page }) => {
    await page.goto('/');
    const ids = await page.evaluate(() => window.Aventures.LISTE.map((a) => a.id));
    expect(ids.length).toBe(10);
    expect(Envol.FORMES.prehistoire).toBe('f-flamme'); // demande de l'utilisateur : flamme pour la préhistoire
    expect(Envol.FORMES.mayas).toBe('f-pierre-maya'); // pierres pour les Mayas
    for (const id of ids) {
      const sym = await page.evaluate((i) => window.Envol.symbole(i), id);
      expect(Envol.FORMES[id], id).toBe(sym);
      expect(await page.locator('symbol#' + sym).count(), sym).toBe(1);
    }
    expect(new Set(ids.map((i) => Envol.FORMES[i])).size).toBe(10); // 10 formes différentes
  });

  test('réglages choisis (proposition A du 18/11/2026) : vol d\'une seconde, formes qui rétrécissent', () => {
    expect(Envol.REGLAGES).toMatchObject({ taille: 0.12, fin: 0.22, pause: 200, ecart: 130, duree: 1000, rotation: 1 });
  });
});

// Partie réelle : le dé roule vite, l'envol est activé (window.AVENTURA_ENVOL = true), la pause entre joueurs est courte.
async function partieAvecEnvol(page, aventure) {
  await page.addInitScript(() => { window.AVENTURA_PAUSE = 80; window.AVENTURA_DUREE_DE = 0; window.AVENTURA_AUTO_DE = 600000; window.AVENTURA_ENVOL = true; });
  page.__rapide = true;
  await lancerPartie(page, aventure ? { aventure } : {});
  await page.getByRole('button', { name: /^(Première question|Question suivante)$/ }).click();
  await repondre(page, true);
}

test('fin de tour : les formes se posent au centre, volent vers l\'image, et le comptage monte à chaque arrivée', async ({ page }) => {
  await partieAvecEnvol(page, 'Préhistoire');
  await lancerLeDe(page);
  const formes = page.locator('#envol-couche .envol-forme');
  // Elles apparaissent (une par point : 4 à 6), grosses, au centre du plateau ; le comptage n'a pas bougé.
  await expect.poll(() => formes.count()).toBeGreaterThanOrEqual(4);
  const n = await formes.count();
  expect(n).toBeLessThanOrEqual(6);
  await expect(page.locator('#points')).toHaveText('0');
  // Taille et place de départ lues dans le style (la forme est encore en train de « se poser » : son échelle varie).
  const depart = await page.evaluate(() => {
    const c = document.getElementById('envol-couche'), f = c.querySelector('.envol-forme');
    return { couche: c.getBoundingClientRect().width, w: parseFloat(f.style.width), cx: parseFloat(f.style.left) + parseFloat(f.style.width) / 2 };
  });
  expect(depart.w).toBeGreaterThan(depart.couche * 0.08); // grosse au départ (12 % du plateau)
  expect(Math.abs(depart.cx - depart.couche / 2)).toBeLessThan(depart.couche * 0.2); // au centre du plateau
  expect(await formes.first().locator('use').getAttribute('href')).toBe('#f-flamme'); // flamme pour la préhistoire
  // Pendant le vol, une forme se rapproche de l'image des points en rétrécissant.
  // On suit la largeur de la première forme : elle se pose (grandit), puis rétrécit en volant jusqu'à l'image.
  const arrivee = await page.evaluate(() => new Promise((res) => {
    const t0 = performance.now(), el = document.querySelector('#envol-couche .envol-forme');
    const cb = document.getElementById('construction').getBoundingClientRect();
    const mesures = [];
    (function boucle() {
      if (!el.isConnected || performance.now() - t0 > 5000) {
        const pic = Math.max(...mesures), apresPic = mesures.slice(mesures.indexOf(pic));
        return res({ pic, fin: Math.min(...apresPic), cibleW: cb.width, croissant: apresPic.every((w, i) => i === 0 || w <= apresPic[i - 1] + 0.5) });
      }
      // Taille réelle = largeur × échelle de la transformation (la largeur du cadre varie avec la rotation).
      const m = new DOMMatrix(getComputedStyle(el).transform);
      mesures.push(parseFloat(el.style.width) * Math.hypot(m.a, m.b));
      requestAnimationFrame(boucle);
    })();
  }));
  expect(arrivee.fin).toBeLessThan(arrivee.pic * 0.6); // de plus en plus petite
  expect(arrivee.fin).toBeGreaterThan(0);
  expect(arrivee.fin).toBeLessThan(arrivee.cibleW * 0.4); // minuscule dans l'image des points (22 % de sa largeur)
  expect(arrivee.croissant).toBe(true); // elle ne regrossit jamais en volant
  // Le comptage monte à chaque arrivée, jusqu'au total du dé.
  await expect.poll(async () => Number(await page.locator('#points').textContent()), { timeout: 8000 }).toBe(n);
  expect(n).toBeGreaterThan(0);
  await expect(page.locator('#envol-couche .envol-forme')).toHaveCount(0); // plus aucune forme à la fin
  await expect(page.locator('#envol-couche')).toBeEmpty();
});

test('le joueur suivant n\'arrive qu\'après la dernière arrivée', async ({ page }) => {
  await partieAvecEnvol(page);
  await lancerLeDe(page);
  await expect(page.locator('#envol-couche .envol-forme').first()).toBeVisible();
  const nom = await page.locator('#tour-nom').textContent();
  // Tant que les formes volent, c'est encore le même joueur (pause de jeu : 80 ms seulement dans ce test).
  await page.waitForTimeout(400);
  expect(await page.locator('#envol-couche .envol-forme').count()).toBeGreaterThan(0);
  expect(await page.locator('#tour-nom').textContent()).toBe(nom);
  await expect(page.getByRole('button', { name: /^(Première question|Question suivante)$/ })).toBeVisible({ timeout: 9000 });
  expect(await page.locator('#tour-nom').textContent()).not.toBe(nom);
  expect(Number(await page.locator('#points').textContent())).toBeGreaterThanOrEqual(4);
});

test('quitter la partie pendant l\'envol (Menu → Retour à l\'accueil) : plus aucune forme', async ({ page }) => {
  await partieAvecEnvol(page);
  await lancerLeDe(page);
  await expect(page.locator('#envol-couche .envol-forme').first()).toBeVisible();
  await page.getByRole('button', { name: 'Menu' }).click();
  await page.getByRole('button', { name: 'Retour à l’accueil' }).click();
  await page.getByRole('button', { name: 'Oui, arrêter la partie' }).click();
  await expect(page.getByRole('button', { name: 'Commencer l\'aventure' })).toBeVisible();
  await expect(page.locator('#envol-couche .envol-forme')).toHaveCount(0);
  await expect(page.locator('#envol-couche')).toBeEmpty();
});

test('mouvement réduit : pas de forme volante, les points s\'affichent d\'un coup', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1366, height: 800 } });
  const page = await ctx.newPage();
  await page.addInitScript(() => { window.AVENTURA_PAUSE = 80; window.AVENTURA_AUTO_DE = 600000; });
  page.__rapide = true;
  await lancerPartie(page);
  await page.getByRole('button', { name: /^(Première question|Question suivante)$/ }).click();
  await repondre(page, true);
  await lancerLeDe(page);
  await expect(page.locator('#points')).not.toHaveText('0');
  expect(await page.locator('#envol-couche .envol-forme').count()).toBe(0);
  await ctx.close();
});

test('sans envol (tests qui raccourcissent le dé) : les points s\'affichent tout de suite', async ({ page }) => {
  await page.addInitScript(() => { window.AVENTURA_PAUSE = 80; window.AVENTURA_DUREE_DE = 0; window.AVENTURA_AUTO_DE = 600000; });
  page.__rapide = true;
  await lancerPartie(page);
  await page.getByRole('button', { name: /^(Première question|Question suivante)$/ }).click();
  await repondre(page, true);
  await lancerLeDe(page);
  await expect(page.locator('#points')).not.toHaveText('0');
  expect(await page.locator('#envol-couche .envol-forme').count()).toBe(0);
});

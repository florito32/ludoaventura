// Visuel Aventura : accueil façon boîte, puis plateau avec les pions sur DÉPART.
// Formats testés : téléphone, téléphone carré, tablette, ordinateur (playwright.config.js).
const { test, expect } = require('@playwright/test');
const { lancerPartie } = require('./aide');

// Vérifie qu'une image est réellement chargée et affichée.
async function imageChargee(loc) {
  await expect(loc).toBeVisible();
  await expect.poll(() => loc.evaluate((img) => img.complete && img.naturalWidth > 0)).toBe(true);
}

test('accueil : arche Aventura, aventurier et bouton pour commencer @smoke', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Aventura');
  await imageChargee(page.getByRole('img', { name: /Aventura/ }));
  await imageChargee(page.locator('.perso'));
  await imageChargee(page.locator('.herbe'));
  await expect(page.getByRole('button', { name: 'Commencer l\'aventure' })).toBeVisible();
});

test('accueil : tout tient à l\'écran, sans défilement horizontal', async ({ page }) => {
  await page.goto('./');
  const vp = page.viewportSize();
  const sw = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(sw).toBeLessThanOrEqual(vp.width);
  const btn = await page.getByRole('button', { name: 'Commencer l\'aventure' }).boundingBox();
  expect(btn.x).toBeGreaterThanOrEqual(0);
  expect(btn.x + btn.width).toBeLessThanOrEqual(vp.width);
  expect(btn.y + btn.height).toBeLessThanOrEqual(vp.height);
  // Le bouton ne doit pas être caché par l'aventurier ou les herbes.
  const dessus = await page.evaluate(({ x, y }) => document.elementFromPoint(x, y).closest('button')?.id,
    { x: btn.x + btn.width / 2, y: btn.y + btn.height / 2 });
  expect(dessus).toBe('btn-commencer');
});

test('plateau : illustration, 6 cases ; le 1er pion part de DÉPART et va sur la croix 1 @smoke', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' }); // positions lues sans l'animation d'arrivée des pions
  await page.clock.install(); // horloge contrôlée : on voit le pion partir de DÉPART
  await lancerPartie(page, { joueurs: 4 });
  await expect(page.locator('.pion').nth(0)).toHaveAttribute('data-case', '0');
  await page.clock.runFor(600);
  await expect(page.locator('.pion').nth(0)).toHaveAttribute('data-case', '1');
  await imageChargee(page.getByRole('img', { name: /Plateau d'Aventura/ }));
  await expect(page.locator('#cases li')).toHaveCount(6);
  await expect(page.locator('#cases li').first()).toHaveText('DÉPART');
  await expect(page.locator('#cases li').last()).toContainText('ARRIVÉE');

  const pions = page.locator('.pion');
  await expect(pions).toHaveCount(4);
  const plateau = await page.locator('#plateau').boundingBox();
  const centre = async (loc) => { const b = await loc.boundingBox(); return [b.x + b.width / 2, b.y + b.height / 2]; };
  const proche = async (pion, kase) => {
    const [cx, cy] = await centre(pion);
    const c = await page.locator('#cases li').nth(kase).boundingBox();
    return Math.hypot(cx - c.x, cy - c.y) < plateau.width * 0.08;
  };
  // Règle : le 1er joueur pose son pion sur la première croix, les autres attendent sur DÉPART.
  expect(await proche(pions.nth(0), 1)).toBe(true);
  for (let i = 1; i < 4; i++) expect(await proche(pions.nth(i), 0)).toBe(true);
  await expect(page.locator('.pion').nth(0)).toHaveAttribute('data-case', '1');
  await expect(page.locator('.pion').nth(1)).toHaveAttribute('data-case', '0');
});

test('plateau : points à 0 dans l\'encadré en haut à gauche ; plus d\'encadrés joueurs, dés, tas, ambiance', async ({ page }) => {
  await lancerPartie(page, { joueurs: 4 });
  await expect(page.locator('#points')).toHaveText('0');
  const boite = await page.locator('#points-plateau').boundingBox();
  const plateau = await page.locator('#plateau').boundingBox();
  // Encadré dans le quart haut-gauche du plateau.
  expect(boite.x).toBeLessThan(plateau.x + plateau.width * 0.05);
  expect(boite.y).toBeLessThan(plateau.y + plateau.height * 0.06);
  expect(boite.x + boite.width).toBeLessThan(plateau.x + plateau.width * 0.5);
  for (const absent of ['#joueurs', '#tas', '.de-btn', '.ambiance-btn']) await expect(page.locator(absent)).toHaveCount(0);
});

test('ambiance automatique : soir pour la Savane, jour pour les Vikings', async ({ page }) => {
  await lancerPartie(page, { aventure: 'Savane' });
  await expect(page.locator('#plateau-img')).toHaveAttribute('src', /plateau-soir/);
  await lancerPartie(page, { aventure: 'Viking' });
  await expect(page.locator('#plateau-img')).toHaveAttribute('src', /plateau-jour/);
});

test('plateau : pas de défilement horizontal et retour à la préparation puis à l\'accueil', async ({ page }) => {
  await lancerPartie(page, { joueurs: 4 });
  const sw = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(sw).toBeLessThanOrEqual(page.viewportSize().width);
  await page.getByRole('button', { name: /Préparation/ }).click();
  await expect(page.getByRole('heading', { name: 'Préparer la partie' })).toBeVisible();
  await page.getByRole('button', { name: /Accueil/ }).click();
  await expect(page.getByRole('button', { name: 'Commencer l\'aventure' })).toBeVisible();
});

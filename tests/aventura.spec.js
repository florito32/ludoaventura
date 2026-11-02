// Visuel Aventura : accueil façon boîte, puis plateau avec les pions sur DÉPART.
// Formats testés : téléphone, téléphone carré, tablette, ordinateur (playwright.config.js).
const { test, expect } = require('@playwright/test');

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

test('plateau : illustration, 6 cases, 4 pions sur la case DÉPART @smoke', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Commencer l\'aventure' }).click();
  await expect(page.getByRole('heading', { name: 'Le plateau' })).toBeVisible();
  await imageChargee(page.getByRole('img', { name: /Plateau d'Aventura/ }));
  await expect(page.locator('#cases li')).toHaveCount(6);
  await expect(page.locator('#cases li').first()).toHaveText('DÉPART');
  await expect(page.locator('#cases li').last()).toContainText('ARRIVÉE');

  const pions = page.locator('.pion');
  await expect(pions).toHaveCount(4);
  const plateau = await page.locator('#plateau').boundingBox();
  const depart = await page.locator('.case-depart').boundingBox();
  for (let i = 0; i < 4; i++) {
    const b = await pions.nth(i).boundingBox();
    const cx = b.x + b.width / 2, cy = b.y + b.height / 2;
    // Pions dans le plateau et regroupés autour de DÉPART (à moins de 8 % de la largeur).
    expect(cx).toBeGreaterThan(plateau.x);
    expect(cy).toBeLessThan(plateau.y + plateau.height);
    expect(Math.hypot(cx - depart.x, cy - depart.y)).toBeLessThan(plateau.width * 0.08);
  }
  await expect(page.locator('#joueurs li')).toHaveCount(4);
  await expect(page.locator('.joueur-case').first()).toHaveText('DÉPART');
});

test('plateau : points à 0, dés FAIBLE et FORT, piles de cartes', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Commencer l\'aventure' }).click();
  await expect(page.locator('#points')).toHaveText('0');
  await expect(page.getByText('Dé FAIBLE')).toBeVisible();
  await expect(page.getByText('Dé FORT')).toBeVisible();
  await expect(page.locator('.pile')).toHaveCount(4);
  await expect(page.locator('.pile').first()).toContainText('AVENTURE');
});

test('plateau : ambiance Soir puis Jour', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Commencer l\'aventure' }).click();
  const img = page.locator('#plateau-img');
  await page.getByRole('button', { name: 'Soir' }).click();
  await expect(page.getByRole('button', { name: 'Soir' })).toHaveAttribute('aria-pressed', 'true');
  await expect(img).toHaveAttribute('src', /plateau-soir/);
  await imageChargee(img);
  await page.getByRole('button', { name: 'Jour' }).click();
  await expect(img).toHaveAttribute('src', /plateau-jour/);
});

test('plateau : pas de défilement horizontal et retour à l\'accueil', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Commencer l\'aventure' }).click();
  const sw = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(sw).toBeLessThanOrEqual(page.viewportSize().width);
  await page.getByRole('button', { name: /Accueil/ }).click();
  await expect(page.getByRole('button', { name: 'Commencer l\'aventure' })).toBeVisible();
});

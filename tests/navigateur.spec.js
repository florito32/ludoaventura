// Jeu dans le navigateur uniquement (v6.48, demande du 12/11/2026) : plus d'application installable,
// plus de bouton « Installer l'application », plus de copie hors ligne ; l'ancienne est nettoyée.
const { test, expect } = require('@playwright/test');

test('plus installable : ni manifeste, ni mode application, ni bouton d\'installation @smoke', async ({ page, request }) => {
  await page.goto('./');
  await expect(page.getByRole('button', { name: 'Commencer l\'aventure' })).toBeVisible();
  await expect(page.locator('link[rel="manifest"]')).toHaveCount(0);
  await expect(page.locator('meta[name="apple-mobile-web-app-capable"], meta[name="mobile-web-app-capable"]')).toHaveCount(0);
  await expect(page.locator('link[rel="apple-touch-startup-image"]')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Installer/ })).toHaveCount(0);
  await expect(page.locator('#btn-installer, #installer')).toHaveCount(0);
  expect((await request.get('manifest.webmanifest')).status()).toBe(404);
  // L'icône reste pour les favoris et les raccourcis du navigateur.
  const icone = await page.locator('link[rel="apple-touch-icon"]').getAttribute('href');
  expect((await request.get(new URL(icone, page.url()).href)).ok()).toBeTruthy();
});

test('aucun service worker n\'est enregistré', async ({ page }) => {
  await page.goto('./');
  await page.waitForLoadState('load');
  await page.waitForTimeout(500);
  expect(await page.evaluate(() => navigator.serviceWorker.getRegistrations().then((r) => r.length))).toBe(0);
  expect(await page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(false);
});

test('l\'ancienne copie hors ligne est vidée à l\'ouverture', async ({ page }) => {
  await page.goto('./');
  await page.evaluate(async () => { await (await caches.open('ludoaventura-v6.47')).put('ancien', new Response('x')); });
  await page.reload();
  await expect.poll(() => page.evaluate(() => caches.keys())).toEqual([]);
});

test('un ancien service worker se nettoie et se désinscrit (sw.js)', async ({ page }) => {
  await page.goto('./');
  // Comme un appareil qui avait la version installable : copie hors ligne + service worker.
  await page.evaluate(async () => {
    await (await caches.open('ludoaventura-v6.47')).put('ancien', new Response('x'));
    await navigator.serviceWorker.register('sw.js');
  });
  await expect.poll(() => page.evaluate(() => navigator.serviceWorker.getRegistrations().then((r) => r.length)), { timeout: 10000 }).toBe(0);
  await expect.poll(() => page.evaluate(() => caches.keys())).toEqual([]);
  await expect(page.getByRole('button', { name: 'Commencer l\'aventure' })).toBeVisible();
});

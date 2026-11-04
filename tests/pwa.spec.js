// PWA : manifeste valide, icônes présentes, service worker actif, page servie hors ligne.
const { test, expect } = require('@playwright/test');

test('manifeste et icônes accessibles @smoke', async ({ page, request }) => {
  await page.goto('./');
  const href = await page.locator('link[rel="manifest"]').getAttribute('href');
  const manifestUrl = new URL(href, page.url()).href;
  const res = await request.get(manifestUrl);
  expect(res.ok()).toBeTruthy();
  const manifest = await res.json();
  expect(manifest.display).toBe('standalone');
  for (const icon of manifest.icons) {
    expect((await request.get(new URL(icon.src, manifestUrl).href)).ok()).toBeTruthy();
  }
  const apple = await page.locator('link[rel="apple-touch-icon"]').getAttribute('href');
  expect((await request.get(new URL(apple, page.url()).href)).ok()).toBeTruthy();
});

test('service worker actif et page disponible hors ligne', async ({ page, context }) => {
  await page.goto('./');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload(); // la page est maintenant contrôlée et mise en cache
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Commencer l\'aventure' })).toBeVisible();
  await context.setOffline(false);
});

test('le service worker couvre tout le site depuis un jeu', async ({ page }) => {
  await page.goto('./');
  const scope = await page.evaluate(() => navigator.serviceWorker.ready.then((r) => r.scope));
  expect(new URL(scope).pathname).toBe(new URL('./', page.url()).pathname);
});

// Écran de lancement (04/11/2026) : sur Android, fond bleu ciel de l'accueil au lieu du vert ;
// sur iPhone, image plein écran de l'accueil, une par taille d'écran, à la bonne taille en pixels.
test('écran de lancement : fond ciel (Android) et images plein écran (iPhone) @smoke', async ({ page, request }) => {
  await page.goto('./');
  const manifestUrl = new URL(await page.locator('link[rel="manifest"]').getAttribute('href'), page.url()).href;
  const manifest = await (await request.get(manifestUrl)).json();
  expect(manifest.background_color).toBe('#82c1e4');
  const liens = await page.locator('link[rel="apple-touch-startup-image"]').evaluateAll((ls) =>
    ls.map((l) => ({ href: l.getAttribute('href'), media: l.getAttribute('media') })));
  expect(liens.length).toBeGreaterThanOrEqual(12);
  for (const { href, media } of liens) {
    const [, w, h, dpr] = media.match(/device-width: (\d+)px\).*device-height: (\d+)px\).*pixel-ratio: (\d)/);
    const res = await request.get(new URL(href, page.url()).href);
    expect(res.ok(), href).toBeTruthy();
    // Dimensions lues dans l'en-tête PNG (octets 16 à 23).
    const buf = await res.body();
    expect([buf.readUInt32BE(16), buf.readUInt32BE(20)], href).toEqual([w * dpr, h * dpr]);
  }
});

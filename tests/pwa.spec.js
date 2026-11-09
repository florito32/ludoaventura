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

// Bug du 09/11/2026 (v6.26) : en mode avion, le plateau s'affichait cassé (texte de remplacement),
// il fallait se reconnecter. Préhistoire utilise le plateau du soir.
const { lancerPartie, rapide, versReglages, cocherTout } = require('./aide');
async function horsLigneAvecCache(page, context) {
  await page.goto('./');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  await expect.poll(() => page.evaluate(async () => !!(await caches.match('img/plateau-soir.webp')))).toBe(true);
}
const plateauCharge = (page) => page.evaluate(() => {
  const i = document.getElementById('plateau-img');
  return i.complete && i.naturalWidth > 0 ? i.getAttribute('src') : null;
});

test('hors ligne : le plateau du soir s\'affiche (ouverture du jeu en mode avion)', async ({ page, context }) => {
  await horsLigneAvecCache(page, context);
  await context.setOffline(true);
  await lancerPartie(page, { joueurs: 1, aventure: 'Préhistoire' });
  await expect.poll(() => plateauCharge(page)).toBe('img/plateau-soir.webp');
  await context.setOffline(false);
});

test('hors ligne : le plateau s\'affiche si le réseau est coupé après l\'ouverture', async ({ page, context }) => {
  await rapide(page);
  await horsLigneAvecCache(page, context);
  await page.waitForLoadState('load');
  await context.setOffline(true);
  // Plateau du soir retiré de la copie hors ligne : seul le préchargement en mémoire peut l'afficher.
  await page.evaluate(async () => { for (const k of await caches.keys()) await (await caches.open(k)).delete('img/plateau-soir.webp'); });
  await versReglages(page, 1);
  await cocherTout(page, 1);
  await page.getByRole('radio', { name: /^Préhistoire/ }).check();
  await page.getByRole('button', { name: 'Lancer la partie' }).click();
  await expect.poll(() => plateauCharge(page)).toBe('img/plateau-soir.webp');
  await context.setOffline(false);
});

test('copie hors ligne réparée : un fichier manquant est retéléchargé, une image absente n\'est jamais remplacée par la page', async ({ page, context }) => {
  await horsLigneAvecCache(page, context);
  // On efface le plateau du soir de la copie hors ligne, comme s'il n'avait jamais été enregistré.
  await page.evaluate(async () => { for (const k of await caches.keys()) await (await caches.open(k)).delete('img/plateau-soir.webp'); });
  // La réparation a lieu au plus une fois par minute : on lève ce délai, puis on rouvre la page en ligne.
  await context.serviceWorkers()[0].evaluate(() => { self.derniereReparation = 0; });
  await page.reload();
  await expect.poll(() => page.evaluate(async () => !!(await caches.match('img/plateau-soir.webp')))).toBe(true);
  // Hors ligne, une image inconnue reçoit une erreur, pas la page d'accueil.
  await context.setOffline(true);
  const r = await page.evaluate(() => fetch('img/inexistante.webp').then((x) => x.headers.get('content-type'), () => 'erreur'));
  expect(r).toBe('erreur');
  await context.setOffline(false);
});

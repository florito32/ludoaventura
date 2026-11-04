// Bouton « Installer l'application » (v6.24, demande du 04/11/2026) : sur l'accueil, téléphone et tablette
// seulement, et seulement dans un navigateur (pas dans l'application déjà installée).
const { test, expect } = require('@playwright/test');

const tactile = (p) => p !== 'ordinateur';

test('visible sur téléphone et tablette, caché sur ordinateur', async ({ page }) => {
  await page.goto('./');
  const btn = page.getByRole('button', { name: 'Installer l’application' });
  if (tactile(test.info().project.name)) {
    await expect(btn).toBeVisible();
    await expect(btn).toBeInViewport({ ratio: 1 });
    // Il ne cache pas les deux boutons du jeu.
    const b = await btn.boundingBox(), d = await page.locator('#btn-didacticiel').boundingBox();
    expect(b.y).toBeGreaterThanOrEqual(d.y + d.height - 1);
  } else {
    await expect(btn).toBeHidden();
  }
  // Seulement sur l'accueil.
  await page.getByRole('button', { name: 'Commencer l\'aventure' }).click();
  await expect(btn).toBeHidden();
});

test('caché dans l\'application installée (mode autonome)', async ({ page }) => {
  await page.addInitScript(() => {
    const mm = window.matchMedia.bind(window);
    window.matchMedia = (q) => (q.includes('display-mode: standalone') ? { matches: true, media: q, addEventListener() {}, removeEventListener() {} } : mm(q));
  });
  await page.goto('./');
  await expect(page.locator('#btn-installer')).toBeHidden();
});

test('Android (Chrome) : ouvre la fenêtre d\'installation du navigateur', async ({ page }) => {
  test.skip(!tactile(test.info().project.name), 'bouton absent sur ordinateur');
  await page.goto('./');
  await page.evaluate(() => {
    const e = new Event('beforeinstallprompt');
    e.prompt = () => { window.__invite = (window.__invite || 0) + 1; };
    e.userChoice = Promise.resolve({ outcome: 'accepted' });
    window.dispatchEvent(e);
  });
  await page.getByRole('button', { name: 'Installer l’application' }).click();
  await expect.poll(() => page.evaluate(() => window.__invite)).toBe(1);
  await expect(page.locator('#btn-installer')).toBeHidden(); // installée : plus de bouton
  await expect(page.locator('#installer')).toBeHidden();
});

test('sans fenêtre du navigateur (iPhone, Firefox…) : explique comment ajouter l\'icône', async ({ page }) => {
  test.skip(!tactile(test.info().project.name), 'bouton absent sur ordinateur');
  await page.goto('./');
  await page.getByRole('button', { name: 'Installer l’application' }).click();
  const boite = page.locator('#installer');
  await expect(boite).toBeVisible();
  await expect(boite).toContainText('écran d’accueil');
  await expect(boite).toBeInViewport({ ratio: 1 });
  await page.getByRole('button', { name: 'J’ai compris' }).click();
  await expect(boite).toBeHidden();
});

test('iPhone : indique le bouton Partager', async ({ browser }) => {
  test.skip(test.info().project.name !== 'telephone', 'un format suffit');
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1' });
  const page = await ctx.newPage();
  await page.goto(test.info().project.use.baseURL);
  await page.getByRole('button', { name: 'Installer l’application' }).click();
  await expect(page.locator('#installer')).toContainText('Partager');
  await expect(page.locator('#installer')).toContainText('Sur l’écran d’accueil');
  await ctx.close();
});

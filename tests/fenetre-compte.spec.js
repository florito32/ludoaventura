// Fenêtre de connexion au lancement (v10.3, demande du 17/11/2026, backlog ligne 405).
// Tant que le joueur n'est pas connecté, une fenêtre centrée propose « Se connecter », « Créer un compte »
// (v10.58 : plus de « Jouer en invité »), à chaque ouverture du jeu ; elle ne se ferme pas avec Échap. Le service Supabase est imité (aucun appel réel).
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

const SERVICE = 'https://qxaaqcivtnhikppwmgdh.supabase.co';
const UTILISATEUR = { id: '11111111-2222-3333-4444-555555555555', email: 'joueur@example.com' };

async function preparer(page, { session = null } = {}) {
  await page.route(SERVICE + '/**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
  await page.addInitScript((s) => {
    window.AVENTURA_FENETRE_COMPTE = true; // les tests ne voient la fenêtre que s'ils la demandent
    window.AVENTURA_DELAI_SYNCHRO = 0;
    localStorage.setItem('ludo-vu', '1');
    if (s) localStorage.setItem('ludoaventura-session', JSON.stringify(s));
  }, session);
}
const fenetre = (page) => page.locator('#fenetre-compte');

test('pas connecté : la fenêtre s’ouvre au centre, avec les deux choix, sans mode invité, sans débordement @smoke', async ({ page }) => {
  await preparer(page);
  await page.goto('./');
  await expect(fenetre(page)).toBeVisible();
  await expect(page.getByRole('dialog', { name: 'Bienvenue dans Aventura !' })).toBeVisible();
  for (const nom of ['Se connecter', 'Créer un compte']) {
    await expect(fenetre(page).getByRole('button', { name: nom, exact: true })).toBeVisible();
  }
  // Centrée et entièrement dans l'écran (aucun défilement nécessaire).
  const v = page.viewportSize(), b = await fenetre(page).boundingBox();
  expect(b.x).toBeGreaterThanOrEqual(0);
  expect(b.y).toBeGreaterThanOrEqual(0);
  expect(b.x + b.width).toBeLessThanOrEqual(v.width + 1);
  expect(b.y + b.height).toBeLessThanOrEqual(v.height + 1);
  expect(Math.abs((b.x + b.width / 2) - v.width / 2)).toBeLessThan(3);
  expect(Math.abs((b.y + b.height / 2) - v.height / 2)).toBeLessThan(3);
  const deborde = await fenetre(page).evaluate((d) => d.scrollHeight > d.clientHeight + 1 || d.scrollWidth > d.clientWidth + 1);
  expect(deborde).toBe(false);
  await expect(fenetre(page).getByRole('button', { name: 'Jouer en invité' })).toHaveCount(0);
  // Les deux boutons ne sortent pas de la fenêtre.
  for (const id of ['fenetre-connecter', 'fenetre-creer']) {
    const bb = await page.locator('#' + id).boundingBox();
    expect(bb.x).toBeGreaterThanOrEqual(b.x);
    expect(bb.x + bb.width).toBeLessThanOrEqual(b.x + b.width + 1);
  }
});

test('la fenêtre ne se ferme pas avec Échap et revient quand on quitte « Mon compte » sans être connecté', async ({ page }) => {
  await preparer(page);
  await page.goto('./');
  await expect(fenetre(page)).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(fenetre(page)).toBeVisible(); // obligatoire : pas d'invité
  await fenetre(page).getByRole('button', { name: 'Se connecter' }).click();
  await expect(fenetre(page)).toBeHidden();
  await expect(page.locator('#ecran-compte')).toBeVisible();
  // Retour à l'accueil sans s'être connecté : la fenêtre revient.
  await page.evaluate(() => window.Aventura.afficher('ecran-accueil'));
  await expect(fenetre(page)).toBeVisible();
});

test('« Se connecter » ouvre l’écran Mon compte sur le formulaire de connexion', async ({ page }) => {
  await preparer(page);
  await page.goto('./');
  await fenetre(page).getByRole('button', { name: 'Se connecter' }).click();
  await expect(fenetre(page)).toBeHidden();
  await expect(page.locator('#ecran-compte')).toBeVisible();
  await expect(page.locator('#compte-form')).toBeVisible();
  await expect(page.locator('#compte-email')).toBeFocused();
});

test('« Créer un compte » ouvre directement le formulaire de création', async ({ page }) => {
  await preparer(page);
  await page.goto('./');
  await fenetre(page).getByRole('button', { name: 'Créer un compte' }).click();
  await expect(fenetre(page)).toBeHidden();
  await expect(page.locator('#compte-creation')).toBeVisible();
  await expect(page.locator('#compte-invite')).toBeHidden();
  await expect(page.locator('#creation-email')).toBeFocused();
});

test('déjà connecté : pas de fenêtre', async ({ page }) => {
  await preparer(page, { session: { access_token: 'jeton-test', refresh_token: 'r', expires_at: Math.floor(Date.now() / 1000) + 3600, user: UTILISATEUR } });
  await page.goto('./');
  await expect(page.locator('#ecran-accueil')).toBeVisible();
  await page.waitForTimeout(300);
  await expect(fenetre(page)).toBeHidden();
});

test('fenêtre : aucun défaut d’accessibilité', async ({ page }) => {
  test.skip(test.info().project.name !== 'ordinateur', 'un format suffit');
  await preparer(page);
  await page.goto('./');
  await expect(fenetre(page)).toBeVisible();
  const r = await new AxeBuilder({ page }).include('#fenetre-compte').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(r.violations).toEqual([]);
});

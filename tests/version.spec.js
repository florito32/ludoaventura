// Numéro de version + historique au clic, réservés au compte de l'auteur (v9.5, 17/11/2026).
const { test, expect } = require('@playwright/test');

// Session enregistrée comme le fait js/compte.js (jetons factices : seul l'e-mail compte ici).
function session(email) {
  return { access_token: 'x', refresh_token: 'y', expires_at: Math.floor(Date.now() / 1000) + 3600, user: { id: 'u1', email } };
}

test('un joueur (invité ou autre compte) ne voit pas la version @smoke', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('#btn-commencer')).toBeVisible();
  await expect(page.locator('.version-badge')).toHaveCount(0);
  await page.evaluate((s) => localStorage.setItem('ludoaventura-session', JSON.stringify(s)), session('joueur@exemple.fr'));
  await page.reload();
  await expect(page.locator('#btn-commencer')).toBeVisible();
  await expect(page.locator('.version-badge')).toHaveCount(0);
});

test('le compte de l\'auteur voit la version et ouvre l\'historique au clic @smoke', async ({ page }) => {
  await page.addInitScript((s) => { try { localStorage.setItem('ludoaventura-session', JSON.stringify(s)); } catch (e) { /* */ } }, session('FBorel64@gmail.com'));
  await page.goto('./');
  const badge = page.locator('.version-badge');
  await badge.scrollIntoViewIfNeeded();
  await expect(badge).toBeVisible();
  await expect(badge).toHaveText(/^v\d+\.\d+ — historique des versions$/);

  await badge.click();
  const dialog = page.getByRole('dialog', { name: 'Historique des versions' });
  await expect(dialog).toBeVisible();
  // La version affichée est bien la première entrée de l'historique.
  const version = (await badge.textContent()).match(/v\d+\.\d+/)[0];
  await expect(dialog.locator('.version-list > li').first().locator('h3')).toContainText(version);

  await dialog.getByRole('button', { name: 'Fermer' }).click();
  await expect(dialog).toBeHidden();
});

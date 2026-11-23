// v9.5 (17/11/2026) : barre du haut de l'accueil compacte sur téléphone (choix B de la page A/B).
// v10.30 (23/11/2026, backlog ligne 453) : rien de chiffré sur l'accueil : il ne reste que « Défi du jour » et le compte.
const { test, expect } = require('@playwright/test');

test('barre du haut : défi du jour et compte tiennent dans l\'écran, sans chevauchement ; aucun nombre @smoke', async ({ page }) => {
  await page.addInitScript(() => { try { localStorage.setItem('ludo-vu', '1'); } catch (e) { /* */ } });
  await page.goto('./');
  const ids = ['btn-defi', 'btn-compte'];
  for (const id of ids) await expect(page.locator('#' + id)).toBeInViewport({ ratio: 1 });
  const b = await page.evaluate((ids) => ids.map((id) => document.getElementById(id).getBoundingClientRect().toJSON()), ids);
  expect(b[0].right).toBeLessThanOrEqual(b[1].left + 1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  // Plus de bloc des étoiles ni de bouton du coffre ; aucun chiffre visible dans la barre (ni pastille de défis restants).
  await expect(page.locator('#btn-etoiles-haut, #btn-coffre-haut, #accueil-total')).toHaveCount(0);
  await expect(page.locator('#defi-badge')).toBeHidden();
  expect(await page.locator('.accueil-haut').innerText()).not.toMatch(/\d/);

  // Le défi garde son nom pour les lecteurs d'écran.
  await expect(page.locator('#btn-defi')).toHaveAccessibleName(/Défi du jour/);

  const largeur = page.viewportSize().width;
  if (largeur <= 520) {
    // Téléphone : défi et compte sont des ronds de 48 px à icône seule.
    for (const i of [0, 1]) {
      expect(Math.round(b[i].width)).toBe(48);
      expect(Math.round(b[i].height)).toBe(48);
    }
    await expect(page.locator('#btn-defi .pd-texte')).toHaveCSS('position', 'absolute');
  } else if (largeur >= 1024) {
    // Ordinateur : le texte du défi reste affiché.
    await expect(page.locator('#btn-defi .pd-texte')).toBeVisible();
    await expect(page.locator('#btn-defi .pd-texte')).not.toHaveCSS('position', 'absolute');
  }
});

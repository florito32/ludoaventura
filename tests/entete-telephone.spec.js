// v9.5 (17/11/2026) : barre du haut de l'accueil compacte sur téléphone (choix B de la page A/B).
// Niveau, étoiles et pierres empilés ; défi, coffre et compte en boutons ronds à icône seule ; tout tient à l'écran.
const { test, expect } = require('@playwright/test');

test('barre du haut : les boutons défi et compte tiennent dans l\'écran, sans chevauchement ; sans compteurs @smoke', async ({ page }) => {
  await page.addInitScript(() => { try { localStorage.setItem('ludo-vu', '1'); } catch (e) { /* */ } });
  await page.goto('./');
  const ids = ['btn-defi', 'btn-compte'];
  for (const id of ids) await expect(page.locator('#' + id)).toBeInViewport({ ratio: 1 });
  const b = await page.evaluate((ids) => ids.map((id) => document.getElementById(id).getBoundingClientRect().toJSON()), ids);
  for (let i = 1; i < b.length; i++) expect(b[i - 1].right).toBeLessThanOrEqual(b[i].left + 1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);

  // v10.31 : plus de bloc étoiles/niveau ni de coffre en haut de l'accueil.
  await expect(page.locator('#btn-etoiles-haut, #btn-coffre-haut')).toHaveCount(0);

  // Le défi garde son nom pour les lecteurs d'écran.
  await expect(page.locator('#btn-defi')).toHaveAccessibleName(/Défi du jour/);

  const largeur = page.viewportSize().width;
  if (largeur <= 520) {
    // Téléphone : défi, coffre et compte sont des ronds de 48 px à icône seule.
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

// v9.5 (17/11/2026) : barre du haut de l'accueil compacte sur téléphone (choix B de la page A/B).
// Niveau, étoiles et pierres empilés ; défi, coffre et compte en boutons ronds à icône seule ; tout tient à l'écran.
const { test, expect } = require('@playwright/test');

test('barre du haut : les 4 boutons tiennent dans l\'écran, sans chevauchement ; niveau, étoiles et pierres empilés @smoke', async ({ page }) => {
  await page.addInitScript(() => { try { localStorage.setItem('ludo-vu', '1'); } catch (e) { /* */ } });
  await page.goto('./');
  const ids = ['btn-etoiles-haut', 'btn-defi', 'btn-coffre-haut', 'btn-compte'];
  for (const id of ids) await expect(page.locator('#' + id)).toBeInViewport({ ratio: 1 });
  const b = await page.evaluate((ids) => ids.map((id) => document.getElementById(id).getBoundingClientRect().toJSON()), ids);
  for (let i = 1; i < b.length; i++) expect(b[i - 1].right).toBeLessThanOrEqual(b[i].left + 1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);

  // Une seule étoile dans le bloc, placée devant le total ; ordre : niveau, étoiles, pierres (de haut en bas).
  await expect(page.locator('#btn-etoiles-haut use[href="#i-etoile"]')).toHaveCount(1);
  const y = await page.evaluate(() => ['.pe-niveau', '.pe-total', '.pe-gemmes'].map((s) => document.querySelector('#btn-etoiles-haut ' + s).getBoundingClientRect().top));
  expect(y[0]).toBeLessThan(y[1]); expect(y[1]).toBeLessThan(y[2]);

  // Le défi garde son nom pour les lecteurs d'écran.
  await expect(page.locator('#btn-defi')).toHaveAccessibleName(/Défi du jour/);

  const largeur = page.viewportSize().width;
  if (largeur <= 520) {
    // Téléphone : défi, coffre et compte sont des ronds de 48 px à icône seule.
    for (const i of [1, 2, 3]) {
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

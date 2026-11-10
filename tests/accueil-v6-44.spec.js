// Accueil v6.44 (demande du 10/11/2026, backlog lignes 212 à 214) :
// plus d'encadré « Un jeu éducatif d'aventure, à jouer en équipe », bouton « Partie rapide solo » en bleu.
const { test, expect } = require('@playwright/test');

test('accueil : pas d’accroche, bouton « Partie rapide solo » bleu, tout tient dans l’écran', async ({ page }) => {
  await page.addInitScript(() => { try { localStorage.setItem('ludo-vu', '1'); } catch (e) { /* */ } });
  await page.goto('./');
  await expect(page.locator('#btn-commencer')).toBeVisible();
  await expect(page.locator('.accroche')).toHaveCount(0);
  await expect(page.locator('#ecran-accueil')).not.toContainText('à jouer en équipe');
  const b = page.getByRole('button', { name: 'Partie rapide solo' });
  await expect(b).toBeVisible();
  await expect(b).toHaveCSS('background-color', 'rgb(28, 52, 115)');
  await expect(b).toHaveCSS('color', 'rgb(255, 255, 255)');
  // Le bouton reste dans l'écran (pas coupé en bas).
  const r = await b.boundingBox();
  const h = page.viewportSize().height;
  expect(r.y + r.height).toBeLessThanOrEqual(h);
});

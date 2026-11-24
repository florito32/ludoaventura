// Accueil v6.44 (demande du 10/11/2026, backlog lignes 212 à 214) :
// plus d'encadré « Un jeu éducatif d'aventure, à jouer en équipe », puis (24/11/2026) plus de « Partie rapide solo » et « Défi du jour » en bleu.
const { test, expect } = require('@playwright/test');

test('accueil : pas d’accroche, pas de partie rapide, « Défi du jour » bleu, tout tient dans l’écran', async ({ page }) => {
  await page.addInitScript(() => { try { localStorage.setItem('ludo-vu', '1'); } catch (e) { /* */ } });
  await page.goto('./');
  await expect(page.locator('#btn-commencer')).toBeVisible();
  await expect(page.locator('.accroche')).toHaveCount(0);
  await expect(page.locator('#ecran-accueil')).not.toContainText('à jouer en équipe');
  // 24/11/2026 (ligne 519) : plus de « Partie rapide solo » ; le « Défi du jour » est en bleu, entièrement dans l'écran.
  await expect(page.getByRole('button', { name: 'Partie rapide solo' })).toHaveCount(0);
  await expect(page.locator('#btn-rapide, #ecran-rapide')).toHaveCount(0);
  const b = page.locator('#btn-defi');
  await expect(b).toBeVisible();
  await expect(b).toHaveCSS('background-color', 'rgb(28, 52, 115)');
  await expect(b).toHaveCSS('color', 'rgb(255, 255, 255)');
  const r = await b.boundingBox();
  const h = page.viewportSize().height;
  expect(r.y + r.height).toBeLessThanOrEqual(h);
});

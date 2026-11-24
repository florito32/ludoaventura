// v9.5 (17/11/2026) : barre du haut de l'accueil compacte sur téléphone (choix B de la page A/B).
// v10.30 (23/11/2026, backlog ligne 453) : rien de chiffré sur l'accueil.
// v10.36 (24/11/2026, backlog ligne 477) : le défi du jour n'est plus dans la barre du haut : c'est un rectangle jaune juste sous
// « Commencer l'aventure ». Il ne reste en haut que le compte.
const { test, expect } = require('@playwright/test');

test('accueil : le compte tient en haut, le défi du jour est sous « Commencer », sans débordement ; aucun nombre @smoke', async ({ page }) => {
  await page.addInitScript(() => { try { localStorage.setItem('ludo-vu', '1'); } catch (e) { /* */ } });
  await page.goto('./');
  for (const id of ['btn-compte', 'btn-defi', 'btn-commencer', 'btn-rapide', 'btn-baby', 'btn-didacticiel']) await expect(page.locator('#' + id)).toBeInViewport({ ratio: 1 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  // Le défi du jour n'est plus dans la barre du haut.
  await expect(page.locator('.accueil-haut #btn-defi')).toHaveCount(0);
  await expect(page.locator('#btn-etoiles-haut, #btn-coffre-haut, #accueil-total, #defi-badge')).toHaveCount(0);
  expect(await page.locator('.accueil-haut').innerText()).not.toMatch(/\d/);
  // Ordre des boutons : Commencer, Défi du jour, Partie rapide solo, Baby jeux, Didacticiel ; aucun ne chevauche le suivant.
  const ids = ['btn-commencer', 'btn-defi', 'btn-rapide', 'btn-baby', 'btn-didacticiel'];
  const b = await page.evaluate((ids) => ids.map((id) => document.getElementById(id).getBoundingClientRect().toJSON()), ids);
  for (let i = 0; i < b.length - 1; i++) expect(b[i].bottom).toBeLessThanOrEqual(b[i + 1].top + 1);
  // Le défi garde son nom pour les lecteurs d'écran et annonce ses étoiles ×3.
  await expect(page.locator('#btn-defi')).toHaveAccessibleName(/Défi du jour/);
  await expect(page.locator('#btn-defi')).toContainText('étoiles ×3');
  // Rectangle jaune comme les autres boutons (bordure épaisse, coins arrondis).
  await expect(page.locator('#btn-defi')).toHaveCSS('background-color', 'rgb(255, 230, 0)');
  await expect(page.locator('#btn-defi')).toHaveCSS('border-top-width', '3px');
});

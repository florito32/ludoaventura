// Corrections d'affichage du plateau (demandes du 02/11/2026).
const { test, expect } = require('@playwright/test');
const { lancerPartie } = require('./aide');

test('les points cumulés sont écrits une seule fois, en rouge (pas d\'ombre décalée)', async ({ page }) => {
  await lancerPartie(page);
  const pv = page.locator('.points-plateau .points-valeur');
  await expect(pv).toBeVisible();
  const style = await pv.evaluate((e) => ({ ombre: getComputedStyle(e).textShadow, couleur: getComputedStyle(e).color }));
  expect(style.ombre).toBe('none');
  expect(style.couleur).toBe('rgb(227, 38, 42)'); // var(--rouge)
});

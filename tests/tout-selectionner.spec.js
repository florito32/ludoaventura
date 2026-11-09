// « Tout sélectionner » des packs et des questions d'orthographe (v6.27, demande du 09/11/2026).
const { test, expect } = require('@playwright/test');
const { rapide, versReglages, orthographe, valider } = require('./aide');

test('orthographe : « Tout sélectionner » coche tous les packs puis toutes les questions, et redevient « Tout désélectionner » @smoke', async ({ page }) => {
  await rapide(page);
  await page.goto('./');
  await versReglages(page, 1);
  await orthographe(page);
  // Écran des packs
  const toutPacks = page.locator('#ortho-packs .btn-tout');
  await expect(toutPacks).toBeVisible();
  await expect(toutPacks).toBeInViewport();
  await expect(toutPacks).toHaveAccessibleName('Tout sélectionner : packs');
  const nPacks = await page.locator('#packs input').count();
  await toutPacks.click();
  await expect(page.locator('#packs input:checked')).toHaveCount(nPacks);
  await expect(toutPacks).toHaveAccessibleName('Tout désélectionner : packs');
  await toutPacks.click();
  await expect(page.locator('#packs input:checked')).toHaveCount(0);
  // Un pack décoché à la main après « Tout » : le bouton redevient « Tout sélectionner ».
  await toutPacks.click();
  await page.locator('#packs .pack').first().click();
  await expect(toutPacks).toHaveAccessibleName('Tout sélectionner : packs');
  await toutPacks.click();
  await valider(page);
  // Écran des questions
  await page.locator('#reglages-ortho').waitFor();
  const toutQ = page.locator('#reglages-ortho .btn-tout');
  await expect(toutQ).toBeInViewport();
  await toutQ.click();
  const nQ = await page.locator('#types-questions input').count();
  await expect(page.locator('#types-questions input:checked')).toHaveCount(nQ);
  expect(await page.evaluate(() => window.Aventura.partie.types[0].length)).toBe(nQ);
  await expect(toutQ).toHaveAccessibleName('Tout désélectionner : questions');
  // Le bouton ne déborde pas et ne pousse pas les questions hors de l'écran.
  expect(await toutQ.evaluate((e) => e.scrollWidth <= e.clientWidth + 1)).toBe(true);
  await expect(page.locator('#types-questions .pack').last()).toBeInViewport();
});

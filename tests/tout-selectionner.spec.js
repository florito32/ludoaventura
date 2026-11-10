// « Tout sélectionner » des packs et des questions d'orthographe (v6.27, demande du 09/11/2026).
const { test, expect } = require('@playwright/test');
const { rapide, versReglages, orthographe, valider } = require('./aide');

test('orthographe : « Tout sélectionner » coche tous les packs puis toutes les questions, et redevient « Tout désélectionner » @smoke', async ({ page }) => {
  await rapide(page);
  await page.goto('./');
  await versReglages(page, 1);
  await orthographe(page);
  // Écran des packs
  const toutPacks = page.locator('#ortho-packs .btn-tout[data-liste]');
  await expect(toutPacks).toBeVisible();
  await expect(toutPacks).toBeInViewport();
  await expect(toutPacks).toHaveAccessibleName('Tout sélectionner : thèmes');
  const nPacks = await page.locator('#packs input').count();
  await toutPacks.click();
  await expect(page.locator('#packs input:checked')).toHaveCount(nPacks);
  await expect(toutPacks).toHaveAccessibleName('Tout désélectionner : thèmes');
  await toutPacks.click();
  await expect(page.locator('#packs input:checked')).toHaveCount(0);
  // Un pack décoché à la main après « Tout » : le bouton redevient « Tout sélectionner ».
  await toutPacks.click();
  await page.locator('#packs .pack').first().click();
  await expect(toutPacks).toHaveAccessibleName('Tout sélectionner : thèmes');
  await toutPacks.click();
  await valider(page);
  // Écran des questions
  await page.locator('#reglages-ortho').waitFor();
  const toutQ = page.locator('#reglages-ortho .btn-tout[data-liste]');
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

// v6.33 (choix de l'utilisateur au test A/B du 09/11/2026) : 3 familles encadrées selon la réponse, icônes,
// 3 boutons par ligne, un « Tout » par famille ; Voyelles et Consonnes sur la même ligne.
test('questions d\'orthographe rangées en 3 familles, chacune avec son « Tout »', async ({ page }) => {
  await rapide(page);
  await page.goto('./');
  await versReglages(page, 1);
  await orthographe(page);
  await page.locator('#ortho-packs .btn-tout[data-liste]').click();
  await valider(page);
  await page.locator('#reglages-ortho').waitFor();
  const familles = page.locator('#types-questions .famille');
  await expect(familles).toHaveCount(3);
  await expect(familles.locator('.famille-nom')).toHaveText([/Écrire un mot/, /Trouver des lettres/, /Compter/]);
  await expect(familles.nth(1).locator('.pack')).toHaveText(['Voyelles', 'Consonnes', 'Lettres muettes']);
  const y = async (t) => (await page.locator('#types-questions .pack', { hasText: new RegExp('^' + t + '$') }).boundingBox()).y;
  expect(Math.round(await y('Voyelles'))).toBe(Math.round(await y('Consonnes')));
  expect(Math.round(await y('Nombre de voyelles'))).toBe(Math.round(await y('Nombre de consonnes')));
  // « Tout » de « Compter » : seulement ses 5 questions ; un 2e toucher les retire.
  const tout = page.getByRole('button', { name: 'Tout sélectionner : Compter' });
  await expect(tout).toBeInViewport();
  await tout.click();
  expect((await page.evaluate(() => window.Aventura.partie.types[0])).sort()).toEqual(['combien-lettre', 'nb-consonnes', 'nb-voyelles', 'nombre', 'syllabes']);
  await page.getByRole('button', { name: 'Tout désélectionner : Compter' }).click();
  expect(await page.evaluate(() => window.Aventura.partie.types[0])).toEqual([]);
  await expect(familles.last().locator('.pack').last()).toBeInViewport();
});

test('v6.39 : thèmes rangés en 4 familles encadrées, chacune avec son « Tout » ; plus de « packs »', async ({ page }) => {
  await rapide(page);
  await page.goto('./');
  await versReglages(page, 1);
  await orthographe(page);
  await expect(page.locator('#reglages-titre')).toHaveText('Léa (Joueur 1) : Orthographe, les thèmes');
  await expect(page.locator('#packs-titre')).toContainText('Thèmes');
  await expect(page.locator('#ortho-packs')).not.toContainText(/pack/i);
  const familles = page.locator('#packs .famille');
  await expect(familles).toHaveCount(4);
  await expect(familles.locator('.famille-nom')).toHaveText([/Nature et animaux/, /Tous les jours/, /En ville/, /Le monde, le temps, les nombres/]);
  // « Tout » de « En ville » : ses 5 thèmes seulement.
  const ville = familles.nth(2);
  await ville.locator('.btn-tout-famille').click();
  expect(await page.evaluate(() => window.Aventura.partie.packs[0].slice().sort())).toEqual(['ecole', 'lieux', 'loisirs', 'metiers', 'transports']);
  await expect(ville.locator('.btn-tout-famille')).toHaveText('Aucun');
  await ville.locator('.btn-tout-famille').click();
  expect(await page.evaluate(() => window.Aventura.partie.packs[0])).toEqual([]);
  // Tous les thèmes visibles sans défiler, et aucun nom ne déborde de son bouton.
  await expect(page.locator('#packs .pack').last()).toBeInViewport();
  await expect(page.locator('#packs-titre')).toBeInViewport();
  const deborde = await page.locator('#packs .pack span').evaluateAll((l) => l.filter((e) => e.scrollHeight > e.clientHeight + 1 || e.scrollWidth > e.clientWidth + 1).map((e) => e.textContent));
  expect(deborde).toEqual([]);
});

test('v6.39 : une partie sauvegardée avec seulement « Mots simples » pioche dans tous les thèmes', async ({ page }) => {
  await rapide(page);
  await page.goto('./');
  await versReglages(page, 1);
  await orthographe(page);
  const ids = await page.evaluate(() => {
    window.Aventura.partie.packs[0] = ['mots-simples'];
    return [...new Set(window.Aventura.cartesDuJoueur(0).map((c) => c.pack))];
  });
  expect(ids).toHaveLength(17);
  expect(ids).not.toContain('mots-simples');
  expect(ids).not.toContain('mots-compliques');
});

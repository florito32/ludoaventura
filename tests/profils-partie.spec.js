// v10.27 (backlog lignes 446 et 448) : les joueurs du compte jouent la partie ; +1 point à la sous-matière jouée de chaque profil.
const { test, expect } = require('@playwright/test');
const { rapide, lancerPartie, ouvrirNeuf, repondre, lancerLeDe } = require('./aide');

const ETAT = {
  v: 1, total: 0,
  joueurs: [
    { id: 'j-1', nom: 'Léa', perso: 'lea', cree: '2026-11-01T00:00:00Z', maj: '2026-11-01T00:00:00Z', niv: { 'francais.orthographe': 10 } },
    { id: 'j-2', nom: 'Hugo', perso: 'tom', cree: '2026-11-01T00:00:00Z', maj: '2026-11-01T00:00:00Z', niv: {} }
  ]
};
async function preparer(page, etat) {
  await page.addInitScript((e) => {
    try { localStorage.setItem('ludo-vu', '1'); if (!localStorage.getItem('ludoaventura-etoiles')) localStorage.setItem('ludoaventura-etoiles', JSON.stringify(e)); } catch (x) { /* */ }
  }, etat);
}
const stockes = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('ludoaventura-etoiles') || '{}').joueurs || []);

test('étape 2 : choix du profil (2 joueurs au compte) ; un profil pris par le joueur 1 est grisé pour le joueur 2 @smoke', async ({ page }) => {
  await rapide(page); await preparer(page, ETAT);
  await ouvrirNeuf(page);
  await page.getByRole('button', { name: 'Commencer l\'aventure' }).click();
  await page.getByRole('radio', { name: /^2 joueurs?$/ }).check();
  await page.getByRole('button', { name: 'Valider', exact: true }).click();
  const chips = page.locator('#profils-joueur .profil-bouton');
  await expect(chips).toHaveCount(2);
  await expect(chips.nth(0)).toHaveAttribute('aria-pressed', 'true'); // Léa d'office
  await chips.nth(1).click(); // Hugo : prend son personnage (Tom)
  await expect(chips.nth(1)).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.aventurier[data-id="tom"]')).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Valider', exact: true }).click(); // joueur 2
  await expect(page.locator('#profils-joueur .profil-bouton').nth(1)).toBeDisabled();
  await expect(page.locator('#profils-joueur .profil-bouton').nth(0)).toHaveAttribute('aria-pressed', 'true');
});

test('un seul joueur au compte : pas de choix de profil, la partie compte pour lui', async ({ page }) => {
  await rapide(page); await preparer(page, { v: 1, total: 0, joueurs: [] });
  await ouvrirNeuf(page);
  await page.getByRole('button', { name: 'Commencer l\'aventure' }).click();
  await page.getByRole('button', { name: 'Valider', exact: true }).click();
  await expect(page.locator('#profils-joueur')).toBeHidden();
});

test('fin de partie : +1 point à l\'orthographe pour chaque profil joué, réussie ou non, une seule fois', async ({ page }) => {
  await rapide(page); await preparer(page, ETAT);
  await lancerPartie(page, { joueurs: 2 });
  const suite = page.getByRole('button', { name: /^(Première question|Question suivante)$/ });
  for (let t = 0; t < 14; t++) {
    await suite.or(page.locator('#fin[open]')).first().waitFor();
    if (await page.locator('#fin').isVisible()) break;
    await suite.click();
    await repondre(page, true);
    await lancerLeDe(page);
  }
  await expect(page.locator('#fin')).toBeVisible();
  const j = await stockes(page);
  expect(j.find((x) => x.id === 'j-1').niv['francais.orthographe']).toBe(11);
  expect(j.find((x) => x.id === 'j-2').niv['francais.orthographe']).toBe(1);
  await page.reload();
  const apres = await stockes(page);
  expect(apres.find((x) => x.id === 'j-1').niv['francais.orthographe']).toBe(11);
});

// Touche « précédent » du téléphone ou de la tablette (v6.23, demande du 04/11/2026) :
// elle ramène à l'étape précédente au lieu de fermer l'application.
const { test, expect } = require('@playwright/test');
const { lancerPartie, valider } = require('./aide');

const titrePrepa = (page) => page.getByRole('heading', { name: 'Préparer la partie' });

test('préparation : la touche précédent revient à l\'étape précédente, puis à l\'accueil', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Commencer l\'aventure' }).click();
  await valider(page); // 1 joueur → choix de l'aventurier
  await expect(page.locator('#prepa-progres')).toHaveText('Étape 2 sur 4');
  await page.goBack();
  await expect(titrePrepa(page)).toBeVisible();
  await expect(page.locator('#prepa-progres')).toHaveText('Étape 1 sur 4');
  await page.locator('.nb-joueurs label').nth(2).click(); // un toucher entre deux appuis, comme en vrai
  await page.goBack();
  await expect(page.getByRole('button', { name: 'Commencer l\'aventure' })).toBeVisible();
});

test('plateau : la touche précédent ouvre le menu, une deuxième fois le referme ; la partie reste', async ({ page }) => {
  await lancerPartie(page, { joueurs: 2 });
  await page.getByRole('button', { name: 'Piocher une carte' }).click();
  await page.goBack();
  await expect(page.locator('#menu-partie')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Le plateau' })).toBeAttached();
  await page.goBack();
  await expect(page.locator('#menu-partie')).toBeHidden();
  await expect(page.getByRole('heading', { name: 'Le plateau' })).toBeVisible();
  await expect(page.locator('#carte-piochee')).toBeVisible(); // la carte piochée est toujours là
});

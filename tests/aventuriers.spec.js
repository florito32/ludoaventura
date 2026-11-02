// Aventuriers : 10 portraits, chaque joueur choisit le sien en début de partie.
const { test, expect } = require('@playwright/test');
const P = require('../js/aventuriers.js');

async function preparation(page, joueurs) {
  await page.goto('./');
  await page.getByRole('button', { name: 'Commencer l\'aventure' }).click();
  await page.getByRole('radio', { name: new RegExp('^' + joueurs + ' joueurs?$') }).check();
}

test('10 aventuriers différents, chacun avec un nom et un portrait', async ({ page }) => {
  expect(P.LISTE).toHaveLength(10);
  expect(new Set(P.LISTE.map((a) => a.nom)).size).toBe(10);
  await preparation(page, 2);
  const portraits = page.locator('.aventurier img');
  await expect(portraits).toHaveCount(10);
  for (const img of await portraits.all()) {
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate((i) => i.complete && i.naturalWidth > 0)).toBe(true);
  }
});

test('un onglet par joueur ; toucher un portrait le donne au joueur actif, « Joueur suivant » passe au suivant', async ({ page }) => {
  await preparation(page, 3);
  const onglets = page.locator('.onglet-joueur');
  await expect(onglets).toHaveCount(3);
  await expect(onglets.nth(0)).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: /^Zoé/ }).click();
  await expect(onglets.nth(0)).toContainText('Zoé');
  await expect(onglets.nth(0)).toHaveAttribute('aria-pressed', 'true'); // reste sur le joueur pour choisir ses cartes
  await page.getByRole('button', { name: 'Joueur suivant →' }).click();
  await expect(onglets.nth(1)).toHaveAttribute('aria-pressed', 'true');
  // Un aventurier pris par un autre joueur n'est plus disponible.
  await expect(page.getByRole('button', { name: /^Zoé/ })).toBeDisabled();
  await page.getByRole('button', { name: /^Awa/ }).click();
  await expect(onglets.nth(1)).toContainText('Awa');
  // Revenir sur un joueur pour changer son choix.
  await onglets.nth(0).click();
  await page.getByRole('button', { name: /^Kenji/ }).click();
  await expect(onglets.nth(0)).toContainText('Kenji');
  await expect(page.getByRole('button', { name: /^Zoé/ })).toBeEnabled();
});

test('sur le plateau : nom et portrait de chaque aventurier, dans la liste et sur les pions @smoke', async ({ page }) => {
  await preparation(page, 2);
  await page.getByRole('button', { name: /^Inès/ }).click();
  await page.getByRole('button', { name: 'Joueur suivant →' }).click();
  await page.getByRole('button', { name: /^Papi Jo/ }).click();
  await page.getByRole('button', { name: 'Lancer la partie' }).click();
  await expect(page.locator('#joueurs li').nth(0)).toContainText('Inès');
  await expect(page.locator('#joueurs li').nth(1)).toContainText('Papi Jo');
  await expect(page.locator('#tas .pile').nth(0)).toContainText('Inès');
  await expect(page.locator('.pion').nth(0)).toHaveAttribute('style', /aventuriers\/ines\.svg/);
  await expect(page.locator('.pion').nth(1)).toHaveAttribute('style', /aventuriers\/jo\.svg/);
});

test('passer de 4 à 2 joueurs garde les choix des 2 premiers', async ({ page }) => {
  await preparation(page, 4);
  await expect(page.locator('.onglet-joueur')).toHaveCount(4);
  await page.locator('.onglet-joueur').nth(3).click();
  await expect(page.locator('.onglet-joueur').nth(3)).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('radio', { name: '2 joueurs' }).check();
  await expect(page.locator('.onglet-joueur')).toHaveCount(2);
  await expect(page.locator('.onglet-joueur').nth(1)).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.onglet-joueur').nth(0)).toContainText('Léa');
});

test('chaque portrait est un SVG valide (un attribut en double l\'empêchait de s\'afficher)', async ({ page, baseURL }) => {
  test.skip(test.info().project.name !== 'ordinateur', 'un seul format suffit');
  await page.goto('./');
  for (const a of P.LISTE) {
    const erreur = await page.evaluate(async (url) => {
      const txt = await (await fetch(url)).text();
      const doc = new DOMParser().parseFromString(txt, 'image/svg+xml');
      return doc.querySelector('parsererror')?.textContent || '';
    }, new URL(a.image, baseURL).href);
    expect(erreur, a.image).toBe('');
  }
});

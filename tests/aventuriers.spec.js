// Aventuriers : 10 portraits, chaque joueur choisit le sien en début de partie.
const { test, expect } = require('@playwright/test');
const P = require('../js/aventuriers.js');
const { cocherTout, valider } = require('./aide');

// Va jusqu'à l'écran 2 (choix de l'aventurier du joueur 1).
async function preparation(page, joueurs) {
  await page.goto('./');
  await page.getByRole('button', { name: 'Commencer l\'aventure' }).click();
  await page.getByRole('radio', { name: new RegExp('^' + joueurs + ' joueurs?$') }).check();
  await valider(page);
}

test('10 aventuriers différents, chacun avec un nom et un portrait', async ({ page }) => {
  expect(P.LISTE).toHaveLength(10);
  expect(new Set(P.LISTE.map((a) => a.nom)).size).toBe(10);
  await preparation(page, 2);
  const portraits = page.locator('.aventurier img');
  await expect(portraits).toHaveCount(10);
  for (const img of await portraits.all()) {
    await expect.poll(() => img.evaluate((i) => i.complete && i.naturalWidth > 0)).toBe(true);
  }
});

test('un écran par joueur : il touche un portrait puis « Valider » ; un aventurier déjà pris est grisé', async ({ page }) => {
  await preparation(page, 3);
  const legende = page.locator('#aventurier-legende');
  await expect(legende).toHaveText('Joueur 1, choisis ton aventurier');
  await expect(page.locator('#prepa-progres')).toHaveText('Étape 2 sur 4 · Joueur 1 sur 3');
  // Les joueurs suivants n'ont pas encore choisi : seul le joueur 1 apparaît sur les portraits.
  await expect(page.locator('.aventurier-pris:not(:empty)')).toHaveCount(1);
  await page.getByRole('button', { name: /^Zoé/ }).click();
  await expect(page.getByRole('button', { name: /^Zoé/ })).toHaveAttribute('aria-pressed', 'true');
  await valider(page);
  await expect(legende).toHaveText('Joueur 2, choisis ton aventurier');
  // Un aventurier pris par un autre joueur n'est plus disponible.
  await expect(page.getByRole('button', { name: /^Zoé/ })).toBeDisabled();
  await page.getByRole('button', { name: /^Awa/ }).click();
  await valider(page);
  await expect(legende).toHaveText('Joueur 3, choisis ton aventurier');
  // Revenir sur le joueur 1 pour changer son choix.
  await page.getByRole('button', { name: /Retour/ }).click();
  await page.getByRole('button', { name: /Retour/ }).click();
  await expect(legende).toHaveText('Joueur 1, choisis ton aventurier');
  await page.getByRole('button', { name: /^Kenji/ }).click();
  await expect(page.getByRole('button', { name: /^Zoé/ })).toBeEnabled();
  expect((await page.evaluate(() => window.Aventura.partie.choix)).slice(0, 2)).toEqual(['kenji', 'awa']);
});

test('si son aventurier par défaut est déjà pris, le joueur suivant en reçoit un libre', async ({ page }) => {
  await preparation(page, 2);
  await page.getByRole('button', { name: /^Tom/ }).click(); // Tom est le choix par défaut du joueur 2
  await valider(page);
  const choix = await page.evaluate(() => window.Aventura.partie.choix);
  expect(choix[0]).toBe('tom');
  expect(choix[1]).not.toBe('tom');
  await expect(page.locator('.aventurier[aria-pressed="true"]')).toHaveCount(1);
});

test('sur le plateau : nom de l\'aventurier qui joue et son personnage debout sur chaque case @smoke', async ({ page }) => {
  await preparation(page, 2);
  await page.getByRole('button', { name: /^Inès/ }).click();
  await valider(page);
  await page.getByRole('button', { name: /^Papi Jo/ }).click();
  await valider(page);
  await cocherTout(page, 2);
  await page.getByRole('button', { name: 'Lancer la partie' }).click();
  await expect(page.locator('#tour-nom')).toHaveText('Inès');
  await expect(page.locator('.pion').nth(0)).toHaveAttribute('data-aventurier', 'ines');
  await expect(page.locator('.pion').nth(1)).toHaveAttribute('data-aventurier', 'jo');
});

test('v4.6 : chaque écran de la préparation tient sans défiler', async ({ page }) => {
  // La page ne défile pas et le contenu de l'écran tient dans sa zone (rien de caché à faire défiler).
  const tient = async (nom) => {
    const r = await page.evaluate(() => ({
      page: document.documentElement.scrollHeight - innerHeight,
      corps: Math.max(...[...document.querySelectorAll('.etape:not([hidden]) .etape-corps')].map((c) => c.scrollHeight - c.clientHeight))
    }));
    expect(r.page, nom + ' : la page défile').toBeLessThanOrEqual(1);
    expect(r.corps, nom + ' : le contenu dépasse').toBeLessThanOrEqual(1);
  };
  await preparation(page, 4);
  await tient('aventuriers');
  for (let k = 0; k < 4; k++) await valider(page);
  await tient('cartes');
  await valider(page); // rien de coché : message
  await expect(page.locator('#packs-alerte')).not.toBeEmpty();
  await tient('cartes avec message');
  await cocherTout(page, 4);
  await page.getByRole('radio', { name: /^Savane/ }).check(); // histoire la plus longue
  await tient('aventure');
  // « Retour » remonte joueur par joueur et écran par écran : 4 → 3 (réglages puis matière, ×4) → 2 (×4) → 1.
  for (let k = 0; k < 13; k++) await page.getByRole('button', { name: /Retour/ }).click();
  await expect(page.locator('#prepa-progres')).toHaveText('Étape 1 sur 4');
  await tient('nombre de joueurs');
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

// Bug v4.6 : le cadre de couleur des cartes choisies (J1, J2…) était dessiné à l'extérieur
// de la carte et rogné par la grille sur les cartes du bord. Il doit rester à l'intérieur.
test('cadres des aventuriers choisis entiers : rien ne dépasse de la carte', async ({ page }) => {
  await preparation(page, 2);
  await valider(page); // joueur 1 garde son aventurier → écran du joueur 2
  const ombres = await page.locator('.aventurier.pris, .aventurier[aria-pressed="true"]')
    .evaluateAll(els => els.map(e => getComputedStyle(e).boxShadow));
  expect(ombres.length).toBeGreaterThanOrEqual(2);
  for (const o of ombres) expect(o === 'none' || /inset/.test(o), o).toBe(true);
  // Et la carte elle-même tient dans la grille (pas coupée).
  const grille = await page.locator('.aventuriers').boundingBox();
  const carte = await page.locator('.aventurier').first().boundingBox();
  expect(carte.x).toBeGreaterThanOrEqual(grille.x - 0.5);
  expect(carte.y).toBeGreaterThanOrEqual(grille.y - 0.5);
});

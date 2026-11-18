// v10.21 (demande du 18/11/2026) :
//  1. le bouton « plein écran » est en bas à droite de l'écran, il ne cache rien du plateau (le menu reste sur le plateau) ;
//  2. sur téléphone, après une réponse, la correction n'est jamais coupée en bas de l'encadré du tour.
const { test, expect } = require('@playwright/test');
const { rapide, versReglages, valider, lancer, ouvrirNeuf, cocher } = require('./aide');

// Plateau d'une partie de Géographie en mode Quiz, jeu « Drapeaux » (g05) : la question est un drapeau, 4 réponses.
async function versDrapeaux(page) {
  await rapide(page);
  await ouvrirNeuf(page);
  await versReglages(page, 1);
  await cocher(page, '#matieres', 'geographie');
  await cocher(page, '#niveau-savoir', 'facile');
  await cocher(page, '#mode-savoir', 'quiz');
  await valider(page);
  await page.locator('#savoir-jeux').waitFor();
  await page.locator('#savoir-liste input[value="g05"]').check();
  await lancer(page);
  await page.getByRole('heading', { name: 'Le plateau' }).waitFor();
  await page.evaluate(() => window.Savoirs.regler(() => 0));
}

test('bouton plein écran : en bas à droite de l\'écran, ni sur le plateau ni sur le menu', async ({ page }) => {
  await versDrapeaux(page);
  const possible = await page.evaluate(() => !!(document.fullscreenEnabled || document.webkitFullscreenEnabled));
  test.skip(!possible, 'plein écran indisponible dans ce navigateur de test');
  const g = await page.evaluate(() => {
    const r = (id) => document.getElementById(id).getBoundingClientRect();
    const b = r('btn-plein-ecran'), p = r('plateau'), m = r('btn-menu');
    const inter = (a, c) => a.left < c.right && a.right > c.left && a.top < c.bottom && a.bottom > c.top;
    return { droite: innerWidth - b.right, bas: innerHeight - b.bottom, surPlateau: inter(b, p), surMenu: inter(b, m), larg: innerWidth, haut: b.top };
  });
  expect(g.droite).toBeGreaterThanOrEqual(0);
  expect(g.droite).toBeLessThanOrEqual(24);
  expect(g.bas).toBeGreaterThanOrEqual(0);
  expect(g.bas).toBeLessThanOrEqual(24);
  expect(g.surPlateau).toBe(false);
  expect(g.surMenu).toBe(false);
  await expect(page.locator('#btn-plein-ecran')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('téléphone bas : après la réponse au quiz de drapeaux, la correction est visible en entier', async ({ page }) => {
  test.skip(test.info().project.name === 'ordinateur' || test.info().project.name === 'tablette', 'téléphones seulement');
  // Un téléphone dont la barre d'adresse mange de la hauteur : de 580 à 700 px utiles.
  for (const haut of [700, 640, 580]) {
    await page.setViewportSize({ width: 411, height: haut });
    await versDrapeaux(page);
    await page.getByRole('button', { name: /^(Première question|Question suivante)$/ }).click();
    await page.locator('#carte-piochee').waitFor();
    const bonne = await page.evaluate(() => window.Aventura.partie.carte.bonne);
    await page.locator('.btn-option', { hasText: bonne }).first().click();
    await expect(page.locator('#carte-reponse')).toContainText('Bonne réponse');
    await page.waitForTimeout(300); // la correction attend une image pour descendre l'encadré
    const v = await page.evaluate(() => {
      const t = document.getElementById('tour').getBoundingClientRect(), c = document.getElementById('carte-piochee').getBoundingClientRect(),
        r = document.getElementById('carte-reponse').getBoundingClientRect();
      return { repBas: r.bottom, repHaut: r.top, tourBas: t.bottom, tourHaut: t.top, carteBas: c.bottom };
    });
    expect(v.repHaut, haut + ' px : correction sous le haut de l\'encadré').toBeGreaterThanOrEqual(v.tourHaut);
    expect(v.repBas, haut + ' px : correction au-dessus du bas de l\'encadré').toBeLessThanOrEqual(v.tourBas);
    expect(v.carteBas, haut + ' px : bas de la carte visible').toBeLessThanOrEqual(v.tourBas + 1);
  }
});

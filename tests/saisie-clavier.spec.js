// v6.13 (lignes 106-107 du backlog) : sur écran tactile, quand le joueur écrit sa réponse, la carte se pose
// par-dessus le plateau et occupe exactement la partie de l'écran visible au-dessus du clavier.
// Le clavier virtuel n'existe pas dans le navigateur de test : on le simule en réduisant la zone visible
// (visualViewport.height), comme le fait le vrai clavier d'Android ou d'iPhone.
const { test, expect } = require('@playwright/test');
const { rapide, versReglages, conjugaison, maths, lancer } = require('./aide');

async function partie(page, reglage) {
  await rapide(page, { autoDe: 50 });
  await page.goto('./');
  await versReglages(page, 1);
  await reglage(page);
  await lancer(page);
  await page.getByRole('button', { name: 'Piocher une carte' }).click();
  await expect(page.getByLabel('Ta réponse')).toBeFocused();
}

// Simule le clavier : la zone visible garde `part` de la hauteur de l'écran (1 = clavier fermé).
async function clavier(page, part) {
  await page.evaluate((p) => {
    const vv = window.visualViewport, h = Math.round(innerHeight * p);
    Object.defineProperty(vv, 'height', { configurable: true, get: () => h });
    vv.dispatchEvent(new Event('resize'));
  }, part);
}

// Tout ce qui sert à répondre est entièrement dans la zone visible au-dessus du clavier.
async function toutVisible(page, quand) {
  const r = await page.evaluate(() => {
    const h = window.visualViewport.height;
    const ids = ['carte-titre', 'btn-ecouter', 'carte-consigne', 'carte-mot', 'reponse-joueur', 'btn-valider-reponse'];
    const dehors = ids.filter((id) => {
      const b = document.getElementById(id).getBoundingClientRect();
      return b.top < -1 || b.bottom > h + 1 || b.left < -1 || b.right > innerWidth + 1;
    });
    const p = document.querySelector('.panneau').getBoundingClientRect();
    return { dehors, haut: p.top, bas: p.bottom, h };
  });
  expect(r.dehors, quand + ' : hors de la zone visible').toEqual([]);
  // La carte occupe toute la zone visible (de haut en bas), par-dessus le plateau.
  expect(Math.abs(r.haut), quand + ' : haut de la carte').toBeLessThanOrEqual(1);
  expect(Math.abs(r.bas - r.h), quand + ' : bas de la carte').toBeLessThanOrEqual(1);
}

test('conjugaison : clavier ouvert, la carte prend toute la zone visible, rien n\'est caché ni coupé', async ({ page }, info) => {
  test.skip(info.project.name === 'ordinateur', 'pas de clavier virtuel sur ordinateur');
  await partie(page, (p) => conjugaison(p, { temps: ['indicatif.futur'], groupes: [3], niveau: 'facile' }));
  // Curseur dans la case mais pas encore de clavier : rien ne bouge (bug corrigé avant livraison).
  await expect(page.locator('body')).not.toHaveClass(/saisie-clavier/);
  for (const part of [0.55, 0.4]) {
    await clavier(page, part);
    await toutVisible(page, 'zone visible ' + part);
  }
  await page.screenshot({ path: 'test-results/saisie-' + info.project.name + '.png' });
});

test('calcul : réponse validée, le clavier se ferme et le plateau revient (dé visible)', async ({ page }, info) => {
  test.skip(info.project.name === 'ordinateur', 'pas de clavier virtuel sur ordinateur');
  await partie(page, (p) => maths(p, { signes: ['plus'], nombres: [2], niveau: 'facile' }));
  await clavier(page, 0.5);
  await toutVisible(page, 'calcul');
  await page.getByLabel('Ta réponse').fill('0');
  await page.getByRole('button', { name: 'OK', exact: true }).click();
  await expect(page.locator('body')).not.toHaveClass(/saisie-clavier/);
  await expect(page.locator('#carte-reponse')).toContainText('tu as écrit « 0 »');
  await expect(page.getByRole('button', { name: 'J’ai compris' })).toBeInViewport();
});

test('clavier refermé par le joueur : la carte rend la place au plateau', async ({ page }, info) => {
  test.skip(info.project.name === 'ordinateur', 'pas de clavier virtuel sur ordinateur');
  await partie(page, (p) => maths(p, { signes: ['plus'], nombres: [3], niveau: 'facile' }));
  await clavier(page, 0.5);
  await expect(page.locator('body')).toHaveClass(/saisie-clavier/);
  await clavier(page, 1);
  await expect(page.locator('body')).not.toHaveClass(/saisie-clavier/);
  await expect(page.locator('#plateau-image, .plateau').first()).toBeInViewport();
  // Toucher la case rouvre le clavier, et la carte repasse en grand.
  await page.getByLabel('Ta réponse').tap();
  await clavier(page, 0.5);
  await expect(page.locator('body')).toHaveClass(/saisie-clavier/);
  await toutVisible(page, 'après réouverture');
});

test('ordinateur : pas de clavier virtuel, la carte reste à sa place à côté du plateau', async ({ page }, info) => {
  test.skip(info.project.name !== 'ordinateur', 'ordinateur seulement');
  await partie(page, (p) => maths(p, { signes: ['plus'], nombres: [2], niveau: 'facile' }));
  await expect(page.locator('body')).not.toHaveClass(/saisie-clavier/);
});

test.describe('téléphone en paysage', () => {
  test.use({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true });
  test('clavier ouvert (il reste ~180 px) : la case et « Valider » restent visibles', async ({ page }, info) => {
    test.skip(info.project.name !== 'telephone', 'un seul format suffit');
    await partie(page, (p) => conjugaison(p, { temps: ['indicatif.futur'], groupes: [3], niveau: 'facile' }));
    await clavier(page, 0.45);
    await toutVisible(page, 'paysage');
    await page.screenshot({ path: 'test-results/saisie-paysage.png' });
  });
});

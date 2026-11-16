// v6.13 (lignes 106-107 du backlog) : la carte se calait au-dessus du clavier du téléphone pendant la saisie.
// v9.3 (demande du 16/11/2026, lignes 364 à 367, 373 et 374) : plus aucune réponse ne s'écrit au clavier du téléphone :
// les nombres ont le pavé numérique (v9.0), les lettres le clavier à lettres. Ces tests vérifient que le clavier
// du téléphone ne s'ouvre plus et que tout tient à l'écran, même en paysage.
// Le clavier virtuel n'existe pas dans le navigateur de test : on le simule en réduisant la zone visible.
const { test, expect } = require('@playwright/test');
const { rapide, versReglages, conjugaison, maths, lancer } = require('./aide');

async function partie(page, reglage) {
  await rapide(page, { autoDe: 50 });
  await page.goto('./');
  await versReglages(page, 1);
  await reglage(page);
  await lancer(page);
  await page.getByRole('button', { name: /^(Première question|Question suivante)$/ }).click();
}
async function clavier(page, part) {
  await page.evaluate((p) => {
    const vv = window.visualViewport, h = Math.round(innerHeight * p);
    Object.defineProperty(vv, 'height', { configurable: true, get: () => h });
    vv.dispatchEvent(new Event('resize'));
  }, part);
}
const CONJ = (p) => conjugaison(p, { temps: ['indicatif.futur'], groupes: [3], niveau: 'facile' });

test('écran tactile : la case de réponse n\'a jamais le curseur, le clavier du téléphone ne s\'ouvre pas', async ({ page }, info) => {
  test.skip(info.project.name === 'ordinateur', 'pas de clavier virtuel sur ordinateur');
  await partie(page, CONJ);
  await expect(page.locator('#clavier')).toBeVisible();
  await expect(page.getByLabel('Ta réponse')).not.toBeFocused();
  await expect(page.getByLabel('Ta réponse')).toHaveAttribute('inputmode', 'none');
  await page.locator('#clavier-grille .touche').first().tap();
  await expect(page.getByLabel('Ta réponse')).not.toBeFocused();
  // Même si la zone visible rétrécit (barre du navigateur…), la carte ne passe pas en mode « clavier ouvert ».
  await clavier(page, 0.5);
  await expect(page.locator('body')).not.toHaveClass(/saisie-clavier/);
  await expect(page.locator('body')).toHaveClass(/question-plein/);
});

test('ordinateur : pas de clavier virtuel, la carte reste à sa place à côté du plateau', async ({ page }, info) => {
  test.skip(info.project.name !== 'ordinateur', 'ordinateur seulement');
  await partie(page, (p) => maths(p, { signes: ['plus'], nombres: [2], niveau: 'facile' }));
  await expect(page.locator('body')).not.toHaveClass(/saisie-clavier/);
});

test.describe('téléphone en paysage', () => {
  test.use({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true });
  test('clavier à lettres : la question à gauche, les lettres à droite, tout se voit, « Valider » compris', async ({ page }, info) => {
    test.skip(info.project.name !== 'telephone', 'un seul format suffit');
    await partie(page, CONJ);
    const r = await page.evaluate(() => {
      const H = innerHeight, W = innerWidth;
      return [...document.querySelectorAll('#clavier button, #cases-reponse .case-l, #carte-consigne, #carte-mot')].filter((e) => {
        const b = e.getBoundingClientRect();
        return b.top < -1 || b.bottom > H + 1 || b.left < -1 || b.right > W + 1;
      }).map((e) => e.id || e.textContent);
    });
    expect(r).toEqual([]);
    await page.screenshot({ path: 'test-results/clavier-paysage.png' });
  });
});

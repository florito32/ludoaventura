// v10.45 (demande du 24/11/2026, backlog lignes 502 à 505) : cartes des joueurs de la préparation de partie.
//  - plus de niveaux : la ligne du joueur dit la matière qu'il a choisie ; la liste des joueurs du compte et les boutons de
//    « Suivre ma progression » n'affichent plus de niveau ;
//  - un seul joueur : aucun bouton (ni « Changer », ni poubelle) ; plusieurs joueurs : une poubelle tout à droite de chaque ligne ;
//  - le bouton « Changer » a disparu de la préparation ; rien ne déborde de l'écran.
const { test, expect } = require('@playwright/test');
const { rapide, ouvrirNeuf, suivreMaProgression } = require('./aide');

const ETAT = {
  v: 1, total: 0,
  joueurs: ['Léa', 'Hugo', 'Zoé', 'Max'].map((nom, k) => ({
    id: 'j-' + (k + 1), nom, perso: ['lea', 'tom', 'lea', 'tom'][k], cree: '2026-11-01T00:00:00Z', maj: '2026-11-01T00:00:00Z', niv: { 'maths.calcul': 55, 'maths.probleme': 55 }
  }))
};
async function etape1(page, n = 1) {
  await rapide(page);
  await page.addInitScript((e) => { try { localStorage.setItem('ludo-vu', '1'); if (!localStorage.getItem('ludoaventura-etoiles')) localStorage.setItem('ludoaventura-etoiles', JSON.stringify(e)); } catch (x) { /* */ } }, ETAT);
  await ouvrirNeuf(page);
  await page.getByRole('button', { name: 'Commencer l\'aventure' }).click();
  for (let k = 1; k < n; k++) {
    await page.locator('[data-ajouter]').click();
    await page.locator('.cj-profil[data-choisir]:not([disabled])').first().click();
  }
}
// Rien ne dépasse de l'écran (overflow) : ni la page, ni une ligne de joueur.
async function pasDeDebordement(page) {
  const r = await page.evaluate(() => {
    const L = window.innerWidth, hors = [];
    document.querySelectorAll('.cj-ligne, .cj-ligne *').forEach((e) => { const b = e.getBoundingClientRect(); if (b.width && (b.right > L + 1 || b.left < -1)) hors.push(e.className || e.tagName); });
    return { page: document.documentElement.scrollWidth - L, hors };
  });
  expect(r.page).toBeLessThanOrEqual(1);
  expect(r.hors).toEqual([]);
}

test('un seul joueur : ni « Changer » ni poubelle ; la matière à choisir remplace les niveaux', async ({ page }) => {
  await etape1(page, 1);
  const ligne = page.locator('.cj-ligne').first();
  await expect(ligne).toContainText('Léa');
  await expect(ligne).not.toContainText('Niv.');
  await expect(ligne).toContainText('Matière à choisir');
  await expect(page.getByRole('button', { name: /Changer/ })).toHaveCount(0);
  await expect(page.locator('[data-ouvrir], [data-retirer]')).toHaveCount(0);
  await pasDeDebordement(page);
});

test('la ligne du joueur dit la matière choisie une fois sa préparation faite', async ({ page }) => {
  await etape1(page, 1);
  await suivreMaProgression(page, 0, 'maths');
  const ligne = page.locator('.cj-ligne').first();
  await expect(ligne.locator('.cj-niv')).toContainText('Maths');
  await expect(ligne).not.toContainText('Niv.');
  await expect(ligne).not.toContainText('niveau 6');
  await pasDeDebordement(page);
});

test('plusieurs joueurs : une poubelle à droite de chaque ligne, plus de « Changer » ; elle retire le joueur de la partie', async ({ page }) => {
  await etape1(page, 2);
  await expect(page.getByRole('button', { name: /Changer/ })).toHaveCount(0);
  const poubelles = page.locator('.cj-retirer');
  await expect(poubelles).toHaveCount(2);
  for (const k of [0, 1]) {
    const ligne = page.locator('.cj-ligne').nth(k), b = await ligne.boundingBox(), p = await poubelles.nth(k).boundingBox();
    await expect(poubelles.nth(k).locator('svg path')).toHaveCount(1); // l'icône de poubelle des profils
    // Tout à droite : le bord droit de l'icône touche le bord droit de la ligne (marges et bordure comprises).
    expect(b.x + b.width - (p.x + p.width)).toBeLessThan(24);
    expect(p.x).toBeGreaterThan(b.x + b.width / 2);
  }
  await pasDeDebordement(page);
  await poubelles.nth(0).click(); // Joueur 1 aussi peut être retiré : Hugo devient Joueur 1
  await expect(page.locator('.cj-ligne')).toHaveCount(1);
  await expect(page.locator('.cj-ligne').first()).toContainText('Hugo');
  await expect(page.locator('.cj-retirer')).toHaveCount(0); // de nouveau seul : plus aucun bouton
  // Le profil n'est pas supprimé du compte : il est toujours proposé dans la liste.
  await page.locator('[data-ajouter]').click();
  await expect(page.locator('.cj-profil[data-choisir]', { hasText: 'Léa' })).toBeVisible();
});

test('la liste des joueurs du compte n\'affiche aucun niveau', async ({ page }) => {
  await etape1(page, 1);
  await page.locator('[data-ajouter]').click();
  await expect(page.locator('.cj-profil[data-choisir]').first()).toBeVisible();
  await expect(page.locator('.cj-choix')).not.toContainText('Niv.');
  await expect(page.locator('.cj-profil[data-choisir]', { hasText: 'Léa' })).toContainText('Déjà dans la partie');
});

test('4 joueurs : poubelles et matières tiennent sans déborder', async ({ page }) => {
  await etape1(page, 4);
  await expect(page.locator('.cj-retirer')).toHaveCount(4);
  await suivreMaProgression(page, 0, 'maths');
  await expect(page.locator('.cj-ligne').first()).toContainText('Maths');
  await pasDeDebordement(page);
});

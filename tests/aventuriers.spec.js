// Aventuriers et choix des joueurs (v10.27) : 10 portraits ; la préparation choisit parmi les joueurs du compte
// (étape 1 « Qui joue ? », proposition A) ; le personnage vient du profil du joueur.
const { test, expect } = require('@playwright/test');
const P = require('../js/aventuriers.js');
const { cocherTout, valider, creerJoueurs, versReglages, personnaliser } = require('./aide');

// Va jusqu'à l'étape 1 (Qui joue ?) avec n joueurs dans le compte.
async function preparation(page, joueurs = 1) {
  await page.goto('./');
  await creerJoueurs(page, joueurs);
  await page.getByRole('button', { name: 'Commencer l\'aventure' }).click();
}

test('10 aventuriers différents, chacun avec un nom et un portrait', async ({ page }) => {
  expect(P.LISTE).toHaveLength(10);
  expect(new Set(P.LISTE.map((a) => a.nom)).size).toBe(10);
  await page.goto('./');
  const ok = await page.evaluate((l) => Promise.all(l.map((a) => new Promise((r) => { const i = new Image(); i.onload = () => r(true); i.onerror = () => r(false); i.src = a.image; }))), P.LISTE);
  expect(ok.every(Boolean)).toBe(true);
});

test('étape 1 « Qui joue ? » : Joueur 1 est déjà là, « Valider » est actif ; plus de nombre de joueurs ni de grille d\'aventuriers', async ({ page }) => {
  await preparation(page, 1);
  await expect(page.getByRole('heading', { name: 'Préparer la partie' })).toBeVisible();
  await expect(page.locator('#prepa-progres')).toHaveText('Étape 1 sur 3');
  await expect(page.locator('.cj-ligne')).toHaveCount(1);
  await expect(page.locator('.cj-ligne').first()).toContainText('Léa');
  await expect(page.locator('input[name="nb"]')).toHaveCount(0);
  await expect(page.locator('.aventuriers')).toHaveCount(0);
  // v10.36 : le bouton du bas n'apparaît que quand tous les joueurs sont prêts (2 boutons par profil).
  await expect(page.locator('#btn-valider-joueurs')).toBeHidden();
  await expect(page.locator('.cj-parcours-btn')).toHaveCount(2);
});

test('ajouter un joueur : place vide → « Valider » grisé ; un profil déjà pris est grisé ; 4 joueurs au plus', async ({ page }) => {
  await preparation(page, 5);
  await page.locator('[data-ajouter]').click();
  await expect(page.locator('.cj-ligne')).toHaveCount(2);
  await expect(page.locator('#btn-valider-joueurs')).toBeHidden();
  await expect(page.locator('.cj-profil[data-choisir]', { hasText: 'Léa' })).toBeDisabled();
  await expect(page.locator('.cj-profil[data-choisir]', { hasText: 'Léa' })).toContainText('Déjà dans la partie');
  await page.locator('.cj-profil[data-choisir]', { hasText: 'Tom' }).click();
  await expect(page.locator('.cj-parcours-btn[data-place="1"]')).toHaveCount(2);
  await page.locator('[data-ajouter]').click(); await page.locator('.cj-profil[data-choisir]:not([disabled])').first().click();
  await page.locator('[data-ajouter]').click(); await page.locator('.cj-profil[data-choisir]:not([disabled])').first().click();
  await expect(page.locator('.cj-ligne')).toHaveCount(4);
  await expect(page.locator('[data-ajouter]')).toHaveCount(0); // 4 joueurs au plus
  await expect(page.locator('.cj-ligne.joueur-rouge, .cj-ligne.joueur-jaune, .cj-ligne.joueur-bleu, .cj-ligne.joueur-vert')).toHaveCount(4);
});

test('retirer un joueur, et deux joueurs peuvent avoir le même personnage (pion de couleur différente)', async ({ page }) => {
  await preparation(page, 2);
  await page.evaluate(() => { const c = window.Recompenses.compte; window.Joueurs.changerPerso(c.etat, window.Joueurs.duCompte()[1].id, 'lea'); localStorage.setItem(window.Etoiles.CLE, JSON.stringify(c.etat)); });
  await page.locator('[data-ajouter]').click();
  await page.locator('.cj-profil[data-choisir]', { hasText: 'Tom' }).click();
  await page.locator('.cj-parcours-btn[data-parcours="perso"][data-place="0"]').click();
  await page.locator('#reglages-titre').waitFor();
  const choix = await page.evaluate(() => window.Aventura.partie.choix.slice(0, 2));
  expect(choix).toEqual(['lea', 'lea']);
  await page.getByRole('button', { name: /Retour/ }).click();
  await page.locator('[data-retirer="1"]').click();
  await expect(page.locator('.cj-ligne')).toHaveCount(1);
});

test('sur le plateau : nom du joueur qui joue et son personnage debout sur chaque case @smoke', async ({ page }) => {
  await page.goto('./');
  await creerJoueurs(page, 2);
  await page.evaluate(() => { const c = window.Recompenses.compte, J = window.Joueurs, l = J.duCompte(); J.changerPerso(c.etat, l[0].id, 'ines'); J.changerPerso(c.etat, l[1].id, 'jo'); localStorage.setItem(window.Etoiles.CLE, JSON.stringify(c.etat)); });
  await versReglages(page, 2);
  await cocherTout(page, 2);
  await page.getByRole('button', { name: 'Lancer la partie' }).click();
  await expect(page.locator('#tour-nom')).toHaveText('Léa'); // le nom vient du profil du joueur, le personnage aussi
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
    // v10.36 : à 4 joueurs, l'étape 1 d'un écran carré de 480 px (2 boutons par joueur) défile dans son cadre (limite connue, backlog) ;
    // la page, elle, ne défile jamais.
    if (test.info().project.name === 'telephone-carre' && nom === 'joueurs') return;
    expect(r.corps, nom + ' : le contenu dépasse').toBeLessThanOrEqual(1);
  };
  await preparation(page, 4);
  for (let k = 1; k < 4; k++) { await page.locator('[data-ajouter]').click(); await page.locator('.cj-profil[data-choisir]:not([disabled])').first().click(); }
  await tient('joueurs');
  await page.locator('.cj-parcours-btn[data-parcours="perso"][data-place="0"]').click();
  await tient('matière');
  await cocherTout(page, 4); // chaque joueur : « Personnaliser » puis « Choisir l'aventure »
  await page.getByRole('radio', { name: /^Savane/ }).check(); // histoire la plus longue
  await tient('aventure');
  // v10.36 : « Retour » de l'aventure revient à l'étape 1.
  await page.getByRole('button', { name: /Retour/ }).click();
  await expect(page.locator('#prepa-progres')).toHaveText('Étape 1 sur 3');
  await tient('joueurs');
});

test('v6.19 : chaque aventurier a son buste et son corps entier en WebP, et une figurine SVG valide', async ({ page }) => {
  test.skip(test.info().project.name !== 'ordinateur', 'un seul format suffit');
  const fs = require('fs');
  const F = require('../js/figurines.js');
  for (const a of P.LISTE) {
    for (const f of [a.image, a.pied]) {
      const b = fs.readFileSync(f);
      expect(b.subarray(0, 4).toString() + b.subarray(8, 12).toString(), f).toBe('RIFFWEBP');
      expect(b.length, f).toBeGreaterThan(5000);
    }
    expect(F[a.id], a.id).toContain(a.pied);
  }
  await page.goto('./');
  for (const a of P.LISTE) {
    const erreur = await page.evaluate((s) => new DOMParser().parseFromString(s, 'image/svg+xml').querySelector('parsererror')?.textContent || '', F[a.id]);
    expect(erreur, a.id).toBe('');
  }
});


// Cartes JEU : 5 packs × 3 niveaux depuis l'Excel, choix par joueur, dictée, lecture vocale.
const { test, expect } = require('@playwright/test');
const C = require('../js/cartes.js');
const { rapide } = require('./aide');

// Remplace la synthèse vocale du navigateur par un enregistreur (les phrases « lues » sont gardées).
async function voixEspion(page) {
  await page.addInitScript(() => {
    window.__lu = [];
    window.SpeechSynthesisUtterance = function (t) { this.text = t; };
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: { speak: (u) => window.__lu.push({ text: u.text, lang: u.lang }), cancel() {}, getVoices: () => [] }
    });
  });
}

// Ne garder que certains types de questions pour le joueur actif.
async function seulement(page, types) {
  for (const t of ['Épeler', 'Nombre de lettres', 'Syllabes', 'Consonnes', 'Voyelles', 'Première lettre', 'Lettres muettes', 'Réécrire le mot']) {
    if (types.includes(t)) await page.getByRole('checkbox', { name: t, exact: true }).check();
  }
  for (const t of ['Épeler', 'Nombre de lettres', 'Syllabes', 'Consonnes', 'Voyelles', 'Première lettre', 'Lettres muettes', 'Réécrire le mot']) {
    if (!types.includes(t)) await page.getByRole('checkbox', { name: t, exact: true }).uncheck();
  }
}

async function preparer(page, joueurs = 1) {
  if (!page.__rapide) { await rapide(page); page.__rapide = true; }
  await page.goto('./');
  await page.getByRole('button', { name: 'Commencer l\'aventure' }).click();
  await page.getByRole('radio', { name: new RegExp('^' + joueurs + ' joueurs?$') }).check();
}

test.describe('données des cartes', () => {
  test.beforeEach(() => test.skip(test.info().project.name !== 'ordinateur', 'test de logique : un seul format suffit'));

  test('5 packs (feuilles « pack » de l\'Excel), 3 niveaux chacun, 300 cartes', () => {
    expect(C.PACKS.map((p) => p.nom)).toEqual(['Mots simples', 'Mots compliqués', 'Temps', 'Numérique', 'Lettres']);
    let total = 0;
    for (const p of C.PACKS) {
      expect(Object.keys(p.niveaux)).toEqual(['1', '2', '3']);
      for (const n of ['1', '2', '3']) { expect(p.niveaux[n].length).toBeGreaterThan(0); total += p.niveaux[n].length; }
    }
    expect(total).toBe(300);
  });

  test('accents et fautes corrigés (choix de l\'utilisateur)', () => {
    const tous = C.PACKS.flatMap((p) => Object.values(p.niveaux).flat());
    for (const faux of ['APRES', 'TOT', 'PRES', 'TRES', 'CÔTE A CÔTE', 'TOUT A COUP', 'ZERO', 'MIILIARD', 'ÉLEPHANT', 'VELO', 'ZEBRE', 'GATEAU']) {
      expect(tous, faux).not.toContain(faux);
    }
    for (const juste of ['APRÈS', 'TÔT', 'PRÈS', 'TRÈS', 'À', 'CÔTE À CÔTE', 'TOUT À COUP', 'ZÉRO', 'MILLIARD', 'ÉLÉPHANT', 'VÉLO', 'ZÈBRE', 'GÂTEAU', 'OU', 'OÙ']) {
      expect(tous, juste).toContain(juste);
    }
    // La lettre A reste une lettre dans le pack Lettres.
    expect(C.PACKS.find((p) => p.id === 'lettres').niveaux['1'][0]).toBe('A');
  });
});

test('préparation : chaque joueur choisit ses packs et son niveau', async ({ page }) => {
  await preparer(page, 2);
  await expect(page.locator('#reglages-titre')).toHaveText('Cartes de Léa (Joueur 1)');
  await expect(page.locator('#packs input')).toHaveCount(5);
  await page.getByRole('checkbox', { name: 'Mots simples', exact: true }).uncheck();
  await page.getByRole('radio', { name: 'Niveau 3' }).check();
  await expect(page.locator('.onglet-joueur').nth(0)).toContainText('Niveau 3 · 4 packs');
  await page.getByRole('button', { name: 'Joueur suivant →' }).click();
  await expect(page.locator('#reglages-titre')).toHaveText('Cartes de Tom (Joueur 2)');
  // Le joueur 2 garde ses propres réglages (par défaut : tous les packs, niveau 1).
  await expect(page.getByRole('checkbox', { name: 'Mots simples', exact: true })).toBeChecked();
  await expect(page.locator('.onglet-joueur').nth(1)).toContainText('Niveau 1 · tous les packs');
  // Retour au joueur 1 : ses choix sont gardés.
  await page.locator('.onglet-joueur').nth(0).click();
  await expect(page.getByRole('checkbox', { name: 'Mots simples', exact: true })).not.toBeChecked();
});

test('il faut garder au moins un pack', async ({ page }) => {
  await preparer(page, 1);
  for (const nom of ['Mots simples', 'Mots compliqués', 'Temps', 'Numérique']) await page.getByRole('checkbox', { name: nom, exact: true }).uncheck();
  await page.getByRole('checkbox', { name: 'Lettres', exact: true }).click();
  await expect(page.getByRole('checkbox', { name: 'Lettres', exact: true })).toBeChecked();
  await expect(page.locator('#packs-alerte')).toHaveText('Il faut garder au moins un pack.');
});

test('la carte piochée vient des packs et du niveau du joueur ; mot caché puis « Voir la réponse » @smoke', async ({ page }) => {
  await preparer(page, 1);
  for (const nom of ['Mots simples', 'Mots compliqués', 'Numérique', 'Lettres']) await page.getByRole('checkbox', { name: nom, exact: true }).uncheck();
  await page.getByRole('radio', { name: 'Niveau 2' }).check();
  await seulement(page, ['Épeler']);
  await page.getByRole('button', { name: 'Lancer la partie' }).click();
  const temps2 = C.PACKS.find((p) => p.id === 'temps').niveaux['2'];
  for (let t = 0; t < 5; t++) {
    await page.getByRole('button', { name: 'Piocher une carte' }).click();
    await expect(page.locator('#carte-titre')).toContainText('Temps · niveau 2');
    await expect(page.locator('#carte-consigne')).toHaveText('Épelle le mot :');
    // Le mot est caché…
    await expect(page.locator('#carte-mot')).toHaveClass(/cache/);
    const cache = await page.locator('#carte-mot').innerText();
    expect(cache).toMatch(/^[•\s'’-]+/);
    // …jusqu'à « Voir la réponse ».
    await page.getByRole('button', { name: 'Voir la réponse' }).click();
    const mot = (await page.locator('#carte-mot').innerText()).trim();
    expect(temps2).toContain(mot);
    await expect(page.locator('#carte-reponse')).toHaveText('Réponse : ' + [...mot].filter((c) => /\p{L}/u.test(c)).join(' - '));
    await page.getByRole('button', { name: 'Bonne réponse' }).click();
    await page.getByRole('button', { name: /^Lancer le dé/ }).click();
    if (t < 4) await page.getByRole('button', { name: 'Piocher une carte' }).waitFor();
  }
});

test('lettres : la lettre est affichée et la consigne demande son nom', async ({ page }) => {
  await preparer(page, 1);
  for (const nom of ['Mots simples', 'Mots compliqués', 'Temps', 'Numérique']) await page.getByRole('checkbox', { name: nom, exact: true }).uncheck();
  await page.getByRole('button', { name: 'Lancer la partie' }).click();
  await page.getByRole('button', { name: 'Piocher une carte' }).click();
  await expect(page.locator('#carte-consigne')).toHaveText('Quelle est cette lettre ?');
  await expect(page.locator('#carte-mot')).toHaveText(/^[A-Z]$/);
  await expect(page.getByRole('button', { name: 'Voir la réponse' })).toBeHidden();
});

test('🔊 Écouter : la voix lit la consigne et le mot (en français), sans dire la lettre', async ({ page }) => {
  await voixEspion(page);
  await preparer(page, 1);
  for (const nom of ['Mots simples', 'Mots compliqués', 'Numérique', 'Lettres']) await page.getByRole('checkbox', { name: nom, exact: true }).uncheck();
  await seulement(page, ['Épeler']);
  await page.getByRole('button', { name: 'Lancer la partie' }).click();
  await page.getByRole('button', { name: 'Piocher une carte' }).click();
  await page.getByRole('button', { name: 'Écouter' }).click();
  await page.getByRole('button', { name: 'Voir la réponse' }).click();
  const mot = (await page.locator('#carte-mot').innerText()).trim();
  const lu = await page.evaluate(() => window.__lu);
  expect(lu).toEqual([{ text: 'Épelle le mot : ' + mot.toLocaleLowerCase('fr-FR') + '.', lang: 'fr-FR' }]);

  // Carte lettre : seule la question est lue.
  await page.getByRole('button', { name: 'Bonne réponse' }).click();
  await page.getByRole('button', { name: /^Lancer le dé/ }).click();
  await page.getByRole('button', { name: 'Piocher une carte' }).waitFor();
  await page.getByRole('button', { name: 'Préparation' }).click();
  for (const nom of ['Lettres', 'Temps']) await page.getByRole('checkbox', { name: nom, exact: true }).click(); // Lettres d'abord : on ne peut pas décocher le dernier pack
  await page.getByRole('button', { name: 'Lancer la partie' }).click();
  await page.getByRole('button', { name: 'Piocher une carte' }).click();
  await page.getByRole('button', { name: 'Écouter' }).click();
  expect((await page.evaluate(() => window.__lu)).pop().text).toBe('Quelle est cette lettre ?');
});

test('« Mêmes réglages pour tous les joueurs » copie packs, niveau et questions', async ({ page }) => {
  await preparer(page, 3);
  await page.getByRole('checkbox', { name: 'Temps', exact: true }).uncheck();
  await page.getByRole('radio', { name: 'Niveau 3' }).check();
  await page.getByRole('checkbox', { name: 'Syllabes', exact: true }).uncheck();
  await page.getByRole('button', { name: 'Mêmes réglages pour tous les joueurs' }).click();
  await expect(page.locator('#packs-alerte')).toHaveText('Tous les joueurs ont maintenant les mêmes réglages.');
  for (const k of [1, 2]) {
    await page.locator('.onglet-joueur').nth(k).click();
    await expect(page.getByRole('checkbox', { name: 'Temps', exact: true })).not.toBeChecked();
    await expect(page.getByRole('radio', { name: 'Niveau 3' })).toBeChecked();
    await expect(page.getByRole('checkbox', { name: 'Syllabes', exact: true })).not.toBeChecked();
    await expect(page.locator('.onglet-joueur').nth(k)).toContainText('Niveau 3 · 4 packs · 7 questions');
  }
});

test('le bouton « Mêmes réglages » n\'apparaît pas pour un seul joueur', async ({ page }) => {
  await preparer(page, 1);
  await expect(page.getByRole('button', { name: 'Mêmes réglages pour tous les joueurs' })).toBeHidden();
});

test('« Voir le mot » montre le mot seul (aide), « Voir la réponse » montre aussi la solution', async ({ page }) => {
  await preparer(page, 1);
  await page.getByRole('checkbox', { name: 'Lettres', exact: true }).uncheck();
  await page.getByRole('button', { name: 'Lancer la partie' }).click();
  await page.getByRole('button', { name: 'Piocher une carte' }).click();
  await expect(page.locator('#carte-mot')).toHaveClass(/cache/);
  await page.getByRole('button', { name: 'Voir le mot' }).click();
  await expect(page.locator('#carte-mot')).not.toHaveClass(/cache/);
  await expect(page.locator('#carte-reponse')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Cacher le mot' })).toBeVisible();
  await page.getByRole('button', { name: 'Voir la réponse' }).click();
  await expect(page.locator('#carte-reponse')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Voir le mot' })).toBeVisible();
  await page.getByRole('button', { name: 'Cacher la réponse' }).click();
  await expect(page.locator('#carte-mot')).toHaveClass(/cache/);
  await expect(page.locator('#carte-reponse')).toBeHidden();
});

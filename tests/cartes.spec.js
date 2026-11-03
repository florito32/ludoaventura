// Cartes JEU : 5 packs × 3 niveaux depuis l'Excel, choix par joueur, dictée, lecture vocale.
const { test, expect } = require('@playwright/test');
const C = require('../js/cartes.js');
const { rapide, lancerLeDe, versReglages, cocherJoueur, valider, lancer } = require('./aide');

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

// Arrive sur l'écran 3 (cartes du joueur 1), tout coché pour le joueur 1.
async function preparer(page, joueurs = 1) {
  if (!page.__rapide) { await rapide(page); page.__rapide = true; }
  await page.goto('./');
  await versReglages(page, joueurs);
  await cocherJoueur(page);
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

test('préparation : chaque joueur choisit ses packs, sur son propre écran, sans choix du niveau', async ({ page }) => {
  await preparer(page, 2);
  await expect(page.locator('#reglages-titre')).toHaveText('Léa (Joueur 1) : packs et questions');
  // Plus de choix du niveau (v4.8).
  await expect(page.locator('input[name="niveau-cartes"]')).toHaveCount(0);
  await expect(page.getByText('Niveau', { exact: true })).toHaveCount(0);
  // Le pack « Lettres » n'est plus proposé (v4.8).
  await expect(page.locator('#packs input')).toHaveCount(4);
  await expect(page.getByRole('checkbox', { name: 'Lettres', exact: true })).toHaveCount(0);
  await page.getByRole('checkbox', { name: 'Mots simples', exact: true }).uncheck();
  await valider(page);
  await expect(page.locator('#reglages-titre')).toHaveText('Tom (Joueur 2) : packs et questions');
  await expect(page.locator('#prepa-progres')).toHaveText('Étape 3 sur 4 · Joueur 2 sur 2');
  // Le joueur 2 a ses propres réglages (rien de coché).
  await expect(page.getByRole('checkbox', { name: 'Mots simples', exact: true })).not.toBeChecked();
  // Retour au joueur 1 : ses choix sont gardés.
  await page.getByRole('button', { name: /Retour/ }).click();
  await expect(page.locator('#reglages-titre')).toContainText('Léa (Joueur 1)');
  await expect(page.getByRole('checkbox', { name: 'Mots simples', exact: true })).not.toBeChecked();
});

test('packs et questions décochés au départ ; « Valider » demande au moins un pack et une question', async ({ page }) => {
  if (!page.__rapide) { await rapide(page); page.__rapide = true; }
  await page.goto('./');
  await versReglages(page, 2);
  for (const c of await page.locator('#packs input, #types-questions input').all()) await expect(c).not.toBeChecked();
  // Rien de coché : on reste sur le joueur 1 avec un message.
  await valider(page);
  await expect(page.locator('#reglages-titre')).toContainText('Léa (Joueur 1)');
  await expect(page.locator('#packs-alerte')).toHaveText('Léa (Joueur 1) doit cocher au moins un pack.');
  await expect(page.locator('#packs input').first()).toBeFocused();
  // Un pack coché mais aucune question → message pour les questions.
  await page.getByRole('checkbox', { name: 'Temps', exact: true }).check();
  await valider(page);
  await expect(page.locator('#packs-alerte')).toHaveText('Léa (Joueur 1) doit cocher au moins un type de question.');
  await page.getByRole('checkbox', { name: 'Épeler', exact: true }).check();
  await valider(page);
  // Joueur 2 : il faut aussi au moins un pack.
  for (const c of await page.locator('#packs input, #types-questions input').all()) await expect(c).not.toBeChecked();
  await valider(page);
  await expect(page.locator('#packs-alerte')).toHaveText('Tom (Joueur 2) doit cocher au moins un pack.');
  await page.getByRole('checkbox', { name: 'Numérique', exact: true }).check();
  await page.getByRole('checkbox', { name: 'Épeler', exact: true }).check();
  await valider(page);
  await lancer(page);
  await expect(page.getByRole('heading', { name: 'Le plateau' })).toBeVisible();
});

test('la carte piochée vient des packs du joueur, tous niveaux mêlés ; mot caché puis « Voir la réponse » @smoke', async ({ page }) => {
  await preparer(page, 1);
  for (const nom of ['Mots simples', 'Mots compliqués', 'Numérique']) await page.getByRole('checkbox', { name: nom, exact: true }).uncheck();
  await seulement(page, ['Épeler']);
  await lancer(page);
  const temps = Object.values(C.PACKS.find((p) => p.id === 'temps').niveaux).flat();
  for (let t = 0; t < 5; t++) {
    await page.getByRole('button', { name: 'Piocher une carte' }).click();
    await expect(page.locator('#carte-titre')).toContainText('Temps · Épeler');
    await expect(page.locator('#carte-titre')).not.toContainText('niveau');
    await expect(page.locator('#carte-consigne')).toHaveText('Épelle le mot :');
    // Le mot est caché…
    await expect(page.locator('#carte-mot')).toHaveClass(/cache/);
    const cache = await page.locator('#carte-mot').innerText();
    expect(cache).toMatch(/^[•\s'’-]+/);
    // …jusqu'à « Voir la réponse ».
    await page.getByRole('button', { name: 'Voir la réponse' }).click();
    const mot = (await page.locator('#carte-mot').innerText()).trim();
    expect(temps).toContain(mot);
    await expect(page.locator('#carte-reponse')).toHaveText('Réponse : ' + [...mot].filter((c) => /\p{L}/u.test(c)).join(' - '));
    await page.getByRole('button', { name: 'Bonne réponse' }).click();
    await lancerLeDe(page);
    if (t < 4) await page.getByRole('button', { name: 'Piocher une carte' }).waitFor();
  }
});

test('pack « Lettres » plus proposé : aucune carte lettre n\'est piochée, même avec tous les packs', async ({ page }) => {
  await preparer(page, 1);
  await lancer(page);
  // Toutes les cartes que le joueur peut piocher : 4 packs × 3 niveaux, aucune du pack Lettres.
  const packs = await page.evaluate(() => [...new Set(window.Aventura.cartesDuJoueur(0).map((c) => c.pack + ':' + c.niveau))]);
  expect(packs.filter((p) => p.startsWith('lettres'))).toEqual([]);
  expect(packs).toHaveLength(12);
  await page.getByRole('button', { name: 'Piocher une carte' }).click();
  await expect(page.locator('#carte-consigne')).not.toHaveText('Quelle est cette lettre ?');
});

test('🔊 Écouter : la voix lit la consigne et le mot (en français)', async ({ page }) => {
  await voixEspion(page);
  await preparer(page, 1);
  for (const nom of ['Mots simples', 'Mots compliqués', 'Numérique']) await page.getByRole('checkbox', { name: nom, exact: true }).uncheck();
  await seulement(page, ['Épeler']);
  await lancer(page);
  await page.getByRole('button', { name: 'Piocher une carte' }).click();
  await page.getByRole('button', { name: 'Écouter' }).click();
  await page.getByRole('button', { name: 'Voir la réponse' }).click();
  const mot = (await page.locator('#carte-mot').innerText()).trim();
  const lu = await page.evaluate(() => window.__lu);
  expect(lu).toEqual([{ text: 'Épelle le mot : ' + mot.toLocaleLowerCase('fr-FR') + '.', lang: 'fr-FR' }]);

});

test('« Mêmes réglages pour tous » copie packs et questions, puis passe au choix de l\'aventure', async ({ page }) => {
  await preparer(page, 3);
  await page.getByRole('checkbox', { name: 'Temps', exact: true }).uncheck();
  await page.getByRole('checkbox', { name: 'Syllabes', exact: true }).uncheck();
  await page.getByRole('button', { name: 'Mêmes réglages pour tous' }).click();
  await expect(page.getByRole('button', { name: 'Lancer la partie' })).toBeVisible();
  const p = await page.evaluate(() => window.Aventura.partie);
  for (const k of [1, 2]) {
    expect(p.packs[k]).toEqual(p.packs[0]);
    expect(p.packs[k]).not.toContain('temps');
    expect(p.types[k]).toHaveLength(7);
    expect(p.types[k]).not.toContain('syllabes');
  }
  // En revenant en arrière, le joueur 3 a bien ces réglages.
  await page.getByRole('button', { name: /Retour/ }).click();
  await expect(page.locator('#reglages-titre')).toContainText('(Joueur 3)');
  await expect(page.getByRole('checkbox', { name: 'Temps', exact: true })).not.toBeChecked();
});

test('le bouton « Mêmes réglages » n\'apparaît pas pour un seul joueur', async ({ page }) => {
  await preparer(page, 1);
  await expect(page.getByRole('button', { name: 'Mêmes réglages pour tous' })).toBeHidden();
});

test('« Voir le mot » montre le mot seul (aide), « Voir la réponse » montre aussi la solution', async ({ page }) => {
  await preparer(page, 1);
  await lancer(page);
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

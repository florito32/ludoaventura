// Cartes JEU : 5 packs × 3 niveaux depuis l'Excel, choix par joueur, dictée, lecture vocale.
const { test, expect } = require('@playwright/test');
const C = require('../js/cartes.js');
const { repondre, rapide, lancerLeDe, versReglages, cocherJoueur, orthographe, valider, lancer } = require('./aide');

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
  for (const t of ['Nombre de lettres', 'Nombre de syllabes', 'Consonnes', 'Voyelles', 'Lettres muettes', 'Réécrire le mot']) {
    if (types.includes(t)) await page.getByRole('checkbox', { name: t, exact: true }).check();
  }
  for (const t of ['Nombre de lettres', 'Nombre de syllabes', 'Consonnes', 'Voyelles', 'Lettres muettes', 'Réécrire le mot']) {
    if (!types.includes(t)) await page.getByRole('checkbox', { name: t, exact: true }).uncheck();
  }
}

// Arrive sur l'écran 3 (cartes du joueur 1), tout coché pour le joueur 1.
async function preparer(page, joueurs = 1, options) {
  if (!page.__rapide) { await rapide(page); page.__rapide = true; }
  await page.goto('./');
  await versReglages(page, joueurs);
  await cocherJoueur(page, options);
}

test.describe('données des cartes', () => {
  test.beforeEach(() => test.skip(test.info().project.name !== 'ordinateur', 'test de logique : un seul format suffit'));

  test('20 packs (feuilles « pack » de l\'Excel), 3 niveaux chacun + séries 4 et 5 des thèmes (v6.50), 932 cartes', () => {
    expect(C.PACKS.map((p) => p.nom)).toEqual(['Mots simples', 'Mots compliqués', 'Jours et mois', 'Nombres', 'Lettres',
      // 15 packs ajoutés le 04/11/2026 (v6.16), 8 mots par niveau
      'Animaux', 'Lieux et constructions', 'Pays', 'Villes', 'Paysages et nature', 'Météo et saisons', 'Le corps', 'Aliments',
      'Dans la maison', 'Vêtements', 'L’école', 'Métiers', 'Transports', 'Couleurs et formes', 'Sports et musique']);
    for (const p of C.PACKS.slice(5)) for (const n of ['1', '2', '3']) expect(p.niveaux[n], p.nom).toHaveLength(8);
    let total = 0;
    const themes = C.FAMILLES.flatMap((f) => f.themes);
    for (const p of C.PACKS) {
      // v6.50 : les 17 thèmes proposés ont aussi les séries 4 (Difficile) et 5 (Expert).
      const series = themes.includes(p.id) ? ['1', '2', '3', '4', '5'] : ['1', '2', '3'];
      expect(Object.keys(p.niveaux)).toEqual(series);
      for (const n of series) { expect(p.niveaux[n].length).toBeGreaterThan(0); total += p.niveaux[n].length; }
    }
    expect(total).toBe(660 + 17 * 16);
  });

  test('v6.39 : 17 thèmes rangés en 4 familles (Nature et animaux, Tous les jours, En ville, Le monde…)', () => {
    expect(C.FAMILLES.map((f) => f.nom)).toEqual(['Nature et animaux', 'Tous les jours', 'En ville', 'Le monde, le temps, les nombres']);
    const nom = (id) => C.PACKS.find((p) => p.id === id).nom;
    expect(C.FAMILLES.map((f) => f.themes.map(nom))).toEqual([
      ['Animaux', 'Paysages et nature', 'Météo et saisons'],
      ['Le corps', 'Aliments', 'Dans la maison', 'Vêtements', 'Couleurs et formes'],
      ['Lieux et constructions', 'L’école', 'Métiers', 'Transports', 'Sports et musique'],
      ['Pays', 'Villes', 'Jours et mois', 'Nombres']]);
  });

  test('nouveaux packs : syllabes et lettres muettes relues (exemples)', () => {
    const muettes = (m) => C.INFOS[m].muettes.map((i) => m[i]).join('');
    expect(C.INFOS['OCÉAN'].syllabes).toBe('O-CÉ-AN');
    expect(C.INFOS['LYON'].syllabes).toBe('LY-ON');
    expect(muettes('PRINTEMPS')).toBe('PS');
    expect(muettes('DOIGT')).toBe('GT');
    expect(muettes('HÉRISSON')).toBe('H');
    expect(muettes('PARIS')).toBe('S');
    expect(C.INFOS['ANANAS'].muettes).toBeNull(); // « s » prononcé ou non selon les régions : question non posée
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
  if (!page.__rapide) { await rapide(page); page.__rapide = true; }
  await page.goto('./');
  await versReglages(page, 2);
  await orthographe(page);
  // v6.16 : un écran pour les packs, puis un écran pour les questions.
  await expect(page.locator('#reglages-titre')).toHaveText('Léa (Joueur 1) : Orthographe, les thèmes');
  await expect(page.locator('#reglages-ortho')).toBeHidden();
  // Plus de choix du niveau (v4.8).
  await expect(page.locator('input[name="niveau-cartes"]')).toHaveCount(0);
  await expect(page.locator('#ortho-packs').getByText('Niveau')).toHaveCount(0);
  // 17 thèmes ; « Lettres » n'est plus proposé (v4.8), ni « Mots simples » et « Mots compliqués » (v6.39).
  await expect(page.locator('#packs input')).toHaveCount(17);
  for (const n of ['Lettres', 'Mots simples', 'Mots compliqués', 'Temps', 'Numérique']) await expect(page.getByRole('checkbox', { name: n, exact: true })).toHaveCount(0);
  for (const n of ['Animaux', 'Pays', 'Villes', 'Lieux et constructions', 'Sports et musique']) await expect(page.getByRole('checkbox', { name: n, exact: true })).toHaveCount(1);
  await page.getByRole('checkbox', { name: 'Animaux', exact: true }).check();
  await valider(page);
  await expect(page.locator('#reglages-titre')).toHaveText('Léa (Joueur 1) : Orthographe, les questions');
  await expect(page.locator('#ortho-packs')).toBeHidden();
  await page.getByRole('checkbox', { name: 'Nombre de lettres', exact: true }).check();
  await valider(page);
  // Joueur 2 : il commence par l'écran de la matière (v5.8), rien de choisi.
  await expect(page.locator('#reglages-titre')).toHaveText('Tom (Joueur 2) : quelle matière ?');
  await expect(page.locator('#prepa-progres')).toHaveText('Étape 3 sur 4 · Joueur 2 sur 2');
  await expect(page.locator('#ortho-packs')).toBeHidden();
  for (const c of await page.locator('#matieres input').all()) await expect(c).not.toBeChecked();
  await orthographe(page);
  await expect(page.locator('#reglages-titre')).toHaveText('Tom (Joueur 2) : Orthographe, les thèmes');
  await expect(page.getByRole('checkbox', { name: 'Animaux', exact: true })).not.toBeChecked();
  // Retour : la matière du joueur 2, puis les questions et les packs du joueur 1, gardés.
  await page.getByRole('button', { name: /Retour/ }).click();
  await expect(page.locator('#reglages-titre')).toHaveText('Tom (Joueur 2) : quelle matière ?');
  await page.getByRole('button', { name: /Retour/ }).click();
  await expect(page.locator('#reglages-titre')).toHaveText('Léa (Joueur 1) : Orthographe, les questions');
  await expect(page.getByRole('checkbox', { name: 'Nombre de lettres', exact: true })).toBeChecked();
  await page.getByRole('button', { name: /Retour/ }).click();
  await expect(page.locator('#reglages-titre')).toHaveText('Léa (Joueur 1) : Orthographe, les thèmes');
  await expect(page.getByRole('checkbox', { name: 'Animaux', exact: true })).toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'Pays', exact: true })).not.toBeChecked();
});

test('packs et questions décochés au départ ; « Valider » demande au moins un pack et une question', async ({ page }) => {
  if (!page.__rapide) { await rapide(page); page.__rapide = true; }
  await page.goto('./');
  await versReglages(page, 2);
  // Aucune matière choisie au départ (v5.7) : message, puis Français demande Orthographe.
  await valider(page);
  await expect(page.locator('#packs-alerte')).toHaveText('Léa (Joueur 1) doit choisir une matière.');
  await page.locator('#matieres input[value="francais"]').check();
  await valider(page);
  await expect(page.locator('#packs-alerte')).toHaveText('Léa (Joueur 1) doit choisir Orthographe, Conjugaison, Grammaire ou Phonèmes.');
  await page.locator('#francais input[value="orthographe"]').check();
  await valider(page); // écran des packs (v6.16)
  for (const c of await page.locator('#packs input, #types-questions input').all()) await expect(c).not.toBeChecked();
  // Aucun pack : on reste sur l'écran des packs avec un message.
  await valider(page);
  await expect(page.locator('#reglages-titre')).toHaveText('Léa (Joueur 1) : Orthographe, les thèmes');
  await expect(page.locator('#packs-alerte')).toHaveText('Léa (Joueur 1) doit choisir au moins un thème.');
  await expect(page.locator('#packs input').first()).toBeFocused();
  // Un pack coché → écran des questions ; aucune question → message.
  await page.getByRole('checkbox', { name: 'Jours et mois', exact: true }).check();
  await valider(page);
  await expect(page.locator('#reglages-titre')).toHaveText('Léa (Joueur 1) : Orthographe, les questions');
  await valider(page);
  await expect(page.locator('#packs-alerte')).toHaveText('Léa (Joueur 1) doit choisir au moins un type de question.');
  await page.getByRole('checkbox', { name: 'Nombre de lettres', exact: true }).check();
  await valider(page);
  // Joueur 2 : il faut aussi au moins un pack.
  await orthographe(page);
  for (const c of await page.locator('#packs input, #types-questions input').all()) await expect(c).not.toBeChecked();
  await valider(page);
  await expect(page.locator('#packs-alerte')).toHaveText('Tom (Joueur 2) doit choisir au moins un thème.');
  await page.getByRole('checkbox', { name: 'Nombres', exact: true }).check();
  await valider(page);
  await page.getByRole('checkbox', { name: 'Nombre de lettres', exact: true }).check();
  await valider(page);
  await lancer(page);
  await expect(page.getByRole('heading', { name: 'Le plateau' })).toBeVisible();
});

test('la carte piochée vient des packs du joueur, tous niveaux mêlés ; mot caché puis « Voir le mot » @smoke', async ({ page }) => {
  await preparer(page, 1, { packs: ['temps'] });
  await seulement(page, ['Nombre de lettres']);
  await lancer(page);
  const temps = Object.values(C.PACKS.find((p) => p.id === 'temps').niveaux).flat();
  for (let t = 0; t < 5; t++) {
    await page.getByRole('button', { name: 'Question suivante' }).click();
    await expect(page.locator('#carte-titre')).toContainText('· Nombre de lettres');
    await expect(page.locator('#carte-titre')).not.toContainText('niveau');
    await expect(page.locator('#carte-consigne')).toHaveText('Combien de lettres y a-t-il dans le mot :');
    // Le mot est caché…
    await expect(page.locator('#carte-mot')).toHaveClass(/cache/);
    const cache = await page.locator('#carte-mot').innerText();
    expect(cache).toMatch(/^[•\s'’-]+/);
    // …jusqu'à « Voir le mot ».
    await page.getByRole('button', { name: 'Voir le mot' }).click();
    const mot = (await page.locator('#carte-mot').innerText()).trim();
    expect(temps).toContain(mot);
    await repondre(page, true);
    await expect(page.locator('#carte-reponse')).toContainText('Bonne réponse !');
    await lancerLeDe(page);
    if (t < 4) await page.getByRole('button', { name: 'Question suivante' }).waitFor();
  }
});

test('pack « Lettres » plus proposé : aucune carte lettre n\'est piochée, même avec tous les packs', async ({ page }) => {
  await preparer(page, 1);
  await lancer(page);
  // Toutes les cartes que le joueur peut piocher : 4 packs × 2 séries (niveau Facile = séries 1 et 2, v6.50), aucune du pack Lettres.
  const packs = await page.evaluate(() => [...new Set(window.Aventura.cartesDuJoueur(0).map((c) => c.pack + ':' + c.niveau))]);
  expect(packs.filter((p) => p.startsWith('lettres'))).toEqual([]);
  expect(packs).toHaveLength(8);
  await page.getByRole('button', { name: 'Question suivante' }).click();
  await expect(page.locator('#carte-consigne')).not.toHaveText('Quelle est cette lettre ?');
});

test('🔊 Écouter : la voix lit la consigne et le mot (en français)', async ({ page }) => {
  await voixEspion(page);
  await preparer(page, 1, { packs: ['temps'] });
  await seulement(page, ['Nombre de lettres']);
  await lancer(page);
  await page.getByRole('button', { name: 'Question suivante' }).click();
  await page.getByRole('button', { name: 'Écouter' }).click();
  const mot = await page.evaluate(() => window.Aventura.partie.carte.mot);
  const lu = await page.evaluate(() => window.__lu);
  expect(lu).toEqual([{ text: 'Combien de lettres y a-t-il dans le mot : ' + mot.toLocaleLowerCase('fr-FR') + '.', lang: 'fr-FR' }]);
});

test('« Mêmes réglages pour tous » copie packs et questions, puis passe au choix de l\'aventure', async ({ page }) => {
  await preparer(page, 3, { packs: ['animaux', 'pays', 'numerique'] });
  for (const c of await page.locator('#types-questions input').all()) await c.check(); // toutes les questions
  await page.getByRole('checkbox', { name: 'Nombre de syllabes', exact: true }).uncheck();
  await page.getByRole('button', { name: 'Mêmes réglages pour tous' }).click();
  await expect(page.getByRole('button', { name: 'Lancer la partie' })).toBeVisible();
  const p = await page.evaluate(() => window.Aventura.partie);
  for (const k of [1, 2]) {
    expect(p.packs[k]).toEqual(p.packs[0]);
    expect(p.packs[k]).not.toContain('temps');
    expect(p.types[k]).toHaveLength(10);
    expect(p.types[k]).not.toContain('syllabes');
  }
  // En revenant en arrière, le joueur 3 a bien ces réglages.
  await page.getByRole('button', { name: /Retour/ }).click();
  await expect(page.locator('#reglages-titre')).toContainText('(Joueur 3)');
  await page.getByRole('button', { name: /Retour/ }).click(); // écran des packs du joueur 3
  await expect(page.getByRole('checkbox', { name: 'Jours et mois', exact: true })).not.toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'Nombres', exact: true })).toBeChecked();
});

test('le bouton « Mêmes réglages » n\'apparaît pas pour un seul joueur', async ({ page }) => {
  await preparer(page, 1);
  await expect(page.getByRole('button', { name: 'Mêmes réglages pour tous' })).toBeHidden();
});

test('« Voir le mot » montre le mot seul (aide), sans la réponse ; « Cacher le mot » le recache', async ({ page }) => {
  await preparer(page, 1);
  await lancer(page);
  await page.getByRole('button', { name: 'Question suivante' }).click();
  await expect(page.locator('#carte-mot')).toHaveClass(/cache/);
  await page.getByRole('button', { name: 'Voir le mot' }).click();
  await expect(page.locator('#carte-mot')).not.toHaveClass(/cache/);
  await expect(page.locator('#carte-reponse')).toBeHidden();
  await page.getByRole('button', { name: 'Cacher le mot' }).click();
  await expect(page.locator('#carte-mot')).toHaveClass(/cache/);
  await expect(page.locator('#carte-reponse')).toBeHidden();
});

// v5.0 : « Voir le mot » juste sous « Écouter », même style, avec son icône d'œil (gardée en « Cacher le mot »).
test('« Voir le mot » est juste sous « Écouter », avec une icône d\'œil', async ({ page }) => {
  await preparer(page, 1);
  await lancer(page);
  await page.getByRole('button', { name: 'Question suivante' }).click();
  const ecouter = page.getByRole('button', { name: 'Écouter' });
  const voir = page.getByRole('button', { name: 'Voir le mot' });
  await expect(voir.locator('[aria-hidden="true"]')).toHaveText('👁️');
  const a = await ecouter.boundingBox(), b = await voir.boundingBox();
  expect(b.y).toBeGreaterThan(a.y + a.height - 1);       // dessous…
  expect(b.y - (a.y + a.height)).toBeLessThan(16);        // …juste dessous
  expect(Math.abs(b.x + b.width / 2 - (a.x + a.width / 2))).toBeLessThan(2); // aligné
  await voir.click();
  await expect(page.getByRole('button', { name: 'Cacher le mot' }).locator('[aria-hidden="true"]')).toHaveText('👁️');
});

// v5.6 : plus de cases à cocher à l'étape 3 : le choix est entouré, fond transparent ;
// une fois choisi, il se remplit de couleur.
test('étape 3 : choix entourés sans case à cocher, colorés quand ils sont choisis', async ({ page }) => {
  if (!page.__rapide) { await rapide(page); page.__rapide = true; }
  await page.goto('./');
  await versReglages(page, 1);
  await orthographe(page);
  const pastille = page.locator('#packs .pack').first().locator('span').first();
  const style = (el) => el.evaluate((s) => {
    const c = getComputedStyle(s), b = getComputedStyle(s, '::before');
    return { fond: c.backgroundColor, avant: b.content, largeurAvant: b.width };
  });
  const avant = await style(pastille);
  expect(avant.fond).toBe('rgba(0, 0, 0, 0)'); // fond transparent
  expect(['none', 'normal']).toContain(avant.avant); // aucune case dessinée devant le texte
  await page.locator('#packs .pack').first().click();
  await expect(page.locator('#packs input').first()).toBeChecked();
  // Rempli de couleur (après la petite transition) : brun foncé.
  await expect.poll(async () => (await style(pastille)).fond).toBe('rgb(59, 42, 30)');
  expect(['none', 'normal']).toContain((await style(pastille)).avant);
  // Un deuxième toucher retire le choix.
  await page.locator('#packs .pack').first().click();
  await expect(page.locator('#packs input').first()).not.toBeChecked();
});

// v6.40 (demande du 10/11/2026) : après « Écouter », un 2e bouton « Phrase d'exemple » lit une courte phrase avec le mot.
test('v6.40 : « Phrase d’exemple » apparaît après « Écouter » et lit la phrase du mot', async ({ page }) => {
  await voixEspion(page);
  await preparer(page, 1, { packs: ['animaux'] });
  await seulement(page, ['Nombre de syllabes']);
  await lancer(page);
  await page.getByRole('button', { name: 'Question suivante' }).click();
  const phrase = page.getByRole('button', { name: 'Écouter une phrase d’exemple' });
  await expect(phrase).toBeHidden();
  await page.getByRole('button', { name: 'Écouter' }).click();
  await expect(phrase).toBeVisible();
  await expect(phrase).toBeInViewport();
  await phrase.click();
  const mot = await page.evaluate(() => window.Aventura.partie.carte.mot);
  const P = require('../js/phrases.js');
  const lu = await page.evaluate(() => window.__lu.map((u) => u.text));
  expect(lu[lu.length - 1]).toBe(P[mot]);
  // Rafraîchir la page garde le bouton ; la carte suivante le cache jusqu'au prochain « Écouter ».
  await page.reload();
  await expect(phrase).toBeVisible();
  await page.getByLabel('Ta réponse').fill('99');
  await page.getByRole('button', { name: 'OK', exact: true }).click();
  await page.getByRole('button', { name: 'J’ai compris' }).click();
  await page.getByRole('button', { name: 'Question suivante' }).click();
  await expect(phrase).toBeHidden();
});

test('v6.40 : pas de phrase quand elle donnerait la réponse (mot mélangé, le ou la, pluriel déjà écrit, dictée)', async ({ page }) => {
  test.skip(test.info().project.name !== 'ordinateur', 'test de logique : un seul format suffit');
  await page.goto('./');
  const r = await page.evaluate(() => {
    const Q = window.Questions, V = window.Voix;
    const carte = (id, mot) => ({ mot, question: Q.trouver(id) });
    return {
      syllabes: V.phraseExemple(carte('syllabes', 'CHEVAL')),
      melange: V.phraseExemple(carte('melange', 'CHEVAL')),
      genre: V.phraseExemple(carte('genre', 'CHEVAL')),
      ecrire: V.phraseExemple(carte('ecrire', 'CHEVAL')),
      plurielDonne: V.phraseExemple(carte('pluriel', 'UNITÉ')),
      pluriel: V.phraseExemple(carte('pluriel', 'CHEVAL')),
      calcul: V.phraseExemple({ type: 'calcul' })
    };
  });
  expect(r.syllabes).toBeTruthy();
  expect(r.pluriel).toBeTruthy();
  for (const k of ['melange', 'genre', 'ecrire', 'plurielDonne', 'calcul']) expect(r[k], k).toBeNull();
});

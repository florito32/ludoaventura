// v7.0 (demande du 04/11/2026) : en orthographe, nombre de lettres, nombre de syllabes, consonnes,
// voyelles et lettres muettes s'écrivent ; le jeu corrige. « Réécrire le mot » s'écrit (dictée, v6.31) ; « Épeler à l'oral » n'existe plus (v6.38).
const { test, expect } = require('@playwright/test');
const Q = require('../js/questions.js');
const C = require('../js/cartes.js');
const { rapide, lancerLeDe, versReglages, cocherJoueur, lancer } = require('./aide');

const juste = (id, texte, mot) => Q.juste(Q.trouver(id), texte, mot, C.INFOS[mot]);

test.describe('correction des réponses écrites', () => {
  test.beforeEach(() => test.skip(test.info().project.name !== 'ordinateur', 'test de logique : un seul format suffit'));

  test('lettres séparées par un espace, une virgule ou rien du tout', () => {
    for (const t of ['a i o', 'a,i,o', 'aio', 'A, I, O', 'o a i', 'a, i et o', ' a ; i ; o ']) expect(juste('voyelles', t, 'AVION'), t).toBe(true);
    expect(juste('voyelles', 'a i', 'AVION')).toBe(false); // il en manque une
    expect(juste('voyelles', 'a i o u', 'AVION')).toBe(false); // une de trop
    expect(juste('consonnes', 'v n', 'AVION')).toBe(true);
    expect(juste('consonnes', 'v n t', 'AVION')).toBe(false);
  });

  test('accents ignorés, lettres répétées écrites une ou plusieurs fois, Œ = OE', () => {
    expect(juste('voyelles', 'e a', 'ÉLÉPHANT')).toBe(true);
    expect(juste('voyelles', 'é é a', 'ÉLÉPHANT')).toBe(true);
    expect(juste('consonnes', 'p', 'PAPA')).toBe(true);
    expect(juste('voyelles', 'oeu', 'SŒUR')).toBe(true);
    expect(juste('voyelles', 'œ u', 'SŒUR')).toBe(true);
    expect(juste('muettes', 'g p s', 'LONGTEMPS')).toBe(true);
    expect(juste('muettes', 't', 'ET')).toBe(true);
    expect(juste('consonnes', 'et', 'ET')).toBe(false); // « et » collé = les lettres E et T
  });

  test('nombres en chiffres ou en lettres', () => {
    expect(juste('nombre', '5', 'AVION')).toBe(true);
    expect(juste('nombre', '5 lettres', 'AVION')).toBe(true);
    expect(juste('nombre', 'cinq', 'AVION')).toBe(true);
    expect(juste('nombre', '6', 'AVION')).toBe(false);
    expect(juste('syllabes', '2', 'MAISON')).toBe(true);
    expect(juste('syllabes', 'deux', 'MAISON')).toBe(true);
    expect(juste('syllabes', '3', 'MAISON')).toBe(false);
    expect(Q.lisible(Q.trouver('nombre'), 'beaucoup')).toBe(false);
    expect(Q.lisible(Q.trouver('voyelles'), '1 2')).toBe(false);
  });

  test('v6.38 : plus d’« Épeler à l’oral » ; toutes les questions s’écrivent', () => {
    expect(Q.trouver('epeler')).toBeNull();
    for (const t of Q.TYPES) expect(t.saisie).toBeTruthy();
    expect(Q.FAMILLES.flatMap((f) => f.types)).not.toContain('epeler');
    expect(Q.trouver('ecrire').saisie).toBe('mot');
  });
});

async function partieAvec(page, types) {
  await rapide(page);
  await page.goto('./');
  await versReglages(page, 1);
  await cocherJoueur(page, { types });
  await lancer(page);
  await page.getByRole('button', { name: 'Question suivante' }).click();
  return page.evaluate(() => window.Aventura.partie.carte.mot);
}

test('voyelles : bonne réponse écrite → « Bonne réponse », le dé FORT se lance @smoke', async ({ page }) => {
  const mot = await partieAvec(page, ['voyelles']);
  await expect(page.locator('#carte-consigne')).toHaveText('Quelles sont les voyelles du mot :');
  await expect(page.getByRole('button', { name: 'Voir le mot' })).toBeVisible(); // aide toujours là
  const voy = Q.lettres(mot).filter(Q.estVoyelle);
  await page.getByLabel('Ta réponse').fill(voy.join('').toLowerCase()); // sans séparateur
  await page.getByRole('button', { name: 'OK', exact: true }).click();
  await expect(page.locator('#carte-reponse')).toHaveText('Bonne réponse ! ' + voy.join(', '));
  await expect(page.locator('#carte-mot')).toHaveText(mot); // le mot s'affiche avec la correction
  expect(await page.evaluate(() => window.Aventura.partie.regles.de)).toBe('fort');
  await lancerLeDe(page);
});

test('nombre de syllabes faux → correction avec le découpage, « J’ai compris » lance le dé FAIBLE', async ({ page }) => {
  const mot = await partieAvec(page, ['syllabes']);
  await expect(page.locator('#reponse-joueur')).toHaveAttribute('inputmode', 'numeric');
  const n = C.INFOS[mot].syllabes.split(/[\s-]+/).filter((m) => /\p{L}/u.test(m)).length;
  await page.getByLabel('Ta réponse').fill(String(n + 1));
  await page.getByRole('button', { name: 'OK', exact: true }).click();
  await expect(page.locator('#carte-reponse')).toContainText('tu as écrit « ' + (n + 1) + ' »');
  await expect(page.locator('#carte-reponse')).toContainText(n + ' syllabe');
  expect(await page.evaluate(() => window.Aventura.partie.regles.de)).toBe('faible');
  await page.getByRole('button', { name: 'J’ai compris' }).click();
  await page.getByRole('button', { name: 'Question suivante' }).waitFor({ timeout: 15000 });
});

test('réponse illisible : un message demande de corriger, sans compter de faute', async ({ page }) => {
  await partieAvec(page, ['nombre']);
  await page.getByLabel('Ta réponse').fill('beaucoup');
  await page.getByRole('button', { name: 'OK', exact: true }).click();
  await expect(page.locator('#carte-reponse')).toHaveText('Écris un nombre, par exemple 5.');
  expect(await page.evaluate(() => window.Aventura.partie.regles.etape)).toBe('repondre');
});

test('v6.38 : « Épeler à l’oral » n’est plus proposée dans les questions', async ({ page }) => {
  await rapide(page);
  await page.goto('./');
  await versReglages(page, 1);
  await cocherJoueur(page, { types: [] });
  await expect(page.locator('#types-questions input[value="epeler"]')).toHaveCount(0);
  await expect(page.locator('#types-questions').getByText('Épeler', { exact: false })).toHaveCount(0);
});

// ---------- v6.17 : lettre manquante, mot mélangé, nombre de voyelles / consonnes, combien de fois ----------
test.describe('nouvelles questions : logique', () => {
  test.beforeEach(() => test.skip(test.info().project.name !== 'ordinateur', 'test de logique : un seul format suffit'));
  const Qt = (id) => Q.trouver(id);

  test('lettre manquante : une lettre sans accent remplacée par « _ »', () => {
    for (let k = 0; k < 30; k++) {
      const p = Qt('manquante').preparer('ÉLÉPHANT');
      const vu = Qt('manquante').montrer('ÉLÉPHANT', null, p);
      expect(vu).toMatch(/^[^_]*_[^_]*$/);
      expect('ÉLÉPHANT'[p.pos]).toMatch(/[A-Z]/); // jamais É
      expect(Q.juste(Qt('manquante'), 'ÉLÉPHANT'[p.pos].toLowerCase(), 'ÉLÉPHANT', null, p)).toBe(true);
    }
    expect(Q.juste(Qt('manquante'), 'n', 'BANANE', null, { pos: 1 })).toBe(false);
  });

  test('mot mélangé : jamais dans le bon ordre ; le mot est accepté sans accents ; pas pour les expressions', () => {
    for (let k = 0; k < 30; k++) expect(Qt('melange').montrer('CHAT', null, Qt('melange').preparer('CHAT')).replace(/ /g, '')).not.toBe('CHAT');
    expect(Q.juste(Qt('melange'), 'elephant', 'ÉLÉPHANT', null, {})).toBe(true);
    expect(Q.juste(Qt('melange'), 'éléfant', 'ÉLÉPHANT', null, {})).toBe(false);
    expect(Q.possibles('PARCE QUE', C.INFOS['PARCE QUE'], ['melange'])).toHaveLength(0);
    expect(Q.possibles('LE', C.INFOS['LE'], ['melange'])).toHaveLength(0); // trop court
  });

  test('nombre de voyelles, de consonnes, combien de fois une lettre', () => {
    expect(Q.juste(Qt('nb-voyelles'), '3', 'AVION', null)).toBe(true);
    expect(Q.juste(Qt('nb-consonnes'), 'deux', 'AVION', null)).toBe(true);
    expect(Qt('nb-voyelles').reponse('AVION')).toBe('3 voyelles (A, I, O)');
    expect(Q.juste(Qt('combien-lettre'), '2', 'BANANE', null, { lettre: 'A' })).toBe(true);
    expect(Q.juste(Qt('combien-lettre'), '2', 'ÉLÉPHANT', null, { lettre: 'E' })).toBe(true); // É compte comme E
    expect(Q.consigne(Qt('combien-lettre'), 'BANANE', null, { lettre: 'N' })).toBe('Combien de fois vois-tu la lettre N dans le mot :');
    // 3 fois sur 4, une lettre présente plusieurs fois
    let doubles = 0;
    for (let k = 0; k < 200; k++) if (['A', 'N'].includes(Qt('combien-lettre').preparer('BANANE').lettre)) doubles++;
    expect(doubles).toBeGreaterThan(120);
  });
});

async function partieMots(page, types, packs) {
  await rapide(page);
  await page.goto('./');
  await versReglages(page, 1);
  await cocherJoueur(page, { types, packs });
  await lancer(page);
  await page.getByRole('button', { name: 'Question suivante' }).click();
  return page.evaluate(() => window.Aventura.partie.carte);
}

test('lettre manquante : le mot s\'affiche avec « _ », pas de « Voir le mot » ; bonne réponse → dé FORT @smoke', async ({ page }) => {
  const c = await partieMots(page, ['manquante']);
  await expect(page.locator('#carte-consigne')).toHaveText('Quelle lettre manque dans le mot :');
  await expect(page.locator('#carte-mot')).toHaveText(c.mot.slice(0, c.params.pos) + '_' + c.mot.slice(c.params.pos + 1));
  await expect(page.locator('#btn-voir-mot')).toBeHidden();
  await page.getByLabel('Ta réponse').fill(c.mot[c.params.pos].toLowerCase());
  await page.getByRole('button', { name: 'OK', exact: true }).click();
  await expect(page.locator('#carte-reponse')).toContainText('Bonne réponse !');
  expect(await page.evaluate(() => window.Aventura.partie.regles.de)).toBe('fort');
});

test('mot mélangé : lettres en désordre, la voix ne dit pas le mot ; réponse fausse → la correction donne le mot', async ({ page }) => {
  await page.addInitScript(() => {
    window.__lu = [];
    window.SpeechSynthesisUtterance = function (t) { this.text = t; };
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: { speak: (u) => window.__lu.push(u.text), cancel() {}, getVoices: () => [] } });
  });
  const c = await partieMots(page, ['melange'], ['animaux']);
  await expect(page.locator('#carte-mot')).toHaveText(c.params.melange);
  await page.getByRole('button', { name: 'Écouter' }).click();
  expect(await page.evaluate(() => window.__lu.pop())).toBe('Remets les lettres dans l’ordre :');
  await page.getByLabel('Ta réponse').fill('zzzz');
  await page.getByRole('button', { name: 'OK', exact: true }).click();
  await expect(page.locator('#carte-reponse')).toContainText('La bonne réponse : ' + c.mot + '.');
  await expect(page.locator('#carte-mot')).toHaveText(c.mot);
  await page.getByRole('button', { name: 'J’ai compris' }).click();
});

test('combien de fois une lettre : la consigne nomme la lettre ; le mot reste caché avec « Voir le mot »', async ({ page }) => {
  const c = await partieMots(page, ['combien-lettre']);
  await expect(page.locator('#carte-consigne')).toHaveText('Combien de fois vois-tu la lettre ' + c.params.lettre + ' dans le mot :');
  await expect(page.locator('#carte-mot')).toHaveClass(/cache/);
  await expect(page.getByRole('button', { name: 'Voir le mot' })).toBeVisible();
  // Rechargement : la même lettre est gardée.
  await page.reload();
  await expect(page.locator('#carte-consigne')).toHaveText('Combien de fois vois-tu la lettre ' + c.params.lettre + ' dans le mot :');
});

// ---------- v6.18 : Le ou la ? et Au pluriel ----------
test.describe('genre et pluriel : logique', () => {
  test.beforeEach(() => test.skip(test.info().project.name !== 'ordinateur', 'test de logique : un seul format suffit'));
  const j = (id, t, m) => Q.juste(Q.trouver(id), t, m, C.INFOS[m]);

  test('Le ou la ? : le / la, ou un / une devant une voyelle ou un h muet', () => {
    expect(Q.consigne(Q.trouver('genre'), 'MAISON', C.INFOS.MAISON)).toBe('Le ou la ? Écris le mot qui va devant :');
    expect(Q.consigne(Q.trouver('genre'), 'ÉCOLE', C.INFOS['ÉCOLE'])).toBe('Un ou une ? Écris le mot qui va devant :');
    expect(Q.consigne(Q.trouver('genre'), 'HÉRISSON', C.INFOS['HÉRISSON'])).toBe('Le ou la ? Écris le mot qui va devant :'); // h aspiré
    expect(j('genre', 'la', 'MAISON')).toBe(true);
    expect(j('genre', 'La maison', 'MAISON')).toBe(true);
    expect(j('genre', 'une', 'MAISON')).toBe(true); // même genre
    expect(j('genre', 'le', 'MAISON')).toBe(false);
    expect(j('genre', 'un', 'HÔPITAL')).toBe(true);
    expect(j('genre', 'le', 'HÔPITAL')).toBe(false); // on dit « l'hôpital »
    expect(j('genre', 'la', 'FRANCE')).toBe(true);
    expect(Q.lisible(Q.trouver('genre'), 'maison')).toBe(false);
  });

  test('Au pluriel : pluriels en -aux, mots déjà en -s ; « des » peut être écrit', () => {
    expect(j('pluriel', 'chevaux', 'CHEVAL')).toBe(true);
    expect(j('pluriel', 'des chevaux', 'CHEVAL')).toBe(true);
    expect(j('pluriel', 'chevals', 'CHEVAL')).toBe(false);
    expect(j('pluriel', 'bateaux', 'BATEAU')).toBe(true);
    expect(j('pluriel', 'bras', 'BRAS')).toBe(true);
    expect(j('pluriel', 'maisons', 'MAISON')).toBe(true);
    expect(Q.trouver('pluriel').montrer('CHEVAL', C.INFOS.CHEVAL)).toBe('UN CHEVAL → DES …');
    expect(Q.trouver('pluriel').montrer('MAISON', C.INFOS.MAISON)).toBe('UNE MAISON → DES …');
  });

  test('pas de question pour les mots qui ne sont pas des noms, les métiers épicènes, les pays (pluriel)', () => {
    const poss = (m) => Q.possibles(m, C.INFOS[m], ['genre', 'pluriel']).map((t) => t.id);
    expect(poss('LE')).toEqual([]);
    expect(poss('ROUGE')).toEqual([]);
    expect(poss('PILOTE')).toEqual([]); // un ou une pilote : les deux sont justes
    expect(poss('PARIS')).toEqual([]);
    expect(poss('FRANCE')).toEqual(['genre']);
    expect(poss('CISEAUX')).toEqual(['genre']);
    expect(poss('CHEVAL')).toEqual(['genre', 'pluriel']);
  });
});

test('Au pluriel : « UN … → DES … » affiché, bonne réponse écrite → dé FORT', async ({ page }) => {
  const c = await partieMots(page, ['pluriel'], ['animaux']);
  const info = C.INFOS[c.mot];
  await expect(page.locator('#carte-mot')).toHaveText((info.genre === 'f' ? 'UNE ' : 'UN ') + c.mot + ' → DES …');
  await page.getByLabel('Ta réponse').fill('des ' + info.pluriel.toLowerCase());
  await page.getByRole('button', { name: 'OK', exact: true }).click();
  await expect(page.locator('#carte-reponse')).toHaveText('Bonne réponse ! DES ' + info.pluriel);
  expect(await page.evaluate(() => window.Aventura.partie.regles.de)).toBe('fort');
});

test('Le ou la ? : réponse illisible → message ; fausse → correction « LA MAISON »', async ({ page }) => {
  const c = await partieMots(page, ['genre'], ['lieux']);
  const info = C.INFOS[c.mot];
  await expect(page.locator('#carte-mot')).toHaveText(c.mot);
  await page.getByLabel('Ta réponse').fill('bof');
  await page.getByRole('button', { name: 'OK', exact: true }).click();
  await expect(page.locator('#carte-reponse')).toHaveText(info.elision ? 'Écris « un » ou « une ».' : 'Écris « le » ou « la ».');
  const faux = info.elision ? (info.genre === 'f' ? 'un' : 'une') : (info.genre === 'f' ? 'le' : 'la');
  await page.getByLabel('Ta réponse').fill(faux);
  await page.getByRole('button', { name: 'OK', exact: true }).click();
  await expect(page.locator('#carte-reponse')).toContainText(Q.trouver('genre').reponse(c.mot, info));
  expect(await page.evaluate(() => window.Aventura.partie.regles.de)).toBe('faible');
});

// v6.31 (demande du 09/11/2026) : « Réécrire le mot » au clavier ; la voix dicte le mot avec une phrase d'exemple.
test('Réécrire le mot : dictée lue tout de suite (mot, phrase, mot), mot caché sans « Voir le mot », réponse écrite corrigée @smoke', async ({ page }) => {
  await page.addInitScript(() => {
    window.__lu = [];
    window.SpeechSynthesisUtterance = function (t) { this.text = t; };
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: { speak: (u) => window.__lu.push(u.text), cancel() {}, getVoices: () => [] } });
  });
  const mot = await partieAvec(page, ['ecrire']);
  const P = require('../js/phrases.js');
  await expect(page.locator('#carte-consigne')).toHaveText('Écris le mot que tu entends :');
  await expect(page.locator('#carte-mot')).toHaveClass(/cache/);
  await expect(page.locator('#btn-voir-mot')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Bonne réponse' })).toHaveCount(0);
  const m = mot.toLocaleLowerCase('fr-FR');
  const lu = await page.evaluate(() => window.__lu.slice());
  expect(lu).toEqual(['Écris le mot que tu entends : ' + m + '. ' + P[mot] + ' ' + m.charAt(0).toLocaleUpperCase('fr-FR') + m.slice(1) + '.']);
  // Les accents ne sont pas exigés (hypothèse à valider) : « elephant » = ÉLÉPHANT.
  await page.getByLabel('Ta réponse').fill(Q.lettres(mot).join('').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase());
  await page.getByRole('button', { name: 'OK', exact: true }).click();
  await expect(page.locator('#carte-reponse')).toHaveText('Bonne réponse ! ' + mot);
  await expect(page.locator('#carte-mot')).toHaveText(mot);
  expect(await page.evaluate(() => window.Aventura.partie.regles.de)).toBe('fort');
});

test('Réécrire le mot : faute → correction avec le bon mot, dé FAIBLE', async ({ page }) => {
  const mot = await partieAvec(page, ['ecrire']);
  await page.getByLabel('Ta réponse').fill('zzz');
  await page.getByRole('button', { name: 'OK', exact: true }).click();
  await expect(page.locator('#carte-reponse')).toContainText('La bonne réponse : ' + mot + '.');
  expect(await page.evaluate(() => window.Aventura.partie.regles.de)).toBe('faible');
});

test.describe('phrases de la dictée', () => {
  test.beforeEach(() => test.skip(test.info().project.name !== 'ordinateur', 'test de logique : un seul format suffit'));
  test('chaque mot des packs (sauf les lettres seules) a sa phrase, qui contient le mot', () => {
    const P = require('../js/phrases.js');
    const n = (s) => s.toLowerCase().replace(/œ/g, 'oe').normalize('NFD').replace(/[^a-z]/g, '');
    const mots = new Set();
    for (const p of C.PACKS) for (const l of Object.values(p.niveaux)) for (const m of l) if (!(p.id === 'lettres' && m.length === 1)) mots.add(m);
    for (const m of mots) {
      expect(P[m], m).toBeTruthy();
      if (!/\.\.\.|…/.test(m)) expect(n(P[m]), m).toContain(n(m));
    }
  });
});

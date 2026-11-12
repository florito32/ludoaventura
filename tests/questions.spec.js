// Types de questions : épeler, nombre de lettres, syllabes, consonnes, voyelles, première lettre, lettres muettes, réécrire.
const { test, expect } = require('@playwright/test');
const Q = require('../js/questions.js');
const C = require('../js/cartes.js');
const { rapide, lancerLeDe, versReglages, cocherJoueur, lancer } = require('./aide');

const rep = (id, mot) => Q.trouver(id).reponse(mot, C.INFOS[mot]);
const possible = (id, mot) => Q.possibles(mot, C.INFOS[mot], [id]).length === 1;

test.describe('réponses attendues', () => {
  test.beforeEach(() => test.skip(test.info().project.name !== 'ordinateur', 'test de logique : un seul format suffit'));

  test('13 types de questions (plus d’« Épeler à l’oral » depuis la v6.38)', () => {
    expect(Q.TYPES.map((t) => t.nom)).toEqual(['Nombre de lettres', 'Nombre de syllabes', 'Consonnes', 'Voyelles', 'Lettres muettes', 'Réécrire le mot',
      // v6.17 : questions acceptées le 04/11/2026
      'Lettre manquante', 'Mot mélangé', 'Nombre de voyelles', 'Nombre de consonnes', 'Combien de fois cette lettre\u00a0?',
      // v6.18
      'Le ou la\u00a0?', 'Au pluriel']);
  });

  test('AVION', () => {
    expect(rep('nombre', 'AVION')).toBe('5 lettres');
    expect(rep('syllabes', 'AVION')).toBe('2 syllabes (A · VION)');
    expect(rep('consonnes', 'AVION')).toBe('V, N');
    expect(rep('voyelles', 'AVION')).toBe('A, I, O');
    expect(Q.trouver('premiere')).toBeNull(); // « Première lettre » n'est plus proposée (v4.9)
    expect(rep('ecrire', 'AVION')).toBe('AVION');
    expect(possible('muettes', 'AVION')).toBe(false); // pas de lettre muette : la question n'est pas posée
  });

  test('lettres muettes', () => {
    expect(rep('muettes', 'CHAT')).toBe('T');
    expect(rep('muettes', 'LONGTEMPS')).toBe('G, P, S');
    expect(rep('muettes', 'HIBOU')).toBe('H');
    expect(rep('muettes', 'POMME')).toBe('E');
    expect(possible('muettes', 'PLUS')).toBe(false); // prononciation variable : exclu
  });

  test('syllabes relues à la main et mots composés', () => {
    expect(rep('syllabes', 'LION')).toBe('2 syllabes (LI · ON)');
    expect(rep('syllabes', 'CÔTE À CÔTE')).toBe('5 syllabes (CÔ · TE · À · CÔ · TE)');
    expect(rep('nombre', 'PEUT-ÊTRE')).toBe('8 lettres');
    expect(rep('voyelles', 'YOGA')).toBe('Y, O, A'); // y est une voyelle
    expect(possible('nombre', 'SŒUR')).toBe(false);
  });

  test('chaque mot a au moins 5 types de questions possibles', () => {
    const tous = Q.TYPES.map((t) => t.id);
    for (const mot of Object.keys(C.INFOS)) expect(Q.possibles(mot, C.INFOS[mot], tous).length, mot).toBeGreaterThanOrEqual(5);
  });
});

async function preparer(page, types) {
  await rapide(page);
  await page.goto('./');
  await versReglages(page, 1);
  await cocherJoueur(page, types ? { types } : undefined);
}

test('le joueur choisit ses questions ; « Lettres muettes » seule → il les écrit, la correction les surligne @smoke', async ({ page }) => {
  await preparer(page, ['muettes']);
  await expect(page.locator('#types-questions input')).toHaveCount(11);
  await expect(page.getByRole('checkbox', { name: 'Première lettre', exact: true })).toHaveCount(0);
  expect(await page.evaluate(() => window.Aventura.partie.types[0])).toEqual(['muettes']);
  await lancer(page);
  for (let t = 0; t < 3; t++) {
    await page.getByRole('button', { name: 'Question suivante' }).click();
    await expect(page.locator('#carte-consigne')).toHaveText('Quelles sont les lettres muettes du mot :');
    // Plus de « Voir la réponse » ni de « Bonne / Mauvaise réponse » : le joueur écrit.
    await expect(page.getByRole('button', { name: 'Voir la réponse' })).toBeHidden();
    await expect(page.getByRole('button', { name: 'Bonne réponse' })).toHaveCount(0);
    const mot = await page.evaluate(() => window.Aventura.partie.carte.mot);
    const muettes = C.INFOS[mot].muettes.map((i) => mot[i]);
    await page.getByLabel('Ta réponse').fill(muettes.join(' ').toLowerCase());
    await page.getByRole('button', { name: 'OK', exact: true }).click();
    await expect(page.locator('#carte-mot .muette')).toHaveText(muettes);
    await expect(page.locator('#carte-reponse')).toHaveText('Bonne réponse ! ' + muettes.join(', '));
    await lancerLeDe(page);
    if (t < 2) await page.getByRole('button', { name: 'Question suivante' }).waitFor();
  }
});

test('la voix lit la question tirée, puis le mot', async ({ page }) => {
  await page.addInitScript(() => {
    window.__lu = [];
    window.SpeechSynthesisUtterance = function (t) { this.text = t; };
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: { speak: (u) => window.__lu.push(u.text), cancel() {}, getVoices: () => [] } });
  });
  await preparer(page, ['syllabes']);
  await lancer(page);
  await page.getByRole('button', { name: 'Question suivante' }).click();
  await page.getByRole('button', { name: 'Écouter' }).click();
  const mot = await page.evaluate(() => window.Aventura.partie.carte.mot);
  expect(await page.evaluate(() => window.__lu.pop())).toBe('Combien de syllabes y a-t-il dans le mot : ' + mot.replace(/(\.\.\.|…)/g, ' ').replace(/\s+/g, ' ').trim().toLocaleLowerCase('fr-FR') + '.');
});

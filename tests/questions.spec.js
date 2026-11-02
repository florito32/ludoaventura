// Types de questions : épeler, nombre de lettres, syllabes, consonnes, voyelles, première lettre, lettres muettes, réécrire.
const { test, expect } = require('@playwright/test');
const Q = require('../js/questions.js');
const C = require('../js/cartes.js');
const { rapide } = require('./aide');

const rep = (id, mot) => Q.trouver(id).reponse(mot, C.INFOS[mot]);
const possible = (id, mot) => Q.possibles(mot, C.INFOS[mot], [id]).length === 1;

test.describe('réponses attendues', () => {
  test.beforeEach(() => test.skip(test.info().project.name !== 'ordinateur', 'test de logique : un seul format suffit'));

  test('8 types de questions', () => {
    expect(Q.TYPES.map((t) => t.nom)).toEqual(['Épeler', 'Nombre de lettres', 'Syllabes', 'Consonnes', 'Voyelles', 'Première lettre', 'Lettres muettes', 'Réécrire le mot']);
  });

  test('AVION', () => {
    expect(rep('epeler', 'AVION')).toBe('A - V - I - O - N');
    expect(rep('nombre', 'AVION')).toBe('5 lettres');
    expect(rep('syllabes', 'AVION')).toBe('A · VION (2 syllabes)');
    expect(rep('consonnes', 'AVION')).toBe('V, N');
    expect(rep('voyelles', 'AVION')).toBe('A, I, O');
    expect(rep('premiere', 'AVION')).toBe('A');
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
    expect(rep('syllabes', 'LION')).toBe('LI · ON (2 syllabes)');
    expect(rep('syllabes', 'CÔTE À CÔTE')).toBe('CÔ · TE · À · CÔ · TE (5 syllabes)');
    expect(rep('nombre', 'PEUT-ÊTRE')).toBe('8 lettres');
    expect(rep('voyelles', 'YOGA')).toBe('Y, O, A'); // y est une voyelle
    expect(possible('nombre', 'SŒUR')).toBe(false);
  });

  test('chaque mot a au moins 5 types de questions possibles', () => {
    const tous = Q.TYPES.map((t) => t.id);
    for (const mot of Object.keys(C.INFOS)) expect(Q.possibles(mot, C.INFOS[mot], tous).length, mot).toBeGreaterThanOrEqual(5);
  });
});

async function preparer(page) {
  await rapide(page);
  await page.goto('./');
  await page.getByRole('button', { name: 'Commencer l\'aventure' }).click();
  await page.getByRole('radio', { name: '1 joueur' }).check();
}

test('le joueur choisit ses questions ; « Lettres muettes » seule → la réponse surligne les lettres muettes @smoke', async ({ page }) => {
  await preparer(page);
  await expect(page.locator('#types-questions input')).toHaveCount(8);
  for (const t of ['Épeler', 'Nombre de lettres', 'Syllabes', 'Consonnes', 'Voyelles', 'Première lettre', 'Réécrire le mot']) {
    await page.getByRole('checkbox', { name: t, exact: true }).uncheck();
  }
  await expect(page.locator('.onglet-joueur').nth(0)).toContainText('1 question');
  // Au moins un type doit rester coché.
  await page.getByRole('checkbox', { name: 'Lettres muettes', exact: true }).click();
  await expect(page.getByRole('checkbox', { name: 'Lettres muettes', exact: true })).toBeChecked();
  await page.getByRole('checkbox', { name: 'Lettres', exact: true }).uncheck(); // pas de lettres seules
  await page.getByRole('button', { name: 'Lancer la partie' }).click();
  for (let t = 0; t < 3; t++) {
    await page.getByRole('button', { name: 'Piocher une carte' }).click();
    await expect(page.locator('#carte-consigne')).toHaveText('Quelles sont les lettres muettes du mot :');
    await page.getByRole('button', { name: 'Voir la réponse' }).click();
    const mot = (await page.locator('#carte-mot').innerText()).trim();
    const muettes = C.INFOS[mot].muettes.map((i) => mot[i]);
    await expect(page.locator('#carte-mot .muette')).toHaveText(muettes);
    await expect(page.locator('#carte-reponse')).toHaveText('Réponse : ' + muettes.join(', '));
    await page.getByRole('button', { name: 'Bonne réponse' }).click();
    await page.getByRole('button', { name: /^Lancer le dé/ }).click();
    if (t < 2) await page.getByRole('button', { name: 'Piocher une carte' }).waitFor();
  }
});

test('la voix lit la question tirée, puis le mot', async ({ page }) => {
  await page.addInitScript(() => {
    window.__lu = [];
    window.SpeechSynthesisUtterance = function (t) { this.text = t; };
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: { speak: (u) => window.__lu.push(u.text), cancel() {}, getVoices: () => [] } });
  });
  await preparer(page);
  for (const t of ['Épeler', 'Nombre de lettres', 'Consonnes', 'Voyelles', 'Première lettre', 'Lettres muettes', 'Réécrire le mot']) {
    await page.getByRole('checkbox', { name: t, exact: true }).uncheck();
  }
  await page.getByRole('checkbox', { name: 'Lettres', exact: true }).uncheck();
  await page.getByRole('button', { name: 'Lancer la partie' }).click();
  await page.getByRole('button', { name: 'Piocher une carte' }).click();
  await page.getByRole('button', { name: 'Écouter' }).click();
  await page.getByRole('button', { name: 'Voir la réponse' }).click();
  const mot = (await page.locator('#carte-mot').innerText()).trim();
  expect(await page.evaluate(() => window.__lu.pop())).toBe('Découpe en syllabes le mot : ' + mot.toLocaleLowerCase('fr-FR') + '.');
});

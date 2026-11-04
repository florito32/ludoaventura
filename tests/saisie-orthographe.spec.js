// v7.0 (demande du 04/11/2026) : en orthographe, nombre de lettres, nombre de syllabes, consonnes,
// voyelles et lettres muettes s'écrivent ; le jeu corrige. « Épeler » et « Réécrire » restent à l'oral.
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

  test('« Épeler » et « Réécrire » restent à l’oral', () => {
    expect(Q.trouver('epeler').saisie).toBeUndefined();
    expect(Q.trouver('ecrire').saisie).toBeUndefined();
  });
});

async function partieAvec(page, types) {
  await rapide(page);
  await page.goto('./');
  await versReglages(page, 1);
  await cocherJoueur(page, { types });
  await lancer(page);
  await page.getByRole('button', { name: 'Piocher une carte' }).click();
  return page.evaluate(() => window.Aventura.partie.carte.mot);
}

test('voyelles : bonne réponse écrite → « Bonne réponse », le dé FORT se lance @smoke', async ({ page }) => {
  const mot = await partieAvec(page, ['voyelles']);
  await expect(page.locator('#carte-consigne')).toHaveText('Quelles sont les voyelles du mot :');
  await expect(page.getByRole('button', { name: 'Voir le mot' })).toBeVisible(); // aide toujours là
  const voy = Q.lettres(mot).filter(Q.estVoyelle);
  await page.getByLabel('Ta réponse').fill(voy.join('').toLowerCase()); // sans séparateur
  await page.getByRole('button', { name: 'Valider', exact: true }).click();
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
  await page.getByRole('button', { name: 'Valider', exact: true }).click();
  await expect(page.locator('#carte-reponse')).toContainText('tu as écrit « ' + (n + 1) + ' »');
  await expect(page.locator('#carte-reponse')).toContainText(n + ' syllabe');
  expect(await page.evaluate(() => window.Aventura.partie.regles.de)).toBe('faible');
  await page.getByRole('button', { name: 'J’ai compris' }).click();
  await page.getByRole('button', { name: 'Piocher une carte' }).waitFor({ timeout: 15000 });
});

test('réponse illisible : un message demande de corriger, sans compter de faute', async ({ page }) => {
  await partieAvec(page, ['nombre']);
  await page.getByLabel('Ta réponse').fill('beaucoup');
  await page.getByRole('button', { name: 'Valider', exact: true }).click();
  await expect(page.locator('#carte-reponse')).toHaveText('Écris un nombre, par exemple 5.');
  expect(await page.evaluate(() => window.Aventura.partie.regles.etape)).toBe('repondre');
});

test('« Épeler » garde « Bonne / Mauvaise réponse »', async ({ page }) => {
  await partieAvec(page, ['epeler']);
  await expect(page.locator('#carte-saisie')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Bonne réponse' })).toBeVisible();
});

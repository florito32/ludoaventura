// « Épeler à l'oral » (v6.28, demande du 09/11/2026) : le joueur dit les lettres, la reconnaissance vocale
// les écrit, le jeu valide ; 3 essais ; sans reconnaissance vocale la question n'est pas proposée.
// La reconnaissance du navigateur est remplacée par une fausse (window.__dire : ce que le joueur « dit »).
const { test, expect } = require('@playwright/test');
const P = require('../js/parole.js');
const Q = require('../js/questions.js');
const { rapide, lancerLeDe, versReglages, cocherJoueur, lancer } = require('./aide');

test.describe('lettres entendues', () => {
  test.beforeEach(() => test.skip(test.info().project.name !== 'ordinateur', 'test de logique : un seul format suffit'));
  test('noms des lettres, lettres seules, « deux L », « i grec », « double vé », accents ignorés', () => {
    expect(P.lettresEntendues('a v i o n').lettres.join('')).toBe('AVION');
    expect(P.lettresEntendues('bé a thé eau').lettres.join('')).toBe('BATO');
    expect(P.lettresEntendues('hache i grec').lettres.join('')).toBe('HY');
    expect(P.lettresEntendues('double vé a g o n').lettres.join('')).toBe('WAGON');
    expect(P.lettresEntendues('b a deux elle e').lettres.join('')).toBe('BALLE');
    expect(P.lettresEntendues('e accent aigu t e').lettres.join('')).toBe('ETE');
    expect(P.lettresEntendues('bonjour').douteux).toEqual(['bonjour']);
    expect(P.juste('ÉTÉ', ['e t e'])).toBe(true);
    expect(P.juste('SŒUR', ['s o e u r'])).toBe(true);
    // Bug du 09/11/2026 (capture ESTOMAC) : la reconnaissance de Google colle les lettres épelées en un mot.
    // Choix de l'utilisateur : accepté sans contrôle (même si le joueur a dit le mot sans l'épeler).
    expect(P.juste('ESTOMAC', ['estomac'])).toBe(true);
    expect(P.juste('ESTOMAC', ['est o mac'])).toBe(true);
    expect(P.juste('ÉLÉPHANT', ['éléphant'])).toBe(true);
    expect(P.juste('ESTOMAC', ['estomaque'])).toBe(false);
    expect(P.lettresEntendues('bonjour', true).lettres.join('')).toBe('BONJOUR');
    expect(P.juste('AVION', ['a b i o n', 'a v i o n'])).toBe(true); // une des propositions suffit
  });
});

// Fausse reconnaissance vocale : chaque start() « entend » la phrase suivante de window.__dire
// (ou l'erreur window.__erreur), puis s'arrête comme après un silence.
async function fausseVoix(page) {
  await page.addInitScript(() => {
    window.__dire = [];
    class Fausse {
      start() {
        setTimeout(() => {
          if (window.__erreur) { this.onerror && this.onerror({ error: window.__erreur }); this.onend && this.onend(); return; }
          const t = window.__dire.shift() || '';
          if (t) {
            const res = [Object.assign([{ transcript: t }], { isFinal: true })];
            this.onresult && this.onresult({ results: res });
          }
          setTimeout(() => this.onend && this.onend(), 30);
        }, 50);
      }
      stop() {}
    }
    window.SpeechRecognition = Fausse;
    window.webkitSpeechRecognition = Fausse;
  });
}

async function partieEpeler(page) {
  await rapide(page, { juge: false });
  await fausseVoix(page);
  await page.goto('./');
  await versReglages(page, 1);
  await cocherJoueur(page, { types: ['epeler'] });
  await lancer(page);
  await page.getByRole('button', { name: 'Question suivante' }).click();
  return page.evaluate(() => window.Aventura.partie.carte.mot);
}
const epele = (mot) => P.lettresDuMot(mot).join(' ').toLowerCase();

test('épeler à l\'oral : la carte cache le mot, « Parler », lettres justes → « Bonne réponse », dé FORT @smoke', async ({ page }) => {
  const mot = await partieEpeler(page);
  await expect(page.locator('#carte-titre')).toContainText('Épeler à l’oral');
  await expect(page.locator('#carte-consigne')).toHaveText('Épelle le mot à voix haute :');
  await expect(page.locator('#carte-mot')).toHaveClass(/cache/);
  await expect(page.getByRole('button', { name: 'Voir le mot' })).toBeHidden();
  await expect(page.getByRole('button', { name: 'Voir la réponse' })).toBeHidden();
  await expect(page.getByRole('button', { name: 'Bonne réponse' })).toHaveCount(0);
  await page.evaluate((t) => window.__dire.push(t), epele(mot));
  await page.getByRole('button', { name: /Parler/ }).click();
  await expect(page.locator('#carte-reponse')).toContainText('Bonne réponse !');
  await expect(page.locator('#carte-mot')).toHaveText(mot);
  expect(await page.evaluate(() => window.Aventura.partie.regles.de)).toBe('fort');
  await lancerLeDe(page);
});

test('épeler à l\'oral : lettres collées en un mot par la reconnaissance (« estomac ») → « Bonne réponse » (bug du 09/11/2026)', async ({ page }) => {
  const mot = await partieEpeler(page);
  await page.evaluate((t) => window.__dire.push(t), mot.toLowerCase());
  await page.getByRole('button', { name: /Parler/ }).click();
  await expect(page.locator('#carte-reponse')).toContainText('Bonne réponse !');
  expect(await page.evaluate(() => window.Aventura.partie.regles.de)).toBe('fort');
});

test('épeler à l\'oral : 3 essais ; ce qui est entendu s\'affiche ; au 3e essai faux, correction et dé FAIBLE', async ({ page }) => {
  const mot = await partieEpeler(page);
  await page.evaluate(() => window.__dire.push('z z z', 'zède'));
  await page.getByRole('button', { name: /Parler/ }).click();
  await expect(page.locator('#carte-reponse')).toContainText('J’ai entendu « Z - Z - Z »');
  await expect(page.locator('#carte-reponse')).toContainText('Essai 2 sur 3');
  expect(await page.evaluate(() => window.Aventura.partie.regles.etape)).toBe('repondre');
  await page.getByRole('button', { name: /Réessayer/ }).click();
  await expect(page.locator('#carte-reponse')).toContainText('Essai 3 sur 3');
  // Rien entendu : l'essai ne compte pas.
  await page.getByRole('button', { name: /Réessayer/ }).click();
  await expect(page.locator('#carte-reponse')).toContainText('Essai 3 sur 3');
  await page.evaluate(() => window.__dire.push('x'));
  await page.getByRole('button', { name: /Réessayer/ }).click();
  await expect(page.locator('#carte-reponse')).toContainText('j’ai entendu « X »');
  await expect(page.locator('#carte-reponse')).toContainText('La bonne réponse : ' + Q.trouver('epeler').reponse(mot));
  await expect(page.locator('#carte-mot')).toHaveText(mot);
  expect(await page.evaluate(() => window.Aventura.partie.regles.de)).toBe('faible');
  await page.getByRole('button', { name: 'J’ai compris' }).click(); // le dé FAIBLE se lance tout seul
  await page.getByRole('button', { name: 'Question suivante' }).waitFor({ timeout: 15000 });
});

test('épeler à l\'oral : micro refusé → les autres joueurs jugent avec « Bonne / Mauvaise réponse »', async ({ page }) => {
  await partieEpeler(page);
  await page.evaluate(() => { window.__erreur = 'not-allowed'; });
  await page.getByRole('button', { name: /Parler/ }).click();
  await expect(page.locator('#carte-reponse')).toContainText('Le micro ne marche pas ici');
  await page.getByRole('button', { name: 'Bonne réponse' }).click();
  await lancerLeDe(page);
});

test('sans reconnaissance vocale (ex. Firefox), « Épeler à l\'oral » n\'est pas proposée', async ({ page }) => {
  await page.addInitScript(() => { delete window.SpeechRecognition; delete window.webkitSpeechRecognition; });
  await rapide(page);
  await page.goto('./');
  await versReglages(page, 1);
  await cocherJoueur(page, { types: ['nombre'] });
  await expect(page.locator('#types-questions input')).toHaveCount(13);
  await expect(page.getByRole('checkbox', { name: 'Épeler à l’oral' })).toHaveCount(0);
});

// Synthèse vocale (v9.5, demande du 17/11/2026) : texte préparé (pauses, prononciation), découpé en phrases,
// meilleure voix française choisie, et le même bouton « Écouter » pour les maths, le français et l'histoire.
const { test, expect } = require('@playwright/test');
const V = require('../js/voix.js');
const { rapide, versReglages, valider, maths, lancer, ouvrirNeuf, cocher } = require('./aide');

const textes = (t) => V.preparer(t).map((m) => m.texte);

test.describe('préparation du texte et choix de la voix', () => {
  test.beforeEach(() => test.skip(test.info().project.name !== 'ordinateur', 'test de logique : un seul format suffit'));

  test('micro-pauses : « : » devient « … », les mots entre guillemets sont détachés, une fin de phrase est ajoutée', () => {
    expect(textes('Combien de lettres y a-t-il dans le mot : cheval.')).toEqual(['Combien de lettres y a-t-il dans le mot… cheval.']);
    expect(textes('Remets les lettres dans l’ordre :')).toEqual(['Remets les lettres dans l’ordre.']);
    expect(textes('Quelle est la nature du mot « chat » dans la phrase : le chat dort.'))
      .toEqual(['Quelle est la nature du mot, chat, dans la phrase… le chat dort.']);
    expect(textes('ba')).toEqual(['ba.']);
    expect(V.preparer('')).toEqual([]);
  });

  test('prononciation : calculs, chiffres romains, dates, unités, grands nombres', () => {
    expect(textes('12 × 3 = ?')).toEqual(['12 fois 3 égale combien?']);
    expect(textes('20 ÷ 4 − 1 + 2 = 6')).toEqual(['20 divisé par 4 moins 1 plus 2 égale 6.']);
    expect(textes('Vers 3300 av. J.-C. et 300 apr. J.-C.')).toEqual(['Vers 3300 avant Jésus-Christ et 300 après Jésus-Christ.']);
    expect(textes('Louis XIV, François Ier, Napoléon III, la Ve République, au XIXe siècle'))
      .toEqual(['Louis 14, François premier, Napoléon 3, la cinquième République, au dix-neuvième siècle.']);
    expect(textes('Environ −89 °C, 70 % et 50 000 habitants')).toEqual(['Environ moins 89 degrés, 70 pour cent et 50000 habitants.']);
    // Pas de faux chiffres romains : « Le », « Cœur de Lion », « Léonard de Vinci ».
    expect(textes('Le Chapelier, Richard Cœur de Lion, Léonard de Vinci')).toEqual(['Le Chapelier, Richard Cœur de Lion, Léonard de Vinci.']);
  });

  test('une phrase par morceau ; la question monte, les nombres sont dits plus lentement', () => {
    const m = V.preparer('Vers 3300 av. J.-C., en Mésopotamie. Vrai ou faux ?');
    expect(m.map((x) => x.texte)).toEqual(['Vers 3300 avant Jésus-Christ, en Mésopotamie.', 'Vrai ou faux?']);
    expect(m[1].hauteur).toBeGreaterThan(m[0].hauteur);
    expect(m[0].vitesse).toBeLessThan(m[1].vitesse);
    // Très longue phrase : coupée à une virgule (Chrome coupe les lectures trop longues).
    const longue = Array.from({ length: 30 }, (_, i) => 'élément ' + i).join(', ');
    for (const x of V.preparer(longue)) expect(x.texte.length).toBeLessThanOrEqual(180);
  });

  test('voix : fr-FR « Natural » > Premium > Enhanced > Google > Microsoft classique > autre français ; jamais une voix étrangère', () => {
    const n = (name, lang = 'fr-FR') => V.noteVoix({ name, lang });
    const ordre = [n('Microsoft Denise Online (Natural) - French (France)'), n('Audrey (Premium)'), n('Thomas (Enhanced)'),
      n('Google français'), n('Microsoft Hortense - French (France)'), n('Thomas'), n('Amélie', 'fr-CA')];
    for (let i = 1; i < ordre.length; i++) expect(ordre[i - 1]).toBeGreaterThan(ordre[i]);
    expect(n('Samantha', 'en-US')).toBe(0);
    expect(n('Thomas', 'fr_FR')).toBeGreaterThan(n('Amélie', 'fr-CA'));
  });
});

// Synthèse vocale remplacée par un enregistreur, avec de vraies listes de voix (dont une étrangère par défaut).
async function voixEspion(page, voix) {
  await page.addInitScript((liste) => {
    window.__lu = [];
    window.SpeechSynthesisUtterance = function (t) { this.text = t; };
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        speak: (u) => window.__lu.push({ text: u.text, lang: u.lang, voix: u.voice && u.voice.name, rate: u.rate, pitch: u.pitch }),
        cancel() { window.__lu.length = 0; }, getVoices: () => liste, addEventListener() {}
      }
    });
  }, voix);
}

const VOIX = [
  { name: 'Samantha', lang: 'en-US', default: true },
  { name: 'Microsoft Hortense - French (France)', lang: 'fr-FR' },
  { name: 'Google français', lang: 'fr-FR' },
  { name: 'Microsoft Denise Online (Natural) - French (France)', lang: 'fr-FR' }
];

test('maths : « Écouter » lit le calcul avec la meilleure voix française, tout de suite', async ({ page }) => {
  await voixEspion(page, VOIX);
  await page.addInitScript(() => { window.AVENTURA_TYPE_MATHS = 'calcul'; }); // v10.52 : calculs et problèmes sont mélangés : carte de calcul forcée
  await rapide(page);
  await ouvrirNeuf(page);
  await versReglages(page, 1);
  await maths(page, { signes: ['fois'], nombres: [7], niveau: 'facile' });
  await lancer(page);
  await page.getByRole('button', { name: /^(Première question|Question suivante)$/ }).click();
  await page.getByRole('button', { name: 'Écouter', exact: true }).click();
  const lu = await page.evaluate(() => window.__lu);
  expect(lu.length).toBeGreaterThan(0);
  expect(lu.map((u) => u.text).join(' ')).toMatch(/^Combien font \d+ (multiplié par|fois) \d+\?$/);
  for (const u of lu) {
    expect(u.voix).toBe('Microsoft Denise Online (Natural) - French (France)');
    expect(u.lang).toBe('fr-FR');
  }
});

test('histoire : « Écouter » lit la carte avec la même voix, phrase par phrase', async ({ page }) => {
  await voixEspion(page, VOIX.slice(0, 3)); // sans voix « Natural » : Google français
  await rapide(page);
  await ouvrirNeuf(page);
  await versReglages(page, 1);
  await cocher(page, '#matieres', 'histoire');
  await cocher(page, '#niveau-savoir', 'facile');
  await cocher(page, '#mode-savoir', 'normal');
  await valider(page);
  await page.locator('#savoir-jeux').waitFor();
  await page.locator('#savoir-liste input[value="a01"]').check();
  await lancer(page);
  await page.getByRole('button', { name: /^(Première question|Question suivante)$/ }).click();
  await page.getByRole('button', { name: 'Écouter', exact: true }).click();
  const lu = await page.evaluate(() => window.__lu);
  const dernier = await page.evaluate(() => window.Voix.dernier);
  expect(dernier.length).toBeGreaterThan(0);
  expect(lu.map((u) => u.text)).toEqual(V.preparer(dernier).map((m) => m.texte));
  for (const u of lu) expect(u.voix).toBe('Google français');
});

test('sans voix française sur l\'appareil : la langue fr-FR est demandée, sans voix imposée', async ({ page }) => {
  await voixEspion(page, [{ name: 'Samantha', lang: 'en-US', default: true }]);
  await page.goto('./');
  await page.evaluate(() => window.Voix.lire('Bonjour : ça marche ?'));
  const lu = await page.evaluate(() => window.__lu);
  expect(lu).toEqual([{ text: 'Bonjour… ça marche?', lang: 'fr-FR', voix: undefined, rate: 0.92, pitch: 1.08 }]);
});

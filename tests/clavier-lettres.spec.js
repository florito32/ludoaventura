// v9.3 (demande du 16/11/2026, BACKLOG lignes 364 à 367, 373 et 374) : clavier à lettres pour toute réponse en lettres
// (orthographe, conjugaison, question ouverte de géographie et d'histoire) : plus jamais le clavier du téléphone.
// Choix de l'utilisateur : touches comme le pavé, MAJUSCULES, 6 par ligne, au moins 18 lettres (réponse + au moins
// 5 pièges) dans l'ordre alphabétique, une case par signe (espace, tiret, apostrophe compris), é è ê, - et ’,
// ⌫, « Tout effacer », espace, Valider.
const { test, expect } = require('@playwright/test');
const CL = require('../js/clavier-lettres.js');
const S = require('../js/savoirs.js');
require('../js/geographie.js');
require('../js/histoire.js');
const V = require('../js/conjugaison.js');
const { rapide, versReglages, valider, conjugaison, lancer, cocherJoueur } = require('./aide');

// Tape un texte au clavier à lettres, comme un joueur : lettre de base, puis « é è ê » autant de fois que nécessaire.
async function taper(page, texte) {
  for (const ch of CL.tapable(texte)) {
    if (ch === ' ') { await page.locator('#clavier [data-cl="espace"]').click(); continue; }
    if (ch === '-' || ch === '’') { await page.locator('#clavier [data-cl="' + ch + '"]').click(); continue; }
    const base = CL.sansAccent(ch);
    await page.locator('#clavier-grille [data-cl="' + base + '"]').click();
    const n = ch === base ? 0 : CL.VARIANTES[base].indexOf(ch);
    for (let k = 0; k < n; k++) await page.locator('#clavier [data-cl="accent"]').click();
  }
}

// Le clavier tient dans l'écran : aucune touche ni case ne dépasse, rien ne déborde sur le côté ;
// sur téléphone et tablette (question en plein écran), « Valider » se voit sans faire défiler.
async function toutTient(page, quand) {
  const r = await page.evaluate(() => {
    const W = innerWidth, H = innerHeight, plein = document.body.classList.contains('question-plein');
    // Le cadre visible le plus étroit : la carte ou l'encadré « Tour de jeu » qui la contient.
    const c1 = document.getElementById('carte-piochee').getBoundingClientRect(), c2 = document.getElementById('tour').getBoundingClientRect();
    const carte = { left: Math.max(c1.left, c2.left), right: Math.min(c1.right, c2.right) };
    const dehors = [...document.querySelectorAll('#clavier button, #cases-reponse .case-l')].filter((e) => {
      const b = e.getBoundingClientRect();
      // Texte d'une touche plus large que la touche (« Tout effacer », « Valider »…) : coupé ou qui déborde.
      if (e.tagName === 'BUTTON' && e.scrollWidth > e.clientWidth + 1) return true;
      return b.width < 1 || b.left < carte.left - 1 || b.right > carte.right + 1 || b.left < -1 || b.right > W + 1;
    }).map((e) => e.textContent || e.dataset.cl);
    const v = document.getElementById('btn-valider-lettres').getBoundingClientRect();
    return { dehors, large: document.documentElement.scrollWidth > W, plein, valider: v.bottom <= H + 1 && v.top >= -1 };
  });
  expect(r.dehors, quand + ' : touches ou cases hors de la carte').toEqual([]);
  expect(r.large, quand + ' : débordement horizontal').toBe(false);
  if (r.plein) expect(r.valider, quand + ' : « Valider » hors de l’écran').toBe(true);
}

test.describe('clavier à lettres : fonctions', () => {
  test.beforeEach(() => test.skip(test.info().project.name !== 'ordinateur', 'test de logique : un seul format suffit'));

  test('lettres proposées : celles de la réponse + au moins 5 pièges, au moins 18, sans doublon, par ordre alphabétique', () => {
    for (const r of ['Rome', 'Léonard de Vinci', 'Saint-Vincent-et-les-Grenadines', 'mangeâmes', 'Chișinău', '2A', 'Côte d’Ivoire']) {
      const L = CL.lettres(r), t = CL.sansAccent(CL.tapable(r));
      const siennes = [...new Set(t.replace(/[ \-’]/g, ''))];
      for (const l of siennes) expect(L, r).toContain(l);
      expect(L.length, r).toBeGreaterThanOrEqual(Math.max(18, siennes.length + 5));
      expect(new Set(L).size).toBe(L.length);
      expect(L).toEqual([...L].sort());
      expect(CL.lettres(r), 'mêmes lettres à chaque fois').toEqual(L);
    }
    expect(CL.lettres('Rome')).toHaveLength(18);
  });

  test('touches : ⌫, Tout effacer, é è ê qui fait défiler les accents, nombre de cases limité', () => {
    expect(CL.toucher('rom', 'e', 4)).toBe('rome');
    expect(CL.toucher('rome', 'x', 4)).toBe('rome'); // plus de case libre
    expect(CL.toucher('rome', 'retour', 4)).toBe('rom');
    expect(CL.toucher('rome', 'tout', 4)).toBe('');
    expect(CL.toucher('e', 'accent')).toBe('é');
    expect(CL.toucher('é', 'accent')).toBe('è');
    expect(CL.toucher('è', 'accent')).toBe('ê');
    expect(CL.toucher('ë', 'accent')).toBe('e');
    expect(CL.toucher('c', 'accent')).toBe('ç');
    expect(CL.toucher('t', 'accent')).toBe('t'); // pas d'accent sur T
    expect(CL.toucher('saint', 'espace')).toBe('saint ');
    expect(CL.tapable('Côte-d\'Or')).toBe('côte-d’or');
    expect(CL.tapable('Hyderabad (Pakistan)')).toBe('hyderabad pakistan');
    expect(CL.tapable('SŒUR')).toBe('soeur');
    expect(CL.nettoyer('Ab-C’1?', 0)).toBe('ab-c’1');
  });

  test('chaque réponse modèle se tape au clavier et est jugée juste (géographie, histoire, conjugaison)', () => {
    let n = 0;
    for (const j of S.JEUX) for (const s of j.series) {
      if (s.k !== 'paires' || s.ouverte === false) continue;
      for (const niv of ['difficile', 'expert']) for (const p of ((s.niveaux || {})[niv] || [])) {
        for (const att of [p[1]].concat(s.qi && !s.image && s.qiOuverte !== false ? [p[0]] : [])) {
          if (String(att).split('|').every((a) => /^\d+([.,]\d+)?$/.test(a.trim()))) continue;
          const m = CL.tapable(S.affiche(att));
          expect(S.ouverteJuste(m, att), j.id + ' ' + m).toBe(true);
          for (const ch of m) if (/[à-ÿ]/.test(ch)) expect(CL.VARIANTES[CL.sansAccent(ch)], ch).toContain(ch);
          n++;
        }
      }
    }
    for (const v of V.VERBES) for (const t of V.TEMPS.map((x) => x.id)) for (const k of V.personnes(v.inf, t)) {
      const m = CL.tapable(V.formes(v.inf, t, k)[0]);
      expect(V.juste(m, v.inf, t, k), v.inf + ' ' + t + ' ' + k).toBe(true);
      for (const ch of m) if (/[à-ÿ]/.test(ch)) expect(CL.VARIANTES[CL.sansAccent(ch)], ch).toContain(ch);
      n++;
    }
    expect(n).toBeGreaterThan(5000);
  });

  test('une question ouverte attend un nom, jamais une phrase (ex. une définition) : sinon autre sens ou « Relie »', () => {
    for (const mat of ['geographie', 'histoire']) for (const j of S.jeuxDe(mat)) for (const niv of ['difficile', 'expert']) {
      for (let k = 0; k < 60; k++) {
        const c = S.generer({ jeux: [j.id], niveau: niv, mode: 'normal' }, mat);
        if (!c || c.format !== 'O') continue;
        const a = S.affiche(c.attendu);
        expect(a.split(/\s+/).length <= 4 && a.length <= 32, j.id + ' : ' + a).toBe(true);
      }
    }
  });
});

test('conjugaison : lettres à toucher, une case par lettre, aucun clavier du téléphone ; bonne réponse → dé FORT', async ({ page }, info) => {
  await rapide(page, { autoDe: 600000 });
  await page.goto('./');
  await versReglages(page, 1);
  await conjugaison(page, { temps: ['indicatif.passe-simple'], groupes: [1], niveau: 'facile' });
  await lancer(page);
  await page.getByRole('button', { name: /^(Première question|Question suivante)$/ }).click();
  await expect(page.locator('#clavier')).toBeVisible();
  await expect(page.locator('#pave')).toBeHidden();
  const c = await page.evaluate(() => window.Aventura.partie.carte);
  const forme = V.formes(c.verbe, c.temps, c.personne)[0];
  const modele = CL.tapable(forme);
  // Une case par signe ; au moins 18 lettres, rangées par ordre alphabétique, en majuscules.
  await expect(page.locator('#cases-reponse .case-l')).toHaveCount(modele.length);
  const touches = await page.locator('#clavier-grille .touche').allTextContents();
  expect(touches.length).toBeGreaterThanOrEqual(18);
  expect(touches).toEqual([...touches].sort());
  expect(touches.every((t) => t === t.toUpperCase())).toBe(true);
  for (const l of new Set(CL.sansAccent(modele).replace(/[ \-’]/g, ''))) expect(touches).toContain(l.toUpperCase());
  // Sur écran tactile, la case de réponse n'ouvre jamais le clavier du système.
  if (await page.evaluate(() => matchMedia('(pointer: coarse)').matches)) {
    await expect(page.locator('#reponse-joueur')).toHaveAttribute('inputmode', 'none');
    await expect(page.locator('#reponse-joueur')).not.toBeFocused();
  }
  await toutTient(page, 'conjugaison');
  await page.screenshot({ path: 'test-results/clavier-lettres-' + info.project.name + '.png' });
  // Une faute, ⌫, Tout effacer, puis la bonne réponse.
  await page.locator('#clavier-grille [data-cl="' + touches[0].toLowerCase() + '"]').click();
  await expect(page.locator('#cases-reponse .case-l.pleine')).toHaveCount(1);
  await page.getByRole('button', { name: 'Effacer la dernière lettre' }).click();
  await expect(page.locator('#cases-reponse .case-l.pleine')).toHaveCount(0);
  await page.locator('#clavier-grille .touche').nth(1).click();
  await page.locator('#clavier-grille .touche').nth(2).click();
  await page.getByRole('button', { name: 'Tout effacer' }).click();
  await expect(page.getByLabel('Ta réponse')).toHaveValue('');
  await taper(page, forme);
  await expect(page.getByLabel('Ta réponse')).toHaveValue(modele);
  await page.getByRole('button', { name: 'Valider', exact: true }).click();
  await expect(page.locator('#carte-reponse')).toContainText('Bonne réponse');
  expect(await page.evaluate(() => window.Aventura.partie.regles.de)).toBe('fort');
});

test('Valider sans rien toucher : « Touche les lettres de ta réponse. »', async ({ page }) => {
  await rapide(page, { autoDe: 600000 });
  await page.goto('./');
  await versReglages(page, 1);
  await conjugaison(page, { temps: ['indicatif.present'], groupes: [1], niveau: 'facile' });
  await lancer(page);
  await page.getByRole('button', { name: /^(Première question|Question suivante)$/ }).click();
  await page.getByRole('button', { name: 'Valider', exact: true }).click();
  await expect(page.locator('#carte-reponse')).toHaveText('Touche les lettres de ta réponse.');
  await page.locator('#clavier-grille .touche').first().click();
  await expect(page.locator('#carte-reponse')).toBeHidden();
});

test('ordinateur : le clavier physique écrit aussi dans les cases', async ({ page }, info) => {
  test.skip(info.project.name !== 'ordinateur', 'clavier physique');
  await rapide(page, { autoDe: 600000 });
  await page.goto('./');
  await versReglages(page, 1);
  await conjugaison(page, { temps: ['indicatif.present'], groupes: [1], niveau: 'facile' });
  await lancer(page);
  await page.getByRole('button', { name: /^(Première question|Question suivante)$/ }).click();
  const c = await page.evaluate(() => window.Aventura.partie.carte);
  const forme = CL.tapable(V.formes(c.verbe, c.temps, c.personne)[0]);
  await page.locator('#clavier-grille .touche').first().click(); // le curseur quitte la case : le clavier marche toujours
  await page.keyboard.press('Backspace');
  await page.keyboard.type(forme + 'zzzz'); // les signes en trop ne rentrent pas
  await expect(page.getByLabel('Ta réponse')).toHaveValue(forme);
  await page.keyboard.press('Enter');
  await expect(page.locator('#carte-reponse')).toContainText('Bonne réponse');
});

for (const mat of ['geographie', 'histoire']) {
  test(mat + ' : question ouverte au clavier à lettres (espaces, tirets, apostrophes ont leur case) → juste', async ({ page }, info) => {
    await rapide(page, { autoDe: 600000 });
    await page.goto('./');
    await versReglages(page, 1);
    await page.locator('#matieres input[value="' + mat + '"]').check();
    await page.locator('#niveau-savoir input[value="difficile"]').check();
    await page.locator('#mode-savoir input[value="normal"]').check();
    await valider(page);
    await page.locator('#savoir-jeux').waitFor();
    // Une carte « question ouverte » dont la réponse contient un espace, un tiret ou une apostrophe (tirée ici,
    // puis imposée au jeu) ; l'apostrophe est cherchée en premier.
    let c = null;
    for (const sep of ['\u2019', '-', ' ']) for (let k = 0; k < 3000 && !c; k++) {
      const x = S.generer({ jeux: S.jeuxDe(mat).map((j) => j.id), niveau: 'difficile', mode: 'normal' }, mat);
      if (x && x.format === 'O' && !/^\d+$/.test(String(x.attendu)) && CL.tapable(S.affiche(x.attendu)).includes(sep)) c = x;
    }
    expect(c, 'une question ouverte avec séparateur').not.toBeNull();
    await page.locator('#savoir-liste input[value="' + c.jeu + '"]').check();
    await lancer(page);
    await page.getByRole('heading', { name: 'Le plateau' }).waitFor();
    await page.evaluate((carte) => { window.Savoirs.generer = () => JSON.parse(JSON.stringify(carte)); }, c);
    await page.getByRole('button', { name: /^(Première question|Question suivante)$/ }).click();
    const carte = await page.evaluate(() => window.Aventura.partie.carte);
    expect(carte.format).toBe('O');
    const modele = CL.tapable(S.affiche(carte.attendu));
    await expect(page.locator('#cases-reponse .case-l')).toHaveCount(modele.length);
    await expect(page.locator('#cases-reponse .case-sep')).toHaveCount((modele.match(/[ \-’]/g) || []).length);
    await toutTient(page, mat);
    await taper(page, modele);
    await page.getByRole('button', { name: 'Valider', exact: true }).click();
    await expect(page.locator('#carte-reponse')).toContainText('Bonne réponse');
  });
}

test('orthographe : « Réécrire le mot » au clavier à lettres → juste', async ({ page }) => {
  await rapide(page, { autoDe: 600000 });
  await page.goto('./');
  await versReglages(page, 1);
  await cocherJoueur(page, { types: ['ecrire'] });
  await lancer(page);
  await page.getByRole('button', { name: /^(Première question|Question suivante)$/ }).click();
  await expect(page.locator('#clavier')).toBeVisible();
  const mot = await page.evaluate(() => window.Aventura.partie.carte.mot);
  await expect(page.locator('#cases-reponse .case-l')).toHaveCount(CL.tapable(mot).length);
  await toutTient(page, 'orthographe');
  await taper(page, CL.sansAccent(CL.tapable(mot))); // les accents ne comptent pas en orthographe
  await page.getByRole('button', { name: 'Valider', exact: true }).click();
  await expect(page.locator('#carte-reponse')).toContainText('Bonne réponse');
});

test('orthographe : un nombre garde le pavé numérique, pas le clavier à lettres', async ({ page }) => {
  await rapide(page, { autoDe: 600000 });
  await page.goto('./');
  await versReglages(page, 1);
  await cocherJoueur(page, { types: ['nombre'] });
  await lancer(page);
  await page.getByRole('button', { name: /^(Première question|Question suivante)$/ }).click();
  await expect(page.locator('#pave')).toBeVisible();
  await expect(page.locator('#clavier')).toBeHidden();
});

// Les réponses les plus longues (jusqu'à 4 mots, 32 signes) tiennent aussi sur chaque écran, « Valider » compris.
test('les réponses les plus longues de géographie et d’histoire tiennent à l’écran', async ({ page }) => {
  const toutes = [];
  for (const j of S.JEUX) for (const s of j.series) {
    if (s.k !== 'paires' || s.ouverte === false) continue;
    for (const niv of ['difficile', 'expert']) for (const p of ((s.niveaux || {})[niv] || [])) {
      for (const att of [p[1]].concat(s.qi && !s.image && s.qiOuverte !== false ? [p[0]] : [])) {
        const a = S.affiche(att).trim();
        if (/^\d+$/.test(a) || a.split(/\s+/).length > 4 || a.length > 32) continue;
        toutes.push({ j, att, n: CL.tapable(a).length, mots: a.split(/[\s-]+/).length });
      }
    }
  }
  const plusLongues = [...toutes].sort((x, y) => y.n - x.n).slice(0, 2).concat([...toutes].sort((x, y) => y.mots - x.mots || y.n - x.n).slice(0, 1));
  await rapide(page, { autoDe: 600000 });
  await page.goto('./');
  await versReglages(page, 1);
  await page.locator('#matieres input[value="histoire"]').check();
  await page.locator('#niveau-savoir input[value="difficile"]').check();
  await valider(page);
  await page.locator('#savoir-jeux').waitFor();
  await page.locator('#savoir-liste input[value="' + S.jeuxDe('histoire')[0].id + '"]').check();
  await lancer(page);
  await page.getByRole('heading', { name: 'Le plateau' }).waitFor();
  for (const [k, x] of plusLongues.entries()) {
    const carte = { type: 'savoir', format: 'O', consigne: 'Quelle est la réponse la plus longue du jeu ?', image: null, sujet: x.j.nom,
      attendu: x.att, bonne: S.affiche(x.att), jeu: x.j.id, matiere: x.j.matiere, niveau: 'difficile', mode: 'normal', packNom: x.j.nom };
    await page.evaluate((c) => { window.Savoirs.generer = () => JSON.parse(JSON.stringify(c)); }, carte);
    if (k) { await page.evaluate(() => window.Aventura.lancerDe()); }
    await page.getByRole('button', { name: /^(Première question|Question suivante)$/ }).click();
    await expect(page.locator('#cases-reponse .case-l')).toHaveCount(CL.tapable(S.affiche(x.att)).length);
    await page.screenshot({ path: 'test-results/clavier-long-' + k + '-' + test.info().project.name + '.png' });
    await toutTient(page, S.affiche(x.att));
    await taper(page, 'a');
    await page.getByRole('button', { name: 'Valider', exact: true }).click();
    await page.getByRole('button', { name: 'J’ai compris' }).click();
  }
});

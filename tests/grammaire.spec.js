// Grammaire (v6.54, demande de l'utilisateur du 12/11/2026, backlog lignes 258 à 267).
// Français → Grammaire : un niveau (Facile à Expert) et des petits jeux cochés, un tiré au hasard à chaque carte.
const { test, expect } = require('@playwright/test');
const G = require('../js/grammaire.js');
const Q = require('../js/questions.js');
const D = require('../js/defis.js');
const { rapide, versReglages, valider, lancer, grammaire } = require('./aide');

const NIVEAUX = ['facile', 'moyen', 'difficile', 'expert'];
const JEUX_CARTE = ['phrase', 'contraires', 'erreur', 'relier', 'nature', 'homophones'];

test.describe('contenus et correction', () => {
  test.beforeEach(() => test.skip(test.info().project.name !== 'ordinateur', 'test de logique : un seul format suffit'));

  test('8 jeux, dont « Au pluriel » et « Le ou la ? » venus de l\'orthographe', () => {
    expect(G.JEUX.map((j) => j.id)).toEqual(['phrase', 'contraires', 'erreur', 'relier', 'nature', 'homophones', 'pluriel', 'genre']);
    // Retirés de l'écran des questions d'orthographe et des défis d'orthographe (choix de l'utilisateur).
    const ortho = Q.FAMILLES.flatMap((f) => f.types);
    expect(ortho).not.toContain('genre');
    expect(ortho).not.toContain('pluriel');
    for (const n of NIVEAUX) expect(D.ORTHO[n].types.filter((t) => t === 'genre' || t === 'pluriel')).toEqual([]);
  });

  test('chaque phrase a un sujet, un verbe, un complément et un adjectif ; plus longues aux niveaux élevés', () => {
    const moyenne = {};
    for (const n of NIVEAUX) {
      expect(G.PHRASES[n].length).toBeGreaterThanOrEqual(15);
      for (const l of G.PHRASES[n]) {
        const p = G.lirePhrase(l);
        expect(p.mots.length, l).toBe(p.natures.length);
        for (const t of ['N', 'V', 'A']) expect(p.natures, l).toContain(t);
        expect(p.mots.length, l).toBeGreaterThanOrEqual(5);
        expect(['.', '!', '?']).toContain(p.fin);
        // Un autre ordre accepté reprend exactement les mêmes mots.
        for (const a of p.alts) expect(a.split(' ').sort(), a).toEqual(p.mots.slice().sort());
      }
      moyenne[n] = G.PHRASES[n].reduce((s, l) => s + G.lirePhrase(l).mots.length, 0) / G.PHRASES[n].length;
    }
    expect(moyenne.moyen).toBeGreaterThan(moyenne.facile + 2);
    expect(moyenne.difficile).toBeGreaterThan(moyenne.moyen);
    expect(moyenne.expert).toBeGreaterThan(moyenne.difficile);
    // Difficile : des conjonctions de coordination (mais, car, donc, et) ; Expert : des pronoms relatifs (qui, que).
    expect(G.PHRASES.difficile.filter((l) => /\/C /.test(l)).length).toBeGreaterThanOrEqual(8);
    expect(G.PHRASES.expert.filter((l) => /\b(qui|que)\/P\b/.test(l)).length).toBeGreaterThanOrEqual(6);
  });

  test('chaque jeu fabrique des cartes à tous les niveaux, et la bonne réponse est acceptée', () => {
    for (const n of NIVEAUX) for (const j of JEUX_CARTE) for (let k = 0; k < 60; k++) {
      const c = G.generer(j, n);
      let bonne;
      if (j === 'phrase') bonne = c.mots.join(' ');
      else if (j === 'erreur') bonne = c.faute;
      else if (j === 'relier') bonne = c.bonnes.slice();
      else bonne = c.bonne;
      expect(G.juste(c, bonne), j + ' ' + n + ' ' + c.cle).toBe(true);
      expect(G.solution(c)).toBeTruthy();
      if (c.choix) {
        expect(c.choix).toContain(c.bonne);
        expect(new Set(c.choix).size).toBe(c.choix.length);
        const faux = c.choix.find((x) => x !== c.bonne);
        expect(G.juste(c, faux)).toBe(false);
      }
    }
  });

  test('contraires : 3 choix ; homophones : le groupe du niveau ; nature : les natures du niveau', () => {
    const c = G.generer('contraires', 'facile');
    expect(c.choix).toHaveLength(3);
    for (const n of NIVEAUX) {
      for (let k = 0; k < 40; k++) {
        const h = G.generer('homophones', n);
        expect(G.GROUPES_HOMOPHONES[n].some((g) => g.join() === h.choix.join())).toBe(true);
        const na = G.generer('nature', n);
        expect(na.choix).toEqual(G.NATURES_NIVEAU[n]);
        expect(G.lirePhrase(G.PHRASES[n].find((l) => G.lirePhrase(l).mots.join(' ').endsWith(na.mots.slice(1).join(' ')))).natures[na.cible]).toBe(na.bonne);
      }
    }
    expect(G.NATURES_NIVEAU.facile).toEqual(['N', 'V', 'A']);
    expect(G.NATURES_NIVEAU.expert).toHaveLength(8);
  });

  test('trouve l\'erreur : phrase corrigée ; un mot en trop est supprimé', () => {
    const c = { mots: ['Le', 'petit', 'le', 'lapin', 'mange', 'une', 'carotte'], fin: '.', faute: 2, correction: '', genre: 'i' };
    expect(G.phraseCorrigee(c)).toBe('Le petit lapin mange une carotte.');
    const e = G.lireErreur('je m’*apelle* Léo.|appelle|o');
    expect(e.mots).toEqual(['je', 'm’apelle', 'Léo']);
    expect(G.phraseCorrigee(Object.assign(e, { mots: ['Je', 'm’apelle', 'Léo'] }))).toBe('Je m’appelle Léo.');
    for (const n of NIVEAUX) for (const l of G.ERREURS[n]) {
      const x = G.lireErreur(l);
      expect(x.faute, l).toBeGreaterThanOrEqual(0);
      expect(Object.keys(G.GENRES_ERREUR)).toContain(x.genre);
      expect(x.correction === '' ? x.genre : 'ok', l).toBe(x.correction === '' ? 'i' : 'ok');
    }
  });

  test('relier : 6, 7 puis 8 paires, une seule bonne réponse à droite pour chaque mot', () => {
    expect(G.NB_PAIRES).toEqual({ facile: 6, moyen: 7, difficile: 8, expert: 8 });
    for (const n of NIVEAUX) {
      for (const l of G.RELIER[n]) {
        const d = l.paires.map((p) => p.split(':')[1]), g = l.paires.map((p) => p.split(':')[0]);
        expect(new Set(d).size, n + ' ' + l.sorte).toBe(d.length);
        expect(new Set(g).size, n + ' ' + l.sorte).toBe(g.length);
      }
      const c = G.generer('relier', n);
      expect(c.gauche.length).toBe(Math.min(G.NB_PAIRES[n], c.gauche.length));
      expect(G.pairesJustes(c, c.bonnes)).toBe(c.gauche.length);
    }
  });
});

// ---------- Dans la partie ----------
async function partie(page, { jeux, niveau = 'facile' }) {
  await rapide(page);
  await page.goto('./');
  await versReglages(page, 1);
  await grammaire(page, { jeux, niveau });
  await lancer(page);
  await page.getByRole('button', { name: 'Question suivante' }).click();
  await page.locator('#carte-gram').waitFor();
  return page.evaluate(() => window.Aventura.partie.carte);
}
const de = (page) => page.evaluate(() => window.Aventura.partie.regles.de);
// La carte ne déborde pas de son cadre (téléphone, téléphone carré, tablette, ordinateur).
async function sansDebordement(page) {
  const d = await page.evaluate(() => {
    const b = document.getElementById('carte-piochee');
    const r = b.getBoundingClientRect();
    const dehors = [...b.querySelectorAll('button, .gram-bulle, .gram-mot-relier')].filter((x) => {
      const q = x.getBoundingClientRect();
      return q.width && (q.left < r.left - 1 || q.right > r.right + 1);
    }).map((x) => x.textContent);
    return { dehors, page: document.documentElement.scrollWidth - document.documentElement.clientWidth };
  });
  expect(d.dehors).toEqual([]);
  expect(d.page).toBeLessThanOrEqual(0);
}

test('écran des réglages : Grammaire, niveau avec exemples, jeux tous cochés ; aucun jeu → message @smoke', async ({ page }) => {
  await rapide(page);
  await page.goto('./');
  await versReglages(page, 1);
  await page.locator('#matieres input[value="francais"]').check();
  await page.locator('#francais input[value="grammaire"]').check();
  await expect(page.locator('#reglage-niveau-gram')).toBeVisible();
  await expect(page.locator('#niveau-gram-aide')).toContainText('Facile');
  await page.locator('#niveau-gram input[value="expert"]').check();
  await expect(page.locator('#niveau-gram-aide')).toContainText('Expert');
  await valider(page);
  await expect(page.locator('#reglages-titre')).toContainText('Grammaire, les jeux');
  await expect(page.locator('#jeux-gram input:checked')).toHaveCount(8);
  await page.locator('#btn-tout-gram').click();
  await expect(page.locator('#jeux-gram input:checked')).toHaveCount(0);
  await valider(page);
  await expect(page.locator('#packs-alerte')).toContainText('choisir au moins un jeu');
  await page.locator('#jeux-gram input[value="contraires"]').check();
  await valider(page);
  await expect(page.getByRole('button', { name: 'Lancer la partie' })).toBeVisible();
  await sansDebordement(page);
});

test('orthographe : « Le ou la ? » et « Au pluriel » ne sont plus dans les questions', async ({ page }) => {
  await rapide(page);
  await page.goto('./');
  await versReglages(page, 1);
  await page.locator('#matieres input[value="francais"]').check();
  await page.locator('#francais input[value="orthographe"]').check();
  await valider(page);
  await page.locator('#packs input[value="animaux"]').check();
  await valider(page);
  await expect(page.locator('#types-questions input[value="genre"]')).toHaveCount(0);
  await expect(page.locator('#types-questions input[value="pluriel"]')).toHaveCount(0);
  await expect(page.locator('#types-questions input[value="melange"]')).toHaveCount(1);
});

test('les contraires : la bonne réponse → dé FORT, sans bouton « Bonne / Mauvaise réponse »', async ({ page }) => {
  const c = await partie(page, { jeux: ['contraires'] });
  await expect(page.locator('#carte-titre')).toHaveText('Grammaire · Facile · Les contraires');
  await expect(page.locator('#carte-consigne')).toHaveText('Quel est le contraire de :');
  await expect(page.locator('.gram-mot')).toHaveText(c.mot);
  await expect(page.locator('.gram-bouton')).toHaveCount(3);
  await expect(page.getByRole('button', { name: 'Bonne réponse' })).toHaveCount(0);
  await sansDebordement(page);
  await page.locator('.gram-bouton', { hasText: new RegExp('^' + c.bonne + '$') }).click();
  await expect(page.locator('#carte-reponse')).toContainText('Bonne réponse !');
  await expect(page.locator('.gram-bouton.bonne')).toHaveText(c.bonne);
  expect(await de(page)).toBe('fort');
});

test('homophones : mauvais choix → correction, « J\'ai compris », dé FAIBLE', async ({ page }) => {
  const c = await partie(page, { jeux: ['homophones'] });
  await expect(page.locator('.gram-trou')).toHaveCount(1);
  const faux = c.choix.find((x) => x !== c.bonne);
  await page.locator('.gram-bouton', { hasText: new RegExp('^' + faux + '$') }).click();
  await expect(page.locator('#carte-reponse')).toContainText('Ce n’est pas ça');
  await expect(page.locator('#carte-reponse')).toContainText(c.phrase.replace('_', c.bonne));
  await expect(page.locator('.gram-bouton.fausse')).toHaveText(faux);
  await page.getByRole('button', { name: 'J’ai compris' }).click();
  expect(await de(page)).toBe('faible');
});

test('nature du mot : le mot en couleur, les natures du niveau Moyen', async ({ page }) => {
  const c = await partie(page, { jeux: ['nature'], niveau: 'moyen' });
  await expect(page.locator('.gram-cible')).toHaveText(c.mots[c.cible].replace(/,$/, ''));
  await expect(page.locator('.gram-bouton')).toHaveText(['Nom', 'Verbe', 'Adjectif', 'Déterminant']);
  await sansDebordement(page);
  await page.locator('.gram-bouton', { hasText: G.NATURES[c.bonne] }).click();
  await expect(page.locator('#carte-reponse')).toContainText('Bonne réponse !');
  expect(await de(page)).toBe('fort');
});

test('trouve l\'erreur : toucher le mot faux → dé FORT et phrase corrigée', async ({ page }) => {
  const c = await partie(page, { jeux: ['erreur'], niveau: 'difficile' });
  await expect(page.locator('#carte-gram .gram-bulle')).toHaveCount(c.mots.length);
  await sansDebordement(page);
  await page.locator('#carte-gram .gram-bulle').nth(c.faute).click();
  await expect(page.locator('#carte-reponse')).toContainText('Bonne réponse !');
  await expect(page.locator('#carte-reponse')).toContainText(G.phraseCorrigee(c));
  expect(await de(page)).toBe('fort');
});

test('remettre la phrase : les mots touchés vont à la suite, un mot posé revient, la phrase complète est corrigée ; gardé au rechargement', async ({ page }) => {
  const c = await partie(page, { jeux: ['phrase'], niveau: 'moyen' });
  const mots = c.ordre.map((k) => c.mots[k]);
  // Pour chaque mot de la phrase, la bulle mélangée qui le porte (mots répétés : la suivante libre).
  const pris = [];
  const bulle = (m) => { const t = mots.findIndex((x, i) => x === m && !pris.includes(i)); pris.push(t); return t; };
  const t0 = bulle(c.mots[0]);
  await page.locator('#carte-gram .gram-bulle[data-t="' + t0 + '"]').click();
  await expect(page.locator('.gram-ligne .gram-bulle')).toHaveText([c.mots[0]]);
  await expect(page.locator('#carte-gram .gram-bulle.trou')).toHaveCount(1);
  // Toucher le mot posé le renvoie à sa place.
  await page.locator('.gram-ligne .gram-bulle').first().click();
  await expect(page.locator('.gram-ligne .gram-bulle')).toHaveCount(0);
  await page.locator('#carte-gram .gram-bulle[data-t="' + t0 + '"]').click();
  const t1 = bulle(c.mots[1]);
  await page.locator('#carte-gram .gram-bulle[data-t="' + t1 + '"]').click();
  await sansDebordement(page);
  // Rechargement : les deux mots posés sont toujours là.
  await page.reload();
  await expect(page.locator('.gram-ligne .gram-bulle')).toHaveText([c.mots[0], c.mots[1]]);
  for (let i = 2; i < c.mots.length; i++) await page.locator('#carte-gram .gram-bulle[data-t="' + bulle(c.mots[i]) + '"]').click();
  await expect(page.locator('#carte-reponse')).toContainText('Bonne réponse ! ' + G.texte(c.mots, c.fin));
  expect(await de(page)).toBe('fort');
});

test('relier les paires (Expert, 8 paires) : liens de couleur dans les deux sens, un lien se défait ; tout juste → dé FORT', async ({ page }) => {
  const c = await partie(page, { jeux: ['relier'], niveau: 'expert' });
  const n = c.gauche.length;
  await expect(page.locator('.gram-mot-relier[data-cote="g"]')).toHaveCount(n);
  await sansDebordement(page);
  // Gauche puis droite.
  await page.locator('[data-cote="g"][data-i="0"]').click();
  await expect(page.locator('[data-cote="g"][data-i="0"]')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('[data-cote="d"][data-i="' + c.bonnes[0] + '"]').click();
  await expect(page.locator('.gram-traits line')).toHaveCount(1);
  await expect(page.locator('[data-cote="g"][data-i="0"] .gram-num')).toHaveText('1');
  // Toucher un mot relié défait le lien.
  await page.locator('[data-cote="d"][data-i="' + c.bonnes[0] + '"]').click();
  await expect(page.locator('.gram-traits line')).toHaveCount(0);
  await page.locator('[data-cote="g"][data-i="0"]').click();
  await expect(page.locator('.gram-traits line')).toHaveCount(1);
  // Droite puis gauche pour les autres.
  for (let g = 1; g < n; g++) {
    await page.locator('[data-cote="d"][data-i="' + c.bonnes[g] + '"]').click();
    await page.locator('[data-cote="g"][data-i="' + g + '"]').click();
  }
  await expect(page.locator('#carte-reponse')).toContainText('Toutes les paires sont justes');
  await expect(page.locator('.gram-mot-relier.juste')).toHaveCount(2 * n);
  expect(await de(page)).toBe('fort');
});

test('relier les paires : une paire fausse → correction avec les bonnes paires, dé FAIBLE', async ({ page }) => {
  const c = await partie(page, { jeux: ['relier'] });
  const n = c.gauche.length;
  // Les deux premiers mots échangés, les autres justes.
  const choix = c.bonnes.slice();
  [choix[0], choix[1]] = [choix[1], choix[0]];
  for (let g = 0; g < n; g++) {
    await page.locator('[data-cote="g"][data-i="' + g + '"]').click();
    await page.locator('[data-cote="d"][data-i="' + choix[g] + '"]').click();
  }
  await expect(page.locator('#carte-reponse')).toContainText((n - 2) + ' paires justes sur ' + n);
  await expect(page.locator('.gram-traits line[stroke-dasharray]')).toHaveCount(2);
  await page.getByRole('button', { name: 'J’ai compris' }).click();
  expect(await de(page)).toBe('faible');
});

// v6.55 (ligne 268) : la grammaire dans la partie rapide et le défi du jour.
test('partie rapide « Français » : une carte de grammaire au niveau choisi', async ({ page }) => {
  await rapide(page);
  await page.addInitScript(() => { try { localStorage.setItem('ludo-vu', '1'); localStorage.setItem('ludoaventura-rapide-choix', JSON.stringify({ matieres: ['francais'], niveau: 'difficile' })); } catch (e) { /* */ } });
  await page.goto('./');
  await page.getByRole('button', { name: 'Partie rapide' }).click();
  await page.getByRole('button', { name: 'Lancer la partie' }).click();
  // On force la matière de la prochaine carte (le hasard choisit sinon entre les 3 matières du français).
  await page.evaluate(() => { const R = window.Rapide, c = R.carte; R.carte = (m, n) => { const t = c(m, n, () => 0.9); return t; }; });
  await page.getByRole('button', { name: 'Question suivante' }).click();
  await expect(page.locator('#carte-titre')).toContainText('Grammaire · Difficile');
  await expect.poll(() => page.evaluate(() => !document.getElementById('carte-gram').hidden || !document.getElementById('carte-saisie').hidden)).toBe(true);
});

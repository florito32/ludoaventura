// Histoire (v7.1, BACKLOG lignes 271 et 275) : matière, niveau, jeux rangés par périodes (l'Antiquité d'abord),
// contenu propre à chaque niveau, chiffres romains, et le format « Qui suis-je ? » (points sans dé).
const { test, expect } = require('@playwright/test');
const S = require('../js/savoirs.js');
const H = require('../js/histoire.js');
const { rapide, versReglages, valider, lancer, ouvrirNeuf } = require('./aide');

const NIVEAUX = ['facile', 'moyen', 'difficile', 'expert'];

test.describe('contenu d\'histoire', () => {
  test.beforeEach(() => test.skip(test.info().project.name !== 'ordinateur', 'test de logique : un seul format suffit'));

  test('les jeux d\'histoire ont du contenu à chaque niveau et les cartes sont bien formées', () => {
    const jeux = S.jeuxDe('histoire');
    expect(new Set(jeux.map((j) => j.id)).size).toBe(jeux.length);
    for (const j of jeux) {
      for (const n of NIVEAUX) {
        for (let k = 0; k < 150; k++) {
          const c = S.generer({ jeux: [j.id], niveau: n }, 'histoire');
          expect(c, j.id + ' ' + n).not.toBeNull();
          expect(c.matiere).toBe('histoire');
          if (c.format === 'Q') { expect(c.options).toContain(c.bonne); expect(new Set(c.options).size).toBe(c.options.length); }
          if (c.format === 'R') { expect(new Set(c.droite).size).toBe(c.droite.length); expect(c.gauche.length).toBeLessThanOrEqual(S.TAILLE[n]); }
          if (c.format === 'O') expect(n === 'difficile' || n === 'expert').toBeTruthy();
          if (c.format === 'F') expect([...c.bonnes].sort()).toEqual([...c.elements].sort());
          if (c.format === 'I') { expect(c.indices).toHaveLength(5); expect(c.options).toContain(c.bonne); expect(new Set(c.options).size).toBe(4); }
        }
      }
    }
  });

  test('v8.0 : en mode Quiz, chaque jeu proposé ne pose que des questions à 4 choix, une seule bonne', () => {
    for (const j of S.jeuxDe('histoire')) {
      if (!NIVEAUX.every((n) => j.series.some((s) => S.utilisable(s, n, 'quiz')))) continue; // pas encore proposé en Quiz
      for (const n of NIVEAUX) {
        for (let k = 0; k < 60; k++) {
          const c = S.generer({ jeux: [j.id], niveau: n, mode: 'quiz' }, 'histoire');
          expect(c.format, j.id).toBe('Q');
          expect(c.options).toHaveLength(4);
          expect(new Set(c.options).size).toBe(4);
          expect(c.options).toContain(c.bonne);
        }
      }
    }
  });

  test('chaque niveau n\'a que son propre contenu (demande de l\'utilisateur)', () => {
    for (const j of S.jeuxDe('histoire')) {
      for (const s of j.series) {
        const vus = {};
        for (const n of NIVEAUX) for (const p of (s.niveaux[n] || [])) {
          const cle = JSON.stringify(Array.isArray(p) ? p.slice(0, 2) : p.r || p.q || p);
          expect(vus[cle], j.id + ' : ' + cle + ' en ' + vus[cle] + ' et ' + n).toBeUndefined();
          vus[cle] = n;
        }
      }
    }
  });

  test('Préhistoire (v8.3) : 2 jeux regroupés, environ 40 éléments par niveau, jouables en Quiz et en Normal', () => {
    const pre = S.jeuxDe('histoire').filter((j) => j.famille === 'pre');
    expect(pre.map((j) => j.id)).toEqual(['p01', 'p03']);
    for (const j of pre) {
      for (const n of NIVEAUX) {
        for (const mode of ['quiz', 'normal']) expect(j.series.some((s) => S.utilisable(s, n, mode)), j.id + ' ' + n + ' ' + mode).toBe(true);
        const total = j.series.reduce((a, s) => a + (s.k === 'classer' ? (s.niveaux[n] || []).reduce((x, g) => x + g.items.length, 0) : (s.niveaux[n] || []).length), 0);
        expect(total, j.id + ' ' + n).toBeGreaterThanOrEqual(35);
      }
    }
    // Une frise se range dans le bon ordre.
    S.regler(() => 0.9);
    const c = S.generer({ jeux: ['p01'], niveau: 'moyen' }, 'histoire');
    S.regler();
    if (c.format === 'F') expect(c.bonnes[0]).toContain('Toumaï');
  });

  test('Antiquité (v8.4) : 12 jeux regroupés en 6, environ 40 éléments par niveau, jouables en Quiz et en Normal', () => {
    const ant = S.jeuxDe('histoire').filter((j) => j.famille === 'ant');
    expect(ant.map((j) => j.id)).toEqual(['a01', 'a03', 'a05', 'a07', 'a10', 'a11']);
    for (const j of ant) {
      for (const n of NIVEAUX) {
        for (const mode of ['quiz', 'normal']) expect(j.series.some((s) => S.utilisable(s, n, mode)), j.id + ' ' + n + ' ' + mode).toBe(true);
        if (j.id === 'a10') continue; // chiffres romains : contenu calculé
        const total = j.series.reduce((a, s) => a + (s.k === 'classer' ? (s.niveaux[n] || []).reduce((x, g) => x + g.items.length, 0) : (s.niveaux[n] || []).length), 0);
        expect(total, j.id + ' ' + n).toBeGreaterThanOrEqual(35);
      }
      // Frises : pas deux événements de la même année dans un niveau (sinon l'ordre serait ambigu).
      for (const s of j.series.filter((x) => x.k === 'ordre')) for (const n of NIVEAUX) {
        const annees = (s.niveaux[n] || []).map((x) => x[1]);
        expect(new Set(annees).size, j.id + ' ' + n).toBe(annees.length);
      }
    }
    // Quiz « description → nom » : la question donne la description, les 4 choix sont des noms (bug des anciennes paires « inverseSeul »).
    let vues = 0;
    for (let k = 0; k < 400; k++) {
      const c = S.generer({ jeux: ['a01'], niveau: 'facile', mode: 'quiz' }, 'histoire');
      if (/^Chez les Égyptiens/.test(c.consigne)) { vues++; for (const o of c.options) expect(['Râ', 'Anubis', 'Osiris', 'Horus', 'Isis']).toContain(o); }
    }
    expect(vues).toBeGreaterThan(0);
  });

  test('Moyen Âge (v8.5) : 8 jeux regroupés en 3, environ 35 éléments par niveau, jouables en Quiz et en Normal', () => {
    const mag = S.jeuxDe('histoire').filter((j) => j.famille === 'mag');
    expect(mag.map((j) => j.id)).toEqual(['m01', 'm02', 'm07']);
    for (const j of mag) {
      for (const n of NIVEAUX) {
        for (const mode of ['quiz', 'normal']) expect(j.series.some((s) => S.utilisable(s, n, mode)), j.id + ' ' + n + ' ' + mode).toBe(true);
        const total = j.series.reduce((a, s) => a + (s.k === 'classer' ? (s.niveaux[n] || []).reduce((x, g) => x + g.items.length, 0) : (s.niveaux[n] || []).length), 0);
        expect(total, j.id + ' ' + n).toBeGreaterThanOrEqual(35);
        // Quiz : 4 choix tous différents.
        for (let k = 0; k < 150; k++) {
          const c = S.generer({ jeux: [j.id], niveau: n, mode: 'quiz' }, 'histoire');
          expect(c.options).toHaveLength(4);
          expect(new Set(c.options).size, c.consigne).toBe(4);
        }
      }
      for (const s of j.series.filter((x) => x.k === 'ordre')) for (const n of NIVEAUX) {
        const annees = (s.niveaux[n] || []).map((x) => x[1]);
        expect(new Set(annees).size, j.id + ' ' + n).toBe(annees.length);
      }
    }
    // « Qui a… ? » : la question donne le fait, les 4 choix sont des noms (et non 4 descriptions).
    let vues = 0;
    for (let k = 0; k < 400; k++) {
      const c = S.generer({ jeux: ['m01'], niveau: 'facile', mode: 'quiz' }, 'histoire');
      if (/^Qui a été/.test(c.consigne) || /^Qui rendait/.test(c.consigne)) { vues++; for (const o of c.options) expect(['Clovis', 'Charlemagne', 'Saint Louis', 'Charles VII', 'Hugues Capet']).toContain(o); }
    }
    expect(vues).toBeGreaterThan(0);
  });

  test('Renaissance (v7.8) : 6 jeux, chacun a du contenu à chaque niveau', () => {
    const ren = S.jeuxDe('histoire').filter((j) => j.famille === 'ren');
    expect(ren.map((j) => j.id)).toEqual(['r01', 'r02', 'r04', 'r05', 'r06', 'r07']);
    for (const j of ren) for (const n of NIVEAUX) expect(j.series.some((s) => S.utilisable(s, n)), j.id + ' ' + n).toBe(true);
  });

  test('Temps modernes (v7.9) : 4 jeux, chacun a du contenu à chaque niveau', () => {
    const mod = S.jeuxDe('histoire').filter((j) => j.famille === 'mod');
    expect(mod.map((j) => j.id)).toEqual(['t01', 't04', 't05', 't09']);
    for (const j of mod) for (const n of NIVEAUX) expect(j.series.some((s) => S.utilisable(s, n)), j.id + ' ' + n).toBe(true);
  });

  test('Révolution et XIXe siècle (v7.10) : 9 jeux, chacun a du contenu à chaque niveau', () => {
    const xix = S.jeuxDe('histoire').filter((j) => j.famille === 'xix');
    expect(xix.map((j) => j.id)).toEqual(['x01', 'x02', 'x03', 'x04', 'x05', 'x06', 'x07', 'x08', 'x09']);
    for (const j of xix) for (const n of NIVEAUX) expect(j.series.some((s) => S.utilisable(s, n)), j.id + ' ' + n).toBe(true);
    // Frises : pas deux événements de la même année dans un niveau (sinon l'ordre serait ambigu).
    for (const j of xix) for (const s of j.series.filter((x) => x.k === 'ordre')) for (const n of NIVEAUX) {
      const annees = s.niveaux[n].map((x) => x[1]);
      expect(new Set(annees).size, j.id + ' ' + n).toBe(annees.length);
    }
  });

  test('XXe siècle (v7.11) : 7 jeux, chacun a du contenu à chaque niveau', () => {
    const xx = S.jeuxDe('histoire').filter((j) => j.famille === 'xx');
    expect(xx.map((j) => j.id)).toEqual(['z03', 'z04', 'z05', 'z06', 'z07', 'z08', 'z11']);
    for (const j of xx) for (const n of NIVEAUX) expect(j.series.some((s) => S.utilisable(s, n)), j.id + ' ' + n).toBe(true);
    // Frises : pas deux événements de la même année dans un niveau (sinon l'ordre serait ambigu).
    for (const j of xx) for (const s of j.series.filter((x) => x.k === 'ordre')) for (const n of NIVEAUX) {
      const annees = (s.niveaux[n] || []).map((x) => x[1]);
      expect(new Set(annees).size, j.id + ' ' + n).toBe(annees.length);
    }
  });

  test('chiffres romains : conversions justes', () => {
    expect(H.romain(4)).toBe('IV');
    expect(H.romain(14)).toBe('XIV');
    expect(H.romain(476)).toBe('CDLXXVI');
    expect(H.romain(1789)).toBe('MDCCLXXXIX');
    expect(H.romain(2026)).toBe('MMXXVI');
    expect(H.romain(3999)).toBe('MMMCMXCIX');
    expect(S.ouverteJuste('mmxxvi', 'MMXXVI')).toBe(true);
  });

  test('les 7 périodes sont dans l\'ordre', () => {
    expect(H.FAMILLES.map((f) => f.id)).toEqual(['pre', 'ant', 'mag', 'ren', 'mod', 'xix', 'xx']);
  });
});

// Va jusqu'au plateau avec 1 joueur en Histoire : niveau et jeux donnés.
async function versHistoire(page, { niveau = 'facile', jeux = ['a01'], hasard = null, mode = 'normal' } = {}) {
  await rapide(page);
  await ouvrirNeuf(page);
  await versReglages(page, 1);
  await page.locator('#matieres input[value="histoire"]').check();
  await page.locator('#niveau-savoir input[value="' + niveau + '"]').check();
  await page.locator('#mode-savoir input[value="' + mode + '"]').check();
  await valider(page);
  await page.locator('#savoir-jeux').waitFor();
  for (const j of jeux) await page.locator('#savoir-liste input[value="' + j + '"]').check();
  await lancer(page);
  await page.getByRole('heading', { name: 'Le plateau' }).waitFor();
  if (hasard !== null) await page.evaluate((h) => window.Savoirs.regler(() => h), hasard);
}
async function piocher(page) {
  await page.getByRole('button', { name: 'Question suivante' }).click();
  await page.locator('#carte-piochee').waitFor();
  return page.evaluate(() => window.Aventura.partie.carte);
}
async function pasDeDebordement(page) {
  const d = await page.evaluate(() => ({ l: document.documentElement.scrollWidth, v: window.innerWidth }));
  expect(d.l).toBeLessThanOrEqual(d.v);
}

test('écran des réglages : la matière Histoire, son niveau, ses jeux rangés par période', async ({ page }) => {
  await rapide(page);
  await ouvrirNeuf(page);
  await versReglages(page, 1);
  await page.locator('#matieres label', { hasText: 'Histoire' }).click();
  await expect(page.locator('#reglage-niveau-savoir')).toBeVisible();
  await page.locator('#niveau-savoir label', { hasText: 'Moyen' }).click();
  await page.locator('#mode-savoir label', { hasText: 'Normal' }).click();
  await valider(page);
  await expect(page.locator('#reglages-titre')).toContainText('Histoire, les jeux');
  // Préhistoire (v7.6), Antiquité, Moyen Âge (v7.7), Renaissance (v7.8), Temps modernes (v7.9), Révolution et XIXe (v7.10), XXe (v7.11), dans l'ordre ; les familles de Géographie sont cachées.
  const familles = page.locator('#savoir-liste .famille:not([hidden])');
  await expect(familles).toHaveCount(7);
  await expect(familles.nth(0).locator('.famille-nom')).toContainText('Préhistoire');
  await expect(familles.nth(0).locator('input')).toHaveCount(2);
  await expect(familles.nth(1).locator('.famille-nom')).toContainText('Antiquité');
  await expect(familles.nth(1).locator('input')).toHaveCount(6);
  await expect(familles.nth(2).locator('.famille-nom')).toContainText('Moyen Âge');
  await expect(familles.nth(2).locator('input')).toHaveCount(3);
  await expect(familles.nth(3).locator('.famille-nom')).toContainText('Renaissance');
  await expect(familles.nth(3).locator('input')).toHaveCount(6);
  await expect(familles.nth(4).locator('.famille-nom')).toContainText('Temps modernes');
  await expect(familles.nth(4).locator('input')).toHaveCount(4);
  await expect(familles.nth(5).locator('.famille-nom')).toContainText('Révolution et XIXe');
  await expect(familles.nth(5).locator('input')).toHaveCount(9);
  await expect(familles.nth(6).locator('.famille-nom')).toContainText('XXe siècle');
  await expect(familles.nth(6).locator('input')).toHaveCount(7);
  // v7.8 : liste plus haute que l'écran → son haut reste atteignable (rien ne sort au-dessus de la zone qui défile).
  const haut = await page.locator('#savoir-liste').evaluate((el) => {
    let c = el.parentElement; while (getComputedStyle(c).overflowY === 'visible') c = c.parentElement;
    c.scrollTop = 0; return el.getBoundingClientRect().top - c.getBoundingClientRect().top;
  });
  expect(haut).toBeGreaterThanOrEqual(-1);
  await valider(page);
  await expect(page.locator('#packs-alerte')).toContainText('au moins un jeu');
  // « Tout » de la période = toute la période choisie.
  await familles.nth(1).locator('.btn-tout-famille').click();
  const p = await page.evaluate(() => window.Aventura.partie.savoirs[0].histoire);
  expect(p.niveau).toBe('moyen');
  expect(p.jeux).toHaveLength(6);
  expect(await page.evaluate(() => window.Aventura.partie.savoirs[0].geographie.jeux)).toHaveLength(0);
  // Tuiles (v7.2) : aucun nom coupé ni débordant du contour.
  const pb = await page.locator('#savoir-liste .famille:not([hidden]) .pack > span').evaluateAll((els) => els.map((el) => {
    const r = el.getBoundingClientRect(), n = el.querySelector('.pack-nom').getBoundingClientRect();
    return { nom: el.textContent, debord: el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1,
      dehors: n.left < r.left + 1 || n.right > r.right - 1 || n.top < r.top || n.bottom > r.bottom,
      lignes: Math.round(n.height / parseFloat(getComputedStyle(el.querySelector('.pack-nom')).lineHeight)) };
  }));
  expect(pb).toHaveLength(37);
  for (const x of pb) { expect(x.debord, x.nom).toBe(false); expect(x.dehors, x.nom).toBe(false); expect(x.lignes, x.nom).toBeLessThanOrEqual(1); }
  await pasDeDebordement(page);
  await valider(page);
  await expect(page.getByRole('button', { name: 'Lancer la partie' })).toBeVisible();
});

test('relier : dieux grecs et noms romains, tout juste → dé FORT', async ({ page }) => {
  await versHistoire(page, { niveau: 'moyen', jeux: ['a01'], hasard: 0 });
  const c = await piocher(page);
  expect(c.format).toBe('R');
  await expect(page.locator('#carte-titre')).toHaveText('Dieux et mythes · Relier');
  await pasDeDebordement(page);
  for (let i = 0; i < c.gauche.length; i++) {
    await page.locator('.relier-g[data-g="' + i + '"]').click();
    await page.locator('.relier-d[data-d="' + c.bonnes[i] + '"]').click();
  }
  await page.locator('.btn-savoir-ok').click();
  await expect(page.locator('#carte-reponse')).toHaveText('Bravo, tout est bien relié !');
  expect(await page.evaluate(() => window.Aventura.partie.regles.de)).toBe('fort');
});

test('remettre dans l\'ordre : la frise de Rome', async ({ page }) => {
  await versHistoire(page, { niveau: 'facile', jeux: ['a05'], hasard: 0.99 });
  const c = await piocher(page);
  expect(c.format).toBe('F');
  for (const b of c.bonnes) await page.locator('.ordre-el', { hasText: b }).click();
  await page.locator('.btn-savoir-ok').click();
  await expect(page.locator('#carte-reponse')).toContainText('Bravo, c’est le bon ordre');
  expect(await page.evaluate(() => window.Aventura.partie.regles.de)).toBe('fort');
});

test('question ouverte : chiffres romains écrits en minuscules → juste', async ({ page }) => {
  await versHistoire(page, { niveau: 'expert', jeux: ['a10'], hasard: 0.99 });
  const c = await piocher(page);
  expect(c.format).toBe('O');
  await page.getByLabel('Ta réponse').fill(c.bonne.toLowerCase());
  await page.getByRole('button', { name: 'OK', exact: true }).click();
  await expect(page.locator('#carte-reponse')).toContainText('Bonne réponse');
  expect(await page.evaluate(() => window.Aventura.partie.regles.de)).toBe('fort');
});

test('qui suis-je ? : un indice de plus, la bonne réponse → 5 points sans lancer de dé', async ({ page }) => {
  await versHistoire(page, { niveau: 'facile', jeux: ['a03'], hasard: 0.99 });
  const c = await piocher(page);
  expect(c.format).toBe('I');
  await expect(page.locator('.indices li')).toHaveCount(1);
  await page.locator('.btn-indice').click();
  await expect(page.locator('.indices li')).toHaveCount(2);
  await expect(page.locator('.indices-points')).toContainText('5 points');
  await pasDeDebordement(page);
  const avant = await page.evaluate(() => window.Aventura.partie.regles.points);
  await page.locator('.btn-option', { hasText: c.bonne }).click();
  await expect(page.locator('#carte-reponse')).toContainText('5 points');
  const apres = await page.evaluate(() => window.Aventura.partie.regles.points);
  if (typeof avant === 'number') expect(apres - avant).toBe(5);
});

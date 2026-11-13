// Histoire (v7.1, BACKLOG lignes 271 et 275) : matière, niveau, jeux rangés par périodes (l'Antiquité d'abord),
// contenu propre à chaque niveau, chiffres romains, et le format « Qui suis-je ? » (points sans dé).
const { test, expect } = require('@playwright/test');
const S = require('../js/savoirs.js');
const H = require('../js/histoire.js');
const { rapide, versReglages, valider, lancer, ouvrirNeuf } = require('./aide');

const NIVEAUX = ['facile', 'moyen', 'difficile', 'expert'];

test.describe('contenu d\'histoire', () => {
  test.beforeEach(() => test.skip(test.info().project.name !== 'ordinateur', 'test de logique : un seul format suffit'));

  test('les 12 jeux de l\'Antiquité ont du contenu à chaque niveau et les cartes sont bien formées', () => {
    const jeux = S.jeuxDe('histoire');
    expect(jeux.filter((j) => j.famille === 'ant')).toHaveLength(12);
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

  test('Préhistoire (v7.6) : 5 jeux, chacun a du contenu à chaque niveau', () => {
    const pre = S.jeuxDe('histoire').filter((j) => j.famille === 'pre');
    expect(pre.map((j) => j.id)).toEqual(['p01', 'p02', 'p03', 'p04', 'p07']);
    for (const j of pre) for (const n of NIVEAUX) expect(j.series.some((s) => S.utilisable(s, n)), j.id + ' ' + n).toBe(true);
    // Une frise se range dans le bon ordre.
    S.regler(() => 0.9);
    const c = S.generer({ jeux: ['p01'], niveau: 'moyen' }, 'histoire');
    S.regler();
    if (c.format === 'F') expect(c.bonnes[0]).toContain('Toumaï');
  });

  test('Moyen Âge (v7.7) : 8 jeux, chacun a du contenu à chaque niveau', () => {
    const mag = S.jeuxDe('histoire').filter((j) => j.famille === 'mag');
    expect(mag.map((j) => j.id)).toEqual(['m01', 'm02', 'm03', 'm05', 'm06', 'm07', 'm08', 'm09']);
    for (const j of mag) for (const n of NIVEAUX) expect(j.series.some((s) => S.utilisable(s, n)), j.id + ' ' + n).toBe(true);
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
async function versHistoire(page, { niveau = 'facile', jeux = ['a01'], hasard = null } = {}) {
  await rapide(page);
  await ouvrirNeuf(page);
  await versReglages(page, 1);
  await page.locator('#matieres input[value="histoire"]').check();
  await page.locator('#niveau-savoir input[value="' + niveau + '"]').check();
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
  await valider(page);
  await expect(page.locator('#reglages-titre')).toContainText('Histoire, les jeux');
  // Préhistoire (v7.6), Antiquité, Moyen Âge (v7.7), Renaissance (v7.8), Temps modernes (v7.9), dans l'ordre ; les familles de Géographie sont cachées.
  const familles = page.locator('#savoir-liste .famille:not([hidden])');
  await expect(familles).toHaveCount(5);
  await expect(familles.nth(0).locator('.famille-nom')).toContainText('Préhistoire');
  await expect(familles.nth(0).locator('input')).toHaveCount(5);
  await expect(familles.nth(1).locator('.famille-nom')).toContainText('Antiquité');
  await expect(familles.nth(1).locator('input')).toHaveCount(12);
  await expect(familles.nth(2).locator('.famille-nom')).toContainText('Moyen Âge');
  await expect(familles.nth(2).locator('input')).toHaveCount(8);
  await expect(familles.nth(3).locator('.famille-nom')).toContainText('Renaissance');
  await expect(familles.nth(3).locator('input')).toHaveCount(6);
  await expect(familles.nth(4).locator('.famille-nom')).toContainText('Temps modernes');
  await expect(familles.nth(4).locator('input')).toHaveCount(4);
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
  expect(p.jeux).toHaveLength(12);
  expect(await page.evaluate(() => window.Aventura.partie.savoirs[0].geographie.jeux)).toHaveLength(0);
  // Tuiles (v7.2) : aucun nom coupé ni débordant du contour.
  const pb = await page.locator('#savoir-liste .famille:not([hidden]) .pack > span').evaluateAll((els) => els.map((el) => {
    const r = el.getBoundingClientRect(), n = el.querySelector('.pack-nom').getBoundingClientRect();
    return { nom: el.textContent, debord: el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1,
      dehors: n.left < r.left + 1 || n.right > r.right - 1 || n.top < r.top || n.bottom > r.bottom,
      lignes: Math.round(n.height / parseFloat(getComputedStyle(el.querySelector('.pack-nom')).lineHeight)) };
  }));
  expect(pb).toHaveLength(35);
  for (const x of pb) { expect(x.debord, x.nom).toBe(false); expect(x.dehors, x.nom).toBe(false); expect(x.lignes, x.nom).toBeLessThanOrEqual(1); }
  await pasDeDebordement(page);
  await valider(page);
  await expect(page.getByRole('button', { name: 'Lancer la partie' })).toBeVisible();
});

test('relier : dieux grecs et noms romains, tout juste → dé FORT', async ({ page }) => {
  await versHistoire(page, { niveau: 'moyen', jeux: ['a01'], hasard: 0 });
  const c = await piocher(page);
  expect(c.format).toBe('R');
  await expect(page.locator('#carte-titre')).toHaveText('Dieux grecs et romains · Relier');
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
  await versHistoire(page, { niveau: 'expert', jeux: ['a10'], hasard: 0 });
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

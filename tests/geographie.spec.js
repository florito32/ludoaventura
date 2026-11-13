// Géographie (v7.0, BACKLOG lignes 258 à 262 ; refonte v8.0, lignes 308 à 320) : matière, niveau, mode Quiz / Normal,
// jeux en familles, et les formats de carte (relier, choix multiples, question ouverte, ordre, vrai ou faux, classer, carte).
const { test, expect } = require('@playwright/test');
const S = require('../js/savoirs.js');
require('../js/geographie.js');
const { rapide, versReglages, valider, lancer, lancerLeDe, ouvrirNeuf } = require('./aide');

const NIVEAUX = ['facile', 'moyen', 'difficile', 'expert'];

test.describe('contenu de géographie', () => {
  test.beforeEach(() => test.skip(test.info().project.name !== 'ordinateur', 'test de logique : un seul format suffit'));

  test('v8.0 : chaque jeu se joue à chaque niveau dans les deux modes ; Quiz = toujours 4 choix, Normal = jamais de QCM, 4 paires', () => {
    for (const j of S.jeuxDe('geographie')) {
      for (const n of NIVEAUX) {
        for (const mode of ['quiz', 'normal']) {
          for (let k = 0; k < 120; k++) {
            const c = S.generer({ jeux: [j.id], niveau: n, mode }, 'geographie');
            expect(c, j.id + ' ' + n + ' ' + mode).not.toBeNull();
            if (mode === 'quiz') {
              expect(c.format, j.id).toBe('Q');
              expect(c.options).toHaveLength(4);
              expect(new Set(c.options).size).toBe(4);
              expect(c.options).toContain(c.bonne);
            } else expect(c.format, j.id).not.toBe('Q');
            if (c.format === 'R') { expect(c.gauche).toHaveLength(4); expect(new Set(c.droite).size).toBe(4); }
            if (c.format === 'O') expect(n === 'difficile' || n === 'expert').toBeTruthy();
            if (c.format === 'F') expect([...c.bonnes].sort()).toEqual([...c.elements].sort());
          }
        }
      }
    }
  });

  test('v8.0 : Départements = 25 départements par niveau, rangés par population (Insee) ; numéro, nom et préfecture', () => {
    const G = require('../js/geographie.js');
    const j = S.trouver('g01');
    const noms = (n) => j.series[0].niveaux[n].map((p) => p[1]);
    expect(NIVEAUX.map((n) => noms(n).length)).toEqual([25, 25, 25, 26]);
    expect(noms('facile')).toEqual(expect.arrayContaining(['Nord', 'Paris', 'Bouches-du-Rhône', 'Rhône']));
    expect(noms('expert')).toEqual(expect.arrayContaining(['Lozère', 'Creuse']));
    // Les trois séries (numéro ↔ nom, nom ↔ préfecture, numéro ↔ préfecture) ont les mêmes départements par niveau.
    for (const n of NIVEAUX) expect(j.series[1].niveaux[n]).toHaveLength(j.series[0].niveaux[n].length);
    expect(S.trouver('g02')).toBeNull(); // « Préfectures » est fusionné dans « Départements »
    expect(G.DEPARTEMENTS).toHaveLength(101);
  });

  test('v8.0 : cartes France / Europe / Monde — chaque niveau a des zones à demander, Quiz = zone en vert + 4 noms', () => {
    const CG = require('../js/cartes-geo.js');
    expect(Object.keys(CG.CARTES).sort()).toEqual(['europe', 'france', 'monde']);
    for (const id of ['france', 'europe', 'monde']) {
      for (const n of NIVEAUX) {
        expect(CG.zonesDu(id, n).length, id + ' ' + n).toBeGreaterThanOrEqual(8);
        for (let k = 0; k < 30; k++) {
          const q = CG.tirer(id, n, Math.random, 'quiz');
          expect(q.options).toHaveLength(4);
          expect(new Set(q.options).size).toBe(4);
          expect(q.options).toContain(q.bonne);
          expect(CG.CARTES[id].zones.find((z) => z.id === q.verte).nom).toBe(q.bonne);
          const t = CG.tirer(id, n, Math.random, 'normal');
          expect(t.consigne).toContain(t.bonneNom);
        }
      }
    }
    // Les plus grands pays en Facile, les plus petits en Expert (superficie).
    const niv = (id, nom) => CG.CARTES[id].zones.find((z) => z.nom === nom).niv;
    expect(niv('monde', 'Russie')).toBe('facile');
    expect(niv('monde', 'Belgique')).toBe('expert');
    expect(niv('europe', 'France')).toBe('facile');
    expect(niv('france', 'Paris')).toBe('facile');
    expect(niv('france', 'Lozère')).toBe('expert');
  });

  test('v8.1 : environ 50 éléments par niveau pour chaque thème (fini les petites listes qui tournent en boucle)', () => {
    const minimum = { g01: 70, g04: 45, g05: 45, g07: 100, g11: 50, g06: 45, g09: 40, g13: 40 };
    for (const [id, min] of Object.entries(minimum)) {
      const j = S.trouver(id);
      for (const n of NIVEAUX) {
        const total = j.series.reduce((a, s) => a + (s.niveaux[n] || []).length, 0);
        expect(total, id + ' ' + n).toBeGreaterThanOrEqual(min);
      }
    }
  });

  test('v8.1 : drapeaux — 195 pays, chaque drapeau existe, deux drapeaux qui se ressemblent ne sont jamais ensemble', () => {
    const G = require('../js/geographie.js');
    const fs = require('fs');
    expect(G.MONDE.length).toBeGreaterThanOrEqual(190);
    for (const p of G.MONDE) expect(fs.existsSync('img/drapeaux/' + p[0] + '.svg'), p[0]).toBe(true);
    const nomVersCode = {};
    for (const p of G.MONDE) nomVersCode[p[1].split('|')[0]] = p[0];
    for (let k = 0; k < 2000; k++) {
      const c = S.generer({ jeux: ['g05'], niveau: NIVEAUX[k % 4], mode: k % 2 ? 'quiz' : 'normal' }, 'geographie');
      const codes = c.format === 'R' ? c.gauche : c.format === 'Q' ? c.options.map((o) => nomVersCode[o]) : [];
      for (const [a, b] of G.SOSIES) expect(codes.includes(a) && codes.includes(b), a + ' / ' + b).toBe(false);
    }
  });

  test('v8.1 : pays voisins — frontières justes (France, Allemagne), jamais un voisin parmi les mauvaises réponses', () => {
    const j = S.trouver('g07');
    const qcm = NIVEAUX.flatMap((n) => j.series[0].niveaux[n]);
    const france = qcm.filter((x) => x[0] === 'Quel pays a une frontière avec ce pays : France ?').map((x) => x[1]).sort();
    expect(france).toEqual(['Allemagne', 'Andorre', 'Belgique', 'Espagne', 'Italie', 'Luxembourg', 'Monaco', 'Suisse']);
    for (const x of qcm.filter((y) => y[0].startsWith('Quel pays a une frontière'))) {
      const pays = x[0].split(' : ')[1].replace(' ?', '');
      const voisins = qcm.filter((y) => y[0] === x[0]).map((y) => y[1]);
      for (const f of x[2]) expect(voisins, pays + ' / ' + f).not.toContain(f);
    }
  });

  test('chaque niveau n\'a que son propre contenu (demande de l\'utilisateur)', () => {
    for (const j of S.jeuxDe('geographie')) {
      for (const s of j.series) {
        if (s.k !== 'paires') continue;
        const vus = {};
        for (const n of NIVEAUX) for (const p of (s.niveaux[n] || [])) {
          const cle = JSON.stringify(p);
          expect(vus[cle], j.id + ' : ' + cle + ' en ' + vus[cle] + ' et ' + n).toBeUndefined();
          vus[cle] = n;
        }
      }
    }
  });

  test('question ouverte : accents, majuscules, tirets et article ne comptent pas ; les autres écritures sont acceptées', () => {
    expect(S.ouverteJuste('brasilia', 'Brasília|Brasilia')).toBe(true);
    expect(S.ouverteJuste('St Etienne', 'Saint-Étienne')).toBe(true);
    expect(S.ouverteJuste('caire', 'Le Caire|Caire')).toBe(true);
    expect(S.ouverteJuste('Evry', 'Évry-Courcouronnes|Évry')).toBe(true);
    expect(S.ouverteJuste('Lyon', 'Marseille')).toBe(false);
    expect(S.ouverteJuste('', 'Paris')).toBe(false);
  });

  test('101 départements : numéros et préfectures uniques, 13 régions de métropole', () => {
    const G = require('../js/geographie.js');
    const D = G.DEPARTEMENTS;
    expect(D).toHaveLength(101);
    expect(new Set(D.map((d) => d[0])).size).toBe(101);
    expect(new Set(D.filter((d) => d[0].length < 3).map((d) => d[3])).size).toBe(13);
  });
});

// Va jusqu'au plateau avec 1 joueur en Géographie : niveau et jeux donnés.
test('écran des jeux (v7.2) : tuiles icône + nom, aucun nom coupé ni débordant du contour', async ({ page }) => {
  await rapide(page);
  await ouvrirNeuf(page);
  await versReglages(page, 1);
  await page.locator('#matieres input[value="geographie"]').check();
  await valider(page);
  await page.locator('#savoir-jeux').waitFor();
  await page.locator('#btn-tout-savoir').click(); // état « choisi » (fond foncé) : mêmes dimensions
  const pb = await page.locator('#savoir-liste .famille:not([hidden]) .pack > span').evaluateAll((els) => els.map((el) => {
    const r = el.getBoundingClientRect(), n = el.querySelector('.pack-nom').getBoundingClientRect();
    const i = el.querySelector('.pack-icone').getBoundingClientRect();
    return {
      nom: el.textContent, debord: el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1,
      dehors: n.left < r.left + 1 || n.right > r.right - 1 || n.top < r.top || n.bottom > r.bottom || i.left < r.left || i.right > r.right,
      lignes: Math.round(n.height / parseFloat(getComputedStyle(el.querySelector('.pack-nom')).lineHeight)),
    };
  }));
  expect(pb).toHaveLength(13);
  for (const t of pb) {
    expect(t.debord, t.nom).toBe(false);
    expect(t.dehors, t.nom).toBe(false);
    expect(t.lignes, t.nom).toBeLessThanOrEqual(1); // le nom tient sur une ligne : pas de mot coupé
  }
  await pasDeDebordement(page);
});

async function versGeo(page, { niveau = 'facile', jeux = ['g04'], hasard = null, mode = 'normal' } = {}) {
  await rapide(page);
  await ouvrirNeuf(page);
  await versReglages(page, 1);
  await page.locator('#matieres input[value="geographie"]').check();
  await page.locator('#niveau-savoir input[value="' + niveau + '"]').check();
  await page.locator('#mode-savoir input[value="' + mode + '"]').check();
  await valider(page);
  await page.locator('#savoir-jeux').waitFor();
  for (const j of jeux) await page.locator('#savoir-liste input[value="' + j + '"]').check();
  await lancer(page);
  await page.getByRole('heading', { name: 'Le plateau' }).waitFor();
  // Hasard fixé : le format de la carte ne dépend plus du hasard.
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

test('écran des réglages : Géographie, son niveau, le mode Quiz / Normal (v8.0), ses jeux en 4 familles ; « Valider » exige un jeu', async ({ page }) => {
  await rapide(page);
  await ouvrirNeuf(page);
  await versReglages(page, 1);
  // Le mode n'existe que pour la Géographie et l'Histoire.
  await page.locator('#matieres label', { hasText: 'Mathématiques' }).click();
  await expect(page.locator('#reglage-mode-savoir')).toBeHidden();
  await page.locator('#matieres label', { hasText: 'Géographie' }).click();
  await expect(page.locator('#reglage-niveau-savoir')).toBeVisible();
  await expect(page.locator('#reglage-mode-savoir')).toBeVisible();
  await expect(page.locator('#mode-savoir input[value="quiz"]')).toBeChecked();
  await expect(page.locator('#mode-savoir-aide')).toContainText('4 réponses');
  await page.locator('#mode-savoir label', { hasText: 'Normal' }).click();
  await expect(page.locator('#mode-savoir-aide')).toContainText('relier 4 paires');
  await expect(page.locator('#niveau-savoir-aide')).toContainText('Facile');
  await page.locator('#niveau-savoir label', { hasText: 'Expert' }).click();
  await expect(page.locator('#niveau-savoir-aide')).toContainText('Expert');
  await pasDeDebordement(page);
  await valider(page);
  await expect(page.locator('#reglages-titre')).toContainText('Géographie, les jeux');
  await expect(page.locator('#savoir-liste .famille:not([hidden])')).toHaveCount(4);
  await expect(page.locator('#savoir-liste .famille:not([hidden]) .pack:not([hidden]) input')).toHaveCount(13);
  for (const nom of ['Départements', 'Carte de France', 'Carte d’Europe', 'Carte du monde']) await expect(page.getByRole('checkbox', { name: nom })).toHaveCount(1);
  // Rien de choisi : « Valider » refuse.
  await valider(page);
  await expect(page.locator('#packs-alerte')).toContainText('au moins un jeu');
  await page.locator('#btn-tout-savoir').click();
  for (const i of await page.locator('#savoir-liste .famille:not([hidden]) input').all()) await expect(i).toBeChecked();
  const p = await page.evaluate(() => window.Aventura.partie.savoirs[0].geographie);
  expect(p.niveau).toBe('expert');
  expect(p.mode).toBe('normal');
  expect(p.jeux).toHaveLength(13);
  await pasDeDebordement(page);
  await valider(page);
  await expect(page.getByRole('button', { name: 'Lancer la partie' })).toBeVisible();
});

test('relier : on relie chaque pays à sa capitale, tout juste → dé FORT', async ({ page }) => {
  await versGeo(page, { niveau: 'expert', jeux: ['g04'], hasard: 0 });
  const c = await piocher(page);
  expect(c.format).toBe('R');
  expect(c.gauche).toHaveLength(4);
  await expect(page.locator('#carte-titre')).toHaveText('Pays et capitales · Relier');
  await pasDeDebordement(page);
  for (let i = 0; i < c.gauche.length; i++) {
    await page.locator('.relier-g[data-g="' + i + '"]').click();
    await page.locator('.relier-d[data-d="' + c.bonnes[i] + '"]').click();
  }
  await page.locator('.btn-savoir-ok').click();
  await expect(page.locator('#carte-reponse')).toHaveText('Bravo, tout est bien relié !');
  expect(await page.evaluate(() => window.Aventura.partie.regles.de)).toBe('fort');
  await lancerLeDe(page);
});

test('relier faux : la correction s\'affiche, « J\'ai compris » puis dé FAIBLE', async ({ page }) => {
  await versGeo(page, { niveau: 'facile', jeux: ['g04'], hasard: 0 });
  const c = await piocher(page);
  // Toucher les réponses dans l'ordre affiché relie chaque élément au suivant libre (choisi automatiquement).
  const faux = c.bonnes.slice(1).concat(c.bonnes[0]);
  for (let i = 0; i < c.gauche.length; i++) await page.locator('.relier-d[data-d="' + faux[i] + '"]').click();
  await page.locator('.btn-savoir-ok').click();
  await expect(page.locator('#carte-reponse')).toContainText('Pas tout à fait');
  expect(await page.evaluate(() => window.Aventura.partie.regles.de)).toBe('faible');
  // Le dé attend « J'ai compris » (le temps de lire la correction), puis se lance.
  await page.getByRole('button', { name: 'J’ai compris' }).click();
  await page.waitForFunction(() => window.Aventura.partie.regles.etape !== 'lancer');
});

test('drapeaux : relier des drapeaux (images) à leur pays', async ({ page }) => {
  await versGeo(page, { niveau: 'facile', jeux: ['g05'], hasard: 0 });
  const c = await piocher(page);
  expect(c.format).toBe('R');
  await expect(page.locator('.relier-g img.drapeau')).toHaveCount(4);
  const ok = await page.locator('.relier-g img.drapeau').first().evaluate((img) => img.complete && img.naturalWidth > 0);
  expect(ok).toBe(true);
});

test('mode Quiz : une question, 4 réponses ; toucher la bonne → dé FORT', async ({ page }) => {
  await versGeo(page, { niveau: 'moyen', jeux: ['g04'], hasard: 0.99, mode: 'quiz' });
  const c = await piocher(page);
  expect(c.format).toBe('Q');
  await expect(page.locator('#carte-titre')).toHaveText('Pays et capitales · Quiz');
  await expect(page.locator('.btn-option')).toHaveCount(4);
  await page.locator('.btn-option', { hasText: c.bonne }).click();
  await expect(page.locator('.btn-option.bonne')).toHaveText(c.bonne);
  expect(await page.evaluate(() => window.Aventura.partie.regles.de)).toBe('fort');
});

test('question ouverte : le joueur écrit la capitale, sans accent → juste', async ({ page }) => {
  await versGeo(page, { niveau: 'difficile', jeux: ['g04'], hasard: 0.99 });
  const c = await piocher(page);
  expect(c.format).toBe('O');
  await expect(page.locator('#carte-saisie')).toBeVisible();
  const texte = c.bonne.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  await page.getByLabel('Ta réponse').fill(texte);
  await page.getByRole('button', { name: 'OK', exact: true }).click();
  await expect(page.locator('#carte-reponse')).toContainText('Bonne réponse');
  expect(await page.evaluate(() => window.Aventura.partie.regles.de)).toBe('fort');
});

test('vrai ou faux : la réponse proposée est vraie → « Vrai » est juste', async ({ page }) => {
  await versGeo(page, { niveau: 'facile', jeux: ['g13'], hasard: 0 });
  const c = await piocher(page);
  expect(c.format).toBe('V');
  await page.locator('.btn-option', { hasText: c.bonne }).click();
  expect(await page.evaluate(() => window.Aventura.partie.regles.de)).toBe('fort');
});

test('remettre dans l\'ordre : records (pays du plus petit au plus grand) ; rechargement en cours de rangement', async ({ page }) => {
  await versGeo(page, { niveau: 'facile', jeux: ['g13'], hasard: 0.6 });
  const c = await piocher(page);
  expect(c.format).toBe('F');
  // Les deux premiers éléments, puis on recharge la page : ils restent rangés.
  await page.locator('.ordre-el', { hasText: c.bonnes[0] }).click();
  await page.reload();
  await page.locator('#carte-savoir').waitFor();
  await page.evaluate(() => window.Savoirs.regler(() => 0.6));
  await expect(page.locator('.ordre-case').first()).toContainText(c.bonnes[0]);
  for (const b of c.bonnes.slice(1)) await page.locator('.ordre-el', { hasText: b }).click();
  await page.locator('.btn-savoir-ok').click();
  await expect(page.locator('#carte-reponse')).toContainText('Bravo, c’est le bon ordre');
  expect(await page.evaluate(() => window.Aventura.partie.regles.de)).toBe('fort');
});

test('classer : voisins d\'un pays ou pas', async ({ page }) => {
  await versGeo(page, { niveau: 'facile', jeux: ['g07'], hasard: 0.99 });
  const c = await piocher(page);
  expect(c.format).toBe('K');
  await pasDeDebordement(page);
  for (let i = 0; i < c.elements.length; i++) await page.locator('.btn-col[data-i="' + i + '"][data-col="' + c.bonnes[i] + '"]').click();
  await page.locator('.btn-savoir-ok').click();
  await expect(page.locator('#carte-reponse')).toHaveText('Bravo, tout est bien rangé !');
});

test('cartes France, Europe, Monde (Normal) : toucher la zone nommée → dé FORT', async ({ page }) => {
  for (const [jeu, niveau, h] of [['g10', 'facile', 0.3], ['g18', 'moyen', 0.5], ['g19', 'expert', 0.6]]) {
    await versGeo(page, { niveau, jeux: [jeu], hasard: h });
    const c = await piocher(page);
    expect(c.format).toBe('C');
    await expect(page.locator('#carte-titre')).toContainText('Toucher sur la carte');
    await pasDeDebordement(page);
    const zone = page.locator('#carte-savoir [data-zone="' + c.bonne + '"]');
    await zone.dispatchEvent('click');
    await expect(page.locator('#carte-reponse')).toContainText('Bravo');
    expect(await page.evaluate(() => window.Aventura.partie.regles.de)).toBe('fort');
  }
});

test('carte en mode Quiz (v8.0) : la zone est en vert, on zoome autour d\'elle, 4 noms au choix', async ({ page }) => {
  await versGeo(page, { niveau: 'expert', jeux: ['g19'], hasard: 0.4, mode: 'quiz' });
  const c = await piocher(page);
  expect(c.format).toBe('Q');
  expect(c.verte).toBeTruthy();
  await expect(page.locator('#carte-savoir .carte-quiz .zone.bonne')).toHaveCount(1);
  await expect(page.locator('.btn-option')).toHaveCount(4);
  // Petit pays (Expert) : la carte est déjà zoomée autour de lui, la zone verte se voit.
  await expect(page.getByRole('button', { name: 'Revoir toute la carte' })).toBeVisible();
  const b = await page.locator('#carte-savoir .zone.bonne').boundingBox();
  expect(Math.max(b.width, b.height)).toBeGreaterThanOrEqual(10);
  await pasDeDebordement(page);
  // Toucher la carte ne répond pas : seule une des 4 réponses compte.
  await page.locator('#carte-savoir .zone.bonne').dispatchEvent('click');
  expect(await page.evaluate(() => window.Aventura.partie.carte.reponseDonnee)).toBeFalsy();
  await page.locator('.btn-option', { hasText: c.bonne }).click();
  await expect(page.locator('#carte-reponse')).toContainText('Bonne réponse');
  expect(await page.evaluate(() => window.Aventura.partie.regles.de)).toBe('fort');
});

test('Départements en Quiz : numéro, nom ou préfecture, toujours 4 choix', async ({ page }) => {
  await versGeo(page, { niveau: 'facile', jeux: ['g01'], hasard: 0.2, mode: 'quiz' });
  const c = await piocher(page);
  expect(c.format).toBe('Q');
  await expect(page.locator('.btn-option')).toHaveCount(4);
  await expect(page.locator('#carte-titre')).toHaveText('Départements · Quiz');
});

// v7.2 (demande du 12/11/2026) : zoomer sur la carte seule, pour toucher plus précisément.
test('carte à toucher (v7.2) : zoom de la carte seule (boutons, pincement, molette), glisser ne choisit pas, toucher choisit', async ({ page }, info) => {
  await versGeo(page, { niveau: 'moyen', jeux: ['g18'], hasard: 0.3 });
  const c = await piocher(page);
  expect(c.format).toBe('C');
  const svg = page.locator('#carte-savoir .carte-geo svg');
  const vb0 = await svg.getAttribute('viewBox');
  const largeur = async () => Number((await svg.getAttribute('viewBox')).split(' ')[2]);
  const w0 = await largeur();
  // Au départ : « − » grisé, « Revoir toute la carte » caché.
  await expect(page.getByRole('button', { name: 'Dézoomer la carte' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Revoir toute la carte' })).toBeHidden();
  await page.getByRole('button', { name: 'Zoomer sur la carte' }).click();
  expect(await largeur()).toBeCloseTo(w0 / 2, 0);
  await expect(page.getByRole('button', { name: 'Revoir toute la carte' })).toBeVisible();
  // La page, elle, n'est pas zoomée et ne déborde pas.
  expect(await page.evaluate(() => (window.visualViewport ? window.visualViewport.scale : 1))).toBe(1);
  await pasDeDebordement(page);
  // Glisser la carte zoomée la déplace, sans choisir de zone.
  const b = await svg.boundingBox();
  const vbAvant = await svg.getAttribute('viewBox');
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width / 2 + 60, b.y + b.height / 2 + 40, { steps: 6 });
  await page.mouse.up();
  expect(await svg.getAttribute('viewBox')).not.toBe(vbAvant);
  expect(await page.evaluate(() => window.Aventura.partie.carte.reponseDonnee)).toBeFalsy();
  // Molette (ordinateur) : zoom autour du pointeur.
  if (!info.project.use.isMobile) {
    const w1 = await largeur();
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
    await page.mouse.wheel(0, -200);
    await expect.poll(largeur).toBeLessThan(w1);
  }
  // Pincer à deux doigts (écrans tactiles) : la carte grossit, la page non.
  if (info.project.use.hasTouch) {
    await page.getByRole('button', { name: 'Revoir toute la carte' }).click();
    expect(await svg.getAttribute('viewBox')).toBe(vb0);
    const cdp = await page.context().newCDPSession(page);
    const cx = b.x + b.width / 2, cy = b.y + b.height / 2;
    const touche = (type, d) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x: cx - d, y: cy, id: 1 }, { x: cx + d, y: cy, id: 2 }] });
    await touche('touchStart', 20);
    for (let d = 25; d <= 80; d += 5) await touche('touchMove', d);
    await touche('touchEnd', 80);
    await expect.poll(largeur).toBeLessThan(w0 / 2);
    expect(await page.evaluate(() => (window.visualViewport ? window.visualViewport.scale : 1))).toBe(1);
    expect(await page.evaluate(() => window.Aventura.partie.carte.reponseDonnee)).toBeFalsy();
  }
  // Toucher la bonne zone (zoomée) : réponse juste.
  await page.getByRole('button', { name: 'Revoir toute la carte' }).click();
  await page.getByRole('button', { name: 'Zoomer sur la carte' }).click();
  const zone = page.locator('#carte-savoir [data-zone="' + c.bonne + '"]');
  await zone.scrollIntoViewIfNeeded().catch(() => {});
  await zone.dispatchEvent('click');
  await expect(page.locator('#carte-reponse')).toContainText('Bravo');
});


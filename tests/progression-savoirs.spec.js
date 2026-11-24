// Difficulté « progression » de l'Histoire et de la Géographie, de 1 à 100 (demande du 23/11/2026) : logique seule, aucun écran.
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const P = require('../js/progression-savoirs.js');
const S = require('../js/savoirs.js');
require('../js/geographie.js');
require('../js/histoire.js');
['pre', 'mag', 'ren', 'mod', 'ant', 'xix', 'xx'].forEach((f) => require('../js/histoire-' + f + '.js'));
const CG = require('../js/cartes-geo.js');
const NIV = ['facile', 'moyen', 'difficile', 'expert'];

test.describe('progression de l’Histoire et de la Géographie (1 à 100)', () => {
  test.beforeEach(() => test.skip(test.info().project.name !== 'ordinateur', 'test de logique : un seul format suffit'));

  test('11 groupes : 7 périodes d’Histoire et 4 familles de Géographie, chacun avec ses 100 niveaux remplis', () => {
    const groupes = Object.keys(P.REPARTITION).sort();
    expect(groupes).toEqual(['geographie/cartes', 'geographie/france', 'geographie/monde', 'geographie/nature',
      'histoire/ant', 'histoire/mag', 'histoire/mod', 'histoire/pre', 'histoire/ren', 'histoire/xix', 'histoire/xx']);
    groupes.forEach((g) => {
      const rep = P.REPARTITION[g];
      expect(rep, g).toHaveLength(100);
      rep.forEach((n, i) => expect(n, g + ' niveau ' + (i + 1)).toBeGreaterThan(0));
      // Tranches égales : chaque niveau compte à peu près autant de questions (écart d'une au plus).
      expect(Math.max(...rep) - Math.min(...rep), g).toBeLessThanOrEqual(1);
    });
  });

  test('chaque question du jeu a un niveau de 1 à 100, et le compte par groupe est celui du tableau de répartition', () => {
    const compte = {};
    S.JEUX.forEach((j) => j.series.forEach((s, si) => NIV.forEach((n) => {
      const nb = s.k === 'carte' ? CG.zonesDu(s.carte, n).length : ((s.niveaux && s.niveaux[n]) || []).length;
      for (let i = 0; i < nb; i++) {
        const v = P.niveau(j.id, si, n, i);
        expect(v, j.id + ' série ' + si + ' ' + n + ' #' + i).toBeGreaterThanOrEqual(1);
        expect(v).toBeLessThanOrEqual(100);
        const g = P.JEU_GROUPE[j.id];
        compte[g] = compte[g] || new Array(100).fill(0);
        compte[g][v - 1]++;
      }
    })));
    expect(compte).toEqual(P.REPARTITION);
  });

  test('le niveau actuel prime : dans un groupe, une question facile n’est jamais plus haute qu’une question expert', () => {
    // Pour chaque jeu, le niveau de progression maximal d'un niveau « facile » reste ≤ au minimum d'un niveau « expert » du même groupe.
    const bornes = {};
    S.JEUX.forEach((j) => j.series.forEach((s, si) => NIV.forEach((n) => {
      const t = P.DATA[j.id + '.' + si + '.' + n] || [];
      const g = P.JEU_GROUPE[j.id];
      bornes[g] = bornes[g] || {};
      const b = bornes[g][n] = bornes[g][n] || { min: 101, max: 0 };
      t.forEach((v) => { b.min = Math.min(b.min, v); b.max = Math.max(b.max, v); });
    })));
    Object.keys(bornes).forEach((g) => {
      for (let k = 0; k < 3; k++) {
        const a = bornes[g][NIV[k]], b = bornes[g][NIV[k + 1]];
        if (a.max && b.min <= 100) expect(a.max, g + ' ' + NIV[k] + ' / ' + NIV[k + 1]).toBeLessThanOrEqual(b.min);
      }
    });
  });

  test('les notes à la main : 25 lots, chaque question jugée a une note de 1 à 9', () => {
    const dir = path.join(__dirname, '..', 'outils', 'donnees', 'progression');
    const lots = fs.readdirSync(dir).filter((f) => /^ids-B\d+\.json$/.test(f));
    expect(lots).toHaveLength(25);
    let total = 0;
    lots.forEach((f) => {
      const ids = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
      total += ids.length;
      expect(fs.existsSync(path.join(dir, 'notes-' + f.slice(4, 7) + '.txt')), f).toBe(true);
    });
    expect(total).toBe(7949);
  });
});

// v10.41 : « Suivre ma progression » en Histoire et Géographie : tirage dans une fenêtre de niveaux de progression.
test.describe('Savoirs : tirage dans une fenêtre de niveaux (v10.41)', () => {
  test.beforeEach(() => test.skip(test.info().project.name !== 'ordinateur', 'test de logique : un seul format suffit'));
  test('une fenêtre qui ne contient qu\'une question tire cette question', () => {
    const S = require('../js/savoirs.js');
    require('../js/histoire.js'); require('../js/geographie.js');
    ['pre', 'mag', 'ren', 'mod', 'ant', 'xix', 'xx'].forEach((f) => require('../js/histoire-' + f + '.js'));
    const PS = require('../js/progression-savoirs.js');
    const jeux = S.JEUX.filter((j) => j.matiere === 'histoire' && j.famille === 'xix').map((j) => j.id);
    for (let b = 1; b <= 96; b += 19) {
      for (let k = 0; k < 8; k++) {
        const c = S.generer({ jeux, niveau: 'facile', mode: 'quiz', fenetre: { bas: b, haut: b + 4, niveau: PS.niveau } }, 'histoire');
        expect(c).toBeTruthy();
        expect(c.type).toBe('savoir');
      }
    }
    // fenêtre factice : une seule question de la série 0 du premier jeu est dans la fenêtre → c'est elle qui sort
    const jeu = S.trouver(jeux[0]);
    const serieQcm = jeu.series.findIndex((s) => s.k === 'qcm' && s.niveaux.facile && s.niveaux.facile.length > 3 && s.niveaux.facile.some((x) => x[2].length >= 3));
    if (serieQcm < 0) return;
    const rang = s0(jeu.series[serieQcm]);
    const fen = { bas: 50, haut: 50, niveau: (j, si, n, i) => (j === jeu.id && si === serieQcm && n === 'facile' && i === rang ? 50 : 99) };
    for (let k = 0; k < 10; k++) {
      const c = S.generer({ jeux: [jeu.id], niveau: 'facile', mode: 'quiz', fenetre: fen }, 'histoire');
      expect(c).toBeTruthy();
      expect(c.niveau).toBe('facile');
    }
    function s0(s) { return s.niveaux.facile.findIndex((x) => x[2].length >= 3); }
  });
});

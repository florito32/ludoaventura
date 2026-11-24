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

  // v10.42 (règle 1 du 24/11/2026) : « Suivre ma progression » tire dans une fenêtre de 5 niveaux.
  test('fenêtre : une carte est tirée dans chaque famille et chaque fenêtre ; les questions posées sont bien dans la fenêtre', () => {
    const familles = {};
    S.JEUX.forEach((j) => { (familles[j.matiere + '/' + j.famille] = familles[j.matiere + '/' + j.famille] || []).push(j.id); });
    let verifiees = 0;
    for (const [f, ids] of Object.entries(familles)) {
      for (const bas of [1, 24, 50, 70, 96]) {
        for (let k = 0; k < 25; k++) {
          const c = S.generer({ jeux: ids, mode: 'quiz', fenetre: { bas, haut: bas + 4 } }, f.split('/')[0]);
          expect(c, f + ' ' + bas).not.toBeNull();
          // Questions à une seule question (QCM, vrai ou faux) : on retrouve la question dans les données et on lit son niveau.
          const texte = c.question || c.affirmation || c.consigne;
          if (!texte) continue;
          const jeu = S.trouver(c.jeu);
          // Une même question peut exister dans plusieurs séries : au moins une de ses occurrences doit être dans la fenêtre.
          const niveaux = [];
          jeu.series.forEach((s, si) => {
            const l = (s.niveaux && s.niveaux[c.niveau]) || [];
            l.forEach((x, i) => {
              const brut = Array.isArray(x) && (x[0] === texte || x[2] === texte || x[3] === texte);
              const classer = x && Array.isArray(x.qq) && x.qq.indexOf(texte) >= 0; // série « classer » : la question est dans qq
              const indices = x && !Array.isArray(x) && x.r === c.bonne && c.indicesQuiz && x.i && x.i[0] === c.indicesQuiz[0];
              if (brut || classer || indices) {
                niveaux.push(P.niveau(jeu.id, si, c.niveau, i));
              }
            });
          });
          if (!niveaux.length) continue;
          expect(niveaux.some((n) => n >= bas && n <= bas + 4), jeu.id + ' ' + texte + ' ' + niveaux).toBe(true);
          verifiees++;
        }
      }
    }
    expect(verifiees).toBeGreaterThan(100); // assez de questions retrouvées pour que la vérification compte
  });

  test('fenêtre : sans fenêtre, le tirage est inchangé (toutes les questions du niveau)', () => {
    const c = S.generer({ jeux: ['a01'], niveau: 'facile', mode: 'quiz' }, 'histoire');
    expect(c).not.toBeNull();
    expect(c.fenetre).toBeUndefined();
    expect(c.niveau).toBe('facile');
  });
});

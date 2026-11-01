// Générateur de questions : calculs justes, 4 choix différents, rien de négatif, difficulté par niveau.
const { test, expect } = require('@playwright/test');
const Q = require('../js/questions.js');
const { resoudre } = require('./aide');

test.describe('générateur de questions', () => {
  test.skip(({}, info) => info.project.name !== 'ordinateur', 'test de logique : un seul format suffit');

  for (const niveau of Object.keys(Q.NIVEAUX)) {
    test(`niveau ${niveau} : 5 lieux, réponses justes et choix valides`, () => {
      expect(Q.NIVEAUX[niveau].lieux).toHaveLength(5);
      for (let lieu = 0; lieu < 5; lieu++) {
        for (let n = 0; n < 300; n++) {
          const q = Q.generer(niveau, lieu);
          expect(Number.isInteger(q.reponse), q.texte).toBe(true);
          expect(q.reponse).toBeGreaterThanOrEqual(0);
          expect(resoudre(q.texte + ' = ?'), q.texte).toBe(q.reponse);
          expect(q.choix).toHaveLength(4);
          expect(new Set(q.choix).size).toBe(4);
          expect(q.choix).toContain(q.reponse);
          for (const c of q.choix) expect(c).toBeGreaterThanOrEqual(0);
        }
      }
    });
  }

  test('Moussaillon reste sous 10 dans les premiers lieux', () => {
    for (let lieu = 0; lieu < 4; lieu++) {
      for (let n = 0; n < 200; n++) {
        const q = Q.generer('moussaillon', lieu);
        expect(q.reponse).toBeLessThanOrEqual(10);
        for (const m of q.texte.match(/\d+/g)) expect(Number(m)).toBeLessThanOrEqual(10);
      }
    }
  });

  test('une série de 5 questions ne contient pas de doublon', () => {
    for (let n = 0; n < 50; n++) {
      const s = Q.serie('navigateur', 1, 5);
      expect(new Set(s.map((q) => q.texte)).size).toBe(5);
    }
  });
});

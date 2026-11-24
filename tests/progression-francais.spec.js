// Difficulté « progression » du Français, de 1 à 100 (demande du 23/11/2026) : logique seule, aucun écran.
const { test, expect } = require('@playwright/test');
const P = require('../js/progression-francais.js');
const Cartes = require('../js/cartes.js');
const Conj = require('../js/conjugaison.js');

test.describe('progression du Français (1 à 100)', () => {
  test.beforeEach(() => test.skip(test.info().project.name !== 'ordinateur', 'test de logique : un seul format suffit'));

  for (const matiere of ['orthographe', 'conjugaison', 'grammaire', 'phonemes']) {
    test(matiere + ' : les 100 niveaux existent, tous remplis, aucun hors de 1 à 100', () => {
      const table = P[matiere].table();
      const cles = Object.keys(table);
      expect(cles.length).toBeGreaterThanOrEqual(100);
      const rep = P.repartition(table);
      expect(rep).toHaveLength(100);
      rep.forEach((n, i) => expect(n, 'niveau ' + (i + 1)).toBeGreaterThan(0));
      // Répartition régulière : chaque niveau compte à peu près autant de cartes (écart d'une carte au plus).
      expect(Math.max(...rep) - Math.min(...rep)).toBeLessThanOrEqual(1);
    });
  }

  test('orthographe : mot court < mot long et piégeux ; type de question facile < difficile', () => {
    expect(P.orthographe.mot('LE')).toBeLessThan(P.orthographe.mot('THERMOMÈTRE'));
    expect(P.orthographe.mot('CHAT')).toBeLessThan(P.orthographe.mot('HYPERMARCHÉ'));
    expect(P.orthographe.carte('LE', 'nombre')).toBeLessThan(P.orthographe.carte('THERMOMÈTRE', 'melange'));
    expect(P.orthographe.carte('ZÈBRE', 'nombre')).toBeLessThan(P.orthographe.carte('ZÈBRE', 'melange'));
    // Série du fichier (1 à 5) : un mot de la série 5 monte plus haut qu'un mot de la série 1 de même longueur.
    const s1 = Cartes.PACKS.find((p) => p.id === 'animaux').niveaux[1][0], s5 = Cartes.PACKS.find((p) => p.id === 'animaux').niveaux[5][0];
    expect(P.orthographe.mot(s1)).toBeLessThan(P.orthographe.mot(s5));
  });

  test('conjugaison : présent avant subjonctif plus-que-parfait, verbe facile avant expert, 1er groupe avant 3e', () => {
    const facile = Conj.VERBES.find((v) => v.niveau === 'facile' && v.groupe === 1).inf;
    const expert = Conj.VERBES.find((v) => v.niveau === 'expert' && v.groupe === 3).inf;
    expect(P.conjugaison.carte(facile, 'indicatif.present', 0)).toBeLessThan(P.conjugaison.carte(facile, 'subjonctif.plus-que-parfait', 0));
    expect(P.conjugaison.carte(facile, 'indicatif.present', 0)).toBeLessThan(P.conjugaison.carte(expert, 'indicatif.present', 0));
    expect(P.conjugaison.carte(facile, 'indicatif.imparfait', 2)).toBeLessThan(P.conjugaison.carte(expert, 'indicatif.imparfait', 2));
    expect(P.conjugaison.carte('chanter', 'indicatif.futur', 0)).toBeLessThan(P.conjugaison.carte('chanter', 'indicatif.passe-anterieur', 0));
  });

  test('phonèmes : sons simples avant sons délicats ; jeu simple avant « Trier »', () => {
    expect(P.phonemes.difficulteSon('p')).toBeLessThan(P.phonemes.difficulteSon('9~'));
    expect(P.phonemes.carte('son', 'p', 'pomme')).toBeLessThan(P.phonemes.carte('trier', 'p', 'pomme'));
  });

  test('grammaire : un niveau Facile reste sous le niveau Expert du même jeu', () => {
    expect(P.grammaire.element('contraires', 'facile', 0)).toBeLessThan(P.grammaire.element('contraires', 'expert', 0));
    expect(P.grammaire.element('erreur', 'facile', 0)).toBeLessThan(P.grammaire.element('erreur', 'expert', 0));
  });
});

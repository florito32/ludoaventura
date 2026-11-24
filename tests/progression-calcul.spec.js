// Difficulté « progression » des calculs, de 1 à 100 (demande du 23/11/2026) : logique seule, aucun écran.
const { test, expect } = require('@playwright/test');
const P = require('../js/progression-calcul.js');
const K = require('../js/calcul.js');

test.describe('progression des calculs (1 à 100)', () => {
  test.beforeEach(() => test.skip(test.info().project.name !== 'ordinateur', 'test de logique : un seul format suffit'));

  function hasardFixe(graine) { let g = graine; return () => { g = (g * 1664525 + 1013904223) % 4294967296; return g / 4294967296; }; }

  test('99 seuils croissants, donc exactement 100 niveaux possibles', () => {
    expect(P.SEUILS).toHaveLength(99);
    for (let i = 1; i < 99; i++) expect(P.SEUILS[i]).toBeGreaterThanOrEqual(P.SEUILS[i - 1]);
    expect(P.niveauDuScore(-1)).toBe(1);
    expect(P.niveauDuScore(1e9)).toBe(100);
  });

  test('à nombres égaux : addition < soustraction < multiplication < division', () => {
    for (const [a, b] of [[12, 4], [96, 12], [48, 6], [360, 12]]) {
      const n = (op) => P.niveau([a, b], [op]);
      expect(n('plus')).toBeLessThan(n('moins'));
      expect(n('moins')).toBeLessThan(n('fois'));
      expect(n('fois')).toBeLessThan(n('divise'));
    }
  });

  test('petits nombres plus faciles que grands ; un signe plus facile que plusieurs', () => {
    for (const op of ['plus', 'moins', 'fois']) expect(P.niveau([3, 2], [op])).toBeLessThan(P.niveau([873, 214], [op]));
    expect(P.niveau([3, 4], ['plus'])).toBeLessThan(P.niveau([3, 4, 5], ['plus', 'plus']));
    expect(P.niveau([3, 4, 5], ['plus', 'plus'])).toBeLessThan(P.niveau([3, 4, 5, 6], ['plus', 'plus', 'plus']));
  });

  test('progression diffuse : 1 × 2 est plus facile que 745 − 356, une petite multiplication qu\'une grande addition', () => {
    expect(P.niveau([1, 2], ['fois'])).toBeLessThan(P.niveau([745, 356], ['moins']));
    expect(P.niveau([1, 1], ['plus'])).toBe(1);
    // Chevauchement : une soustraction à 3 chiffres avec emprunts dépasse une petite multiplication.
    expect(P.niveau([745, 356], ['moins'])).toBeGreaterThan(P.niveau([3, 4], ['fois']));
    // … et une grosse addition dépasse une petite soustraction.
    expect(P.niveau([4871, 3956], ['plus'])).toBeGreaterThan(P.niveau([9, 4], ['moins']));
  });

  test('calcul refusé par le jeu (résultat négatif) : pas de niveau', () => {
    expect(P.niveau([2, 5], ['moins'])).toBeNull();
  });

  test('les 100 niveaux existent : on sait tirer un calcul pour chacun', () => {
    const h = hasardFixe(99);
    for (let n = 1; n <= 100; n++) {
      const c = P.generer(n, h);
      expect(c.prog).toBe(n);
      expect(P.niveau(c)).toBe(n);
      expect(c.resultat).toBeGreaterThanOrEqual(0);
    }
  });

  test('le niveau moyen des calculs monte avec le niveau demandé (pas de blocs : ça se mélange)', () => {
    const h = hasardFixe(5);
    const signes = (n) => { let s = 0; for (let i = 0; i < 30; i++) s += P.generer(n, h).operations.length; return s / 30; };
    expect(signes(10)).toBeLessThan(signes(60));
    expect(signes(60)).toBeLessThan(signes(100));
    const tousNiveauxDuJeu = K.NIVEAUX.map((x) => x.id);
    expect(tousNiveauxDuJeu).toHaveLength(4);
  });
});

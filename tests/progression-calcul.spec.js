// Difficulté « progression » des calculs, de 1 à 100 (demandes du 23/11/2026 et du 24/11/2026, règle 3) : logique seule, aucun écran.
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

  // Règle 3 (24/11/2026) : l'échelle suit l'apprentissage du calcul.
  test('règle 3 : pour chaque opération, deux petits nombres < dizaines < centaines < milliers', () => {
    const echelle = {
      plus: [[3, 4], [23, 45], [234, 178], [2345, 1789]],
      moins: [[9, 4], [72, 38], [745, 356], [4871, 1956]],
      fois: [[7, 8], [23, 4], [23, 12], [234, 12]],
      divise: [[42, 6], [84, 4], [96, 12], [756, 3]],
    };
    for (const [op, paires] of Object.entries(echelle)) {
      const n = paires.map((p) => P.niveau(p, [op]));
      for (let i = 1; i < n.length; i++) expect(n[i], op + ' ' + paires[i]).toBeGreaterThan(n[i - 1]);
    }
  });

  test('règle 3 : addition < soustraction < multiplication < division, avec des nombres de même taille', () => {
    // deux petits nombres : 8 + 7 · 9 − 4 · 7 × 8 · 72 ÷ 8 (les divisions se font sur la table de 8)
    const n = [P.niveau([8, 7], ['plus']), P.niveau([9, 7], ['moins']), P.niveau([8, 7], ['fois']), P.niveau([56, 7], ['divise'])];
    for (let i = 1; i < n.length; i++) expect(n[i]).toBeGreaterThan(n[i - 1]);
    // dizaines
    const d = [P.niveau([34, 28], ['plus']), P.niveau([62, 28], ['moins']), P.niveau([34, 6], ['fois']), P.niveau([84, 6], ['divise'])];
    for (let i = 1; i < d.length; i++) expect(d[i]).toBeGreaterThan(d[i - 1]);
  });

  test('règle 3 : une addition de centaines est plus difficile qu\'une multiplication de deux petits nombres', () => {
    for (const [a, b] of [[745, 356], [234, 178], [500, 300], [123, 456]]) {
      for (const [x, y] of [[7, 8], [9, 9], [6, 7], [4, 5]]) expect(P.niveau([a, b], ['plus'])).toBeGreaterThan(P.niveau([x, y], ['fois']));
    }
  });

  test('règle 3 : les calculs les plus faciles sont des additions de deux petits nombres', () => {
    expect(P.niveau([1, 1], ['plus'])).toBeLessThanOrEqual(2);
    expect(P.niveau([2, 3], ['plus'])).toBeLessThan(P.niveau([5, 4], ['moins']));
    expect(P.niveau([2, 3], ['plus'])).toBeLessThan(P.niveau([2, 3], ['fois']));
  });

  test('fenêtre : on tire des calculs dont le niveau est dans les 5 niveaux demandés, pour toutes les fenêtres', () => {
    const h = hasardFixe(2026);
    for (let bas = 1; bas <= 96; bas++) {
      const c = P.genererDans(bas, bas + 4, h);
      expect(P.niveau(c), 'fenêtre ' + bas + ' à ' + (bas + 4)).toBeGreaterThanOrEqual(bas);
      expect(P.niveau(c)).toBeLessThanOrEqual(bas + 4);
    }
  });
});

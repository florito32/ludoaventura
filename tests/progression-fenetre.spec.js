// v10.39 (demande du 24/11/2026, règle 1) : fenêtre de 5 niveaux autour du niveau du profil, logique seule.
const { test, expect } = require('@playwright/test');
const F = require('../js/progression-fenetre.js');

test.describe('fenêtre de « Suivre ma progression »', () => {
  test.beforeEach(() => test.skip(test.info().project.name !== 'ordinateur', 'test de logique : un seul format suffit'));

  test('niveau 26 → questions de 24 à 28 (5 niveaux)', () => {
    expect(F.fenetre(26)).toEqual({ niveau: 26, bas: 24, haut: 28 });
  });

  test('toujours 5 niveaux, y compris aux deux bouts de l\'échelle', () => {
    for (let n = 0; n <= 100; n++) {
      const f = F.fenetre(n);
      expect(f.haut - f.bas + 1).toBe(5);
      expect(f.bas).toBeGreaterThanOrEqual(1);
      expect(f.haut).toBeLessThanOrEqual(100);
      expect(F.dans(f, f.niveau)).toBe(true);
    }
    expect(F.fenetre(0)).toEqual({ niveau: 1, bas: 1, haut: 5 }); // profil à 0 point = niveau 1
    expect(F.fenetre(1)).toEqual({ niveau: 1, bas: 1, haut: 5 });
    expect(F.fenetre(100)).toEqual({ niveau: 100, bas: 96, haut: 100 });
  });
});

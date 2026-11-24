// Partie rapide (v6.43, backlog lignes 202 à 205) ; solo, niveau, aventure du niveau, fin « Recommencer » / « Accueil » (v6.45, lignes 207 à 215).
const { test, expect } = require('@playwright/test');
const R = require('../js/rapide.js');
const K = require('../js/calcul.js');
const V = require('../js/conjugaison.js');
const A = require('../js/aventures.js');
const D = require('../js/defis.js');
const G = require('../js/grammaire.js');

test.describe('tirage de la partie rapide', () => {
  test.beforeEach(() => test.skip(test.info().project.name !== 'ordinateur', 'test de logique : un seul format suffit'));

  test('solo : un seul aventurier ; l’aventure suit le niveau (Facile → facile… Expert → difficile)', () => {
    const attendu = { facile: 'facile', moyen: 'moyen', difficile: 'difficile', expert: 'difficile' };
    for (const n of Object.keys(attendu)) {
      const vues = new Set();
      for (let k = 0; k < 200; k++) {
        const d = R.generer({ joueurs: 4, matieres: ['maths'], niveau: n });
        expect(d.joueurs).toBe(1);
        expect(d.aventuriers).toHaveLength(1);
        expect(d.niveau).toBe(n);
        expect(A.trouver(d.aventure).difficulte).toBe(attendu[n]);
        vues.add(d.aventure);
      }
      expect(vues.size).toBe(A.LISTE.filter((a) => a.difficulte === attendu[n]).length);
    }
    expect(R.generer({ matieres: ['maths'], niveau: 'n’importe quoi' }).niveau).toBe('facile');
  });

  test('chaque carte a la difficulté du niveau choisi (mêmes réglages que le défi du jour)', () => {
    for (const n of ['facile', 'moyen', 'difficile', 'expert']) {
      for (let k = 0; k < 400; k++) {
        const t = R.carte(['maths', 'francais'], n);
        if (t.maths) {
          expect(t.maths.niveau).toBe(n);
          expect(K.generer(t.maths).resultatTexte).toBeTruthy();
          if (n === 'facile') { expect(t.maths.centaines).toEqual([]); expect(t.maths.dizaines).toEqual([]); }
          if (n === 'expert') expect(t.maths.milliers).toEqual([1000]);
        }
        if (t.conj) {
          expect(t.conj.niveau).toBe(n);
          expect(V.generer(t.conj).bonne).toBeTruthy();
          if (n === 'facile') expect(t.conj.groupes).toEqual([1]);
        }
      }
      const o = R.ortho(n);
      expect(o.packs).toEqual(D.PACKS);
      expect(o.mots).toEqual(D.ORTHO[n].mots);
      expect(o.types).toEqual(D.ORTHO[n].types);
    }
    // v10.4 : Maths = calcul mental ou problème.
    const typesMaths = new Set();
    for (let k = 0; k < 300; k++) { const t = R.carte(['maths'], 'moyen'); expect(t.matiere).toBe('maths'); typesMaths.add(t.maths.type); }
    expect([...typesMaths].sort()).toEqual(['calcul', 'probleme']);
    // v6.55 : Français = orthographe, conjugaison ou grammaire (tous les jeux, au niveau choisi) ;
    // v10.43 : plus de phonèmes (devenus le mini-jeu « Les sons »).
    const vues = new Set();
    for (let k = 0; k < 400; k++) {
      const t = R.carte(['francais'], 'moyen');
      expect(['orthographe', 'conjugaison', 'grammaire']).toContain(t.matiere);
      if (t.matiere === 'grammaire') expect(t.gram).toEqual({ niveau: 'moyen', jeux: G.JEUX.map((j) => j.id) });
      vues.add(t.matiere);
    }
    expect(vues.size).toBe(3);
    // Partie rapide gardée d'avant la v6.45 (sans niveau) : tout coché, comme avant.
    expect(R.carte(['maths']).maths.signes).toHaveLength(4);
  });
});

// L'écran, le lancement et le plateau de la « Partie rapide » ont été retirés le 24/11/2026 (backlog ligne 519) : seul le tirage des cartes reste (défi du jour).

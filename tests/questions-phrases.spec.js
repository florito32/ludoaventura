// Questions d'histoire et de géographie écrites en vraies phrases (demande du 17/11/2026, BACKLOG) :
// jamais de deux-points dans une question, plus de « Lequel va avec : « … » ? », articles accordés.
const { test, expect } = require('@playwright/test');
const S = require('../js/savoirs.js');
const A = require('../js/articles.js');
require('../js/geographie.js');
require('../js/histoire.js');

const NIVEAUX = ['facile', 'moyen', 'difficile', 'expert'];

test.describe('questions en phrases', () => {
  test.beforeEach(() => test.skip(test.info().project.name !== 'ordinateur', 'test de logique : un seul format suffit'));

  test('aucune question d’histoire ou de géographie ne contient de deux-points ni de modèle non rempli', () => {
    const fautes = new Set();
    for (const matiere of ['geographie', 'histoire']) {
      for (const j of S.jeuxDe(matiere)) {
        for (const niveau of NIVEAUX) {
          for (const mode of ['quiz', 'normal']) {
            for (let k = 0; k < 120; k++) {
              const c = S.generer({ jeux: [j.id], niveau, mode }, matiere);
              if (!c) continue;
              for (const q of [c.consigne, c.question].filter(Boolean)) {
                if (/:|\{|\}|undefined|Lequel va avec/.test(q)) fautes.add(j.id + ' → ' + q);
              }
            }
          }
        }
      }
    }
    expect([...fautes]).toEqual([]);
  });

  test('le quiz « classer » pose une vraie question (capture du 17/11/2026, Louis XIV et son temps)', () => {
    for (let k = 0; k < 200; k++) {
      const c = S.generer({ jeux: ['t01'], niveau: 'facile', mode: 'quiz' }, 'histoire');
      if (!c || !/gestes/.test(c.consigne)) continue;
      expect(['Lequel de ces gestes se faisait déjà à la cour de Louis XIV ?', 'Lequel de ces gestes n’existe que de nos jours ?']).toContain(c.consigne);
      expect(c.question).toBeUndefined();
      return;
    }
    throw new Error('aucune question « classer » tirée');
  });

  test('articles des noms de lieux', () => {
    expect(A.de('Togo')).toBe('du Togo');
    expect(A.de('France')).toBe('de la France');
    expect(A.de('Iran')).toBe('de l’Iran');
    expect(A.de('Pays-Bas')).toBe('des Pays-Bas');
    expect(A.de('Cuba')).toBe('de Cuba');
    expect(A.de('Israël')).toBe('d’Israël');
    expect(A.le('Lesotho')).toBe('le Lesotho');
    expect(A.le('La tour Eiffel')).toBe('la tour Eiffel');
    expect(A.le('Le Caire')).toBe('Le Caire');
    expect(A.de('Le Caire')).toBe('du Caire');
    expect(A.de('La Réunion|Réunion')).toBe('de La Réunion');
    expect(A.en('Japon')).toBe('au Japon');
    expect(A.en('L’Amérique du Sud')).toBe('en Amérique du Sud');
    expect(A.en('États-Unis')).toBe('aux États-Unis');
    expect(A.a('Les frères Lumière')).toBe('aux frères Lumière');
    expect(A.le('Bouches-du-Rhône')).toBe('les Bouches-du-Rhône');
    // Tous les pays et tous les départements ont leur article.
    const G = require('../js/geographie.js');
    const sans = G.MONDE.map((p) => p[1].split('|')[0]).concat(G.DEPARTEMENTS.map((d) => d[1].split('|')[0]))
      .filter((n) => !A.GENRES[n] && !/^(La|Le|Les) /.test(n));
    expect(sans).toEqual([]);
  });

  test('exemples de phrases', () => {
    const CG = require('../js/cartes-geo.js');
    const c = CG.tirer('france', 'facile', () => 0, 'normal');
    expect(c.consigne).toMatch(/^Touche .+ sur la carte\.$/);
    expect(c.consigne).not.toContain(':');
  });
});

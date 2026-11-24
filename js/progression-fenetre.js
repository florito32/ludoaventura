// Fenêtre de « Suivre ma progression » (v10.39, demande du 24/11/2026, règle 1) : un joueur dont le niveau de profil dans une
// sous-matière est N (1 à 100) reçoit des questions de niveau N − 2 à N + 2, soit 5 niveaux (ex. 26 → 24 à 28).
// Aux deux bouts de l'échelle, la fenêtre garde ses 5 niveaux en se décalant (1 → 1 à 5 ; 100 → 96 à 100) : hypothèse à valider.
// Un profil à 0 point est au niveau 1. Module sans interface : dans la page (window.ProgressionFenetre) et dans les tests Node.
(function (racine) {
  'use strict';
  var LARGEUR = 5, ECART = 2;
  function niveauDeScore(score) { return Math.max(1, Math.min(100, Math.round(Number(score) || 0))); }
  // { niveau, bas, haut } pour un score de profil (0 à 100).
  function fenetre(score) {
    var n = niveauDeScore(score), bas = Math.max(1, Math.min(100 - LARGEUR + 1, n - ECART));
    return { niveau: n, bas: bas, haut: bas + LARGEUR - 1 };
  }
  // Un niveau de question est-il dans la fenêtre ?
  function dans(f, niveau) { return niveau >= f.bas && niveau <= f.haut; }
  var api = { LARGEUR: LARGEUR, ECART: ECART, niveauDeScore: niveauDeScore, fenetre: fenetre, dans: dans };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else racine.ProgressionFenetre = api;
})(this);

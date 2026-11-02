// Déroulement d'une partie d'Aventura (règles de l'utilisateur, Règles.docx + précisions du 02/11/2026).
//  - Manche par manche : tous les joueurs vont sur la croix 1, puis tous sur la croix 2… jusqu'à l'ARRIVÉE (croix 5).
//  - À son tour, le joueur avance son pion sur la croix, pioche une carte dans SON tas,
//    le maître du jeu dit si la réponse est bonne :
//      bonne réponse → dé FORT ; mauvaise réponse (après aide des autres) → dé FAIBLE.
//  - Les points du dé s'ajoutent aux points de l'ÉQUIPE (cumulés).
//  - Quand tous ont répondu à la case ARRIVÉE : l'équipe réussit si points ≥ objectif de l'aventure.
// Module sans interface (machine à états) : utilisable dans la page (window.Regles) et dans les tests Node.
(function (racine) {
  'use strict';

  var NB_CROIX = 5; // croix 1 à 4 + ARRIVÉE (volcan)
  var DES = typeof module !== 'undefined' && module.exports ? require('./des.js') : racine.Des;

  // Étapes d'un tour : piocher → repondre → lancer → suivant (ou fin).
  function nouvellePartie(nbJoueurs, objectif) {
    var p = {
      nbJoueurs: nbJoueurs, objectif: objectif, points: 0,
      manche: 1, joueur: 0, etape: 'piocher', de: null, dernierLancer: null,
      positions: [], pioches: [], historique: []
    };
    for (var i = 0; i < nbJoueurs; i++) { p.positions.push(0); p.pioches.push(0); }
    p.positions[0] = 1; // le premier joueur pose son pion sur la première croix
    return p;
  }

  function verifier(p, etape) {
    if (p.etape !== etape) throw new Error('Étape attendue : ' + etape + ', étape actuelle : ' + p.etape);
  }

  function piocher(p) {
    verifier(p, 'piocher');
    p.pioches[p.joueur]++;
    p.etape = 'repondre';
    return p;
  }

  function repondre(p, bonne) {
    verifier(p, 'repondre');
    p.de = bonne ? 'fort' : 'faible';
    p.etape = 'lancer';
    return p;
  }

  // valeur : résultat du dé (tiré au hasard si absent).
  function lancer(p, valeur) {
    verifier(p, 'lancer');
    if (valeur === undefined) valeur = DES.lancer(p.de);
    if (DES.FACES[p.de].indexOf(valeur) === -1) throw new Error('Valeur impossible pour le dé ' + p.de + ' : ' + valeur);
    p.points += valeur;
    p.dernierLancer = valeur;
    p.historique.push({ manche: p.manche, joueur: p.joueur, de: p.de, points: valeur });
    var dernier = p.manche === NB_CROIX && p.joueur === p.nbJoueurs - 1;
    p.etape = dernier ? 'fin' : 'suivant';
    return p;
  }

  function suivant(p) {
    verifier(p, 'suivant');
    p.joueur++;
    if (p.joueur >= p.nbJoueurs) { p.joueur = 0; p.manche++; }
    p.positions[p.joueur] = p.manche; // le joueur avance son pion sur la croix de la manche
    p.de = null;
    p.dernierLancer = null;
    p.etape = 'piocher';
    return p;
  }

  function reussie(p) { return p.points >= p.objectif; }

  var api = {
    NB_CROIX: NB_CROIX, nouvellePartie: nouvellePartie,
    piocher: piocher, repondre: repondre, lancer: lancer, suivant: suivant, reussie: reussie
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else racine.Regles = api;
})(this);

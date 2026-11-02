// Les deux dés d'Aventura (règles de l'utilisateur, 02/11/2026) :
//   dé FAIBLE : 2 faces à 1, 2 faces à 2, 2 faces à 3 point(s)
//   dé FORT   : 2 faces à 4, 2 faces à 5, 2 faces à 6 points
// Module sans interface : utilisable dans la page (window.Des) et dans les tests Node.
(function (racine) {
  'use strict';

  var FACES = {
    faible: [1, 1, 2, 2, 3, 3],
    fort: [4, 4, 5, 5, 6, 6]
  };

  // Lance un dé : renvoie la valeur d'une face tirée au hasard.
  function lancer(type, rng) {
    var faces = FACES[type];
    return faces[Math.floor((rng || Math.random)() * faces.length)];
  }

  // Positions des points sur une face (grille 3 × 3, cases numérotées de 0 à 8).
  var POINTS = {
    1: [4], 2: [0, 8], 3: [0, 4, 8],
    4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8]
  };

  var api = { FACES: FACES, POINTS: POINTS, lancer: lancer };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else racine.Des = api;
})(this);

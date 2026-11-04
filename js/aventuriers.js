// Les 10 aventuriers qu'on peut choisir en début de partie.
// Illustrations de l'utilisateur (v6.19), préparées par outils/personnages.py : bustes img/aventuriers/<id>.webp,
// corps entiers img/aventuriers/<id>-pied.webp.
// Module sans interface : utilisable dans la page (window.Aventuriers) et dans les tests Node.
(function (racine) {
  'use strict';

  var LISTE = [
    { id: 'lea', nom: 'Léa', titre: 'l’exploratrice' },
    { id: 'tom', nom: 'Tom', titre: 'le grimpeur' },
    { id: 'nour', nom: 'Nour', titre: 'la navigatrice' },
    { id: 'malo', nom: 'Malo', titre: 'le petit savant' },
    { id: 'ines', nom: 'Inès', titre: 'la botaniste' },
    { id: 'jo', nom: 'Papi Jo', titre: 'le vieux pêcheur' },
    { id: 'kenji', nom: 'Kenji', titre: 'le cartographe' },
    { id: 'zoe', nom: 'Zoé', titre: 'la photographe' },
    { id: 'sam', nom: 'Sam', titre: 'le pisteur' },
    { id: 'awa', nom: 'Awa', titre: 'la cheffe d’expédition' }
  ];
  LISTE.forEach(function (a) {
    a.image = 'img/aventuriers/' + a.id + '.webp'; // buste (choix, panneau du tour)
    a.pied = 'img/aventuriers/' + a.id + '-pied.webp'; // corps entier (plateau, js/figurines.js)
  });

  function trouver(id) {
    for (var i = 0; i < LISTE.length; i++) if (LISTE[i].id === id) return LISTE[i];
    return null;
  }

  var api = { LISTE: LISTE, trouver: trouver };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else racine.Aventuriers = api;
})(this);

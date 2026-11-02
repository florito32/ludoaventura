// Les 10 aventures d'Aventura (anciennes cartes « Mission » des livrets de règles).
// Textes repris des livrets pour les 5 premières ; les 5 suivantes n'existent qu'en image
// (noms supposés, à valider). Objectif choisi par l'utilisateur le 02/11/2026 :
// points par joueur selon la difficulté (Facile 15, Moyen 18, Difficile 21) × nombre de joueurs.
// Module sans interface : utilisable dans la page (window.Aventures) et dans les tests Node.
(function (racine) {
  'use strict';

  var POINTS_PAR_JOUEUR = { facile: 15, moyen: 18, difficile: 21 };

  var LISTE = [
    { id: 'viking', nom: 'Viking', difficulte: 'facile', unite: 'troncs d’arbre à couper', image: 'img/aventures/viking.webp',
      histoire: 'Les Vikings vivaient il y a plus de 1000 ans dans les pays du nord. Ils possédaient les navires les plus rapides du monde qu’on appelle « Drakkar ». Votre pire ennemi, Ragnar, vous a volé des troncs d’arbres, vous ne pouvez donc plus finir la construction de vos navires de guerre. À vous de trouver les troncs d’arbre pour fabriquer un de ces navires légendaires.' },
    { id: 'chevalier', nom: 'Chevalier', difficulte: 'facile', unite: 'épées à forger', image: 'img/aventures/chevalier.webp',
      histoire: 'Les chevaliers sont redoutables, ils protègent leurs terres. Votre pire ennemi, Charles dit « Le Terrible », est en route pour votre château avec une armée de soldats d’infanterie. L’armée ennemie arrivera par l’Est à l’aube du septième jour. À vous de forger assez d’épées pour assurer la sécurité du donjon.' },
    { id: 'prehistoire', nom: 'Préhistoire', difficulte: 'moyen', unite: 'silex à trouver', image: 'img/aventures/prehistoire.svg',
      histoire: 'Les hommes de la préhistoire ont fait la plus grande découverte de l’histoire, le FEU. Pour faire apparaître du feu, il faut frapper 2 silex entre eux. Il vous faut allumer un grand feu pour réchauffer votre tribu et éloigner les prédateurs. À vous de trouver assez de silex pour allumer un grand feu au fond de la caverne.' },
    { id: 'mayas', nom: 'Mayas', difficulte: 'moyen', unite: 'pierres à tailler', image: 'img/aventures/mayas.webp',
      histoire: 'Les Mayas ont construit des pyramides afin d’honorer leur dieu « Kukulkan », le dieu serpent. Vous êtes les constructeurs d’une de ces pyramides et il faut la finir avant la prochaine pleine lune. À vous de tailler les pierres qu’il vous manque ou la colère du dieu Kukulkan se fera entendre.' },
    { id: 'savane', nom: 'Savane', difficulte: 'difficile', unite: 'gazelles à chasser', image: 'img/aventures/savane.webp',
      histoire: 'Le lion est le roi des animaux. La saison sèche approche et votre ennemi de la savane, Karkan, a éloigné le troupeau de gazelles pour vous empêcher de nourrir votre meute de lions, lionnes et lionceaux. À vous de chasser assez de gazelles pour votre meute.' },
    { id: 'egypte', nom: 'Égypte', difficulte: 'moyen', unite: 'points', image: 'img/aventures/egypte.webp', histoire: '' },
    { id: 'chine', nom: 'Chine', difficulte: 'moyen', unite: 'points', image: 'img/aventures/chine.webp', histoire: '' },
    { id: 'far-west', nom: 'Far West', difficulte: 'facile', unite: 'points', image: 'img/aventures/far-west.webp', histoire: '' },
    { id: 'druides', nom: 'Druides', difficulte: 'difficile', unite: 'points', image: 'img/aventures/druides.webp', histoire: '' },
    { id: 'incas', nom: 'Incas', difficulte: 'difficile', unite: 'points', image: 'img/aventures/incas.webp', histoire: '' }
  ];

  // Nombre de points que l'équipe doit atteindre pour réussir l'aventure.
  function objectif(aventure, nbJoueurs) {
    return POINTS_PAR_JOUEUR[aventure.difficulte] * nbJoueurs;
  }

  function trouver(id) {
    for (var i = 0; i < LISTE.length; i++) if (LISTE[i].id === id) return LISTE[i];
    return null;
  }

  var api = { LISTE: LISTE, POINTS_PAR_JOUEUR: POINTS_PAR_JOUEUR, objectif: objectif, trouver: trouver };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else racine.Aventures = api;
})(this);

// Numéro de version du site + historique des changements.
// À chaque mise en ligne : incrémenter VERSION et ajouter une entrée en tête de HISTORY.
// Le badge s'insère dans tout élément portant l'attribut [data-version].
(function () {
  'use strict';

  var VERSION = '3.8';

  var HISTORY = [
    { v: '3.8', date: '2026-11-02', changes: [
      'Tour de jeu : la mention « Croix 1 sur 5 — la prairie » n\u2019est plus affichée.'
    ] },
    { v: '3.7', date: '2026-11-02', changes: [
      'Points de l\u2019équipe : le chiffre n\u2019est plus écrit deux fois (ombre décalée retirée), il reste seulement en rouge.'
    ] },
    { v: '3.6', date: '2026-11-02', changes: [
      'Encadré des points horizontal : la construction à gauche, le comptage des points à sa droite. Sur téléphone, il ne cache plus la croix de la prairie.'
    ] },
    { v: '3.5', date: '2026-11-02', changes: [
      'Sur la carte, nouveau bouton « Voir le mot » à côté de « Voir la réponse » : le mot seul, comme une aide avant la solution.'
    ] },
    { v: '3.4', date: '2026-11-02', changes: [
      'Après l\u2019animation « Bravo ! » ou « Oups ! », le bon dé (FORT ou FAIBLE) se lance tout seul. Le bouton reste là pour le lancer plus tôt.'
    ] },
    { v: '3.3', date: '2026-11-02', changes: [
      'Préparation : bouton « Mêmes réglages pour tous les joueurs » (mêmes packs, même niveau, mêmes questions).'
    ] },
    { v: '3.2', date: '2026-11-02', changes: [
      'Huit types de questions : épeler, nombre de lettres, syllabes, consonnes, voyelles, première lettre, lettres muettes, réécrire le mot.',
      'À la préparation, chaque joueur coche les questions qu\u2019il veut ; chaque carte en tire une au hasard.',
      '« Voir la réponse » montre le mot et la réponse attendue (lettres muettes surlignées). La voix lit la question tirée.'
    ] },
    { v: '3.1', date: '2026-11-02', changes: [
      'Sous les points, ce que l\u2019équipe construit (drakkar, épées, grand feu, pyramide…) se construit étape par étape au fil des points, et il est complet quand l\u2019objectif est atteint.'
    ] },
    { v: '3.0', date: '2026-11-02', changes: [
      'Bonne réponse : le pion saute, des confettis éclatent et « Bravo ! » s\u2019affiche.',
      'Mauvaise réponse : le pion tremble et « Oups ! » s\u2019affiche.'
    ] },
    { v: '2.9', date: '2026-11-02', changes: [
      'Quand on lance le dé, un vrai dé roule sur le plateau, rebondit et montre les points gagnés.'
    ] },
    { v: '2.8', date: '2026-11-02', changes: [
      'Les points de l\u2019équipe sont affichés dans un encadré en haut à gauche du plateau.',
      'Plateau épuré : plus d\u2019encadrés Joueurs, Dés, Tas de cartes ni Ambiance.',
      'L\u2019ambiance jour ou soir se règle toute seule selon l\u2019aventure.',
      'En début de partie, le premier aventurier part de DÉPART et marche jusqu\u2019à la prairie.',
      'Après le dé, c\u2019est écrit (« Léa gagne 5 points ! Au tour de Tom. ») et on passe tout seul au joueur suivant.'
    ] },
    { v: '2.7', date: '2026-11-02', changes: [
      'Illustrations des aventures plus élaborées, dans l\u2019esprit du dessin de l\u2019aventurier : trait d\u2019encre irrégulier, hachures dans les ombres, couleurs peintes et grain de papier, plus de détails.'
    ] },
    { v: '2.6', date: '2026-11-02', changes: [
      'Les cartes JEU arrivent : 300 cartes en 5 packs (Mots simples, Mots compliqués, Temps, Numérique, Lettres), 3 niveaux chacun.',
      'À la préparation, chaque joueur choisit les packs où il pioche et son niveau.',
      'Dictée : le mot reste caché, « Voir le mot » permet de vérifier. Pour les lettres : « Quelle est cette lettre ? ».',
      'Bouton « Écouter » : une voix lit la carte à haute voix.'
    ] },
    { v: '2.5', date: '2026-11-02', changes: [
      'Toutes les aventures ont maintenant une illustration dessinée, dans le style du plateau (comme Préhistoire) à la place des photos.'
    ] },
    { v: '2.4', date: '2026-11-02', changes: [
      'On joue ! Chacun son tour, le joueur avance sur la croix et pioche une carte dans son propre tas.',
      'Le maître du jeu indique si la réponse est bonne : bonne réponse = dé FORT, mauvaise réponse = aide des autres puis dé FAIBLE.',
      'Les points du dé s\u2019ajoutent aux points de l\u2019équipe ; tous les joueurs passent une croix avant d\u2019aller à la suivante.',
      'À l\u2019ARRIVÉE : aventure réussie si l\u2019équipe atteint l\u2019objectif, avec « Rejouer » ou « Nouvelle partie ».',
      'Les cartes n\u2019ont pas encore de questions : le maître du jeu pose les siennes.'
    ] },
    { v: '2.3', date: '2026-11-02', changes: [
      'Chaque joueur choisit son aventurier parmi 10 personnages : Léa, Tom, Nour, Malo, Inès, Papi Jo, Kenji, Zoé, Sam et Awa.',
      'Le portrait de l\u2019aventurier apparaît sur son pion, dans la liste des joueurs et sur son tas de cartes.'
    ] },
    { v: '2.2', date: '2026-11-02', changes: [
      'Nouvel écran « Préparer la partie » : nombre de joueurs (1 à 4) et choix de l\u2019aventure parmi 10.',
      'Le nom et l\u2019image de l\u2019aventure s\u2019affichent sur le rouleau du plateau, à la place de « MISSION ».',
      'Objectif de l\u2019équipe affiché avec une jauge : 15, 18 ou 21 points par joueur selon la difficulté de l\u2019aventure.',
      'Chaque joueur a son propre tas de cartes, de la couleur de son pion (rouge, jaune, bleu, vert).'
    ] },
    { v: '2.1', date: '2026-11-02', changes: [
      'Les dés se lancent en les touchant.',
      'Dé FAIBLE : 2 faces à 1, 2 faces à 2, 2 faces à 3 points. Dé FORT : 2 faces à 4, 2 faces à 5, 2 faces à 6 points.'
    ] },
    { v: '2.0', date: '2026-11-02', changes: [
      'Le jeu devient Aventura, avec les vraies illustrations du jeu de société.',
      'Accueil composé comme la boîte : arche « Aventura », aventurier, décor et herbes.',
      'Plateau illustré avec les 4 pions sur la case DÉPART, les points de l\u2019équipe, les dés FAIBLE et FORT et les piles de cartes.',
      'Ambiance Jour ou Soir (les deux versions du plateau).',
      'Pas encore de questions : visuel seulement. Le jeu de calcul de la v1.0 est retiré.'
    ] },
    { v: '1.0', date: '2026-11-01', changes: [
      'Première version de Ludoaventura : l\u2019île aux calculs.',
      'Quatre niveaux : Moussaillon (dès 5 ans), Matelot (dès 7 ans), Navigateur (dès 9 ans), Capitaine (ados et adultes).',
      'Cinq lieux à traverser (plage, forêt, rivière, grotte, volcan), 5 calculs par lieu, jusqu\u2019à 3 étoiles.',
      'Progression mémorisée sur l\u2019appareil, jouable hors ligne et installable comme une application.'
    ] }
  ];

  // Construit la fenêtre d'historique (élément <dialog> natif, accessible au clavier).
  function buildDialog() {
    var dialog = document.createElement('dialog');
    dialog.className = 'version-dialog';
    dialog.setAttribute('aria-labelledby', 'version-title');

    var html = '<h2 id="version-title">Historique des versions</h2><ol class="version-list">';
    HISTORY.forEach(function (item) {
      html += '<li><h3>v' + item.v + ' <time datetime="' + item.date + '">' +
        new Date(item.date + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) +
        '</time></h3><ul>';
      item.changes.forEach(function (c) { html += '<li>' + c + '</li>'; });
      html += '</ul></li>';
    });
    html += '</ol><form method="dialog"><button class="version-close">Fermer</button></form>';
    dialog.innerHTML = html;

    // Clic sur le fond (hors contenu) : fermeture.
    dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
    document.body.appendChild(dialog);
    return dialog;
  }

  function init() {
    var slots = document.querySelectorAll('[data-version]');
    if (!slots.length) return;
    var dialog = buildDialog();
    slots.forEach(function (slot) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'version-badge';
      // Texte visible « v1.x » + précision réservée aux lecteurs d'écran.
      btn.innerHTML = 'v' + VERSION + '<span class="visually-hidden"> — historique des versions</span>';
      btn.setAttribute('aria-haspopup', 'dialog');
      btn.addEventListener('click', function () { dialog.showModal(); });
      slot.appendChild(btn);
    });
  }

  window.SITE_VERSION = VERSION;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

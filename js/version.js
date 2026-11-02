// Numéro de version du site + historique des changements.
// À chaque mise en ligne : incrémenter VERSION et ajouter une entrée en tête de HISTORY.
// Le badge s'insère dans tout élément portant l'attribut [data-version].
(function () {
  'use strict';

  var VERSION = '2.3';

  var HISTORY = [
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

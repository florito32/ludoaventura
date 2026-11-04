// Numéro de version du site + historique des changements.
// À chaque mise en ligne : incrémenter VERSION et ajouter une entrée en tête de HISTORY.
// Le badge s'insère dans tout élément portant l'attribut [data-version].
(function () {
  'use strict';

  var VERSION = '6.14';

  var HISTORY = [
    { v: '6.14', date: '2026-11-04', changes: [
      "Orthographe : pour le nombre de lettres, le nombre de syllabes, les consonnes, les voyelles et les lettres muettes, le joueur écrit lui-même sa réponse et le jeu la corrige. Plusieurs lettres peuvent être séparées par un espace, une virgule ou rien du tout (« a i o », « a,i,o » ou « aio ») ; les accents ne comptent pas.",
      "La question « Syllabes » devient « Nombre de syllabes » : on écrit combien il y en a, la correction montre le découpage.",
      "« Épeler » et « Réécrire le mot » restent à l\u2019oral, avec « Bonne réponse » / « Mauvaise réponse »."
    ] },
    { v: '6.13', date: '2026-11-04', changes: [
      "Téléphone et tablette : quand tu écris ta réponse, la carte se pose par-dessus le plateau et prend toute la place au-dessus du clavier. Rien n\u2019est caché par le clavier ni coupé en haut ; la case de réponse est juste au-dessus du clavier.",
      "Après « Valider », ou si tu refermes le clavier, le plateau revient tout seul."
    ] },
    { v: '6.12', date: '2026-11-04', changes: [
      "Mathématiques : les signes +, −, × et ÷ sont seuls dans des ronds, sur une seule ligne (le mot « Additionner » ne tenait pas dans sa case).",
      "Nouveaux choix : les dizaines (30 = les nombres de 30 à 39) et les centaines (300 = les nombres de 300 à 399), en plus des unités de 1 à 10. Au niveau Facile, ce sont des tables (30 → tables de 30 à 39).",
      "Un bouton « Tout sélectionner / Tout désélectionner » pour les unités, les dizaines et les centaines.",
      "Niveaux Moyen, Difficile et Expert : il faut choisir au moins 4 nombres (unités, dizaines et centaines comptées ensemble)."
    ] },
    { v: '6.11', date: '2026-11-04', changes: [
      "Ouverture de l\u2019application installée : sur iPhone, l\u2019écran de lancement est l\u2019image de l\u2019accueil en plein écran (aventurier, arche et boutons), sans saut à l\u2019arrivée sur l\u2019accueil.",
      "Sur Android, le téléphone fabrique lui-même cet écran (petite icône au centre) : son fond passe du vert au bleu du ciel de l\u2019accueil pour s\u2019y fondre. Le changement arrive sur le téléphone en général sous un ou deux jours, ou tout de suite en réinstallant l\u2019application."
    ] },
    { v: '6.10', date: '2026-11-04', changes: [
      "Accueil : la bulle de Ludo se place en haut, dans le ciel, et ne cache plus sa tête ni l\u2019arche « Aventura ». Sur les petits écrans sans assez de ciel, elle se fait plus étroite et se pose à côté de Ludo, dans l\u2019herbe."
    ] },
    { v: '6.9', date: '2026-11-03', changes: [
      "Ludo, l\u2019aventurier de l\u2019accueil, devient le guide du jeu. Au premier démarrage, il se présente et propose de montrer comment jouer ; le bouton « Didacticiel avec Ludo » de l\u2019accueil le relance.",
      "Didacticiel : à chaque écran de la préparation et pendant le premier tour, Ludo explique l\u2019étape dans une bulle de bande dessinée et une flèche rouge, qui grandit et rétrécit, montre où toucher.",
      "Pendant une partie, Ludo attend en bas à gauche : touche-le pour savoir quoi faire sur l\u2019écran en cours."
    ] },
    { v: '6.8', date: '2026-11-03', changes: [
      "Plateau : la page ne défile plus jamais, sur tous les écrans (ordinateur et téléphone en paysage compris). Sur un écran large, le plateau prend toute la hauteur et le tour de jeu est à droite ; s\u2019il manque de place (correction, tableau « ? »), l\u2019encadré s\u2019élargit par-dessus le plateau. Les boutons restent toujours à l\u2019écran.",
      "Correction : au tout début de la partie, toucher « Piocher une carte » au mauvais moment pouvait ne rien faire."
    ] },
    { v: '6.7', date: '2026-11-03', changes: [
      "Préparation, conjugaison : les groupes de verbes et le niveau sont en grands boutons qui prennent toute la place de l\u2019écran."
    ] },
    { v: '6.6', date: '2026-11-03', changes: [
      "Préparation, conjugaison : chaque mode choisi (indicatif, conditionnel…) est un cadre qui entoure ses propres temps, rangés l\u2019un sous l\u2019autre, pour ne pas se tromper de mode. Les cadres et les boutons prennent toute la place de l\u2019écran."
    ] },
    { v: '6.5', date: '2026-11-03', changes: [
      "Préparation, réglages Orthographe : packs et questions en grille de boutons de même taille, qui remplit l\u2019écran (4 par ligne sur un écran large, 2 sur un écran en hauteur)."
    ] },
    { v: '6.4', date: '2026-11-03', changes: [
      "Préparation, réglages Mathématiques : les choix sont centrés et prennent toute la place de l\u2019écran. Signes en grand sur deux lignes (Additionner et Soustraire, puis Multiplier et Diviser), nombres sur deux lignes (1 à 5, puis 6 à 10)."
    ] },
    { v: '6.3', date: '2026-11-03', changes: [
      "Conjugaison : chaque mode choisi doit avoir au moins un de ses temps. Avec Indicatif et Conditionnel, choisir seulement un temps de l\u2019indicatif est maintenant refusé, avec un message qui dit quel mode n\u2019a pas de temps."
    ] },
    { v: '6.2', date: '2026-11-03', changes: [
      'Téléphones et tablettes : le jeu tient dans l\u2019écran, on n\u2019a plus à faire défiler. Quand la correction ou le tableau « ? » ne tiennent plus sous le plateau, l\u2019encadré Tour de jeu remonte sur le plateau, juste de ce qu\u2019il faut ; il redescend quand le dé roule.',
      'Après une réponse écrite, la case disparaît et la correction rappelle ce qui a été écrit (« tu as écrit … »).'
    ] },
    { v: '6.1', date: '2026-11-03', changes: [
      'Après une erreur (mathématiques, orthographe ou conjugaison), la bonne réponse reste affichée et le dé attend que le joueur touche « J\u2019ai compris » (ce bouton s\u2019appelait « C\u2019est bon pour moi »). Une bonne réponse lance toujours le dé tout seul.'
    ] },
    { v: '6.0', date: '2026-11-03', changes: [
      'Conjugaison en trois petits écrans : la matière (Français → Conjugaison), puis les modes (indicatif, conditionnel, subjonctif, impératif) avec seulement les temps de ces modes, puis les groupes de verbes et le niveau.'
    ] },
    { v: '5.9', date: '2026-11-03', changes: [
      'Mathématiques : le niveau se choisit tout de suite, sur le même écran que « Mathématiques ».',
      'Niveau Facile : les nombres choisis sont des tables. Table de 2 → 2 × 8, 2 + 6, 12 − 2, 16 ÷ 2…, selon les signes choisis. Les autres niveaux ne changent pas.'
    ] },
    { v: '5.8', date: '2026-11-03', changes: [
      'Français → Conjugaison : chaque joueur choisit ses temps (rangés par mode : indicatif, conditionnel, subjonctif, impératif), les groupes de verbes et le niveau (des verbes de plus en plus rares).',
      'À chaque carte : un pronom, un verbe et un temps ; le joueur écrit la forme et le jeu la corrige. Si c\u2019est faux, la bonne réponse s\u2019affiche avec un « ? » qui montre toute la conjugaison du verbe à ce temps ; « C\u2019est bon pour moi » lance le dé.'
    ] },
    { v: '5.7', date: '2026-11-03', changes: [
      'Préparation, étape 3 : chaque joueur choisit d\u2019abord sa matière, Mathématiques ou Français (puis Orthographe).',
      'Mathématiques : choix des signes (+, −, ×, ÷), des nombres de 1 à 10 et du niveau (Facile = 1 signe, Moyen = 2, Difficile = 3, Expert = 4). À chaque carte, une formule ; le joueur écrit le résultat (entier, ou une décimale avec une division) et le jeu le corrige, puis le dé se lance tout seul.'
    ] },
    { v: '5.6', date: '2026-11-03', changes: [
      'Préparation, étape 3 : plus de cases à cocher. Chaque choix est simplement entouré, sur fond transparent, et se remplit de couleur quand il est choisi.'
    ] },
    { v: '5.5', date: '2026-11-03', changes: [
      'Encadré des points : les constructions (drakkar, épées, feu, pyramides, gazelles, muraille, voie ferrée, pierres levées, temple inca) sont redessinées dans le style des nouvelles images d\u2019aventure, avec le même décor que chaque histoire. La progression ne change pas.'
    ] },
    { v: '5.4', date: '2026-11-03', changes: [
      'Nouvelles images des 10 aventures (illustrations de la planche « histoires ») sur le choix de l\u2019aventure et sur le rouleau du plateau.'
    ] },
    { v: '5.3', date: '2026-11-03', changes: [
      'Choix de l\u2019aventure : le cadre rouge de l\u2019aventure choisie n\u2019est plus coupé sur les bords, il est dessiné à l\u2019intérieur de la carte.'
    ] },
    { v: '5.2', date: '2026-11-03', changes: [
      'Tour de jeu : « Léa gagne 3 points ! Au tour de Tom. » n\u2019est plus écrit dans l\u2019encadré, seulement sur le plateau.'
    ] },
    { v: '5.1', date: '2026-11-03', changes: [
      'Dé : les points sont noirs (plus de couleurs).'
    ] },
    { v: '5.0', date: '2026-11-03', changes: [
      'Cartes : le bouton « Voir le mot » est juste sous « Écouter », dans le même style, avec une icône d\u2019œil.'
    ] },
    { v: '4.9', date: '2026-11-03', changes: [
      'La question « Première lettre » n\u2019est plus proposée.'
    ] },
    { v: '4.8', date: '2026-11-03', changes: [
      'Préparation : plus de choix du niveau. Chaque joueur coche ses packs et pioche dans tous leurs mots, niveaux 1, 2 et 3 mélangés.',
      'Le pack « Lettres » n\u2019est plus proposé.'
    ] },
    { v: '4.7', date: '2026-11-03', changes: [
      'Choix des aventuriers : le cadre de couleur des personnages choisis (J1, J2…) n\u2019est plus coupé sur les bords de l\u2019écran, il est dessiné à l\u2019intérieur de la carte.'
    ] },
    { v: '4.6', date: '2026-11-02', changes: [
      'Préparation en écrans successifs, sans défiler : 1) nombre de joueurs, 2) chaque joueur choisit son aventurier, 3) chaque joueur choisit son niveau, ses packs et ses questions, 4) l\u2019aventure, puis « Lancer la partie ». Chaque écran a son bouton « Valider » ; « Retour » revient au joueur ou à l\u2019écran précédent.'
    ] },
    { v: '4.5', date: '2026-11-02', changes: [
      'Quand le dé est lancé, le personnage reste sur sa croix : il ne disparaît plus pour réapparaître.'
    ] },
    { v: '4.4', date: '2026-11-02', changes: [
      'Dé : les coins épousent le bord arrondi (les faces de derrière ne dépassent plus aux coins).'
    ] },
    { v: '4.3', date: '2026-11-02', changes: [
      'Tour de jeu : plus de commentaires après « Bonne réponse » / « Mauvaise réponse » ni au moment de piocher, et plus de bouton « Lancer le dé » : le dé se lance tout seul.'
    ] },
    { v: '4.2', date: '2026-11-02', changes: [
      'Sur le plateau, les aventuriers sont debout (corps entier) sur un socle à la couleur du joueur, au lieu d\u2019un visage dans un rond.',
      'Ils marchent d\u2019une croix à l\u2019autre : jambes et bras qui se balancent, et ils se tournent dans le sens de la route.'
    ] },
    { v: '4.1', date: '2026-11-02', changes: [
      'Les personnages suivent la route pour aller d\u2019une croix à l\u2019autre (et non plus en ligne droite) : chemin pavé, pont, sentier du marais, descente vers le volcan. Chaque déplacement dure 1,5 seconde.'
    ] },
    { v: '4.0', date: '2026-11-02', changes: [
      'La partie en cours n\u2019est plus perdue : rafraîchir la page, aller sur une autre page ou mettre l\u2019écran en veille, on reprend au même endroit. Elle ne repart de l\u2019accueil que si la page est fermée.'
    ] },
    { v: '3.9', date: '2026-11-02', changes: [
      'Préparation : les packs et les questions sont décochés au départ, chaque joueur coche les siens. Si un joueur n\u2019a rien coché, « Lancer la partie » affiche ses réglages avec un message.'
    ] },
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

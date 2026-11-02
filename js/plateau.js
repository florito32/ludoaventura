// Aventura — écrans du jeu : accueil → préparation (joueurs, aventuriers, aventure) → plateau (tours de jeu).
// Dépend de js/des.js, js/aventures.js, js/aventuriers.js et js/regles.js (déroulement d'une partie).
(function () {
  'use strict';

  // Cases du parcours, dans l'ordre, en % de l'image du plateau (img/plateau-*.webp, 1600 × 1071).
  // Relevées sur les croix rouges de l'illustration : DÉPART puis 5 croix, la dernière au volcan.
  var CASES = [
    { nom: 'DÉPART', x: 19, y: 88, depart: true },
    { nom: 'Croix 1 — la prairie', x: 18.8, y: 63.5 },
    { nom: 'Croix 2 — le pont', x: 46.9, y: 42.5 },
    { nom: 'Croix 3 — le marais', x: 83.7, y: 35 },
    { nom: 'Croix 4 — les collines', x: 68.1, y: 60.7 },
    { nom: 'ARRIVÉE — le volcan', x: 72.5, y: 93, arrivee: true }
  ];

  // Tracé de la route entre deux cases (points intermédiaires, en % de l'image), relevé sur l'illustration :
  // ROUTE[i] mène de CASES[i - 1] à CASES[i]. Les pions suivent ces points au lieu d'aller en ligne droite.
  var ROUTE = [
    null,
    // DÉPART → croix 1 (la prairie) : le long de la terre, puis le chemin pavé qui serpente vers le haut.
    [[23, 88.6], [27.5, 87.5], [30, 84.7], [30.9, 81], [30.6, 77.2], [29.1, 74.4], [26.3, 72.6], [23.1, 71.2], [20.3, 69.3], [18.4, 67]],
    // Croix 1 → croix 2 (le pont) : le chemin pavé monte vers le lac.
    [[19.4, 60], [21.9, 58.1], [24.7, 57.4], [27.5, 57.1], [30.6, 56.4], [33.75, 55.3], [36.6, 53.9], [39, 52.5], [40.6, 48.7], [41.9, 45.4], [43.4, 44]],
    // Croix 2 → croix 3 (le marais) : on traverse le pont puis le sentier de sable vers la droite.
    [[50.3, 41.2], [54, 40.5], [58, 40.5], [60.3, 41], [62.5, 39.8], [65, 38.2], [68.1, 37.2], [71.3, 36.5], [74.4, 35.8], [77.5, 35.4], [80.6, 34.9]],
    // Croix 3 → croix 4 (les collines) : le sentier fait demi-tour et redescend entre les collines.
    [[85.9, 36.5], [86.9, 38.9], [86.6, 41.2], [85.3, 44], [83.1, 46.8], [80.3, 49.2], [76.9, 51], [73.75, 52.4], [70.6, 53.8], [68.4, 55.5], [67.5, 57.6]],
    // Croix 4 → ARRIVÉE (le volcan) : la descente jusqu'au pied du volcan.
    [[70.3, 64.3], [71.9, 67.1], [73.4, 70], [75, 72.8], [75.6, 75.1], [74.7, 77.4], [73.4, 79.8], [72.8, 82.1], [73.1, 84.9], [73.1, 87.7], [73.1, 90.5]]
  ];
  // Durée d'un déplacement d'une case à la suivante (ms). Les tests la règlent avec window.AVENTURA_MARCHE.
  var DUREE_MARCHE = typeof window.AVENTURA_MARCHE === 'number' ? window.AVENTURA_MARCHE : 1500;

  // Couleur de chaque joueur : son pion et son tas de cartes (1 à 4 joueurs, le 4e a des cartes vertes).
  var COULEURS = ['rouge', 'jaune', 'bleu', 'vert'];
  // Décalage des personnages posés sur une même case (en % de la largeur du plateau) :
  // deux devant, deux derrière, pour qu'ils restent tous visibles sans trop s'écarter de la croix.
  var DECALAGES = [[-1.8, -1.2], [1.8, -1.2], [-1.8, 1], [1.8, 1]];
  var RAPPORT = 1600 / 1071; // largeur / hauteur du plateau

  var $ = function (id) { return document.getElementById(id); };
  var A = window.Aventures;
  var P = window.Aventuriers;
  var C = window.Cartes;
  var TOUS_PACKS = C.PACKS.map(function (p) { return p.id; });
  var Q = window.Questions;
  var TOUS_TYPES = Q.TYPES.map(function (t) { return t.id; });

  // État de la partie. Il est sauvegardé dans le stockage de session (sessionStorage) :
  // il survit aux rechargements, aux changements de page et à la mise en veille,
  // et n'est effacé qu'à la fermeture de l'onglet (la partie repart alors de l'accueil).
  // choix[i] = aventurier du joueur i (par défaut : les 4 premiers de la liste) ;
  // packs[i] / niveaux[i] = packs où le joueur i pioche et son niveau (niveau 1 par défaut).
  // Packs et types de questions sont décochés au départ : c'est au joueur de les cocher (demande du 02/11/2026).
  var partie = {
    nbJoueurs: 2, aventure: A.LISTE[0], joueurs: [], choix: ['lea', 'tom', 'nour', 'malo'], actif: 0, regles: null,
    packs: [[], [], [], []], niveaux: [1, 1, 1, 1], carte: null,
    types: [[], [], [], []] // types de questions cochés par chaque joueur
  };

  function afficher(id) {
    partie.ecran = id;
    sauver();
    document.querySelectorAll('.ecran').forEach(function (s) { s.hidden = s.id !== id; });
    var titre = $(id).querySelector('h1, h2');
    if (titre) { titre.setAttribute('tabindex', '-1'); titre.focus({ preventScroll: true }); }
    window.scrollTo(0, 0);
  }

  function libelleObjectif(av, nb) {
    return A.objectif(av, nb) + ' ' + av.unite;
  }

  // ---------- Préparation ----------
  var DIFF = { facile: 'Facile', moyen: 'Moyen', difficile: 'Difficile' };

  function construireAventures() {
    var box = $('liste-aventures');
    A.LISTE.forEach(function (av, i) {
      var label = document.createElement('label');
      label.className = 'aventure';
      label.innerHTML =
        '<input type="radio" name="aventure" value="' + av.id + '"' + (i === 0 ? ' checked' : '') + '>' +
        '<img src="' + av.image + '" alt="" width="640" height="400" loading="lazy">' +
        '<span class="aventure-nom">' + av.nom + '</span>' +
        '<span class="aventure-diff diff-' + av.difficulte + '">' + DIFF[av.difficulte] + '</span>';
      box.appendChild(label);
    });
    $('form-preparation').addEventListener('change', function () { majDetail(); majAventuriers(); });
    majDetail();
  }

  // ---------- Choix des aventuriers ----------
  // Un onglet par joueur (le joueur qui choisit), puis une grille de 10 portraits.
  // Toucher un portrait le donne au joueur actif ; « Joueur suivant » passe au joueur d'après.
  // Un aventurier déjà pris par un autre joueur n'est pas disponible.
  function construireAventuriers() {
    var grille = $('grille-aventuriers');
    P.LISTE.forEach(function (a) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'aventurier';
      b.dataset.id = a.id;
      b.innerHTML = '<img src="' + a.image + '" alt="" width="200" height="220">' +
        '<span class="aventurier-nom">' + a.nom + '</span><span class="aventurier-titre">' + a.titre + '</span>' +
        '<span class="aventurier-pris" aria-hidden="true"></span><span class="visually-hidden aventurier-proprio"></span>';
      b.addEventListener('click', function () {
        partie.choix[partie.actif] = a.id;
        majAventuriers();
      });
      grille.appendChild(b);
    });
    construireReglages();
    majAventuriers();
  }

  // Packs (cases à cocher) et niveau (1 à 3) du joueur actif.
  function construireReglages() {
    var box = $('packs');
    C.PACKS.forEach(function (p) {
      var l = document.createElement('label');
      l.className = 'pack';
      l.innerHTML = '<input type="checkbox" name="pack" value="' + p.id + '"><span>' + p.nom + '</span>';
      box.appendChild(l);
    });
    var niv = $('niveaux-cartes');
    [1, 2, 3].forEach(function (n) {
      var l = document.createElement('label');
      l.className = 'niveau-carte';
      l.innerHTML = '<input type="radio" name="niveau-cartes" value="' + n + '"><span><span class="visually-hidden">Niveau </span>' + n + '</span>';
      niv.appendChild(l);
    });
    box.addEventListener('change', function () {
      var j = partie.actif;
      var coches = Array.prototype.filter.call(box.querySelectorAll('input'), function (i) { return i.checked; })
        .map(function (i) { return i.value; });
      // Au moins un pack est demandé, mais on ne le vérifie qu'au lancement de la partie.
      $('packs-alerte').textContent = '';
      partie.packs[j] = coches;
      majAventuriers();
    });
    niv.addEventListener('change', function (e) {
      partie.niveaux[partie.actif] = Number(e.target.value);
      majAventuriers();
    });
    // Types de questions (cases à cocher, au moins un).
    var types = $('types-questions');
    Q.TYPES.forEach(function (t) {
      var l = document.createElement('label');
      l.className = 'pack';
      l.innerHTML = '<input type="checkbox" name="type" value="' + t.id + '"><span>' + t.nom + '</span>';
      types.appendChild(l);
    });
    types.addEventListener('change', function () {
      var coches = Array.prototype.filter.call(types.querySelectorAll('input'), function (i) { return i.checked; })
        .map(function (i) { return i.value; });
      $('packs-alerte').textContent = '';
      partie.types[partie.actif] = coches;
      majAventuriers();
    });
    // Copie les packs, le niveau et les questions du joueur affiché vers tous les joueurs.
    $('btn-memes-reglages').addEventListener('click', function () {
      var a = partie.actif;
      for (var k = 0; k < 4; k++) {
        partie.packs[k] = partie.packs[a].slice();
        partie.niveaux[k] = partie.niveaux[a];
        partie.types[k] = partie.types[a].slice();
      }
      majAventuriers();
      $('packs-alerte').className = 'reglage-alerte ok';
      $('packs-alerte').textContent = 'Tous les joueurs ont maintenant les mêmes réglages.';
    });
    $('btn-joueur-suivant').addEventListener('click', function () {
      partie.actif++;
      majAventuriers();
      $('choix-joueurs').querySelectorAll('button')[partie.actif].focus();
    });
  }

  function resumeCartes(i) {
    var n = partie.packs[i].length;
    var t = partie.types[i].length;
    return 'Niveau ' + partie.niveaux[i] + ' · ' + (n === TOUS_PACKS.length ? 'tous les packs' : n ? n + ' pack' + (n > 1 ? 's' : '') : 'aucun pack') +
      ' · ' + (t === TOUS_TYPES.length ? 'toutes les questions' : t ? t + ' question' + (t > 1 ? 's' : '') : 'aucune question');
  }

  // Ce qui manque au joueur i pour pouvoir jouer (null si tout est coché).
  // Les cartes « Lettres » n'ont pas de type de question : un joueur qui ne pioche que des lettres n'en a pas besoin.
  function manque(i) {
    var packs = partie.packs[i];
    if (!packs.length) return 'pack';
    var queLettres = packs.length === 1 && packs[0] === 'lettres';
    if (!queLettres && !partie.types[i].length) return 'type';
    return null;
  }

  // Avant de lancer la partie : chaque joueur doit avoir coché ses packs et ses questions.
  // Sinon on affiche ses réglages avec un message et on met le focus sur ce qu'il doit cocher.
  function verifierReglages() {
    var nb = Number(document.querySelector('input[name="nb"]:checked').value);
    for (var i = 0; i < nb; i++) {
      var m = manque(i);
      if (!m) continue;
      partie.actif = i;
      majAventuriers();
      var nom = P.trouver(partie.choix[i]).nom;
      var alerte = $('packs-alerte');
      alerte.className = 'reglage-alerte';
      alerte.textContent = m === 'pack'
        ? nom + ' (Joueur ' + (i + 1) + ') doit cocher au moins un pack.'
        : nom + ' (Joueur ' + (i + 1) + ') doit cocher au moins un type de question.';
      var cible = $(m === 'pack' ? 'packs' : 'types-questions').querySelector('input');
      cible.focus({ preventScroll: true });
      $('reglages-joueur').scrollIntoView({ block: 'center' });
      return false;
    }
    return true;
  }

  function majAventuriers() {
    var nb = Number(document.querySelector('input[name="nb"]:checked').value);
    if (partie.actif >= nb) partie.actif = nb - 1;
    var onglets = $('choix-joueurs');
    onglets.innerHTML = '';
    for (var i = 0; i < nb; i++) {
      var a = P.trouver(partie.choix[i]);
      var o = document.createElement('button');
      o.type = 'button';
      o.className = 'onglet-joueur joueur-' + COULEURS[i];
      o.setAttribute('aria-pressed', String(i === partie.actif));
      o.innerHTML = '<img src="' + a.image + '" alt="" width="200" height="220"><span>Joueur ' + (i + 1) +
        '<strong>' + a.nom + '</strong><small>' + resumeCartes(i) + '</small></span>';
      o.addEventListener('click', (function (k) { return function () { partie.actif = k; majAventuriers(); }; })(i));
      onglets.appendChild(o);
    }
    document.querySelectorAll('.aventurier').forEach(function (b) {
      var proprio = partie.choix.slice(0, nb).indexOf(b.dataset.id);
      var a = P.trouver(b.dataset.id);
      b.className = 'aventurier' + (proprio >= 0 ? ' pris joueur-' + COULEURS[proprio] : '');
      b.setAttribute('aria-pressed', String(proprio === partie.actif));
      b.disabled = proprio >= 0 && proprio !== partie.actif;
      b.querySelector('.aventurier-pris').textContent = proprio >= 0 ? 'J' + (proprio + 1) : '';
      // Nom accessible = texte visible + précision pour les lecteurs d'écran (WCAG 2.5.3).
      b.querySelector('.aventurier-proprio').textContent = proprio >= 0 ? ' — choisi par Joueur ' + (proprio + 1) : '';
    });
    // Réglages des cartes du joueur actif.
    var actif = P.trouver(partie.choix[partie.actif]);
    $('reglages-joueur').className = 'reglages-joueur joueur-' + COULEURS[partie.actif];
    $('reglages-titre').textContent = 'Cartes de ' + actif.nom + ' (Joueur ' + (partie.actif + 1) + ')';
    $('packs').querySelectorAll('input').forEach(function (i) { i.checked = partie.packs[partie.actif].indexOf(i.value) >= 0; });
    $('niveaux-cartes').querySelectorAll('input').forEach(function (i) { i.checked = Number(i.value) === partie.niveaux[partie.actif]; });
    $('types-questions').querySelectorAll('input').forEach(function (i) { i.checked = partie.types[partie.actif].indexOf(i.value) >= 0; });
    var suivant = $('btn-joueur-suivant');
    suivant.hidden = partie.actif >= nb - 1;
    $('btn-memes-reglages').hidden = nb < 2;
    suivant.textContent = 'Joueur suivant →';
    sauver();
  }

  // ---------- Paquets de cartes ----------
  function melanger(t) {
    for (var i = t.length - 1; i > 0; i--) {
      var k = Math.floor(Math.random() * (i + 1));
      var x = t[i]; t[i] = t[k]; t[k] = x;
    }
    return t;
  }

  // Toutes les cartes que le joueur i peut piocher : ses packs, à son niveau.
  function cartesDuJoueur(i) {
    var niveau = String(partie.niveaux[i]);
    var liste = [];
    C.PACKS.forEach(function (p) {
      if (partie.packs[i].indexOf(p.id) === -1) return;
      p.niveaux[niveau].forEach(function (mot) {
        liste.push({ pack: p.id, packNom: p.nom, niveau: Number(niveau), mot: mot, lettre: p.id === 'lettres' && mot.length === 1 });
      });
    });
    return liste;
  }

  // Pioche dans le tas du joueur (tas vide → on remélange toutes ses cartes) et tire au hasard
  // une question parmi les types cochés par le joueur qui ont du sens pour ce mot.
  // Si aucun type coché ne convient à la carte, elle repart sous le tas et on en prend une autre.
  function piocherCarte(j) {
    var choisis = partie.types[j.index];
    for (var essai = 0; essai < 400; essai++) {
      if (!j.tas.length) j.tas = melanger(cartesDuJoueur(j.index));
      var c = j.tas.pop();
      if (c.lettre) { c.question = null; return c; }
      var poss = Q.possibles(c.mot, C.INFOS[c.mot], choisis);
      if (poss.length) { c.question = poss[Math.floor(Math.random() * poss.length)]; return c; }
      j.tas.unshift(c);
    }
    c.question = Q.trouver('epeler'); // filet de sécurité (ne devrait pas servir)
    return c;
  }

  function lireChoix() {
    partie.nbJoueurs = Number(document.querySelector('input[name="nb"]:checked').value);
    partie.aventure = A.trouver(document.querySelector('input[name="aventure"]:checked').value);
  }

  // Résumé de l'aventure choisie : histoire et objectif pour le nombre de joueurs choisi.
  function majDetail() {
    lireChoix();
    var av = partie.aventure;
    $('aventure-detail').innerHTML =
      '<h3>' + av.nom + '</h3>' +
      (av.histoire ? '<p>' + av.histoire + '</p>' : '<p class="a-venir">Histoire à venir.</p>') +
      '<p class="detail-objectif">Objectif de l’équipe (' + partie.nbJoueurs + ' joueur' + (partie.nbJoueurs > 1 ? 's' : '') + ') : <strong>' +
      libelleObjectif(av, partie.nbJoueurs) + '</strong></p>';
    // Rappel au-dessus du bouton (visible même quand le détail est hors de l'écran).
    $('resume-choix').textContent = av.nom + ' · ' + partie.nbJoueurs + ' joueur' + (partie.nbJoueurs > 1 ? 's' : '') +
      ' · objectif ' + libelleObjectif(av, partie.nbJoueurs);
    sauver();
  }

  // ---------- Plateau ----------
  function construireCases() {
    var ol = $('cases');
    CASES.forEach(function (c, i) {
      var li = document.createElement('li');
      li.className = 'case' + (c.depart ? ' case-depart' : '') + (c.arrivee ? ' case-arrivee' : '');
      li.style.left = c.x + '%';
      li.style.top = c.y + '%';
      li.dataset.index = i;
      li.innerHTML = '<span class="visually-hidden">' + c.nom + '</span>';
      ol.appendChild(li);
    });
  }

  var R = window.Regles;
  // Pause (ms) pendant laquelle on lit le message « +5 points ! Au tour de… » avant de passer au joueur suivant.
  // Les tests automatiques la raccourcissent avec window.AVENTURA_PAUSE.
  var PAUSE = typeof window.AVENTURA_PAUSE === 'number' ? window.AVENTURA_PAUSE : 2200;
  var minuteurs = [];
  function plusTard(fn, ms) { minuteurs.push(setTimeout(fn, ms)); }
  function annulerMinuteurs() { minuteurs.forEach(clearTimeout); minuteurs = []; }

  function lancerPartie() {
    annulerMinuteurs();
    lireChoix();
    var av = partie.aventure;
    partie.joueurs = [];
    for (var i = 0; i < partie.nbJoueurs; i++) {
      var perso = P.trouver(partie.choix[i]);
      partie.joueurs.push({ nom: perso.nom, aventurier: perso, couleur: COULEURS[i], index: i, tas: melanger(cartesDuJoueur(i)) });
    }
    partie.objectif = A.objectif(av, partie.nbJoueurs);
    partie.regles = R.nouvellePartie(partie.nbJoueurs, partie.objectif);
    partie.carte = null;
    partie.etapesVues = 0;
    preparerPlateau(true);
    afficher('ecran-plateau');
    // …puis le premier joueur se déplace de DÉPART jusqu'à la première croix (animation de début de partie).
    rendre({ sansDeplacement: true });
    plusTard(function () { rendre(); }, 450);
  }

  // Habille le plateau pour la partie en cours (aventure, points, pions).
  // depart = vrai : tous les pions sur DÉPART (nouvelle partie) ; faux : chacun sur sa case (reprise).
  function preparerPlateau(depart) {
    var av = partie.aventure;
    // Ambiance du plateau choisie selon l'aventure (jour ou soir).
    $('plateau-img').src = 'img/plateau-' + av.ambiance + '.webp';
    $('plateau').classList.toggle('soir', av.ambiance === 'soir');

    // Rouleau : nom et image de l'aventure à la place de « MISSION ».
    $('rouleau-img').src = av.image;
    $('rouleau-img').alt = 'Aventure ' + av.nom;
    $('rouleau-nom').textContent = av.nom;
    $('objectif').textContent = partie.objectif;
    $('objectif-texte').textContent = libelleObjectif(av, partie.nbJoueurs);
    $('jauge').setAttribute('aria-valuemax', partie.objectif);
    $('construction').innerHTML = window.Constructions.svg(av.id);
    var vues = partie.etapesVues;
    partie.etapesVues = depart ? 0 : 99; // reprise : pas d'animation « nouvelle étape »
    majConstruction(partie.regles.points);
    partie.etapesVues = depart ? 0 : vues;

    // Pions : sur DÉPART (nouvelle partie) ou sur leur case (reprise).
    var pions = $('pions');
    pions.innerHTML = '';
    partie.joueurs.forEach(function (j, k) {
      var p = document.createElement('span');
      var c = CASES[depart ? 0 : partie.regles.positions[k]];
      p.className = 'pion arrive pion-' + j.couleur + (k >= 2 ? ' devant' : '');
      // L'animation d'arrivée ne doit jouer qu'une fois (voir css : .pion.arrive).
      function finArrivee(e) {
        if (e.animationName !== 'poser') return;
        p.classList.remove('arrive');
        p.removeEventListener('animationend', finArrivee);
        p.removeEventListener('animationcancel', finArrivee);
      }
      p.addEventListener('animationend', finArrivee);
      p.addEventListener('animationcancel', finArrivee);
      p.dataset.aventurier = j.aventurier.id;
      // Personnage debout (js/figurines.js) sur un socle à la couleur du joueur.
      p.innerHTML = '<span class="socle"></span><span class="figurine">' + window.Figurines[j.aventurier.id] + '</span>';
      p.style.left = (c.x + DECALAGES[k][0]) + '%';
      p.style.top = (c.y + DECALAGES[k][1] * RAPPORT) + '%';
      p.dataset.case = depart ? '0' : String(partie.regles.positions[k]);
      pions.appendChild(p);
    });

    $('carte-piochee').hidden = true;
    $('bandeau').hidden = true;
    $('de-plateau').hidden = true;
    $('reaction').hidden = true;
    partie.roule = false;
  }

  // Points (en % du plateau) du trajet de la case « de » à la case « a » en suivant la route.
  function trajet(de, a) {
    var pts = [[CASES[de].x, CASES[de].y]];
    for (var k = de + 1; k <= a; k++) {
      (ROUTE[k] || []).forEach(function (q) { pts.push(q); });
      pts.push([CASES[k].x, CASES[k].y]);
    }
    return pts;
  }

  // Fait marcher le pion i le long de la route, de la case « de » à la case « a », en DUREE_MARCHE ms.
  // La vitesse est constante : chaque point du trajet est atteint à proportion de la distance parcourue.
  function marcher(p, i, de, a) {
    var dx = DECALAGES[i][0], dy = DECALAGES[i][1] * RAPPORT;
    var pts = trajet(de, a);
    var fin = pts[pts.length - 1];
    p.style.left = (fin[0] + dx) + '%';
    p.style.top = (fin[1] + dy) + '%';
    var calme = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (calme || DUREE_MARCHE < 50 || !p.animate || pts.length < 2) return;
    // Distances mesurées en proportions réelles (1 % de hauteur = 1 / RAPPORT % de largeur).
    var cumul = [0];
    for (var k = 1; k < pts.length; k++) {
      var ex = pts[k][0] - pts[k - 1][0], ey = (pts[k][1] - pts[k - 1][1]) / RAPPORT;
      cumul.push(cumul[k - 1] + Math.sqrt(ex * ex + ey * ey));
    }
    var total = cumul[cumul.length - 1] || 1;
    var images = pts.map(function (q, k) {
      return { left: (q[0] + dx) + '%', top: (q[1] + dy) + '%', offset: cumul[k] / total };
    });
    if (p.marche) p.marche.cancel(); // une marche encore en cours est remplacée par la nouvelle
    (p.tournants || []).forEach(clearTimeout);
    p.classList.add('marche');
    var anim = p.animate(images, { duration: DUREE_MARCHE, easing: 'linear' });
    p.marche = anim;
    // Fin de CETTE marche seulement (l'annulation d'une marche remplacée arrive plus tard, sans effet ici).
    anim.onfinish = anim.oncancel = function () {
      if (p.marche !== anim) return;
      p.classList.remove('marche'); p.marche = null;
    };
    // Le personnage regarde dans le sens de la marche : il se retourne quand la route repart vers la gauche.
    p.tournants = [];
    var sens = null;
    for (var s = 1; s < pts.length; s++) {
      var ex2 = pts[s][0] - pts[s - 1][0];
      if (Math.abs(ex2) < 1) continue; // petit écart ou tronçon presque vertical : on garde le sens actuel
      var gauche = ex2 < 0;
      if (gauche === sens) continue;
      if (sens === null) p.classList.toggle('gauche', gauche); // sens de départ : tout de suite
      else p.tournants.push(setTimeout(p.classList.toggle.bind(p.classList, 'gauche', gauche), cumul[s - 1] / total * DUREE_MARCHE));
      sens = gauche;
    }
  }

  // Place les pions ; celui qui change de case y marche en suivant la route.
  // Les pions d'une même case sont décalés pour rester visibles.
  function placerPions() {
    var r = partie.regles;
    document.querySelectorAll('.pion').forEach(function (p, i) {
      var avant = Number(p.dataset.case), apres = r.positions[i];
      if (apres > avant) marcher(p, i, avant, apres);
      else {
        var c = CASES[apres];
        p.style.left = (c.x + DECALAGES[i][0]) + '%';
        p.style.top = (c.y + DECALAGES[i][1] * RAPPORT) + '%';
      }
      p.dataset.case = apres;
      p.classList.toggle('pion-actif', i === r.joueur && r.etape !== 'fin');
    });
  }

  function bouton(texte, classe, action) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn ' + classe;
    b.textContent = texte;
    b.addEventListener('click', action);
    $('tour-actions').appendChild(b);
    return b;
  }

  // Message écrit sur le plateau (et lu par les lecteurs d'écran via la consigne du tour).
  function bandeau(texte) {
    var b = $('bandeau');
    b.textContent = texte;
    b.hidden = false;
    b.classList.remove('montre');
    void b.offsetWidth;
    b.classList.add('montre');
  }

  function points(n) { return n + ' point' + (n > 1 ? 's' : ''); }

  // Met tout l'écran à jour selon l'état de la partie (js/regles.js).
  function rendre(options) {
    var r = partie.regles;
    var j = partie.joueurs[r.joueur];

    if (!(options && options.sansDeplacement)) placerPions();
    $('points').textContent = r.points;
    $('jauge').setAttribute('aria-valuenow', r.points);
    $('jauge-barre').style.width = Math.min(100, r.points / r.objectif * 100) + '%';
    $('jauge').classList.toggle('atteint', r.points >= r.objectif);
    majConstruction(r.points);

    $('tour-portrait').src = j.aventurier.image;
    $('tour-portrait').className = 'joueur-' + j.couleur;
    $('tour-nom').textContent = j.nom;
    $('tour').className = 'bloc tour joueur-' + j.couleur;

    var actions = $('tour-actions');
    actions.innerHTML = '';
    var consigne = $('tour-consigne');
    // Texte lu par les lecteurs d'écran seulement (invisible à l'écran).
    function annoncer(t) { consigne.innerHTML = '<span class="visually-hidden">' + t + '</span>'; }
    if (r.etape === 'piocher') {
      $('carte-piochee').hidden = true;
      // Pas de commentaire visible (v4.3) : seulement pour les lecteurs d'écran.
      annoncer(j.nom + ' pioche une carte dans son tas.');
      bouton('Piocher une carte', 'btn-principal', function () {
        partie.carte = piocherCarte(j);
        R.piocher(r);
        montrerCarte(j);
        rendre();
      });
    } else if (r.etape === 'repondre') {
      consigne.textContent = 'La réponse de ' + j.nom + ' est-elle bonne ?';
      bouton('Bonne réponse', 'btn-bonne', function () { R.repondre(r, true); reagir(true); rendre(); lancerApresReaction(); });
      bouton('Mauvaise réponse', 'btn-mauvaise', function () { R.repondre(r, false); reagir(false); rendre(); lancerApresReaction(); });
    } else if (r.etape === 'lancer') {
      // Après « Bonne / Mauvaise réponse » : ni commentaire ni bouton (v4.3), le dé se lance tout seul.
      annoncer(j.nom + ' lance le dé ' + r.de.toUpperCase() + '.');
    } else if (r.etape === 'suivant' || r.etape === 'fin') {
      // Points ajoutés : on l'écrit, puis on passe tout seul au joueur suivant (ou au résultat).
      var gain = j.nom + ' gagne ' + points(r.dernierLancer) + ' !';
      var suite;
      if (r.etape === 'suivant') {
        var k = r.joueur + 1 < r.nbJoueurs ? r.joueur + 1 : 0;
        suite = 'Au tour de ' + partie.joueurs[k].nom + (k === 0 ? ', croix suivante' : '') + '.';
      } else {
        suite = 'Tout le monde est arrivé au volcan !';
      }
      consigne.textContent = gain + ' ' + suite;
      bandeau(gain + ' ' + suite);
    }
    sauver();
  }

  // La construction de l'aventure avance avec les points (complète quand l'objectif est atteint).
  function majConstruction(pts) {
    var av = partie.aventure, cst = window.Constructions;
    var n = cst.CONSTRUCTIONS[av.id].etapes.length;
    var vues = cst.etapesVisibles(av.id, pts, partie.objectif);
    $('construction').querySelectorAll('.etape').forEach(function (g, k) {
      var visible = k < vues;
      g.classList.toggle('vue', visible);
      if (visible && k >= partie.etapesVues) g.classList.add('nouvelle');
    });
    partie.etapesVues = vues;
    $('construction').classList.toggle('complete', vues === n);
    $('construction').setAttribute('aria-label', 'Construction de ' + cst.CONSTRUCTIONS[av.id].nom + ' : ' + vues + ' étape' + (vues > 1 ? 's' : '') + ' sur ' + n);
  }

  // Petite animation après la réponse : le pion saute et des confettis éclatent (bonne réponse),
  // ou le pion tremble avec un « Oups ! » (mauvaise réponse).
  var DUREE_REACTION = 1600; // durée de l'animation « Bravo ! » / « Oups ! » (ms)
  var COULEURS_CONFETTIS = ['#e3262a', '#ffe600', '#2e55c9', '#2f9e5b', '#ff8a1f', '#fff'];
  function reagir(bonne) {
    var r = partie.regles;
    var pion = document.querySelectorAll('.pion')[r.joueur];
    var zone = $('reaction');
    zone.hidden = false;
    zone.className = 'reaction ' + (bonne ? 'bonne' : 'mauvaise');
    // La bulle s'affiche au-dessus de la tête du personnage (le point du pion est à ses pieds).
    zone.style.left = pion.style.left;
    zone.style.top = 'calc(' + pion.style.top + ' - ' + Math.round(pion.offsetHeight * 0.85) + 'px)';
    var html = '<span class="reaction-texte">' + (bonne ? 'Bravo !' : 'Oups !') + '</span>';
    if (bonne) {
      for (var i = 0; i < 18; i++) {
        var a = (i / 18) * 2 * Math.PI, d = 40 + Math.random() * 40;
        html += '<i style="--dx:' + Math.round(Math.cos(a) * d) + 'px;--dy:' + Math.round(Math.sin(a) * d - 20) + 'px;background:' +
          COULEURS_CONFETTIS[i % COULEURS_CONFETTIS.length] + ';animation-delay:' + Math.round(Math.random() * 120) + 'ms"></i>';
      }
    }
    zone.innerHTML = html;
    pion.classList.remove('saute', 'secoue', 'arrive'); // l'arrivée ne doit pas rejouer après la réaction
    void pion.offsetWidth;
    pion.classList.add(bonne ? 'saute' : 'secoue');
    plusTard(function () { zone.hidden = true; pion.classList.remove('saute', 'secoue'); }, DUREE_REACTION);
  }

  // Une fois l'animation de réponse terminée, le bon dé (FORT ou FAIBLE) se lance tout seul.
  // Il n'y a plus de bouton (v4.3). Les tests règlent ce délai avec window.AVENTURA_AUTO_DE.
  var DELAI_AUTO_DE = typeof window.AVENTURA_AUTO_DE === 'number' ? window.AVENTURA_AUTO_DE : DUREE_REACTION;
  var minuteurDe = null;
  function lancerApresReaction() {
    var r = partie.regles;
    if (r.etape !== 'lancer') return;
    var de = r.de;
    clearTimeout(minuteurDe);
    minuteurDe = setTimeout(function () { minuteurDe = null; lancerDe(de); }, DELAI_AUTO_DE);
    minuteurs.push(minuteurDe);
  }

  // Après le lancer : pause de lecture, puis joueur suivant (ou résultat de la partie).
  function enchainer() {
    var r = partie.regles;
    plusTard(function () {
      $('bandeau').hidden = true;
      $('de-plateau').hidden = true;
      if (r.etape === 'suivant') { R.suivant(r); rendre(); }
      else if (r.etape === 'fin') montrerFin();
    }, PAUSE);
  }

  // Affiche la carte piochée : la question tirée et le mot caché (ou la lettre affichée), avec la lecture vocale.
  function montrerCarte(j) {
    var c = partie.carte;
    var box = $('carte-piochee');
    box.hidden = false;
    box.className = 'carte-piochee joueur-' + j.couleur;
    $('carte-titre').innerHTML = 'Carte n° ' + partie.regles.pioches[j.index] + ' de ' + j.nom +
      '<small>' + c.packNom + ' · niveau ' + c.niveau + (c.question ? ' · ' + c.question.nom : '') + '</small>';
    $('carte-consigne').textContent = c.lettre ? 'Quelle est cette lettre ?' : c.question.consigne;
    var mot = $('carte-mot');
    var boutons = $('carte-boutons');
    $('carte-reponse').hidden = true;
    if (c.lettre) {
      mot.textContent = c.mot;
      mot.className = 'carte-mot lettre';
      boutons.hidden = true;
    } else {
      cacherMot();
      boutons.hidden = false;
    }
  }

  function cacherMot() {
    var mot = $('carte-mot');
    mot.className = 'carte-mot cache';
    mot.innerHTML = '<span aria-hidden="true">' + partie.carte.mot.replace(/[^\s'’-]/g, '•') + '</span><span class="visually-hidden">Mot caché</span>';
    $('carte-reponse').hidden = true;
    partie.vue = 'cache';
    majBoutonsCarte();
  }

  // Textes des deux boutons selon ce qui est affiché : rien, le mot seul (aide) ou la réponse.
  function majBoutonsCarte() {
    var mot = $('btn-voir-mot'), rep = $('btn-voir');
    mot.textContent = partie.vue === 'mot' ? 'Cacher le mot' : 'Voir le mot';
    mot.setAttribute('aria-expanded', String(partie.vue === 'mot'));
    rep.textContent = partie.vue === 'reponse' ? 'Cacher la réponse' : 'Voir la réponse';
    rep.setAttribute('aria-expanded', String(partie.vue === 'reponse'));
    sauver();
  }

  // Aide : le mot seul, sans la réponse.
  function montrerMotSeul() {
    var mot = $('carte-mot');
    mot.className = 'carte-mot';
    mot.textContent = partie.carte.mot;
    $('carte-reponse').hidden = true;
    partie.vue = 'mot';
    majBoutonsCarte();
  }

  // Montre le mot (lettres muettes surlignées si c'est la question) et la réponse attendue.
  function montrerReponse() {
    var c = partie.carte, info = C.INFOS[c.mot], q = c.question;
    var mot = $('carte-mot');
    mot.className = 'carte-mot';
    if (q.id === 'muettes') {
      mot.innerHTML = c.mot.split('').map(function (ch, i) {
        return info.muettes.indexOf(i) >= 0 ? '<span class="muette">' + ch + '</span>' : ch;
      }).join('');
    } else mot.textContent = c.mot;
    var rep = $('carte-reponse');
    rep.textContent = q.id === 'ecrire' ? 'Compare avec ce qui a été écrit.' : 'Réponse : ' + q.reponse(c.mot, info);
    rep.hidden = false;
    partie.vue = 'reponse';
    majBoutonsCarte();
  }

  function brancherCarte() {
    $('btn-voir-mot').addEventListener('click', function () { if (partie.vue === 'mot') cacherMot(); else montrerMotSeul(); });
    $('btn-voir').addEventListener('click', function () { if (partie.vue === 'reponse') cacherMot(); else montrerReponse(); });
    var ecouter = $('btn-ecouter');
    if (!window.Voix.disponible()) {
      ecouter.disabled = true;
      ecouter.title = 'La lecture à voix haute n\u2019est pas disponible sur cet appareil';
    }
    ecouter.addEventListener('click', function () { window.Voix.lire(window.Voix.texteCarte(partie.carte)); });
  }

  // ---------- Dés ----------
  // Durée du roulé du dé (ms). Les tests la raccourcissent avec window.AVENTURA_DUREE_DE.
  var DUREE_DE = typeof window.AVENTURA_DUREE_DE === 'number' ? window.AVENTURA_DUREE_DE : 1400;
  // Orientation du cube qui montre chaque face (face k = valeur FACES[type][k]).
  var ORIENTATIONS = [[0, 0], [0, -90], [0, 180], [0, 90], [-90, 0], [90, 0]];
  var CLASSES_FACES = ['avant', 'droite', 'arriere', 'gauche', 'haut', 'bas'];

  // Points d'une face (grille 3 × 3, cases données par js/des.js).
  function facePoints(valeur) {
    var cases = window.Des.POINTS[valeur], html = '';
    for (var k = 0; k < 9; k++) if (cases.indexOf(k) >= 0) html += '<i style="grid-area:' + (Math.floor(k / 3) + 1) + '/' + (k % 3 + 1) + '"></i>';
    return html;
  }

  // Construit le cube du dé demandé (FAIBLE : 1-1-2-2-3-3, FORT : 4-4-5-5-6-6).
  function construireCube(type) {
    var cube = $('de3d');
    cube.className = 'de3d de3d-' + type;
    cube.innerHTML = window.Des.FACES[type].map(function (v, k) {
      return '<span class="face face-' + CLASSES_FACES[k] + '" data-valeur="' + v + '">' + facePoints(v) + '</span>';
    }).join('');
    return cube;
  }

  // Lance le dé demandé par la règle : il roule sur le plateau, puis ses points s'ajoutent à l'équipe.
  function lancerDe(type) {
    var r = partie.regles;
    if (r.etape !== 'lancer' || r.de !== type || partie.roule) return;
    clearTimeout(minuteurDe); minuteurDe = null; // lancé (par les tests) avant le lancer automatique
    partie.roule = true;
    $('tour-actions').innerHTML = '';
    var v = window.Des.lancer(type);
    var faces = window.Des.FACES[type];
    // Une des faces qui portent cette valeur, au hasard.
    var possibles = [];
    faces.forEach(function (f, k) { if (f === v) possibles.push(k); });
    var k = possibles[Math.floor(Math.random() * possibles.length)];

    var zone = $('de-plateau'), cube = construireCube(type);
    zone.hidden = false;
    zone.dataset.valeur = v;
    $('de-gain').textContent = '';
    var fin = 'rotateX(' + (ORIENTATIONS[k][0] - 720) + 'deg) rotateY(' + (ORIENTATIONS[k][1] - 1080) + 'deg)';
    var calme = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function poser() {
      cube.style.transform = fin;
      $('de-gain').textContent = '+' + v;
      zone.classList.add('pose');
      R.lancer(r, v);
      partie.roule = false;
      rendre();
      var pv = document.querySelector('.points-plateau .points-valeur');
      pv.classList.remove('gagne'); void pv.offsetWidth; pv.classList.add('gagne');
      enchainer();
    }

    zone.classList.remove('pose');
    if (calme || DUREE_DE < 100 || !cube.animate) { poser(); return; }
    // Le dé arrive depuis le bord du plateau en roulant et en rebondissant, puis se pose.
    zone.animate([
      { transform: 'translate(-260%, -120%) scale(.7)' },
      { transform: 'translate(-90%, 10%) scale(1)', offset: 0.45 },
      { transform: 'translate(-30%, -25%) scale(1.05)', offset: 0.65 },
      { transform: 'translate(0, 0) scale(1)' }
    ], { duration: DUREE_DE, easing: 'cubic-bezier(.2,.7,.3,1)' });
    var anim = cube.animate([
      { transform: 'rotateX(0deg) rotateY(0deg)' },
      { transform: fin }
    ], { duration: DUREE_DE, easing: 'cubic-bezier(.15,.6,.25,1)' });
    anim.onfinish = poser;
  }

  // ---------- Fin de partie ----------
  function montrerFin() {
    var r = partie.regles, av = partie.aventure;
    var ok = R.reussie(r);
    $('fin-icone').textContent = ok ? '🏆' : '🌋';
    $('fin-titre').textContent = ok ? 'Aventure réussie !' : 'Aventure manquée…';
    $('fin-texte').textContent = 'L’équipe a gagné ' + r.points + ' points pour un objectif de ' + r.objectif + ' ' + av.unite + '. ' +
      (ok ? 'Bravo, vous avez tous réussi l’aventure ' + av.nom + ' !' : 'Vous ferez mieux la prochaine fois !');
    $('fin').className = 'fin ' + (ok ? 'gagne' : 'perdu');
    $('fin').showModal();
  }
  $('btn-rejouer').addEventListener('click', function () { $('fin').close(); lancerPartie(); });
  $('btn-nouvelle').addEventListener('click', function () { $('fin').close(); annulerMinuteurs(); afficher('ecran-preparation'); });

  // ---------- Sauvegarde de la partie (stockage de session) ----------
  // sessionStorage : « survit aux rechargements et restaurations de la page ; fermer l'onglet efface les données »
  // (MDN, Window.sessionStorage). Les objets (aventure, aventuriers, questions) sont enregistrés par leur identifiant.
  var CLE = 'ludoaventura-partie';
  var pretASauver = false; // pas de sauvegarde pendant la construction initiale de la page

  function carteVersDonnees(c) {
    if (!c) return null;
    var d = {};
    for (var k in c) d[k] = c[k];
    d.question = c.question ? c.question.id : null;
    return d;
  }
  function donneesVersCarte(d) {
    if (!d) return null;
    d.question = d.question ? Q.trouver(d.question) : null;
    return d;
  }

  function sauver() {
    if (!pretASauver) return;
    var nb = document.querySelector('input[name="nb"]:checked');
    var avRadio = document.querySelector('input[name="aventure"]:checked');
    var d = {
      ecran: partie.ecran || 'ecran-accueil',
      nb: nb ? Number(nb.value) : partie.nbJoueurs,
      aventure: avRadio ? avRadio.value : partie.aventure.id,
      choix: partie.choix, packs: partie.packs, niveaux: partie.niveaux, types: partie.types, actif: partie.actif
    };
    if (partie.regles && partie.joueurs.length) {
      d.jeu = {
        aventure: partie.aventure.id, objectif: partie.objectif, regles: partie.regles,
        joueurs: partie.joueurs.map(function (j) { return { id: j.aventurier.id, tas: j.tas.map(carteVersDonnees) }; }),
        carte: carteVersDonnees(partie.carte), vue: partie.vue || 'cache', etapesVues: partie.etapesVues || 0
      };
    }
    try { sessionStorage.setItem(CLE, JSON.stringify(d)); } catch (e) { /* stockage indisponible : la partie reste en mémoire */ }
  }

  // Reprend la partie sauvegardée dans l'onglet (rechargement, retour sur la page…). Renvoie vrai si c'est le cas.
  function reprendre() {
    var d;
    try { d = JSON.parse(sessionStorage.getItem(CLE) || 'null'); } catch (e) { d = null; }
    if (!d || !d.ecran || d.ecran === 'ecran-accueil') return false;
    try {
      // Préparation : nombre de joueurs, aventure, aventuriers et réglages des cartes.
      var nb = document.querySelector('input[name="nb"][value="' + d.nb + '"]');
      if (nb) nb.checked = true;
      var av = document.querySelector('input[name="aventure"][value="' + d.aventure + '"]');
      if (av) av.checked = true;
      partie.choix = d.choix; partie.packs = d.packs; partie.niveaux = d.niveaux; partie.types = d.types; partie.actif = d.actif || 0;
      majDetail();
      majAventuriers();

      if (d.jeu) {
        var g = d.jeu;
        partie.aventure = A.trouver(g.aventure);
        partie.nbJoueurs = g.joueurs.length;
        partie.objectif = g.objectif;
        partie.regles = g.regles;
        partie.joueurs = g.joueurs.map(function (s, i) {
          var perso = P.trouver(s.id);
          return { nom: perso.nom, aventurier: perso, couleur: COULEURS[i], index: i, tas: s.tas.map(donneesVersCarte) };
        });
        partie.carte = donneesVersCarte(g.carte);
        partie.etapesVues = g.etapesVues;
        preparerPlateau(false);
      }
      if (d.ecran !== 'ecran-plateau' || !d.jeu) { afficher(d.ecran); return true; }

      // Plateau : on reprend l'étape en cours. Une animation interrompue (dé, pause de lecture) est rejouée ou terminée.
      var r = partie.regles;
      afficher('ecran-plateau');
      if (r.etape === 'suivant') R.suivant(r); // les points étaient déjà comptés : on passe au joueur suivant
      var j = partie.joueurs[r.joueur];
      if ((r.etape === 'repondre' || r.etape === 'lancer') && partie.carte) {
        montrerCarte(j);
        if (!partie.carte.lettre) {
          if (d.jeu.vue === 'mot') montrerMotSeul(); else if (d.jeu.vue === 'reponse') montrerReponse();
        }
      }
      rendre();
      if (r.etape === 'lancer') lancerApresReaction();
      if (r.etape === 'fin') montrerFin();
      return true;
    } catch (e) {
      // Sauvegarde illisible (ancienne version du jeu…) : on repart de l'accueil.
      try { sessionStorage.removeItem(CLE); } catch (e2) { /* rien */ }
      return false;
    }
  }

  // Sauvegarde aussi au moment où la page est quittée ou masquée (veille, autre application).
  window.addEventListener('pagehide', sauver);
  document.addEventListener('visibilitychange', function () { if (document.hidden) sauver(); });

  // ---------- Navigation ----------
  $('btn-commencer').addEventListener('click', function () { afficher('ecran-preparation'); });
  document.querySelectorAll('[data-vers]').forEach(function (b) {
    b.addEventListener('click', function () { annulerMinuteurs(); afficher(b.dataset.vers); });
  });
  $('form-preparation').addEventListener('submit', function (e) { e.preventDefault(); if (verifierReglages()) lancerPartie(); });

  construireAventures();
  construireAventuriers();
  construireCases();
  brancherCarte();
  reprendre();
  pretASauver = true;
  sauver();

  // Préchargement discret du plateau pendant que l'accueil est affiché.
  window.addEventListener('load', function () { new Image().src = 'img/plateau-jour.webp'; });

  window.Aventura = { cases: CASES, route: ROUTE, trajet: trajet, decalages: DECALAGES, partie: partie, cartesDuJoueur: cartesDuJoueur, majConstruction: majConstruction,
    // Tests : lancer le dé sans attendre le lancer automatique (il n'y a plus de bouton depuis v4.3).
    lancerDe: function () { lancerDe(partie.regles.de); } };
})();

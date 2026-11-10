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
  // Destination de chaque manche, annoncée à la fin d'un tour (« Au tour de Léa, en route vers le lac. »).
  // La croix 2 est le pont sur le lac ; la manche 1 (la prairie) n'est jamais annoncée : c'est le départ.
  var DESTINATIONS = { 2: 'le lac', 3: 'le marais', 4: 'les collines', 5: 'le volcan' };

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
  // Packs proposés aux joueurs : le pack « Lettres » n'est plus proposé (demande du 03/11/2026) ;
  // ses cartes restent dans js/cartes.js (généré depuis l'Excel) mais ne sont jamais piochées.
  var PACKS = C.PACKS.filter(function (p) { return p.id !== 'lettres'; });
  var TOUS_PACKS = PACKS.map(function (p) { return p.id; });
  var Q = window.Questions;
  // « Épeler à l'oral » n'est proposée que si l'appareil sait reconnaître la voix (choix de l'utilisateur, 09/11/2026).
  var PAROLE = window.Parole;
  function typeDisponible(t) { return !t.oral || PAROLE.disponible(); }
  var TOUS_TYPES = Q.TYPES.filter(typeDisponible).map(function (t) { return t.id; });
  var K = window.Calcul;
  var V = window.Conjugaison;
  var MATIERES = ['maths', 'orthographe', 'conjugaison']; // matières jouables (Français → Orthographe ou Conjugaison)
  // Aide sous le niveau de calcul (v6.14) : nombres possibles et nombre de signes maximum.
  var AIDES_NIVEAU = {
    facile: 'Facile : les tables de 1 à 10, 1 signe (2 × 8, 2 + 8, 16 ÷ 2…).',
    moyen: 'Moyen : les nombres de 1 à 99, jusqu’à 2 signes.',
    difficile: 'Difficile : les nombres de 1 à 999, jusqu’à 3 signes.',
    expert: 'Expert : les nombres de 1 à 9999, jusqu’à 4 signes.'
  };
  function mathsVides() { return { signes: [], nbSignes: [1], nombres: [], dizaines: [], centaines: [], milliers: [], niveau: 'facile' }; }
  function conjVide() { return { modes: [], temps: [], groupes: [], niveau: 'facile' }; }
  // Écran de l'étape 3 où se règle chaque chose qui manque.
  function ecranDe(m) {
    if (m === 'matiere' || m === 'francais') return 'matiere';
    if (m === 'mode' || m === 'temps' || m === 'tempsMode') return 'modes';
    if (m === 'pack') return 'packs'; // orthographe : écran des packs (v6.16)
    return 'reglages';
  }

  // État de la partie. Il est sauvegardé dans le stockage de session (sessionStorage) :
  // il survit aux rechargements, aux changements de page et à la mise en veille,
  // et n'est effacé qu'à la fermeture de l'onglet (la partie repart alors de l'accueil).
  // choix[i] = aventurier du joueur i (par défaut : les 4 premiers de la liste) ;
  // packs[i] = packs où le joueur i pioche (tous niveaux mêlés : plus de choix du niveau depuis la v4.8).
  // Packs et types de questions sont décochés au départ : c'est au joueur de les cocher (demande du 02/11/2026).
  var partie = {
    nbJoueurs: 1, aventure: A.LISTE[0], joueurs: [], choix: ['lea', 'tom', 'nour', 'malo'], actif: 0, regles: null,
    etapePrepa: 1, // écran de la préparation affiché (1 à 4), voir montrerEtape
    // Étape 3 en deux écrans par joueur (v5.8, choix de l'utilisateur) : 'matiere' puis 'reglages'.
    // Conjugaison (v6.0) : trois écrans, 'matiere' → 'modes' → 'reglages'.
    sousEtape: 'matiere',
    packs: [[], [], [], []], carte: null,
    types: [[], [], [], []], // types de questions cochés par chaque joueur
    // Matière de chaque joueur (v5.7) : null (pas encore choisie), 'maths' ou 'orthographe' ;
    // francais[i] = vrai si le joueur a touché « Français » (il choisit alors Orthographe…).
    matiere: [null, null, null, null], francais: [false, false, false, false],
    // Réglages de calcul de chaque joueur : signes, nombres (1 à 10), niveau (rien de choisi au départ, niveau Facile).
    maths: [mathsVides(), mathsVides(), mathsVides(), mathsVides()],
    // Réglages de conjugaison de chaque joueur (v5.8) : temps (« mode.temps »), groupes 1 à 3, niveau.
    conj: [conjVide(), conjVide(), conjVide(), conjVide()]
  };

  function afficher(id) {
    partie.ecran = id;
    sauver();
    if (id !== 'ecran-accueil') quitter = false;
    if (id !== 'ecran-accueil') armerRetour(navigator.userActivation ? navigator.userActivation.isActive : true);
    document.querySelectorAll('.ecran').forEach(function (s) { s.hidden = s.id !== id; });
    // Écran affiché : js/recompenses.js remplit les écrans des étoiles et met l'accueil à jour (v6.36).
    document.dispatchEvent(new CustomEvent('aventura-ecran', { detail: id }));
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
        '<img src="' + av.image + '" alt="" width="233" height="274" loading="lazy">' +
        '<span class="aventure-nom">' + av.nom + '</span>' +
        '<span class="aventure-diff diff-' + av.difficulte + '">' + DIFF[av.difficulte] + '</span>';
      box.appendChild(label);
    });
    $('form-preparation').addEventListener('change', function () { majDetail(); majAventuriers(); });
    majDetail();
  }

  // ---------- Choix des aventuriers ----------
  // Étape 2 : chaque joueur, à son tour, touche un des 10 portraits puis « Valider ».
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

  // Ajoute un choix « entouré » (case à cocher ou bouton radio invisibles, v5.6) dans une boîte.
  function choix(box, type, nom, valeur, texte, etiquette) {
    var l = document.createElement('label');
    l.className = 'pack';
    l.innerHTML = '<input type="' + type + '" name="' + nom + '" value="' + valeur + '"' +
      (etiquette ? ' aria-label="' + etiquette + '"' : '') + '><span>' + texte + '</span>';
    box.appendChild(l);
  }
  function valeursCochees(box) {
    return Array.prototype.filter.call(box.querySelectorAll('input'), function (i) { return i.checked; })
      .map(function (i) { return i.value; });
  }

  // Matière, réglages de calcul, packs et questions du joueur actif.
  function construireReglages() {
    // Matière : Mathématiques ou Français ; Français → Orthographe.
    $('matieres').addEventListener('change', function () {
      var j = partie.actif, v = valeursCochees($('matieres'))[0];
      $('packs-alerte').textContent = '';
      if (v === 'maths') { partie.matiere[j] = 'maths'; partie.francais[j] = false; }
      else { partie.francais[j] = true; partie.matiere[j] = valeursCochees($('francais'))[0] || null; }
      majAventuriers();
    });
    $('francais').addEventListener('change', function () {
      $('packs-alerte').textContent = '';
      partie.matiere[partie.actif] = valeursCochees($('francais'))[0] || null;
      majAventuriers();
    });
    // Mathématiques : signes (plusieurs), unités 1 à 10, dizaines, centaines (plusieurs), niveau (un seul).
    // v7.0 : le signe seul dans un rond (le mot « Additionner » ne tenait pas), le nom reste lu par les lecteurs d'écran.
    K.SIGNES.forEach(function (sg) {
      choix($('signes'), 'checkbox', 'signe', sg.id, '<b aria-hidden="true">' + sg.symbole + '</b>', sg.nom);
    });
    K.NOMBRES.forEach(function (n) { choix($('nombres'), 'checkbox', 'nombre', n, String(n), 'Nombre ' + n); });
    K.DIZAINES.forEach(function (n) { choix($('dizaines'), 'checkbox', 'dizaine', n, String(n), 'Dizaine ' + n + ' : nombres de ' + n + ' à ' + (n + 9)); });
    K.CENTAINES.forEach(function (n) { choix($('centaines'), 'checkbox', 'centaine', n, String(n), 'Centaine ' + n + ' : nombres de ' + n + ' à ' + (n + 99)); });
    // Expert (v6.14) : un seul bouton « 1000+ », les nombres de 1000 à 9999.
    choix($('milliers'), 'checkbox', 'millier', 1000, '1000+', 'Mille et plus : nombres de 1000 à 9999');
    // Nombre de signes par calcul (v6.14) : de 1 au maximum du niveau, plusieurs choix possibles.
    [1, 2, 3, 4].forEach(function (n) { choix($('nb-signes'), 'checkbox', 'nb-signes', n, String(n), n + (n > 1 ? ' signes' : ' signe') + ' par calcul'); });
    // « Tout sélectionner » / « Tout désélectionner » pour chaque groupe de nombres.
    document.querySelectorAll('#reglages-maths .btn-tout').forEach(function (b) {
      b.addEventListener('click', function () {
        var m = partie.maths[partie.actif], g = b.dataset.groupe, tous = $(g).querySelectorAll('input');
        var plein = (m[g] || []).length === tous.length;
        m[g] = plein ? [] : Array.prototype.map.call(tous, function (i) { return Number(i.value); });
        $('packs-alerte').textContent = '';
        majAventuriers();
      });
    });
    K.NIVEAUX.forEach(function (nv) { choix($('niveau-maths'), 'radio', 'niveau-maths', nv.id, nv.nom); });
    // Conjugaison : temps rangés par mode (une ligne par mode), groupes de verbes, niveau.
    // Les modes d'abord : seuls les temps des modes choisis apparaissent dessous.
    V.MODES.forEach(function (m) { choix($('modes-conj'), 'checkbox', 'mode-conj', m.id, m.nom); });
    V.MODES.forEach(function (m) {
      var ligne = document.createElement('div');
      ligne.dataset.mode = m.id;
      ligne.className = 'mode-ligne';
      ligne.setAttribute('role', 'group');
      ligne.setAttribute('aria-label', m.nom);
      // Nom du mode, abrégé sur les petits écrans (« Indic. ») ; le nom complet reste celui du groupe.
      var COURTS = { indicatif: 'Indic.', conditionnel: 'Cond.', subjonctif: 'Subj.', imperatif: 'Impér.' };
      ligne.innerHTML = '<span class="mode-nom" aria-hidden="true"><span class="long">' + m.nom + '</span><span class="court">' + COURTS[m.id] + '</span></span>';
      var box = document.createElement('div');
      box.className = 'packs';
      m.temps.forEach(function (t) { choix(box, 'checkbox', 'temps-conj', m.id + '.' + t.id, t.nom, m.nom + ' ' + t.nom.toLowerCase()); });
      ligne.appendChild(box);
      $('temps-conj').appendChild(ligne);
    });
    V.GROUPES.forEach(function (g) { choix($('groupes'), 'checkbox', 'groupe', g.id, g.nom.split(' ')[0], g.nom); }); // « 1er », « 2e », « 3e »
    V.NIVEAUX.forEach(function (nv) { choix($('niveau-conj'), 'radio', 'niveau-conj', nv.id, nv.nom); });
    ['modes-conj', 'temps-conj', 'groupes', 'niveau-conj'].forEach(function (id) {
      $(id).addEventListener('change', function () {
        var c = partie.conj[partie.actif];
        $('packs-alerte').textContent = '';
        c.modes = valeursCochees($('modes-conj'));
        // Un mode retiré emporte ses temps.
        c.temps = valeursCochees($('temps-conj')).filter(function (t) { return c.modes.indexOf(t.split('.')[0]) >= 0; });
        c.groupes = valeursCochees($('groupes')).map(Number);
        c.niveau = valeursCochees($('niveau-conj'))[0] || 'facile';
        majAventuriers();
      });
    });
    ['signes', 'nb-signes', 'nombres', 'dizaines', 'centaines', 'milliers', 'niveau-maths'].forEach(function (id) {
      $(id).addEventListener('change', function () {
        var m = partie.maths[partie.actif];
        $('packs-alerte').textContent = '';
        m.signes = valeursCochees($('signes'));
        m.nombres = valeursCochees($('nombres')).map(Number);
        m.dizaines = valeursCochees($('dizaines')).map(Number);
        m.centaines = valeursCochees($('centaines')).map(Number);
        m.milliers = valeursCochees($('milliers')).map(Number);
        var avant = m.niveau;
        m.niveau = valeursCochees($('niveau-maths'))[0] || 'facile';
        // Seuls les nombres de signes permis au niveau restent ; Facile = toujours 1 signe.
        var max = K.niveau(m.niveau).signes;
        m.nbSignes = valeursCochees($('nb-signes')).map(Number).filter(function (n) { return n <= max; });
        if (m.niveau === 'facile' || (avant !== m.niveau && !m.nbSignes.length)) m.nbSignes = [1];
        majAventuriers();
      });
    });

    var box = $('packs');
    PACKS.forEach(function (p) {
      var l = document.createElement('label');
      l.className = 'pack';
      l.innerHTML = '<input type="checkbox" name="pack" value="' + p.id + '"><span>' + p.nom + '</span>';
      box.appendChild(l);
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
    // Types de questions (cases à cocher, au moins un).
    // v6.33 : rangées en 3 familles encadrées (Q.FAMILLES), chacune avec son icône et son bouton « Tout ».
    var types = $('types-questions');
    Q.FAMILLES.forEach(function (f) {
      var liste = f.types.map(Q.trouver).filter(typeDisponible);
      if (!liste.length) return;
      var boite = document.createElement('div');
      boite.className = 'famille';
      boite.setAttribute('role', 'group');
      boite.setAttribute('aria-labelledby', 'famille-' + f.id);
      boite.innerHTML = '<div class="famille-tete"><p class="famille-nom" id="famille-' + f.id + '"><span aria-hidden="true">' + f.icone + '</span> ' + f.nom + '</p>' +
        '<button type="button" class="btn-tout btn-tout-famille" data-famille="' + f.id + '"></button></div><div class="packs"></div>';
      var grille = boite.querySelector('.packs');
      liste.forEach(function (t) {
        var l = document.createElement('label');
        l.className = 'pack';
        l.innerHTML = '<input type="checkbox" name="type" value="' + t.id + '" aria-label="' + t.nom + '"><span>' + (t.court || t.nom) + '</span>';
        grille.appendChild(l);
      });
      types.appendChild(boite);
    });
    // « Tout » d'une famille : coche (ou décoche) toutes ses questions, sans toucher aux autres familles.
    types.addEventListener('click', function (e) {
      var b = e.target.closest('.btn-tout-famille');
      if (!b) return;
      var j = partie.actif, ids = Array.prototype.map.call(b.closest('.famille').querySelectorAll('input'), function (i) { return i.value; });
      var plein = ids.every(function (id) { return partie.types[j].indexOf(id) >= 0; });
      var reste = partie.types[j].filter(function (id) { return ids.indexOf(id) < 0; });
      partie.types[j] = plein ? reste : reste.concat(ids);
      $('packs-alerte').textContent = '';
      majAventuriers();
    });
    types.addEventListener('change', function () {
      var coches = Array.prototype.filter.call(types.querySelectorAll('input'), function (i) { return i.checked; })
        .map(function (i) { return i.value; });
      $('packs-alerte').textContent = '';
      partie.types[partie.actif] = coches;
      majAventuriers();
    });
    // « Tout sélectionner » / « Tout désélectionner » des packs et des questions d'orthographe (v6.27, demande du 09/11/2026).
    document.querySelectorAll('.btn-tout[data-liste]').forEach(function (b) {
      b.addEventListener('click', function () {
        var cle = b.dataset.liste === 'packs' ? 'packs' : 'types', j = partie.actif;
        var tous = Array.prototype.map.call($(b.dataset.liste).querySelectorAll('input'), function (i) { return i.value; });
        partie[cle][j] = partie[cle][j].length === tous.length ? [] : tous;
        $('packs-alerte').textContent = '';
        majAventuriers();
      });
    });
    // Copie les packs et les questions du joueur affiché vers tous les joueurs,
    // puis passe directement au choix de l'aventure (tous les joueurs sont réglés).
    $('btn-memes-reglages').addEventListener('click', function () {
      if (!reglagesComplets(partie.actif)) return;
      var a = partie.actif;
      for (var k = 0; k < 4; k++) {
        partie.packs[k] = partie.packs[a].slice();
        partie.types[k] = partie.types[a].slice();
        partie.matiere[k] = partie.matiere[a];
        partie.francais[k] = partie.francais[a];
        partie.maths[k] = JSON.parse(JSON.stringify(partie.maths[a]));
        partie.conj[k] = JSON.parse(JSON.stringify(partie.conj[a]));
      }
      montrerEtape(4);
    });
  }

  // Ce qui manque au joueur i pour pouvoir jouer (null si tout est coché).
  function manque(i) {
    var m = partie.matiere[i];
    if (!m) return partie.francais[i] ? 'francais' : 'matiere';
    if (m === 'maths') {
      if (!partie.maths[i].signes.length) return 'signe';
      // Au moins un nombre de signes, et au moins une table (Facile) ou un nombre (dans les groupes du niveau).
      var mi = partie.maths[i];
      if (mi.niveau !== 'facile' && !(mi.nbSignes || []).length) return 'nbSignes';
      if (!K.compter(mi)) return mi.niveau === 'facile' ? 'table' : 'nombre';
      return null;
    }
    if (m === 'conjugaison') {
      if (!partie.conj[i].modes.length) return 'mode';
      if (!partie.conj[i].temps.length) return 'temps';
      // Chaque mode choisi doit avoir au moins un de ses temps (v6.3 : Indicatif + Conditionnel
      // avec seulement « Futur simple » ne bloquait pas).
      if (modeSansTemps(i)) return 'tempsMode';
      if (!partie.conj[i].groupes.length) return 'groupe';
      return null;
    }
    if (!partie.packs[i].length) return 'pack';
    if (!partie.types[i].length) return 'type';
    return null;
  }
  // Premier mode choisi par le joueur i sans aucun de ses temps (ou null).
  function modeSansTemps(i) {
    var c = partie.conj[i];
    var id = c.modes.filter(function (m) {
      return !c.temps.some(function (t) { return t.split('.')[0] === m; });
    })[0];
    return id ? V.MODES.filter(function (m) { return m.id === id; })[0] : null;
  }
  // Message et endroit où mettre le focus pour chaque chose qui manque.
  var MANQUES = {
    matiere: ['choisir une matière.', 'matieres'],
    francais: ['choisir Orthographe ou Conjugaison.', 'francais'],
    mode: ['choisir au moins un mode.', 'modes-conj'],
    temps: ['choisir au moins un temps.', 'temps-conj'],
    groupe: ['choisir au moins un groupe de verbes.', 'groupes'],
    signe: ['choisir au moins un signe.', 'signes'],
    nombre: ['choisir au moins un nombre.', 'nombres'],
    nbSignes: ['choisir le nombre de signes par calcul.', 'nb-signes'],
    table: ['choisir au moins une table.', 'nombres'],
    pack: ['choisir au moins un pack.', 'packs'],
    type: ['choisir au moins un type de question.', 'types-questions']
  };

  // Le joueur i a-t-il coché ce qu'il faut ? Sinon, message sous ses réglages et focus sur ce qui manque.
  function reglagesComplets(i) {
    var m = manque(i);
    if (!m) return true;
    var nom = P.trouver(partie.choix[i]).nom;
    var alerte = $('packs-alerte');
    alerte.className = 'reglage-alerte';
    if (m === 'tempsMode') {
      // Un mode choisi sans temps : on le nomme et on va sur ses temps.
      var md = modeSansTemps(i);
      alerte.textContent = nom + ' (Joueur ' + (i + 1) + ') doit choisir au moins un temps ' + md.oral + '.';
      $('temps-conj').querySelector('[data-mode="' + md.id + '"] input').focus({ preventScroll: true });
      return false;
    }
    alerte.textContent = nom + ' (Joueur ' + (i + 1) + ') doit ' + MANQUES[m][0];
    $(MANQUES[m][1]).querySelector('input').focus({ preventScroll: true });
    return false;
  }

  // Avant de lancer la partie : chaque joueur doit avoir coché ses packs et ses questions
  // (sécurité : « Valider » le vérifie déjà). Sinon on revient sur ses réglages.
  function verifierReglages() {
    var nb = nbChoisi();
    for (var i = 0; i < nb; i++) {
      if (manque(i)) {
        partie.actif = i;
        var m = manque(i);
        partie.sousEtape = ecranDe(m);
        montrerEtape(3);
        reglagesComplets(i);
        return false;
      }
    }
    return true;
  }

  function nbChoisi() { return Number(document.querySelector('input[name="nb"]:checked').value); }

  // ---------- Écrans de la préparation ----------
  // 1 nombre de joueurs → 2 aventurier (un écran par joueur) → 3 cartes (un écran par joueur) → 4 aventure.
  var NB_ETAPES = 4;
  function montrerEtape(n) {
    partie.etapePrepa = n;
    var nb = nbChoisi();
    if (partie.actif >= nb) partie.actif = nb - 1;
    document.querySelectorAll('#form-preparation .etape').forEach(function (f) { f.hidden = Number(f.dataset.etape) !== n; });
    $('packs-alerte').textContent = '';
    majAventuriers();
    majDetail();
    // Progression : « Étape 2 sur 4 · Joueur 1 sur 3 ».
    $('prepa-progres').textContent = 'Étape ' + n + ' sur ' + NB_ETAPES +
      ((n === 2 || n === 3) && nb > 1 ? ' · Joueur ' + (partie.actif + 1) + ' sur ' + nb : '');
    // « Modifier les choix » (menu, v6.22) : depuis le premier écran on retourne à la partie, et le dernier bouton la reprend.
    $('prepa-retour-texte').textContent = n === 1 ? (partie.modif ? 'Partie' : 'Accueil') : 'Retour';
    $('btn-lancer').textContent = partie.modif ? 'Reprendre la partie' : 'Lancer la partie';
    var f = document.querySelector('#form-preparation .etape[data-etape="' + n + '"]');
    if (!$('ecran-preparation').hidden) f.focus({ preventScroll: true });
    sauver();
  }

  // « Valider » de chaque écran : joueur suivant, ou écran suivant après le dernier joueur.
  function valider() {
    var n = partie.etapePrepa, nb = nbChoisi();
    if (n === 1) { partie.actif = 0; montrerEtape(2); return; }
    // Étape 3, premier écran : la matière choisie, on passe à ses réglages.
    if (n === 3 && partie.sousEtape === 'matiere') {
      var m = manque(partie.actif);
      if (ecranDe(m) === 'matiere') { reglagesComplets(partie.actif); return; }
      partie.sousEtape = { conjugaison: 'modes', orthographe: 'packs' }[partie.matiere[partie.actif]] || 'reglages';
      montrerEtape(3);
      return;
    }
    // Orthographe, deuxième écran : les packs choisis, on passe aux questions.
    if (n === 3 && partie.sousEtape === 'packs') {
      if (ecranDe(manque(partie.actif)) === 'packs') { reglagesComplets(partie.actif); return; }
      partie.sousEtape = 'reglages';
      montrerEtape(3);
      return;
    }
    // Conjugaison, deuxième écran : modes et temps choisis, on passe aux groupes et au niveau.
    if (n === 3 && partie.sousEtape === 'modes') {
      if (ecranDe(manque(partie.actif)) === 'modes') { reglagesComplets(partie.actif); return; }
      partie.sousEtape = 'reglages';
      montrerEtape(3);
      return;
    }
    if (n === 3 && !reglagesComplets(partie.actif)) return;
    if (n === 2 || n === 3) partie.sousEtape = 'matiere'; // le joueur suivant commence par sa matière
    if ((n === 2 || n === 3) && partie.actif < nb - 1) { partie.actif++; montrerEtape(n); return; }
    if (n === 2 || n === 3) { partie.actif = 0; montrerEtape(n + 1); }
  }

  // « ← Retour » : joueur précédent, ou écran précédent (l'accueil depuis le premier écran).
  function revenir() {
    var n = partie.etapePrepa, nb = nbChoisi();
    // Étape 3 : des réglages on revient à la matière ; de la matière, aux réglages du joueur précédent.
    if (n === 3 && partie.sousEtape === 'reglages') {
      partie.sousEtape = { conjugaison: 'modes', orthographe: 'packs' }[partie.matiere[partie.actif]] || 'matiere';
      montrerEtape(3);
      return;
    }
    if (n === 3 && (partie.sousEtape === 'modes' || partie.sousEtape === 'packs')) { partie.sousEtape = 'matiere'; montrerEtape(3); return; }
    if (n === 3 && partie.actif > 0) { partie.actif--; partie.sousEtape = 'reglages'; montrerEtape(3); return; }
    if (n === 4) partie.sousEtape = 'reglages';
    if (n === 1 && partie.modif) { if (verifierReglages()) reprendreApresModif(); return; }
    if (n === 1) { afficher('ecran-accueil'); return; }
    if ((n === 2 || n === 3) && partie.actif > 0) { partie.actif--; montrerEtape(n); return; }
    partie.actif = n === 2 ? 0 : nb - 1; // on revient sur le dernier joueur de l'écran précédent
    montrerEtape(n - 1);
  }

  // Met à jour les écrans 2 et 3 pour le joueur actif (aventurier choisi, réglages des cartes).
  function majAventuriers() {
    var nb = nbChoisi();
    if (partie.actif >= nb) partie.actif = nb - 1;
    var couleur = COULEURS[partie.actif];
    $('aventurier-legende').textContent = 'Joueur ' + (partie.actif + 1) + ', choisis ton aventurier';
    $('aventurier-legende').className = 'legende-joueur joueur-' + couleur;
    // Sur l'écran 2, seuls les joueurs qui ont déjà choisi (et le joueur actif) apparaissent :
    // les joueurs suivants n'ont pas encore choisi. Si le choix par défaut du joueur actif
    // est déjà pris par un joueur précédent, il reçoit le premier aventurier libre.
    var visibles = partie.etapePrepa === 2 ? partie.actif + 1 : nb;
    var avant = partie.choix.slice(0, partie.actif);
    if (avant.indexOf(partie.choix[partie.actif]) >= 0) {
      partie.choix[partie.actif] = P.LISTE.filter(function (a) { return avant.indexOf(a.id) === -1; })[0].id;
    }
    document.querySelectorAll('.aventurier').forEach(function (b) {
      var proprio = partie.choix.slice(0, visibles).indexOf(b.dataset.id);
      b.className = 'aventurier' + (proprio >= 0 ? ' pris joueur-' + COULEURS[proprio] : '');
      b.setAttribute('aria-pressed', String(proprio === partie.actif));
      b.disabled = proprio >= 0 && proprio !== partie.actif;
      b.querySelector('.aventurier-pris').textContent = proprio >= 0 ? 'J' + (proprio + 1) : '';
      // Nom accessible = texte visible + précision pour les lecteurs d'écran (WCAG 2.5.3).
      b.querySelector('.aventurier-proprio').textContent = proprio >= 0 ? ' — choisi par Joueur ' + (proprio + 1) : '';
    });
    // Réglages des cartes du joueur actif.
    var actif = P.trouver(partie.choix[partie.actif]);
    $('reglages-joueur').className = 'etape-corps reglages-joueur joueur-' + couleur;
    $('reglages-titre').className = 'legende-joueur joueur-' + couleur;
    // Matière choisie : seuls ses réglages s'affichent.
    var a = partie.actif, mat = partie.matiere[a], fr = partie.francais[a] || (mat && mat !== 'maths');
    $('matieres').querySelectorAll('input').forEach(function (i) { i.checked = i.value === 'maths' ? mat === 'maths' : !!fr; });
    $('francais').querySelectorAll('input').forEach(function (i) { i.checked = i.value === mat; });
    $('reglage-francais').hidden = !fr;
    $('reglages-maths').hidden = mat !== 'maths';
    $('reglage-niveau-maths').hidden = mat !== 'maths';
    // Niveau de calcul : une phrase d'aide sous les choix ; au niveau Facile, les nombres deviennent des tables.
    var nvm = partie.maths[a].niveau;
    $('niveau-maths-aide').textContent = AIDES_NIVEAU[nvm];
    // v6.14 : le niveau décide des groupes de nombres et des nombres de signes proposés.
    var permis = K.groupes(nvm).map(function (g) { return g.id; });
    ['nombres', 'dizaines', 'centaines', 'milliers'].forEach(function (g) { $(g).closest('.reglage').hidden = permis.indexOf(g) < 0; });
    $('reglages-maths').dataset.niveau = nvm;
    $('nombres-titre').innerHTML = nvm === 'facile' ? 'Tables <em>(2 → 2 × 8, 2 + 8…)</em>' : 'Unités';
    var maxS = K.niveau(nvm).signes;
    $('nb-signes').querySelectorAll('.pack').forEach(function (l) { l.hidden = Number(l.querySelector('input').value) > maxS; });
    $('reglage-nb-signes').hidden = mat !== 'maths';
    $('reglages-ortho').hidden = mat !== 'orthographe';
    $('reglages-conj').hidden = mat !== 'conjugaison';
    var cc = partie.conj[a];
    $('modes-conj').querySelectorAll('input').forEach(function (i) { i.checked = cc.modes.indexOf(i.value) >= 0; });
    $('temps-conj').querySelectorAll('.mode-ligne').forEach(function (l) { l.hidden = cc.modes.indexOf(l.dataset.mode) === -1; });
    $('temps-conj-vide').hidden = cc.modes.length > 0;
    $('temps-conj').querySelectorAll('input').forEach(function (i) { i.checked = cc.temps.indexOf(i.value) >= 0; });
    $('groupes').querySelectorAll('input').forEach(function (i) { i.checked = cc.groupes.indexOf(Number(i.value)) >= 0; });
    $('niveau-conj').querySelectorAll('input').forEach(function (i) { i.checked = i.value === cc.niveau; });
    var mm = partie.maths[a];
    $('signes').querySelectorAll('input').forEach(function (i) { i.checked = mm.signes.indexOf(i.value) >= 0; });
    // Parties sauvegardées avant la v6.14 : nombre de signes = le maximum du niveau.
    if (!mm.nbSignes) mm.nbSignes = [K.niveau(mm.niveau).signes];
    $('nb-signes').querySelectorAll('input').forEach(function (i) { i.checked = mm.nbSignes.indexOf(Number(i.value)) >= 0; });
    mm.milliers = mm.milliers || [];
    $('milliers').querySelectorAll('input').forEach(function (i) { i.checked = mm.milliers.indexOf(Number(i.value)) >= 0; });
    ['nombres', 'dizaines', 'centaines'].forEach(function (g) {
      mm[g] = mm[g] || []; // parties sauvegardées avant la v6.12
      var tous = $(g).querySelectorAll('input');
      tous.forEach(function (i) { i.checked = mm[g].indexOf(Number(i.value)) >= 0; });
      var plein = mm[g].length === tous.length, b = document.querySelector('.btn-tout[data-groupe="' + g + '"]');
      // Texte court sur téléphone (« Tout » / « Aucun »), nom complet pour les lecteurs d'écran.
      b.innerHTML = plein ? '<span class="long">Tout désélectionner</span><span class="court">Aucun</span>'
        : '<span class="long">Tout sélectionner</span><span class="court">Tout</span>';
      b.setAttribute('aria-label', (plein ? 'Tout désélectionner : ' : 'Tout sélectionner : ') + { nombres: 'unités', dizaines: 'dizaines', centaines: 'centaines' }[g]);
    });
    $('niveau-maths').querySelectorAll('input').forEach(function (i) { i.checked = i.value === mm.niveau; });
    $('packs').querySelectorAll('input').forEach(function (i) { i.checked = partie.packs[partie.actif].indexOf(i.value) >= 0; });
    $('types-questions').querySelectorAll('input').forEach(function (i) { i.checked = partie.types[partie.actif].indexOf(i.value) >= 0; });
    // Libellé des boutons « Tout » des packs et des questions : « Tout désélectionner » quand tout est coché.
    document.querySelectorAll('.btn-tout[data-liste]').forEach(function (b) {
      var n = $(b.dataset.liste).querySelectorAll('input').length;
      var plein = partie[b.dataset.liste === 'packs' ? 'packs' : 'types'][partie.actif].length === n;
      b.innerHTML = plein ? '<span class="long">Tout désélectionner</span><span class="court">Aucun</span>'
        : '<span class="long">Tout sélectionner</span><span class="court">Tout</span>';
      b.setAttribute('aria-label', (plein ? 'Tout désélectionner : ' : 'Tout sélectionner : ') + (b.dataset.liste === 'packs' ? 'packs' : 'questions'));
    });
    document.querySelectorAll('.btn-tout-famille').forEach(function (b) {
      var boite = b.closest('.famille'), ids = Array.prototype.map.call(boite.querySelectorAll('input'), function (i) { return i.value; });
      var plein = ids.every(function (id) { return partie.types[partie.actif].indexOf(id) >= 0; });
      b.textContent = plein ? 'Aucun' : 'Tout';
      b.setAttribute('aria-label', (plein ? 'Tout désélectionner : ' : 'Tout sélectionner : ') + boite.querySelector('.famille-nom').textContent.replace(/^\S+\s/, ''));
    });
    // Étape 3 : écran de la matière ou écran de ses réglages.
    var ecran = partie.sousEtape, surMatiere = ecran === 'matiere';
    if (ecran === 'modes' && mat !== 'conjugaison') ecran = partie.sousEtape = 'reglages';
    if (ecran === 'packs' && mat !== 'orthographe') ecran = partie.sousEtape = 'reglages';
    $('choix-matiere').hidden = !surMatiere;
    $('conj-temps').hidden = ecran !== 'modes';
    $('ortho-packs').hidden = ecran !== 'packs';
    if (ecran !== 'reglages') { $('reglages-maths').hidden = $('reglages-ortho').hidden = $('reglages-conj').hidden = true; }
    var NOMS_MATIERES = { maths: 'Mathématiques', orthographe: 'Orthographe', conjugaison: 'Conjugaison' };
    var sousTitre = surMatiere ? 'quelle matière ?' : NOMS_MATIERES[mat] +
      (mat === 'conjugaison' ? (ecran === 'modes' ? ', les temps' : ', les verbes') : '') +
      (mat === 'orthographe' ? (ecran === 'packs' ? ', les packs' : ', les questions') : '');
    $('reglages-titre').innerHTML = '<img src="' + actif.image + '" alt="" width="200" height="220">' +
      actif.nom + ' (Joueur ' + (partie.actif + 1) + ') : ' + sousTitre;
    $('btn-memes-reglages').hidden = nb < 2 || ecran !== 'reglages';
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

  // Toutes les cartes que le joueur i peut piocher : ses packs, les 3 niveaux mêlés
  // (choix de l'utilisateur le 03/11/2026 : plus de choix du niveau).
  function cartesDuJoueur(i) {
    var liste = [];
    PACKS.forEach(function (p) {
      if (partie.packs[i].indexOf(p.id) === -1) return;
      Object.keys(p.niveaux).forEach(function (niveau) {
        p.niveaux[niveau].forEach(function (mot) {
          liste.push({ pack: p.id, packNom: p.nom, niveau: Number(niveau), mot: mot, lettre: p.id === 'lettres' && mot.length === 1 });
        });
      });
    });
    return liste;
  }

  // Pioche dans le tas du joueur (tas vide → on remélange toutes ses cartes) et tire au hasard
  // une question parmi les types cochés par le joueur qui ont du sens pour ce mot.
  // Si aucun type coché ne convient à la carte, elle repart sous le tas et on en prend une autre.
  function piocherCarte(j) {
    // Mathématiques : une formule tirée au hasard selon les réglages du joueur (pas de tas).
    if (partie.matiere[j.index] === 'maths') {
      var m = partie.maths[j.index], f = K.generer(m);
      f.type = 'calcul';
      f.packNom = 'Calcul · ' + K.niveau(m.niveau).nom + (f.table ? ' · table de ' + f.table : '');
      return f;
    }
    // Conjugaison : un verbe, un temps et un pronom tirés selon les réglages du joueur.
    if (partie.matiere[j.index] === 'conjugaison') {
      var cr = partie.conj[j.index], cj = V.generer(cr);
      cj.type = 'conjugaison';
      cj.packNom = 'Conjugaison · ' + V.NIVEAUX.filter(function (n) { return n.id === cr.niveau; })[0].nom;
      return cj;
    }
    var choisis = partie.types[j.index];
    for (var essai = 0; essai < 400; essai++) {
      if (!j.tas.length) j.tas = melanger(cartesDuJoueur(j.index));
      var c = j.tas.pop();
      if (c.lettre) { c.question = null; return c; }
      var poss = Q.possibles(c.mot, C.INFOS[c.mot], choisis);
      if (poss.length) {
        c.question = poss[Math.floor(Math.random() * poss.length)];
        // Réglages tirés pour cette carte (lettre cachée, lettres mélangées, lettre à compter : v6.17).
        c.params = c.question.preparer ? c.question.preparer(c.mot, C.INFOS[c.mot]) : null;
        return c;
      }
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
      (av.histoire ? '<p class="aventure-histoire">' + av.histoire + '</p>' : '<p class="a-venir">Histoire à venir.</p>') +
      '<p class="detail-objectif">Objectif de l’équipe (' + partie.nbJoueurs + ' joueur' + (partie.nbJoueurs > 1 ? 's' : '') + ') : <strong>' +
      libelleObjectif(av, partie.nbJoueurs) + '</strong></p>';
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
    partie.modif = false;
    lireChoix();
    var av = partie.aventure;
    partie.joueurs = [];
    for (var i = 0; i < partie.nbJoueurs; i++) {
      var perso = P.trouver(partie.choix[i]);
      partie.joueurs.push({ nom: perso.nom, aventurier: perso, couleur: COULEURS[i], index: i, tas: melanger(cartesDuJoueur(i)) });
    }
    partie.objectif = A.objectif(av, partie.nbJoueurs);
    partie.regles = R.nouvellePartie(partie.nbJoueurs, partie.objectif);
    // Identifiant unique : une partie gagnée ne rapporte ses étoiles qu'une fois (js/etoiles.js, v6.36).
    partie.regles.id = 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    partie.carte = null;
    partie.etapesVues = 0;
    preparerPlateau(true);
    afficher('ecran-plateau');
    // …puis le premier joueur se déplace de DÉPART jusqu'à la première croix (animation de début de partie).
    rendre({ sansDeplacement: true });
    // Seulement le déplacement du pion : reconstruire les boutons à ce moment-là pouvait faire perdre
    // un toucher sur « Question suivante » (ex-« Piocher une carte ») qui tombait pile au même instant (v6.8).
    plusTard(function () { placerPions(); }, 450);
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
    $('titre-points').textContent = av.objet.titre; // « Pierres taillées » plutôt que « Points de l'équipe »
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
    // Le dé est posé au même moment : on le range une fois le message à sa place (après son apparition).
    var anims = b.getAnimations ? b.getAnimations() : [];
    if (anims.length) Promise.all(anims.map(function (a) { return a.finished; })).then(degagerDe, degagerDe);
    else degagerDe();
  }

  // Le dé et son « +N » ne cachent jamais le message (capture du 09/11/2026) : s'ils le chevauchent,
  // le dé glisse juste au-dessus du message (en dessous s'il n'y a pas la place), sans couvrir l'encadré des points.
  function degagerDe() {
    var de = $('de-plateau'), b = $('bandeau');
    // Mesure à la place d'origine, sans glissement en cours.
    de.style.transition = 'none';
    de.style.top = ''; de.style.left = '';
    if (de.hidden || b.hidden || !de.offsetParent) { de.style.transition = ''; return; }
    var cadre = de.offsetParent.getBoundingClientRect();
    var m = b.getBoundingClientRect();
    var d = de.getBoundingClientRect(), g = $('de-gain').getBoundingClientRect();
    var marge = 6;
    // Emprise du dé : le cube, son ombre dessous (14 %) et le « +N » à droite.
    var e = { top: Math.min(d.top, g.top), bottom: d.bottom + d.height * 0.14, left: d.left, right: Math.max(d.right, g.right) };
    function touche(a, z) { return a.top < z.bottom && a.bottom > z.top && a.left < z.right && a.right > z.left; }
    if (!touche(e, m)) { de.style.transition = ''; return; }
    var haut = m.top - marge - e.bottom;   // décalage vers le haut (négatif)
    var bas = m.bottom + marge - e.top;    // décalage vers le bas
    var dy = e.top + haut >= cadre.top + 2 ? haut : (e.bottom + bas <= cadre.bottom - 2 ? bas : cadre.top + 2 - e.top);
    var dx = 0;
    var pts = document.querySelector('.points-plateau');
    if (pts && pts.offsetParent) {
      var p = pts.getBoundingClientRect();
      var e2 = { top: e.top + dy, bottom: e.bottom + dy, left: e.left, right: e.right };
      // À la hauteur de l'encadré des points : le dé passe à sa droite.
      if (touche(e2, p)) dx = p.right + marge - e.left;
    }
    var cs = getComputedStyle(de);
    var top = parseFloat(cs.top), left = parseFloat(cs.left);
    void de.offsetWidth;
    de.style.transition = '';
    de.style.top = (top + dy) + 'px';
    if (dx) de.style.left = (left + dx) + 'px';
  }


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
      bouton('Question suivante', 'btn-principal', function () {
        partie.carte = piocherCarte(j);
        partie.vue = 'cache'; // nouvelle carte : mot caché
        R.piocher(r);
        montrerCarte(j);
        rendre();
        // Calcul : le curseur est mis dans la case de réponse (sans faire défiler la page).
        if (aSaisir(partie.carte)) $('reponse-joueur').focus({ preventScroll: true });
        // Dictée (v6.31) : le mot est caché, la voix le lit tout de suite (« Écouter » le relit).
        var q = partie.carte.question;
        if (q && q.dictee) window.Voix.lire(window.Voix.texteCarte(partie.carte));
      });
    } else if (r.etape === 'repondre' && aSaisir(partie.carte)) {
      // Calcul : le joueur écrit sa réponse dans la carte, le jeu la corrige (pas de maître du jeu).
      annoncer(j.nom + ' écrit sa réponse puis valide.');
    } else if (r.etape === 'repondre' && epelerOral(partie.carte)) {
      // Épeler à l'oral (v6.28) : « Parler », le joueur dit les lettres, « J'ai fini » (ou un silence) arrête l'écoute.
      if (ecoute) {
        annoncer(j.nom + ' dit les lettres du mot, puis touche « J\u2019ai fini ».');
        bouton('\u23f9\ufe0f J\u2019ai fini', 'btn-principal btn-parler ecoute', function () { ecoute.arreter(); });
      } else {
        annoncer(j.nom + ' touche « Parler » et dit les lettres du mot une par une.');
        // Une fois les lettres dans la case, « OK » est le bouton principal : « Redire » devient secondaire.
        var corr = partie.carte.aCorriger;
        bouton('\ud83c\udfa4 ' + (corr ? 'Redire les lettres' : 'Parler'), (corr ? 'btn-secondaire' : 'btn-principal') + ' btn-parler', parler);
      }
    } else if (r.etape === 'repondre') {
      consigne.textContent = 'La réponse de ' + j.nom + ' est-elle bonne ?';
      bouton('Bonne réponse', 'btn-bonne', function () { R.repondre(r, true); reagir(true); rendre(); lancerApresReaction(); });
      // Mauvaise réponse en orthographe : la réponse s'affiche et le dé attend « J'ai compris » (v6.1).
      bouton('Mauvaise réponse', 'btn-mauvaise', function () {
        R.repondre(r, false);
        partie.carte.attente = true;
        montrerReponse();
        reagir(false);
        rendre();
      });
    } else if (r.etape === 'lancer' && partie.carte && partie.carte.attente) {
      // Réponse fausse : le joueur lit la correction (et le « ? » en conjugaison), puis « J'ai compris » lance le dé.
      annoncer(j.nom + ' lit la correction, puis touche « J\u2019ai compris ».');
      bouton('J\u2019ai compris', 'btn-principal', function () {
        partie.carte.attente = false;
        // Le tableau « ? » se referme : l'encadré redescend et laisse voir le dé.
        $('carte-tableau').hidden = true;
        $('btn-tableau').setAttribute('aria-expanded', 'false');
        rendre();
        lancerDe(r.de);
      });
    } else if (r.etape === 'lancer') {
      // Après « Bonne / Mauvaise réponse » : ni commentaire ni bouton (v4.3), le dé se lance tout seul.
      annoncer(j.nom + ' lance le dé ' + r.de.toUpperCase() + '.');
    } else if (r.etape === 'suivant' || r.etape === 'fin') {
      // Points ajoutés : on l'écrit, puis on passe tout seul au joueur suivant (ou au résultat).
      var av = partie.aventure; // « Léa taille 3 pierres ! » plutôt que « gagne 3 points »
      var gain = j.nom + ' ' + av.objet.verbe + ' ' + A.quantite(av, r.dernierLancer) + ' !';
      var suite;
      if (r.etape === 'suivant') {
        var k = r.joueur + 1 < r.nbJoueurs ? r.joueur + 1 : 0;
        // Nouvelle manche : on dit où l'équipe part (« en route vers le lac »…), demande du 04/11/2026.
        suite = 'Au tour de ' + partie.joueurs[k].nom + (k === 0 ? ', en route vers ' + DESTINATIONS[r.manche + 1] : '') + '.';
      } else {
        suite = 'Tout le monde est arrivé au volcan !';
      }
      // Écrit sur le plateau (bandeau) seulement : plus dans le Tour de jeu (demande du 03/11/2026),
      // mais toujours annoncé aux lecteurs d'écran (le bandeau leur est masqué).
      annoncer(gain + ' ' + suite);
      bandeau(gain + ' ' + suite);
    }
    ajusterTour();
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
    if (partie.carte && partie.carte.attente) return; // le joueur n'a pas encore touché « J'ai compris »
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

  // Cartes où le joueur écrit lui-même sa réponse, corrigée par le jeu (calcul, v5.7).
  // Orthographe (v6.14) : nombre de lettres, de syllabes, consonnes, voyelles, lettres muettes s'écrivent aussi ;
  // « Réécrire le mot » s'écrit aussi depuis la v6.31 (dictée) ; « Épeler à l'oral » se dit au micro (v6.30).
  function aSaisir(c) { return !!(c && (c.type === 'calcul' || c.type === 'conjugaison' || (c.question && c.question.saisie))); }
  function orthoSaisie(c) { return !!(c && c.question && c.question.saisie); }

  // ---------- Épeler à l'oral (v6.28, demande du 09/11/2026) ----------
  // Le mot est caché (la voix le lit ; « Voir le mot » et « Voir la réponse » donneraient la réponse).
  // v6.34 (demande du 09/11/2026) : plus d'essais. Si la reconnaissance vocale se trompe de lettre, le joueur
  // corrige les lettres entendues au clavier (elles s'affichent dans la case de réponse), puis touche « OK ».
  // Lettres entendues justes : bonne réponse tout de suite. « Parler » peut être retouché pour tout redire.
  // Si le micro ne marche pas (refusé, pas de connexion…), la carte repasse en « Bonne / Mauvaise réponse »
  // jugée par les autres joueurs (c.juge). Les tests forcent ce mode avec window.AVENTURA_JUGE.
  var ecoute = null; // écoute en cours (js/parole.js)
  function epelerOral(c) { return !!(c && c.question && c.question.oral && !c.juge && !window.AVENTURA_JUGE); }

  function montrerEpeler(c) {
    $('carte-boutons').hidden = true;
    $('btn-voir-mot').hidden = true;
    var rep = $('carte-reponse'), mot = $('carte-mot'), saisie = $('carte-saisie'), champ = $('reponse-joueur');
    saisie.hidden = true;
    if (c.reponseDonnee != null) {
      // Réponse jugée : le mot et la correction.
      mot.className = 'carte-mot';
      mot.textContent = c.mot;
      rep.hidden = false;
      rep.className = 'carte-reponse ' + (c.juste ? 'juste' : 'fausse');
      rep.textContent = c.juste ? 'Bonne réponse ! ' + c.question.reponse(c.mot)
        : 'Ce n\u2019est pas ça (tu as donné « ' + (c.reponseDonnee || '…') + ' »). La bonne réponse : ' + c.question.reponse(c.mot) + '.';
      return;
    }
    cacherMot();
    $('btn-voir-mot').hidden = true; // cacherMot() remet les boutons à jour
    rep.className = 'carte-reponse entendu';
    if (ecoute) {
      rep.hidden = false;
      rep.textContent = c.entendu ? 'J\u2019entends : ' + c.entendu : 'Je t\u2019écoute… dis les lettres une par une.';
    } else if (c.aCorriger) {
      // Les lettres entendues sont dans la case : le joueur les corrige si besoin, puis « OK ».
      rep.hidden = false;
      rep.textContent = 'Vérifie les lettres entendues. Corrige-les si besoin, puis touche « OK ».';
      saisie.hidden = false;
      champ.setAttribute('inputmode', 'text');
      champ.setAttribute('autocapitalize', 'characters');
      champ.disabled = false;
      $('btn-valider-reponse').disabled = false;
      champ.removeAttribute('aria-invalid');
      if (champ.value !== c.entendu) champ.value = c.entendu || '';
    } else if (c.rienEntendu) {
      rep.hidden = false;
      rep.textContent = 'Je n\u2019ai rien entendu. Touche « Parler » et dis les lettres une par une.';
    } else rep.hidden = true;
  }

  // Lettres entendues, écrites « B A T … » ; un mot collé par la reconnaissance est découpé en lettres (v6.34),
  // pour que le joueur n'ait qu'à corriger la lettre fausse.
  function texteEntendu(t) {
    var e = PAROLE.lettresEntendues(t, true);
    return e.lettres.concat(e.douteux).join(' ');
  }

  function parler() {
    var c = partie.carte, r = partie.regles;
    if (!c || r.etape !== 'repondre' || ecoute) return;
    if (window.speechSynthesis) window.speechSynthesis.cancel(); // la voix du jeu ne doit pas être entendue par le micro
    c.entendu = '';
    c.aCorriger = false;
    c.rienEntendu = false;
    $('reponse-joueur').blur();
    var derniers = [];
    ecoute = PAROLE.ecouter({
      texte: function (props) {
        derniers = props;
        c.entendu = texteEntendu(props[0] || '');
        montrerEpeler(c);
        // Toutes les lettres sont là : inutile d'attendre la fin du silence.
        if (PAROLE.juste(c.mot, props)) ecoute.arreter();
      },
      fin: function (props) {
        ecoute = null;
        if (props && props.length) derniers = props;
        finEcoute(derniers);
      },
      erreur: function (code) {
        ecoute = null;
        if (code === 'no-speech' || code === 'aborted') { c.rienEntendu = true; montrerEpeler(c); rendre(); return; }
        // Micro refusé, pas de connexion… : les autres joueurs jugent (« Bonne / Mauvaise réponse »).
        c.juge = true;
        montrerCarte(partie.joueurs[r.joueur]);
        var rep = $('carte-reponse');
        rep.hidden = false;
        rep.className = 'carte-reponse alerte';
        rep.textContent = 'Le micro ne marche pas ici. Épelle le mot à voix haute : les autres joueurs disent si c\u2019est juste.';
        rendre();
      }
    });
    montrerEpeler(c);
    rendre();
  }

  // Fin de l'écoute : lettres justes → bonne réponse ; sinon le joueur corrige les lettres dans la case.
  function finEcoute(props) {
    var c = partie.carte, r = partie.regles;
    if (!c || r.etape !== 'repondre') return;
    if (!props.length || !c.entendu) { c.rienEntendu = true; montrerEpeler(c); rendre(); return; }
    if (PAROLE.juste(c.mot, props)) { jugerEpeler(true, c.entendu); return; }
    c.aCorriger = true;
    montrerEpeler(c);
    rendre();
    ajusterTour();
    $('reponse-joueur').focus({ preventScroll: true });
  }

  // « OK » après correction : les lettres de la case, comparées à celles du mot (accents non demandés).
  function validerEpeler() {
    var c = partie.carte, champ = $('reponse-joueur'), rep = $('carte-reponse');
    var lettres = Q.lettresEcrites(champ.value);
    if (!lettres.length) {
      rep.hidden = false;
      rep.className = 'carte-reponse alerte';
      rep.textContent = 'Écris les lettres du mot, par exemple : B A T E A U.';
      champ.setAttribute('aria-invalid', 'true');
      champ.focus();
      return;
    }
    champ.blur();
    jugerEpeler(lettres.join('') === PAROLE.lettresDuMot(c.mot).join(''), lettres.join(' '));
  }

  // Réponse définitive : dé FORT si juste ; sinon la correction et « J'ai compris » avant le dé FAIBLE.
  function jugerEpeler(juste, donne) {
    var c = partie.carte, r = partie.regles;
    c.juste = juste;
    c.reponseDonnee = donne;
    c.aCorriger = false;
    c.attente = !juste;
    montrerEpeler(c);
    R.repondre(r, juste);
    reagir(juste);
    rendre();
    lancerApresReaction();
  }

  // Carte d'orthographe à écrire : la consigne, le mot caché (« Voir le mot » l'aide), la case de réponse ;
  // après validation, le mot (lettres muettes surlignées) et la correction.
  function montrerOrthoSaisie(c) {
    var q = c.question, info = C.INFOS[c.mot];
    $('carte-consigne').textContent = Q.consigne(q, c.mot, info, c.params);
    $('carte-boutons').hidden = true; // pas de « Voir la réponse » : c'est le jeu qui corrige
    $('btn-tableau').hidden = true;
    $('carte-tableau').hidden = true;
    var saisie = $('carte-saisie'), champ = $('reponse-joueur'), rep = $('carte-reponse');
    var corrigee = c.reponseDonnee != null;
    saisie.hidden = corrigee;
    champ.setAttribute('inputmode', q.saisie === 'nombre' ? 'numeric' : 'text');
    champ.value = corrigee ? c.reponseDonnee : '';
    champ.disabled = corrigee;
    $('btn-valider-reponse').disabled = corrigee;
    champ.removeAttribute('aria-invalid');
    if (!corrigee && q.montrer) {
      // Lettre manquante, mot mélangé : le joueur voit le mot transformé ; « Voir le mot » donnerait la réponse.
      $('btn-voir-mot').hidden = true;
      var vu = $('carte-mot');
      vu.className = 'carte-mot montre';
      vu.textContent = q.montrer(c.mot, info, c.params);
      rep.hidden = true; rep.className = 'carte-reponse';
      return;
    }
    if (!corrigee) {
      $('btn-voir-mot').hidden = !!q.sansVoirMot; // dictée : voir le mot donnerait la réponse
      if (partie.vue === 'mot') montrerMotSeul(); else cacherMot();
      rep.hidden = true; rep.className = 'carte-reponse';
      return;
    }
    $('btn-voir-mot').hidden = true;
    var mot = $('carte-mot');
    mot.className = 'carte-mot';
    if (q.id === 'muettes') {
      mot.innerHTML = c.mot.split('').map(function (ch, i) {
        return info.muettes.indexOf(i) >= 0 ? '<span class="muette">' + ch + '</span>' : ch;
      }).join('');
    } else mot.textContent = c.mot;
    rep.hidden = false;
    rep.className = 'carte-reponse ' + (c.juste ? 'juste' : 'fausse');
    rep.textContent = c.juste ? 'Bonne réponse ! ' + q.reponse(c.mot, info, c.params)
      : 'Ce n\u2019est pas ça (tu as écrit « ' + c.reponseDonnee + ' »). La bonne réponse : ' + q.reponse(c.mot, info, c.params) + '.';
  }

  // Carte de calcul : la formule, la case de réponse ; après validation, la correction.
  function montrerCalcul(c) {
    var conj = c.type === 'conjugaison';
    var mot = $('carte-mot');
    if (conj) {
      // « Conjugue finir à l'indicatif imparfait : » puis le pronom et la case à remplir.
      $('carte-consigne').innerHTML = 'Conjugue <strong>' + c.verbe + '</strong> <span class="temps-carte">' + c.mode + ' · ' + c.tempsNom.toLowerCase() + '</span>';
      mot.className = 'carte-mot conj';
      mot.textContent = c.pronom + ' …';
    } else {
      $('carte-consigne').textContent = 'Combien font :';
      mot.className = 'carte-mot calcul';
      // Une formule longue peut passer à la ligne, mais jamais entre un signe et le nombre qui le suit.
      mot.textContent = c.formule.replace(/ ([+−×÷]) /g, ' $1\u00a0') + '\u00a0= ?';
    }
    $('btn-voir-mot').hidden = true;
    $('carte-boutons').hidden = true;
    var saisie = $('carte-saisie'), champ = $('reponse-joueur');
    // Une fois la réponse corrigée, la case disparaît : la correction rappelle ce qui a été écrit (v6.2, gain de place).
    saisie.hidden = c.reponseDonnee != null;
    champ.setAttribute('inputmode', conj ? 'text' : 'decimal');
    var corrigee = c.reponseDonnee != null;
    champ.value = corrigee ? c.reponseDonnee : '';
    champ.disabled = corrigee;
    $('btn-valider-reponse').disabled = corrigee;
    champ.removeAttribute('aria-invalid');
    var rep = $('carte-reponse');
    var aide = $('btn-tableau');
    aide.hidden = true;
    $('carte-tableau').hidden = true;
    aide.setAttribute('aria-expanded', 'false');
    if (corrigee) {
      rep.hidden = false;
      rep.className = 'carte-reponse ' + (c.juste ? 'juste' : 'fausse');
      if (conj) {
        rep.textContent = c.juste ? 'Bonne réponse ! ' + c.bonne
          : 'Ce n\u2019est pas ça (tu as écrit « ' + c.reponseDonnee + ' »). La bonne réponse : ' + c.bonne + '.';
        // Réponse fausse : le « ? » montre la conjugaison complète de ce verbe à ce temps.
        if (!c.juste) {
          aide.hidden = false;
          aide.setAttribute('aria-label', 'Voir toute la conjugaison de ' + c.verbe + ' : ' + c.mode.toLowerCase() + ' ' + c.tempsNom.toLowerCase());
          $('carte-tableau').innerHTML = V.tableau(c.verbe, c.temps).map(function (l) {
            return '<li' + (l.personne === c.personne ? ' class="demande"' : '') + '>' + l.texte + '</li>';
          }).join('');
        }
      } else {
        rep.textContent = c.juste ? 'Bonne réponse ! ' + c.formule + ' = ' + c.resultatTexte
          : 'Ce n\u2019est pas ça (tu as écrit « ' + c.reponseDonnee + ' »). La bonne réponse est ' + c.formule + ' = ' + c.resultatTexte + '.';
      }
    } else { rep.hidden = true; rep.className = 'carte-reponse'; }
  }

  // « ? » : montre ou cache le tableau de conjugaison.
  function basculerTableau() {
    var t = $('carte-tableau'), b = $('btn-tableau');
    t.hidden = !t.hidden;
    b.setAttribute('aria-expanded', String(!t.hidden));
    ajusterTour(); // sur téléphone, l'encadré remonte sur le plateau pour montrer tout le tableau
  }

  // « OK » (ex-« Valider ») : la réponse écrite : le jeu la corrige, puis le bon dé se lance tout seul.
  function validerSaisie(e) {
    e.preventDefault();
    var r = partie.regles, c = partie.carte;
    if (r && r.etape === 'repondre' && epelerOral(c) && c.aCorriger) { validerEpeler(); return; } // v6.34
    if (!r || r.etape !== 'repondre' || !aSaisir(c)) return;
    var champ = $('reponse-joueur'), texte = champ.value.trim();
    var rep = $('carte-reponse');
    var conj = c.type === 'conjugaison', ortho = orthoSaisie(c);
    var illisible = ortho ? !Q.lisible(c.question, texte) : (!conj && isNaN(K.lire(texte)));
    if (!texte || illisible) {
      rep.hidden = false;
      rep.className = 'carte-reponse alerte';
      rep.textContent = !texte ? 'Écris ta réponse dans la case.'
        : ortho ? ({ nombre: 'Écris un nombre, par exemple 5.', mot: 'Écris le mot en lettres.',
          article: C.INFOS[c.mot].elision ? 'Écris « un » ou « une ».' : 'Écris « le » ou « la ».' }[c.question.saisie] || 'Écris des lettres, par exemple : a, e.')
        : 'Écris un nombre, par exemple 12 ou 3,5.';
      champ.setAttribute('aria-invalid', 'true');
      champ.focus();
      return;
    }
    c.reponseDonnee = texte;
    champ.blur(); // le clavier se referme : la carte rend la place au plateau et au dé (v6.13)
    c.juste = ortho ? Q.juste(c.question, texte, c.mot, C.INFOS[c.mot], c.params)
      : conj ? V.juste(texte, c.verbe, c.temps, c.personne) : K.juste(texte, c.resultat);
    // Réponse fausse (calcul ou conjugaison) : on attend « J'ai compris » avant de lancer le dé (v6.1).
    c.attente = !c.juste;
    if (ortho) { montrerOrthoSaisie(c); ajusterTour(); } else montrerCalcul(c);
    R.repondre(r, c.juste);
    reagir(c.juste);
    rendre();
    lancerApresReaction();
  }

  // Affiche la carte piochée : la question tirée et le mot caché (ou la lettre affichée), avec la lecture vocale.
  function montrerCarte(j) {
    var c = partie.carte;
    var box = $('carte-piochee');
    box.hidden = false;
    box.className = 'carte-piochee joueur-' + j.couleur;
    $('carte-saisie').hidden = true;
    $('reponse-joueur').setAttribute('autocapitalize', 'off'); // « Épeler à l'oral » met des majuscules (v6.34)
    if (aSaisir(c) && !orthoSaisie(c)) {
      // Le titre de la carte = son thème seul, écrit gros (v6.27 : plus de « Carte n° … de … »).
      $('carte-titre').textContent = c.packNom;
      montrerCalcul(c);
      return;
    }
    $('carte-reponse').className = 'carte-reponse';
    $('carte-titre').textContent = c.packNom + (c.question ? ' · ' + c.question.nom : '');
    $('carte-consigne').textContent = c.lettre ? 'Quelle est cette lettre ?' : Q.consigne(c.question, c.mot, C.INFOS[c.mot], c.params);
    var mot = $('carte-mot');
    var boutons = $('carte-boutons'), voirMot = $('btn-voir-mot');
    $('carte-reponse').hidden = true;
    if (c.lettre) {
      mot.textContent = c.mot;
      mot.className = 'carte-mot lettre';
      boutons.hidden = true; voirMot.hidden = true;
    } else if (orthoSaisie(c)) {
      montrerOrthoSaisie(c);
    } else if (epelerOral(c)) {
      montrerEpeler(c);
    } else {
      cacherMot();
      boutons.hidden = false; voirMot.hidden = false;
    }
  }

  function cacherMot() {
    var mot = $('carte-mot');
    mot.className = 'carte-mot cache';
    mot.innerHTML = '<span aria-hidden="true">' + partie.carte.mot.replace(/[^\s'’-]/g, '•') + '</span><span class="visually-hidden">Mot caché</span>';
    $('carte-reponse').hidden = true;
    partie.vue = 'cache';
    majBoutonsCarte();
    ajusterTour();
  }

  // Textes des deux boutons selon ce qui est affiché : rien, le mot seul (aide) ou la réponse.
  function majBoutonsCarte() {
    var mot = $('btn-voir-mot'), rep = $('btn-voir');
    mot.querySelector('.btn-libelle').textContent = partie.vue === 'mot' ? 'Cacher le mot' : 'Voir le mot'; // garde l'icône d'œil
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
    ajusterTour();
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
    ajusterTour();
  }

  function brancherCarte() {
    $('carte-saisie').addEventListener('submit', validerSaisie);
    // Épeler à l'oral (v6.34) : les lettres corrigées par le joueur sont gardées sur la carte (rechargement de la page).
    $('reponse-joueur').addEventListener('input', function () {
      var c = partie.carte;
      if (epelerOral(c) && c.aCorriger) { c.entendu = this.value; sauver(); }
    });
    $('btn-tableau').addEventListener('click', basculerTableau);
    $('btn-voir-mot').addEventListener('click', function () { if (partie.vue === 'mot') cacherMot(); else montrerMotSeul(); });
    $('btn-voir').addEventListener('click', function () { if (partie.vue === 'reponse') cacherMot(); else montrerReponse(); });
    var ecouter = $('btn-ecouter');
    if (!window.Voix.disponible()) {
      ecouter.disabled = true;
      ecouter.title = 'La lecture à voix haute n\u2019est pas disponible sur cet appareil';
    }
    ecouter.addEventListener('click', function () { window.Voix.lire(window.Voix.texteCarte(partie.carte)); });
  }

  // ---------- Tour de jeu sur téléphone (v6.2) ----------
  // Sur téléphone, la page ne défile pas : si le contenu du tour de jeu (carte, correction, tableau « ? »)
  // ne tient plus sous le plateau, l'encadré remonte sur le plateau. Il redescend dès que le contenu tient
  // (au tour suivant) et pendant que le dé roule, pour qu'on le voie.
  function ajusterTour() {
    var table = document.querySelector('.table'), tour = $('tour');
    if (!table) return;
    var r = partie.regles;
    var deEnCours = r && (r.etape === 'lancer' && !(partie.carte && partie.carte.attente) || r.etape === 'suivant' || r.etape === 'fin');
    table.classList.remove('tour-monte');
    if (deEnCours || $('ecran-plateau').hidden) return; // tous les écrans depuis la v6.8
    if (document.body.classList.contains('saisie-clavier')) return; // la carte occupe déjà tout l'écran visible (v6.13)
    if (tour.scrollHeight > tour.clientHeight + 1) table.classList.add('tour-monte');
  }
  window.addEventListener('resize', ajusterTour);
  window.addEventListener('resize', degagerDe);

  // ---------- Saisie au clavier sur écran tactile (v6.13, lignes 106-107 du backlog) ----------
  // Quand le joueur écrit sa réponse, le clavier du téléphone couvre une bonne partie de l'écran.
  // La carte se pose alors par-dessus le plateau et occupe exactement la partie visible au-dessus
  // du clavier (API Visual Viewport) : rien n'est coupé en haut, rien n'est caché par le clavier,
  // la case de réponse est juste au-dessus du clavier. Le clavier refermé, tout revient en place.
  var tactile = window.matchMedia('(pointer: coarse)');
  var vv = window.visualViewport;
  // suivi : le curseur est dans la case ; clavierVu : le clavier est ouvert (zone visible réduite).
  // La carte ne passe en grand que si les deux sont vrais : un clavier physique (tablette) ne change rien.
  var saisie = { suivi: false, hauteurSansClavier: 0, clavierVu: false, minuteur: 0 };

  function hauteurVisible() { return vv ? vv.height : window.innerHeight; }

  // Zone visible de l'écran (au-dessus du clavier), reportée dans des variables CSS.
  function placerSaisie() {
    var h = hauteurVisible();
    var s = document.body.style;
    s.setProperty('--vv-haut', (vv ? vv.offsetTop : 0) + 'px');
    s.setProperty('--vv-h', h + 'px');
    // Très peu de hauteur (téléphone en paysage, clavier ouvert) : carte resserrée.
    document.body.classList.toggle('saisie-basse', h < 340);
  }

  // Met la carte en grand (ou la range) selon l'état du curseur et du clavier.
  function afficherSaisie() {
    var oui = saisie.suivi && saisie.clavierVu;
    var avant = document.body.classList.contains('saisie-clavier');
    if (oui) { document.querySelector('.table').classList.remove('tour-monte'); placerSaisie(); }
    if (oui === avant) return;
    document.body.classList.toggle('saisie-clavier', oui);
    if (!oui) { document.body.classList.remove('saisie-basse'); ajusterTour(); }
  }

  function doitSuivre() {
    var champ = $('reponse-joueur');
    return tactile.matches && document.activeElement === champ && !champ.disabled && !$('ecran-plateau').hidden;
  }

  function majSaisie() {
    clearTimeout(saisie.minuteur);
    var oui = doitSuivre();
    if (oui && !saisie.suivi) {
      saisie.hauteurSansClavier = window.innerHeight;
      saisie.clavierVu = hauteurVisible() < saisie.hauteurSansClavier * 0.85; // clavier déjà ouvert
    }
    saisie.suivi = oui;
    if (!oui) saisie.clavierVu = false;
    afficherSaisie();
  }

  // Le clavier s'ouvre ou se ferme : la zone visible change de taille.
  function clavierBouge() {
    if (!saisie.suivi) return;
    var ouvert = hauteurVisible() < saisie.hauteurSansClavier * 0.85;
    // Clavier refermé par le joueur (touche « retour » d'Android) : on rend le plateau.
    if (!ouvert && saisie.clavierVu) { saisie.clavierVu = false; $('reponse-joueur').blur(); afficherSaisie(); return; }
    saisie.clavierVu = ouvert;
    afficherSaisie();
  }

  // Entrée immédiate (le curseur arrive dans la case). Sortie différée : un toucher sur « OK »
  // ou « Écouter » déplace le focus, et le clic doit tomber sur le bouton visé, pas sur ce qui
  // apparaîtrait dessous si la carte se rangeait au même instant.
  function majSaisieBientot() { clearTimeout(saisie.minuteur); saisie.minuteur = setTimeout(majSaisie, 300); }
  document.addEventListener('focusin', function (e) { if (e.target === $('reponse-joueur')) majSaisie(); else majSaisieBientot(); });
  document.addEventListener('focusout', majSaisieBientot);
  if (vv) { vv.addEventListener('resize', clavierBouge); vv.addEventListener('scroll', clavierBouge); }
  else window.addEventListener('resize', clavierBouge);

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
    zone.style.top = ''; zone.style.left = ''; // repart de sa place d'origine (voir degagerDe)
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
    $('fin-texte').textContent = 'L’équipe a ' + av.objet.participe + ' ' + A.quantite(av, r.points) + ', il en fallait ' + r.objectif + '. ' +
      (ok ? 'Bravo, vous avez tous réussi l’aventure ' + av.nom + ' !' : 'Vous ferez mieux la prochaine fois !');
    $('fin').className = 'fin ' + (ok ? 'gagne' : 'perdu');
    // Étoiles gagnées (v6.36) : toute aventure gagnée rapporte ce que l'équipe a récolté (doublé pour un défi du jour).
    if (window.Recompenses) {
      window.Recompenses.finDePartie({ regles: r, aventure: av, gagnee: ok, defi: partie.defi ? partie.defi.type : null });
      sauver();
    }
    $('fin').showModal();
  }
  $('btn-rejouer').addEventListener('click', function () { $('fin').close(); lancerPartie(); });
  $('btn-nouvelle').addEventListener('click', function () { $('fin').close(); annulerMinuteurs(); partie.modif = false; preparer(1); });

  // ---------- Sauvegarde de la partie (stockage de session) ----------
  // sessionStorage : « survit aux rechargements et restaurations de la page ; fermer l'onglet efface les données »
  // (MDN, Window.sessionStorage). Les objets (aventure, aventuriers, questions) sont enregistrés par leur identifiant.
  var CLE = 'ludoaventura-partie';
  var PAGES_ACCUEIL = ['ecran-etoiles', 'ecran-progression', 'ecran-defi']; // écrans ouverts depuis l'accueil (v6.36)
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
      choix: partie.choix, packs: partie.packs, types: partie.types, actif: partie.actif,
      matiere: partie.matiere, francais: partie.francais, maths: partie.maths, conj: partie.conj,
      etapePrepa: partie.etapePrepa, sousEtape: partie.sousEtape, modif: !!partie.modif
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
    // Écrans des étoiles (v6.36) : ils s'ouvrent depuis l'accueil, on y revient.
    if (!d || !d.ecran || d.ecran === 'ecran-accueil' || PAGES_ACCUEIL.indexOf(d.ecran) >= 0) return false;
    try {
      // Préparation : nombre de joueurs, aventure, aventuriers et réglages des cartes.
      var nb = document.querySelector('input[name="nb"][value="' + d.nb + '"]');
      if (nb) nb.checked = true;
      var av = document.querySelector('input[name="aventure"][value="' + d.aventure + '"]');
      if (av) av.checked = true;
      partie.choix = d.choix; partie.packs = d.packs.map(function (l) { return l.filter(function (id) { return TOUS_PACKS.indexOf(id) >= 0; }); }); partie.types = d.types.map(function (l) { return l.filter(function (id) { return TOUS_TYPES.indexOf(id) >= 0; }); }); partie.actif = d.actif || 0;
      partie.etapePrepa = d.etapePrepa || 1;
      partie.sousEtape = d.sousEtape || 'matiere';
      partie.modif = !!(d.modif && d.jeu); // « Modifier les choix » en cours : la partie attend d'être reprise
      if (d.matiere) {
        partie.matiere = d.matiere.map(function (m) { return MATIERES.indexOf(m) >= 0 ? m : null; });
        partie.francais = d.francais || partie.francais;
        partie.maths = d.maths || partie.maths;
        partie.conj = (d.conj || partie.conj).map(function (c) {
          // Sauvegarde d'avant la v6.0 : les modes se déduisent des temps choisis.
          if (!c.modes) c.modes = c.temps.map(function (t) { return t.split('.')[0]; }).filter(function (m, k, l) { return l.indexOf(m) === k; });
          return c;
        });
      } else {
        // Sauvegarde d'avant la v5.7 : un joueur qui avait des packs jouait en orthographe.
        partie.matiere = partie.packs.map(function (l) { return l.length ? 'orthographe' : null; });
        partie.francais = partie.matiere.map(function (m) { return !!m; });
      }
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
      if (d.ecran !== 'ecran-plateau' || !d.jeu) {
        afficher(d.ecran);
        montrerEtape(partie.etapePrepa); // même écran de la préparation, même joueur
        return true;
      }
      montrerEtape(partie.etapePrepa);

      reprendreLePlateau(d.jeu.vue);
      return true;
    } catch (e) {
      // Sauvegarde illisible (ancienne version du jeu…) : on repart de l'accueil.
      try { sessionStorage.removeItem(CLE); } catch (e2) { /* rien */ }
      return false;
    }
  }


  // Plateau : on reprend l'étape en cours. Une animation interrompue (dé, pause de lecture) est rejouée ou terminée.
  // vue : ce qui était ouvert sur la carte (« cache », « mot » ou « reponse »).
  function reprendreLePlateau(vue) {
    var r = partie.regles;
    afficher('ecran-plateau');
    if (r.etape === 'suivant') R.suivant(r); // les points étaient déjà comptés : on passe au joueur suivant
    var j = partie.joueurs[r.joueur];
    if ((r.etape === 'repondre' || r.etape === 'lancer') && partie.carte) {
      partie.vue = vue || 'cache'; // orthographe écrite : « Voir le mot » reste ouvert après un rechargement
      montrerCarte(j);
      if (!partie.carte.lettre && !aSaisir(partie.carte)) {
        if (vue === 'mot') montrerMotSeul(); else if (vue === 'reponse') montrerReponse();
      }
    } else $('carte-piochee').hidden = true;
    rendre();
    if (r.etape === 'lancer') lancerApresReaction();
    if (r.etape === 'fin') montrerFin();
  }

  // ---------- Menu de la partie (v6.22) ----------
  // « Redémarrer partie » : même préparation, on recommence à zéro.
  // « Modifier les choix » : retour à la préparation (tous les choix gardés), puis « Reprendre la partie »
  //   la continue là où elle en était, avec les nouveaux réglages.
  // « Retour à l'accueil » : la partie est arrêtée et tout repart de zéro.
  function ouvrirMenu() { if (!$('menu-partie').open) { montrerChoix(); $('menu-partie').showModal(); } }
  // Le menu montre ses 3 choix, ou la question de confirmation (v6.25, choix de l'utilisateur).
  var aConfirmer = null;
  function montrerChoix() {
    aConfirmer = null;
    $('menu-confirmer').hidden = true;
    $('menu-partie').querySelector('.menu-actions').hidden = false;
    $('menu-titre').textContent = 'Menu';
  }
  function demanderConfirmation(titre, texte, oui, action) {
    aConfirmer = action;
    $('menu-titre').textContent = titre;
    $('menu-confirmer-texte').textContent = texte;
    $('btn-confirmer-oui').textContent = oui;
    $('menu-partie').querySelector('.menu-actions').hidden = true;
    $('menu-confirmer').hidden = false;
    $('btn-confirmer-non').focus();
  }
  function fermerMenu() { if ($('menu-partie').open) $('menu-partie').close(); }

  // Reprend la partie après « Modifier les choix ». Hypothèses (à valider, voir BACKLOG) :
  //  - la carte piochée mais pas encore répondue retourne dans le tas (le joueur repioche avec ses nouveaux réglages) ;
  //  - les tas de cartes sont refaits avec les nouveaux réglages ; les points de l'équipe sont gardés ;
  //  - l'objectif suit l'aventure et le nombre de joueurs choisis ;
  //  - un joueur ajouté attend sur la croix d'avant et joue cette manche à son tour ;
  //  - si le joueur dont c'était le tour est retiré, on passe à la manche suivante.
  function reprendreApresModif() {
    annulerMinuteurs();
    partie.modif = false;
    lireChoix();
    var r = partie.regles, nb = partie.nbJoueurs, avant = r.nbJoueurs;
    if (r.etape === 'repondre') { r.pioches[r.joueur]--; r.etape = 'piocher'; partie.carte = null; }
    if (nb !== avant) {
      r.positions.length = Math.min(r.positions.length, nb);
      r.pioches.length = Math.min(r.pioches.length, nb);
      for (var i = avant; i < nb; i++) {
        // Un joueur ajouté vient après le joueur en cours : il attend sur la croix d'avant et joue cette manche à son tour.
        r.positions.push(r.manche - 1);
        r.pioches.push(0);
      }
      r.nbJoueurs = nb;
      if (r.joueur >= nb) {
        // Le joueur dont c'était le tour n'est plus là : manche suivante (ou fin après le volcan).
        partie.carte = null; r.de = null; r.dernierLancer = null; r.joueur = 0;
        if (r.manche >= R.NB_CROIX) r.etape = 'fin';
        else { r.manche++; r.positions[0] = r.manche; r.etape = 'piocher'; }
      } else if (r.etape === 'fin' && r.joueur < nb - 1) {
        r.etape = 'suivant'; // des joueurs ajoutés n'ont pas encore joué au volcan
      }
    }
    partie.joueurs = [];
    for (var k = 0; k < nb; k++) {
      var perso = P.trouver(partie.choix[k]);
      partie.joueurs.push({ nom: perso.nom, aventurier: perso, couleur: COULEURS[k], index: k, tas: melanger(cartesDuJoueur(k)) });
    }
    partie.objectif = A.objectif(partie.aventure, nb);
    r.objectif = partie.objectif;
    preparerPlateau(false);
    reprendreLePlateau(partie.vue);
  }

  $('btn-menu').addEventListener('click', ouvrirMenu);
  $('btn-menu-fermer').addEventListener('click', fermerMenu);
  // Un toucher à côté de la boîte (sur le fond sombre) referme aussi le menu.
  $('menu-partie').addEventListener('click', function (e) { if (e.target === $('menu-partie')) fermerMenu(); });
  $('btn-redemarrer').addEventListener('click', function () {
    demanderConfirmation('Redémarrer ?', 'La partie en cours sera perdue : on recommence avec les mêmes joueurs et la même aventure.',
      'Oui, redémarrer', function () { fermerMenu(); lancerPartie(); });
  });
  $('btn-confirmer-oui').addEventListener('click', function () { var a = aConfirmer; montrerChoix(); if (a) a(); });
  $('btn-confirmer-non').addEventListener('click', montrerChoix);
  $('btn-modifier').addEventListener('click', function () {
    fermerMenu();
    annulerMinuteurs();
    partie.modif = true;
    preparer(1);
  });
  $('btn-accueil').addEventListener('click', function () {
    demanderConfirmation('Retour à l’accueil ?', 'La partie en cours sera arrêtée et tous les choix effacés.', 'Oui, arrêter la partie', retourAccueil);
  });
  function retourAccueil() {
    fermerMenu();
    annulerMinuteurs();
    // Tout repart de zéro : on efface la partie gardée dans l'onglet et on recharge la page sur l'accueil.
    pretASauver = false;
    try { sessionStorage.removeItem(CLE); } catch (e) { /* rien */ }
    window.location.reload();
  }

  // Sauvegarde aussi au moment où la page est quittée ou masquée (veille, autre application).
  window.addEventListener('pagehide', sauver);
  document.addEventListener('visibilitychange', function () { if (document.hidden) sauver(); });

  // ---------- Navigation ----------
  // Ouvre la préparation sur l'écran n (1 = nombre de joueurs).
  function preparer(n) {
    if (n === 1) partie.actif = 0;
    afficher('ecran-preparation');
    montrerEtape(n);
  }
  $('btn-commencer').addEventListener('click', function () { preparer(1); });
  $('btn-prepa-retour').addEventListener('click', revenir);

  // ---------- Touche « précédent » du téléphone ou de la tablette (v6.23) ----------
  // Sans rien faire, elle quitte la page (et ferme l'application installée). On garde donc une entrée
  // « garde » dans l'historique (History API, pushState) : la touche la retire, l'évènement popstate arrive,
  // et on fait comme le bouton « ← Retour » : écran précédent de la préparation, ou menu sur le plateau.
  // Sur l'accueil, il n'y a pas d'écran précédent : la touche quitte normalement.
  // Chrome ignore les entrées ajoutées sans geste de l'utilisateur : la garde est reposée au toucher suivant.
  var quitter = false;
  function armerRetour(geste) {
    var st = history.state;
    if (st && st.aventura === 'garde' && (st.geste || !geste)) return;
    try { history.pushState({ aventura: 'garde', geste: !!geste }, ''); } catch (e) { /* historique indisponible */ }
  }
  function surInteraction() { if ((partie.ecran || 'ecran-accueil') !== 'ecran-accueil') armerRetour(true); }
  document.addEventListener('pointerdown', surInteraction, true);
  document.addEventListener('keydown', surInteraction, true);
  window.addEventListener('popstate', function () {
    var ecran = partie.ecran || 'ecran-accueil';
    if (quitter || ecran === 'ecran-accueil') {
      // Accueil : on laisse la touche quitter, en sautant les gardes restées dans l'historique.
      quitter = true;
      if (history.state && history.state.aventura === 'garde') history.back();
      return;
    }
    if ($('menu-partie').open) fermerMenu();
    else if ($('fin').open) { /* fin de partie : on reste sur le résultat */ }
    else if (ecran === 'ecran-preparation') revenir();
    else if (ecran === 'ecran-plateau') ouvrirMenu();
    else if (PAGES_ACCUEIL.indexOf(ecran) >= 0) { if ($('coffre').open) $('coffre').close(); else afficher('ecran-accueil'); }
    if ((partie.ecran || 'ecran-accueil') !== 'ecran-accueil') armerRetour(false);
  });
  ['btn-valider-nb', 'btn-valider-aventurier', 'btn-valider-reglages'].forEach(function (id) { $(id).addEventListener('click', valider); });
  // Entrée dans le formulaire : « Valider » sur les premiers écrans, « Lancer la partie » sur le dernier.
  $('form-preparation').addEventListener('submit', function (e) {
    e.preventDefault();
    if (partie.etapePrepa < NB_ETAPES) { valider(); return; }
    if (!verifierReglages()) return;
    if (partie.modif && partie.regles) reprendreApresModif(); else lancerPartie();
  });

  construireAventures();
  construireAventuriers();
  construireCases();
  brancherCarte();
  montrerEtape(1);
  reprendre();
  pretASauver = true;
  sauver();

  // Préchargement discret des deux plateaux (jour et soir) pendant que l'accueil est affiché (v6.26).
  // Les images restent référencées : une fois la page ouverte, le plateau s'affiche même si le
  // réseau est coupé ensuite (mode avion), sans dépendre de la copie hors ligne.
  var plateauxGardes = [];
  window.addEventListener('load', function () {
    ['jour', 'soir'].forEach(function (a) {
      var im = new Image();
      im.src = 'img/plateau-' + a + '.webp';
      if (im.decode) im.decode().catch(function () {});
      plateauxGardes.push(im);
    });
  });
  // Si le plateau n'a pas pu se charger (hors ligne), il se recharge seul au retour du réseau.
  $('plateau-img').addEventListener('error', function () {
    var img = this;
    window.addEventListener('online', function () {
      var src = img.getAttribute('src');
      img.src = '';
      img.src = src;
    }, { once: true });
  });

  window.Aventura = { afficher: afficher, cases: CASES, route: ROUTE, trajet: trajet, decalages: DECALAGES, partie: partie, cartesDuJoueur: cartesDuJoueur, majConstruction: majConstruction,
    // Tests : lancer le dé sans attendre le lancer automatique (il n'y a plus de bouton depuis v4.3).
    lancerDe: function () { lancerDe(partie.regles.de); } };
})();

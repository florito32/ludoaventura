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

  // Couleur de chaque joueur : son pion et son tas de cartes (1 à 4 joueurs, le 4e a des cartes vertes).
  var COULEURS = ['rouge', 'jaune', 'bleu', 'vert'];
  // Décalage des pions posés sur une même case (en % de la largeur du plateau).
  var DECALAGES = [[-2.6, -2.6], [2.6, -2.6], [-2.6, 2.6], [2.6, 2.6]];
  var RAPPORT = 1600 / 1071; // largeur / hauteur du plateau

  var $ = function (id) { return document.getElementById(id); };
  var A = window.Aventures;
  var P = window.Aventuriers;
  var C = window.Cartes;
  var TOUS_PACKS = C.PACKS.map(function (p) { return p.id; });
  var Q = window.Questions;
  var TOUS_TYPES = Q.TYPES.map(function (t) { return t.id; });

  // État de la partie (en mémoire : une nouvelle ouverture repart de zéro).
  // choix[i] = aventurier du joueur i (par défaut : les 4 premiers de la liste) ;
  // packs[i] / niveaux[i] = packs où le joueur i pioche et son niveau (niveau 1 par défaut).
  // Packs et types de questions sont décochés au départ : c'est au joueur de les cocher (demande du 02/11/2026).
  var partie = {
    nbJoueurs: 2, aventure: A.LISTE[0], joueurs: [], choix: ['lea', 'tom', 'nour', 'malo'], actif: 0, regles: null,
    packs: [[], [], [], []], niveaux: [1, 1, 1, 1], carte: null,
    types: [[], [], [], []] // types de questions cochés par chaque joueur
  };

  function afficher(id) {
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
    partie.etapesVues = 0;

    // Pions : tous posés sur DÉPART…
    var pions = $('pions');
    pions.innerHTML = '';
    partie.joueurs.forEach(function (j, k) {
      var p = document.createElement('span');
      p.className = 'pion pion-' + j.couleur;
      p.style.backgroundImage = 'url("' + j.aventurier.image + '")';
      p.style.left = (CASES[0].x + DECALAGES[k][0]) + '%';
      p.style.top = (CASES[0].y + DECALAGES[k][1] * RAPPORT) + '%';
      p.dataset.case = '0';
      pions.appendChild(p);
    });

    $('carte-piochee').hidden = true;
    $('bandeau').hidden = true;
    $('de-plateau').hidden = true;
    $('reaction').hidden = true;
    partie.roule = false;
    afficher('ecran-plateau');
    // …puis le premier joueur se déplace de DÉPART jusqu'à la première croix (animation de début de partie).
    rendre({ sansDeplacement: true });
    plusTard(function () { rendre(); }, 450);
  }

  // Place un pion sur sa case ; les pions d'une même case sont décalés pour rester visibles.
  function placerPions() {
    var r = partie.regles;
    document.querySelectorAll('.pion').forEach(function (p, i) {
      var c = CASES[r.positions[i]];
      p.style.left = (c.x + DECALAGES[i][0]) + '%';
      p.style.top = (c.y + DECALAGES[i][1] * RAPPORT) + '%';
      p.dataset.case = r.positions[i];
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
    if (r.etape === 'piocher') {
      $('carte-piochee').hidden = true;
      consigne.textContent = j.nom + ' avance sur la croix et pioche une carte dans son tas.';
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
      consigne.textContent = r.de === 'fort'
        ? 'Bravo ! ' + j.nom + ' lance le dé FORT.'
        : 'Les autres joueurs et le maître du jeu aident à trouver la bonne réponse, puis ' + j.nom + ' lance le dé FAIBLE.';
      consigne.textContent += ' Le dé se lance tout seul dans un instant.';
      bouton('Lancer le dé ' + r.de.toUpperCase(), 'btn-principal', function () { lancerDe(r.de); });
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
    zone.style.left = pion.style.left;
    zone.style.top = pion.style.top;
    var html = '<span class="reaction-texte">' + (bonne ? 'Bravo !' : 'Oups !') + '</span>';
    if (bonne) {
      for (var i = 0; i < 18; i++) {
        var a = (i / 18) * 2 * Math.PI, d = 40 + Math.random() * 40;
        html += '<i style="--dx:' + Math.round(Math.cos(a) * d) + 'px;--dy:' + Math.round(Math.sin(a) * d - 20) + 'px;background:' +
          COULEURS_CONFETTIS[i % COULEURS_CONFETTIS.length] + ';animation-delay:' + Math.round(Math.random() * 120) + 'ms"></i>';
      }
    }
    zone.innerHTML = html;
    pion.classList.remove('saute', 'secoue');
    void pion.offsetWidth;
    pion.classList.add(bonne ? 'saute' : 'secoue');
    plusTard(function () { zone.hidden = true; pion.classList.remove('saute', 'secoue'); }, DUREE_REACTION);
  }

  // Une fois l'animation de réponse terminée, le bon dé (FORT ou FAIBLE) se lance tout seul.
  // Le bouton « Lancer le dé » reste là pour lancer plus tôt. Les tests règlent ce délai avec window.AVENTURA_AUTO_DE.
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
    clearTimeout(minuteurDe); minuteurDe = null; // lancé à la main avant le lancer automatique
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

  // Préchargement discret du plateau pendant que l'accueil est affiché.
  window.addEventListener('load', function () { new Image().src = 'img/plateau-jour.webp'; });

  window.Aventura = { cases: CASES, partie: partie, cartesDuJoueur: cartesDuJoueur, majConstruction: majConstruction };
})();

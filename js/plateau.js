// Aventura — écrans du jeu : accueil → préparation (joueurs, aventure) → plateau.
// Dépend de js/des.js (window.Des) et js/aventures.js (window.Aventures).
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

  // État de la partie (en mémoire : une nouvelle ouverture repart de zéro).
  // choix[i] = aventurier du joueur i (par défaut : les 4 premiers de la liste).
  var partie = { nbJoueurs: 2, aventure: A.LISTE[0], points: 0, joueurs: [], choix: ['lea', 'tom', 'nour', 'malo'], actif: 0 };

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
  // Toucher un portrait le donne au joueur actif, puis passe au joueur suivant.
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
        if (partie.actif < partie.nbJoueurs - 1) partie.actif++;
        majAventuriers();
      });
      grille.appendChild(b);
    });
    majAventuriers();
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
        '<strong>' + a.nom + '</strong></span>';
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

  function lancerPartie() {
    lireChoix();
    var av = partie.aventure;
    partie.points = 0;
    partie.joueurs = [];
    for (var i = 0; i < partie.nbJoueurs; i++) {
      var perso = P.trouver(partie.choix[i]);
      partie.joueurs.push({ nom: perso.nom, aventurier: perso, couleur: COULEURS[i], kase: 0 });
    }

    // Rouleau : nom et image de l'aventure à la place de « MISSION ».
    $('rouleau-img').src = av.image;
    $('rouleau-img').alt = 'Aventure ' + av.nom;
    $('rouleau-nom').textContent = av.nom;

    // Points et objectif.
    var obj = A.objectif(av, partie.nbJoueurs);
    $('points').textContent = partie.points;
    $('objectif').textContent = obj;
    $('objectif-texte').textContent = 'Objectif : ' + libelleObjectif(av, partie.nbJoueurs);
    $('jauge').setAttribute('aria-valuemax', obj);
    $('jauge').setAttribute('aria-valuenow', partie.points);
    $('jauge-barre').style.width = Math.min(100, partie.points / obj * 100) + '%';

    // Pions sur DÉPART (règle : « tous les pions rassemblés à l'emplacement DÉPART »).
    var pions = $('pions'), liste = $('joueurs'), tas = $('tas');
    pions.innerHTML = ''; liste.innerHTML = ''; tas.innerHTML = '';
    partie.joueurs.forEach(function (j, i) {
      var p = document.createElement('span');
      p.className = 'pion pion-' + j.couleur;
      p.style.backgroundImage = 'url("' + j.aventurier.image + '")';
      p.style.left = (CASES[0].x + DECALAGES[i][0]) + '%';
      p.style.top = (CASES[0].y + DECALAGES[i][1] * RAPPORT) + '%';
      p.dataset.case = '0';
      pions.appendChild(p);

      var li = document.createElement('li');
      li.innerHTML = '<img class="portrait-mini joueur-' + j.couleur + '" src="' + j.aventurier.image + '" alt="" width="200" height="220">' +
        '<span>' + j.nom + ' <span class="joueur-couleur">(' + j.couleur + ')</span></span>' +
        '<span class="joueur-case">DÉPART</span>';
      liste.appendChild(li);

      // Tas de cartes du joueur, de sa couleur.
      var t = document.createElement('li');
      t.className = 'pile pile-' + j.couleur;
      t.innerHTML = '<span class="carte" aria-hidden="true"></span>' + j.nom;
      tas.appendChild(t);
    });

    afficher('ecran-plateau');
  }

  // Ambiance jour / soir : les deux versions du plateau illustré.
  function brancherAmbiance() {
    document.querySelectorAll('.ambiance-btn').forEach(function (b) {
      b.addEventListener('click', function () {
        var a = b.dataset.ambiance;
        $('plateau-img').src = 'img/plateau-' + a + '.webp';
        document.querySelectorAll('.ambiance-btn').forEach(function (x) {
          x.setAttribute('aria-pressed', String(x === b));
        });
        $('plateau').classList.toggle('soir', a === 'soir');
      });
    });
  }

  // ---------- Dés ----------
  // Dessine la face d'un dé (points placés sur une grille 3 × 3).
  function dessinerFace(de, valeur) {
    var cases = window.Des.POINTS[valeur];
    var html = '';
    for (var k = 0; k < 9; k++) html += cases.indexOf(k) >= 0 ? '<i style="grid-area:' + (Math.floor(k / 3) + 1) + '/' + (k % 3 + 1) + '"></i>' : '';
    de.innerHTML = html;
    de.dataset.valeur = valeur;
  }

  function brancherDes() {
    document.querySelectorAll('.de-btn').forEach(function (btn) {
      var type = btn.dataset.de;
      var de = btn.querySelector('.de');
      dessinerFace(de, type === 'fort' ? 6 : 3);
      btn.addEventListener('click', function () {
        var v = window.Des.lancer(type);
        de.classList.remove('roule');
        void de.offsetWidth; // relance l'animation
        de.classList.add('roule');
        dessinerFace(de, v);
        $('de-resultat').textContent = 'Dé ' + type.toUpperCase() + ' : ' + v + ' point' + (v > 1 ? 's' : '');
      });
    });
  }

  // ---------- Navigation ----------
  $('btn-commencer').addEventListener('click', function () { afficher('ecran-preparation'); });
  document.querySelectorAll('[data-vers]').forEach(function (b) {
    b.addEventListener('click', function () { afficher(b.dataset.vers); });
  });
  $('form-preparation').addEventListener('submit', function (e) { e.preventDefault(); lancerPartie(); });

  construireAventures();
  construireAventuriers();
  construireCases();
  brancherAmbiance();
  brancherDes();

  // Préchargement discret du plateau pendant que l'accueil est affiché.
  window.addEventListener('load', function () { new Image().src = 'img/plateau-jour.webp'; });

  window.Aventura = { cases: CASES, partie: partie };
})();

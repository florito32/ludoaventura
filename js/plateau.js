// Aventura — affichage de l'accueil et du plateau (visuel seulement, pas encore de questions).
(function () {
  'use strict';

  // Cases du parcours, dans l'ordre, en % de l'image du plateau (img/plateau-*.webp, 1600 × 1071).
  // Relevées sur les croix rouges de l'illustration.
  var CASES = [
    { nom: 'DÉPART', x: 19, y: 88, depart: true },
    { nom: 'Croix 1 — la prairie', x: 18.8, y: 63.5 },
    { nom: 'Croix 2 — le pont', x: 46.9, y: 42.5 },
    { nom: 'Croix 3 — le marais', x: 83.7, y: 35 },
    { nom: 'Croix 4 — les collines', x: 68.1, y: 60.7 },
    { nom: 'ARRIVÉE — le volcan', x: 72.5, y: 93, arrivee: true }
  ];

  // 4 pions (couleurs : hypothèse à valider avec le matériel du jeu de société).
  var JOUEURS = [
    { nom: 'Joueur 1', couleur: 'rouge' },
    { nom: 'Joueur 2', couleur: 'jaune' },
    { nom: 'Joueur 3', couleur: 'bleu' },
    { nom: 'Joueur 4', couleur: 'vert' }
  ];
  // Décalage des pions posés sur une même case (en % de la largeur du plateau).
  var DECALAGES = [[-2.2, -2.2], [2.2, -2.2], [-2.2, 2.6], [2.2, 2.6]];

  var $ = function (id) { return document.getElementById(id); };

  function afficher(id) {
    document.querySelectorAll('.ecran').forEach(function (s) { s.hidden = s.id !== id; });
    var titre = $(id).querySelector('h1, h2');
    if (titre) { titre.setAttribute('tabindex', '-1'); titre.focus({ preventScroll: true }); }
    window.scrollTo(0, 0);
  }

  function construirePlateau() {
    // Repères des cases (lus par les lecteurs d'écran, discrets à l'écran).
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

    // Pions : tous sur la case DÉPART au début de la partie (règle : « tous les pions rassemblés à l'emplacement DÉPART »).
    var pions = $('pions');
    var liste = $('joueurs');
    JOUEURS.forEach(function (j, i) {
      var p = document.createElement('span');
      p.className = 'pion pion-' + j.couleur;
      p.style.left = (CASES[0].x + DECALAGES[i][0]) + '%';
      p.style.top = (CASES[0].y + DECALAGES[i][1] * 1.49) + '%'; // 1,49 = rapport largeur / hauteur du plateau
      p.dataset.case = '0';
      pions.appendChild(p);

      var li = document.createElement('li');
      li.innerHTML = '<span class="pion-mini pion-' + j.couleur + '" aria-hidden="true"></span>' +
        '<span>' + j.nom + ' <span class="joueur-couleur">(' + j.couleur + ')</span></span>' +
        '<span class="joueur-case">DÉPART</span>';
      liste.appendChild(li);
    });
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

  // ----- Dés -----
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

  $('btn-commencer').addEventListener('click', function () { afficher('ecran-plateau'); });
  $('btn-accueil').addEventListener('click', function () { afficher('ecran-accueil'); });
  construirePlateau();
  brancherAmbiance();
  brancherDes();

  // Préchargement discret du plateau pendant que l'accueil est affiché.
  window.addEventListener('load', function () { new Image().src = 'img/plateau-jour.webp'; });

  window.Aventura = { cases: CASES, joueurs: JOUEURS };
})();

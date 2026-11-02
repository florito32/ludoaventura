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

  // État de la partie (en mémoire : une nouvelle ouverture repart de zéro).
  // choix[i] = aventurier du joueur i (par défaut : les 4 premiers de la liste) ;
  // packs[i] / niveaux[i] = packs où le joueur i pioche et son niveau (tous les packs, niveau 1 par défaut).
  var partie = {
    nbJoueurs: 2, aventure: A.LISTE[0], joueurs: [], choix: ['lea', 'tom', 'nour', 'malo'], actif: 0, regles: null,
    packs: [0, 1, 2, 3].map(function () { return TOUS_PACKS.slice(); }), niveaux: [1, 1, 1, 1], carte: null
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
    box.addEventListener('change', function (e) {
      var j = partie.actif;
      var coches = Array.prototype.filter.call(box.querySelectorAll('input'), function (i) { return i.checked; })
        .map(function (i) { return i.value; });
      if (!coches.length) { // au moins un pack, sinon le joueur ne pourrait rien piocher
        e.target.checked = true;
        $('packs-alerte').textContent = 'Il faut garder au moins un pack.';
        return;
      }
      $('packs-alerte').textContent = '';
      partie.packs[j] = coches;
      majAventuriers();
    });
    niv.addEventListener('change', function (e) {
      partie.niveaux[partie.actif] = Number(e.target.value);
      majAventuriers();
    });
    $('btn-joueur-suivant').addEventListener('click', function () {
      partie.actif++;
      majAventuriers();
      $('choix-joueurs').querySelectorAll('button')[partie.actif].focus();
    });
  }

  function resumeCartes(i) {
    var n = partie.packs[i].length;
    return 'Niveau ' + partie.niveaux[i] + ' · ' + (n === TOUS_PACKS.length ? 'tous les packs' : n + ' pack' + (n > 1 ? 's' : ''));
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
    var suivant = $('btn-joueur-suivant');
    suivant.hidden = partie.actif >= nb - 1;
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

  // Pioche dans le tas du joueur ; tas vide → on remélange toutes ses cartes.
  function piocherCarte(j) {
    if (!j.tas.length) j.tas = melanger(cartesDuJoueur(j.index));
    return j.tas.pop();
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

  // Noms courts des cases (liste des joueurs).
  var COURT = ['DÉPART', 'Croix 1', 'Croix 2', 'Croix 3', 'Croix 4', 'ARRIVÉE'];
  var R = window.Regles;

  function lancerPartie() {
    lireChoix();
    var av = partie.aventure;
    partie.joueurs = [];
    for (var i = 0; i < partie.nbJoueurs; i++) {
      var perso = P.trouver(partie.choix[i]);
      partie.joueurs.push({ nom: perso.nom, aventurier: perso, couleur: COULEURS[i], index: i, tas: melanger(cartesDuJoueur(i)) });
    }
    partie.objectif = A.objectif(av, partie.nbJoueurs);
    partie.regles = R.nouvellePartie(partie.nbJoueurs, partie.objectif);

    // Rouleau : nom et image de l'aventure à la place de « MISSION ».
    $('rouleau-img').src = av.image;
    $('rouleau-img').alt = 'Aventure ' + av.nom;
    $('rouleau-nom').textContent = av.nom;
    $('objectif').textContent = partie.objectif;
    $('objectif-texte').textContent = 'Objectif : ' + libelleObjectif(av, partie.nbJoueurs);
    $('jauge').setAttribute('aria-valuemax', partie.objectif);

    // Pions (tous sur DÉPART), liste des joueurs et tas de cartes.
    var pions = $('pions'), liste = $('joueurs'), tas = $('tas');
    pions.innerHTML = ''; liste.innerHTML = ''; tas.innerHTML = '';
    partie.joueurs.forEach(function (j) {
      var p = document.createElement('span');
      p.className = 'pion pion-' + j.couleur;
      p.style.backgroundImage = 'url("' + j.aventurier.image + '")';
      pions.appendChild(p);

      var li = document.createElement('li');
      li.innerHTML = '<img class="portrait-mini joueur-' + j.couleur + '" src="' + j.aventurier.image + '" alt="" width="200" height="220">' +
        '<span>' + j.nom + ' <span class="joueur-couleur">(' + j.couleur + ')</span></span>' +
        '<span class="joueur-case">DÉPART</span>';
      liste.appendChild(li);

      var t = document.createElement('li');
      t.className = 'pile pile-' + j.couleur;
      t.innerHTML = '<span class="carte" aria-hidden="true"></span>' + j.nom;
      tas.appendChild(t);
    });

    $('carte-piochee').hidden = true;
    $('de-resultat').textContent = '';
    afficher('ecran-plateau');
    rendre();
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

  // Met tout l'écran à jour selon l'état de la partie (js/regles.js).
  function rendre() {
    var r = partie.regles;
    var j = partie.joueurs[r.joueur];
    var c = CASES[r.manche];

    placerPions();
    $('points').textContent = r.points;
    $('jauge').setAttribute('aria-valuenow', r.points);
    $('jauge-barre').style.width = Math.min(100, r.points / r.objectif * 100) + '%';
    $('jauge').classList.toggle('atteint', r.points >= r.objectif);

    document.querySelectorAll('#joueurs li').forEach(function (li, i) {
      li.querySelector('.joueur-case').textContent = COURT[r.positions[i]];
      li.classList.toggle('actif', i === r.joueur && r.etape !== 'fin');
    });
    document.querySelectorAll('#tas .pile').forEach(function (t, i) {
      t.classList.toggle('a-piocher', i === r.joueur && r.etape === 'piocher');
    });

    $('tour-manche').textContent = (c.arrivee ? 'ARRIVÉE' : 'Croix ' + r.manche) + ' sur ' + R.NB_CROIX + ' — ' + c.nom.replace(/^.*— /, '');
    $('tour-portrait').src = j.aventurier.image;
    $('tour-portrait').className = 'joueur-' + j.couleur;
    $('tour-nom').textContent = j.nom;
    $('tour').className = 'bloc tour joueur-' + j.couleur;

    // Dés : seul le dé à lancer est actif.
    document.querySelectorAll('.de-btn').forEach(function (b) {
      var attendu = r.etape === 'lancer' && b.dataset.de === r.de;
      b.disabled = !attendu;
      b.classList.toggle('a-lancer', attendu);
    });

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
      bouton('Bonne réponse', 'btn-bonne', function () { R.repondre(r, true); rendre(); });
      bouton('Mauvaise réponse', 'btn-mauvaise', function () { R.repondre(r, false); rendre(); });
    } else if (r.etape === 'lancer') {
      consigne.textContent = r.de === 'fort'
        ? 'Bravo ! ' + j.nom + ' lance le dé FORT.'
        : 'Les autres joueurs et le maître du jeu aident à trouver la bonne réponse, puis ' + j.nom + ' lance le dé FAIBLE.';
      bouton('Lancer le dé ' + r.de.toUpperCase(), 'btn-principal', function () { lancerDe(r.de); });
    } else if (r.etape === 'suivant' || r.etape === 'fin') {
      consigne.textContent = '+' + r.dernierLancer + ' point' + (r.dernierLancer > 1 ? 's' : '') + ' pour l’équipe !';
      if (r.etape === 'suivant') {
        var prochain = r.joueur + 1 < r.nbJoueurs ? partie.joueurs[r.joueur + 1].nom : partie.joueurs[0].nom;
        var croix = r.joueur + 1 < r.nbJoueurs ? '' : ' (croix suivante)';
        bouton('Au tour de ' + prochain + croix, 'btn-principal', function () { R.suivant(r); rendre(); });
      } else {
        bouton('Voir le résultat', 'btn-principal', montrerFin);
      }
    }
  }

  // Affiche la carte piochée : dictée (mot caché) ou lettre (affichée), avec la lecture vocale.
  function montrerCarte(j) {
    var c = partie.carte;
    var box = $('carte-piochee');
    box.hidden = false;
    box.className = 'carte-piochee joueur-' + j.couleur;
    $('carte-titre').innerHTML = 'Carte n° ' + partie.regles.pioches[j.index] + ' de ' + j.nom +
      '<small>' + c.packNom + ' · niveau ' + c.niveau + '</small>';
    $('carte-consigne').textContent = c.lettre ? 'Quelle est cette lettre ?' : 'Épelle le mot :';
    var mot = $('carte-mot');
    var voir = $('btn-voir');
    if (c.lettre) {
      mot.textContent = c.mot;
      mot.className = 'carte-mot lettre';
      voir.hidden = true;
    } else {
      cacherMot();
      voir.hidden = false;
    }
  }

  function cacherMot() {
    var mot = $('carte-mot');
    mot.className = 'carte-mot cache';
    mot.innerHTML = '<span aria-hidden="true">' + partie.carte.mot.replace(/[^\s'’-]/g, '•') + '</span><span class="visually-hidden">Mot caché</span>';
    $('btn-voir').textContent = 'Voir le mot';
    $('btn-voir').setAttribute('aria-expanded', 'false');
  }

  function brancherCarte() {
    $('btn-voir').addEventListener('click', function () {
      var mot = $('carte-mot');
      if (mot.classList.contains('cache')) {
        mot.className = 'carte-mot';
        mot.textContent = partie.carte.mot;
        this.textContent = 'Cacher le mot';
        this.setAttribute('aria-expanded', 'true');
      } else cacherMot();
    });
    var ecouter = $('btn-ecouter');
    if (!window.Voix.disponible()) {
      ecouter.disabled = true;
      ecouter.title = 'La lecture à voix haute n\u2019est pas disponible sur cet appareil';
    }
    ecouter.addEventListener('click', function () { window.Voix.lire(window.Voix.texteCarte(partie.carte)); });
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

  // Lance le dé demandé par la règle et ajoute ses points à l'équipe.
  function lancerDe(type) {
    var r = partie.regles;
    if (r.etape !== 'lancer' || r.de !== type) return;
    var v = window.Des.lancer(type);
    var de = document.querySelector('.de-btn[data-de="' + type + '"] .de');
    de.classList.remove('roule');
    void de.offsetWidth; // relance l'animation
    de.classList.add('roule');
    dessinerFace(de, v);
    $('de-resultat').textContent = 'Dé ' + type.toUpperCase() + ' : ' + v + ' point' + (v > 1 ? 's' : '');
    R.lancer(r, v);
    rendre();
  }

  function brancherDes() {
    document.querySelectorAll('.de-btn').forEach(function (btn) {
      dessinerFace(btn.querySelector('.de'), btn.dataset.de === 'fort' ? 6 : 3);
      btn.addEventListener('click', function () { lancerDe(btn.dataset.de); });
    });
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
  $('btn-nouvelle').addEventListener('click', function () { $('fin').close(); afficher('ecran-preparation'); });

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
  brancherCarte();

  // Préchargement discret du plateau pendant que l'accueil est affiché.
  window.addEventListener('load', function () { new Image().src = 'img/plateau-jour.webp'; });

  window.Aventura = { cases: CASES, partie: partie, cartesDuJoueur: cartesDuJoueur };
})();

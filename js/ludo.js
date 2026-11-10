// Ludo, le guide du jeu (v6.9) : l'aventurier au sac à dos de l'accueil.
//  - Premier démarrage : sur l'accueil, Ludo se présente dans une bulle et propose le didacticiel
//    (« Oui, guide-moi » / « Non merci ») ; ensuite le bouton « Didacticiel » de l'accueil le relance.
//  - Didacticiel : à chaque écran, une bulle de BD explique l'étape et une flèche rouge, qui grandit
//    et rétrécit, montre où toucher ; il guide la préparation et le premier tour complet, puis se retire.
//  - Hors didacticiel : Ludo attend en bas à gauche (pied de page) ; un toucher sur lui donne l'aide
//    de l'étape en cours (bulle + flèche) ; « Compris » ou l'action faite referme la bulle.
// Ludo lit l'état de la partie (window.Aventura.partie, js/plateau.js) sans le modifier.
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var CLE_VU = 'ludo-vu';      // localStorage : Ludo s'est déjà présenté (premier démarrage passé)
  var CLE_TUTO = 'ludo-tuto';  // sessionStorage : didacticiel en cours (survit à un rechargement)

  function lire(stock, cle) { try { return window[stock].getItem(cle); } catch (e) { return null; } }
  function ecrire(stock, cle, v) {
    try { if (v === null) window[stock].removeItem(cle); else window[stock].setItem(cle, v); } catch (e) { /* stockage bloqué */ }
  }

  // mode : null (bulle fermée), 'intro' (présentation), 'tuto' (didacticiel), 'aide' (toucher sur Ludo), 'fin' (fin du didacticiel)
  var etat = { mode: null, cle: null, touche: false, choix: null };

  // ---------- Éléments : bouton de Ludo (pied de page), bulle, flèche ----------
  var bouton = document.createElement('button');
  bouton.type = 'button';
  bouton.className = 'ludo-bouton';
  bouton.id = 'ludo-bouton';
  bouton.setAttribute('aria-label', 'Ludo, ton guide : que faire ici ?');
  bouton.innerHTML = '<img src="img/ludo.webp" alt="" width="192" height="192">';
  var pied = document.querySelector('.pied');
  pied.insertBefore(bouton, pied.firstChild);

  var bulle = document.createElement('div');
  bulle.className = 'ludo-bulle';
  bulle.id = 'ludo-bulle';
  bulle.setAttribute('role', 'region');
  bulle.setAttribute('aria-label', 'Ludo, ton guide');
  bulle.hidden = true;
  bulle.innerHTML = '<p class="ludo-nom" aria-hidden="true">Ludo</p>' +
    '<p class="ludo-texte" id="ludo-texte" aria-live="polite"></p>' +
    '<div class="ludo-actions" id="ludo-actions"></div>';
  document.body.appendChild(bulle);

  // Flèche rouge : dessin vectoriel, pointe en bas (tournée vers le haut si la cible est en haut de l'écran).
  var fleche = document.createElement('div');
  fleche.className = 'ludo-fleche';
  fleche.id = 'ludo-fleche';
  fleche.setAttribute('aria-hidden', 'true');
  fleche.hidden = true;
  fleche.innerHTML = '<svg viewBox="0 0 48 64" width="48" height="64"><path d="M16 2h16v30h14L24 62 2 32h14z" fill="#d62828" stroke="#5a1010" stroke-width="3" stroke-linejoin="round"/></svg>';
  document.body.appendChild(fleche);

  // ---------- Ce que Ludo dit à chaque étape ----------
  function partie() { return window.Aventura && window.Aventura.partie; }
  function ecranVisible() {
    var e = document.querySelector('.ecran:not([hidden])');
    return e ? e.id : null;
  }
  function nomJoueur(p) {
    var a = window.Aventuriers.trouver(p.choix[p.actif]);
    return a ? a.nom : 'Joueur ' + (p.actif + 1);
  }
  function vide(id) { return !document.querySelector('#' + id + ' input:checked'); }

  // Renvoie { cle, texte, cible, choix } : cible = où toucher (flèche), choix = zone de choix déjà réglée
  // par défaut (la flèche passe sur « Valider » dès que le joueur y a touché).
  function contexte() {
    var p = partie(), ecran = ecranVisible();
    if (!p || !ecran) return null;
    if (ecran === 'ecran-accueil') {
      return { cle: 'accueil', cible: $('btn-commencer'),
        texte: 'Touche « Commencer l’aventure » pour préparer la partie : vous jouez en équipe, de 1 à 4 joueurs.' };
    }
    if (ecran === 'ecran-preparation') return contextePreparation(p);
    if (ecran === 'ecran-plateau' && p.regles) return contextePlateau(p);
    return null;
  }

  function contextePreparation(p) {
    var n = p.etapePrepa, nom = nomJoueur(p), valider;
    var cle = 'prepa-' + n + '-' + p.actif + '-' + p.sousEtape;
    if (n === 1) {
      return { cle: cle, choix: document.querySelector('.nb-joueurs'), cible: $('btn-valider-nb'),
        texte: 'Combien êtes-vous à jouer ? Touche le bon nombre, puis « Valider ».' };
    }
    if (n === 2) {
      return { cle: cle, choix: $('grille-aventuriers'), cible: $('btn-valider-aventurier'),
        texte: nom + ', choisis ton aventurier : touche son portrait, puis « Valider ». Il marchera sur le plateau pour toi.' };
    }
    if (n === 4) {
      return { cle: cle, choix: $('liste-aventures'), cible: $('btn-lancer'),
        texte: 'Choisissez votre aventure. Chacune a son objectif à atteindre ensemble avant d’arriver au volcan (pierres à tailler, épées à forger…). Puis « Lancer la partie ».' };
    }
    // Étape 3 : la matière, puis ses réglages (un écran ou deux selon la matière).
    valider = $('btn-valider-reglages');
    var mat = p.matiere[p.actif];
    if (p.sousEtape === 'matiere') {
      if (!mat && !p.francais[p.actif]) return { cle: cle + '-a', cible: $('matieres'),
        texte: nom + ', choisis ta matière : Mathématiques ou Français. Les questions de tes cartes viendront de là.' };
      if (!mat) return { cle: cle + '-b', cible: $('francais'),
        texte: 'En français, choisis Orthographe (des mots à épeler, découper…) ou Conjugaison (des verbes à conjuguer).' };
      if (mat === 'maths') return { cle: cle + '-c', choix: $('niveau-maths'), cible: valider,
        texte: 'Choisis ton niveau : Facile, ce sont les tables ; plus c’est dur, plus les nombres sont grands. Puis le nombre de signes par calcul, et « Valider ».' };
      return { cle: cle + '-d', cible: valider, texte: 'C’est noté ! Touche « Valider » pour régler tes questions.' };
    }
    if (p.sousEtape === 'modes') {
      if (vide('modes-conj')) return { cle: cle + '-a', cible: $('modes-conj'),
        texte: 'Choisis un ou plusieurs modes : indicatif, conditionnel, subjonctif, impératif.' };
      return { cle: cle + '-b', cible: tempsManquant() || valider,
        texte: 'Dans chaque mode choisi, touche au moins un temps, puis « Valider ».' };
    }
    if (p.sousEtape === 'packs') {
      if (vide('packs')) return { cle: cle + '-a', cible: $('packs'), texte: 'Choisis les packs de mots où tu vas piocher : animaux, pays, métiers… « Tout sélectionner » les prend tous.' };
      return { cle: cle + '-b', cible: valider, texte: 'Tu peux en prendre plusieurs. Puis « Valider » pour choisir tes questions.' };
    }
    // sousEtape 'reglages'
    var fin = ' Puis « Valider ». « Mêmes réglages pour tous » donne tes choix aux autres joueurs.';
    if (mat === 'maths') {
      if (vide('signes')) return { cle: cle + '-a', cible: $('signes'), texte: 'Choisis les signes de tes calculs : +, −, × ou ÷.' };
      // v6.14 : au moins une table (Facile) ou un nombre ; chaque calcul prend un nombre de chaque groupe choisi.
      var mm = p.maths[p.actif];
      if (!window.Calcul.compter(mm)) return { cle: cle + '-b', cible: $('nombres'),
        texte: mm.niveau === 'facile' ? 'Choisis les tables que tu veux réviser. « Tout » les choisit toutes d’un coup.'
          : 'Choisis tes nombres : des unités, des dizaines (30 = de 30 à 39)… Chaque calcul prendra un nombre de chaque groupe choisi.' };
      return { cle: cle + '-c', cible: valider, texte: 'Parfait !' + fin };
    }
    if (mat === 'conjugaison') {
      if (vide('groupes')) return { cle: cle + '-a', cible: $('groupes'), texte: 'Choisis les groupes de verbes : 1er (chanter), 2e (finir), 3e (prendre…).' };
      return { cle: cle + '-b', choix: $('niveau-conj'), cible: valider, texte: 'Choisis ton niveau : plus il est haut, plus les verbes sont rares.' + fin };
    }
    if (vide('types-questions')) return { cle: cle + '-b', cible: $('types-questions'),
      texte: 'Choisis les questions qu’on peut te poser : épeler le mot, compter ses lettres, ses syllabes…' };
    return { cle: cle + '-c', cible: valider, texte: 'Bravo, tes cartes sont prêtes !' + fin };
  }

  // Conjugaison : premier mode choisi qui n'a encore aucun temps (sa ligne de temps).
  function tempsManquant() {
    var lignes = document.querySelectorAll('#temps-conj .mode-ligne:not([hidden])');
    for (var i = 0; i < lignes.length; i++) if (!lignes[i].querySelector('input:checked')) return lignes[i];
    return null;
  }

  function contextePlateau(p) {
    var r = p.regles, j = p.joueurs[r.joueur], c = p.carte;
    var cle = 'plateau-' + r.historique.length + '-' + r.etape + (c && c.attente ? '-attente' : '');
    if (r.etape === 'piocher') {
      return { cle: cle, cible: $('tour-actions').querySelector('button'),
        texte: 'C’est au tour de ' + j.nom + '. Touche « Question suivante » : une question de son tas va s’afficher.' };
    }
    var saisie = c && (c.type === 'calcul' || c.type === 'conjugaison' || (c.question && c.question.saisie));
    if (r.etape === 'repondre' && saisie) {
      return { cle: cle, cible: $('reponse-joueur'),
        texte: j.nom + ', écris ta réponse dans la case, puis touche « OK ». « Écouter » lit la question à voix haute.' };
    }
    // Épeler à l'oral (v6.28) : le joueur parle, le jeu écoute et corrige.
    if (r.etape === 'repondre' && c && c.question && c.question.oral && !c.juge && !window.AVENTURA_JUGE) {
      return { cle: cle, cible: $('tour-actions').querySelector('button'),
        texte: j.nom + ', écoute le mot (« Écouter »), puis touche « Parler » et dis ses lettres une par une. Si le micro se trompe, corrige les lettres dans la case, puis « OK ».' };
    }
    if (r.etape === 'repondre') {
      return { cle: cle, cible: $('tour-actions'),
        texte: j.nom + ' répond à voix haute. Les autres vérifient avec « Voir la réponse », puis touchent « Bonne réponse » ou « Mauvaise réponse ».' };
    }
    if (r.etape === 'lancer' && c && c.attente) {
      return { cle: cle, cible: $('tour-actions').querySelector('button'),
        texte: 'Pas grave ! Lis la bonne réponse, puis touche « J’ai compris » : le dé FAIBLE se lance (1 à 3 points).' };
    }
    if (r.etape === 'lancer') {
      return { cle: cle, texte: 'Le dé se lance tout seul : le dé FORT (4 à 6 points) après une bonne réponse, le dé FAIBLE (1 à 3) après une erreur.' };
    }
    var o = p.aventure.objet; // le dé donne des pierres, des épées… selon l'aventure (demande du 09/11/2026)
    return { cle: cle, texte: 'Le chiffre du dé, c’est le nombre de ' + o.des + ' pour l’équipe : le compte est en haut à gauche. Il en faut assez avant d’arriver au volcan !' };
  }

  // ---------- Affichage ----------
  function boutonBulle(texte, classe, action) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn ' + classe;
    b.textContent = texte;
    b.addEventListener('click', action);
    $('ludo-actions').appendChild(b);
    return b;
  }

  function montrerBulle(texte, boutons) {
    $('ludo-texte').textContent = texte;
    $('ludo-actions').innerHTML = '';
    boutons.forEach(function (b) { boutonBulle(b[0], b[1], b[2]); });
    bulle.hidden = false;
    bouton.classList.add('parle');
    placer();
  }

  function fermer() {
    etat.mode = null;
    etat.cle = null;
    bulle.hidden = true;
    fleche.hidden = true;
    bouton.classList.remove('parle');
  }

  // Bulle de l'étape en cours (didacticiel ou aide).
  function montrerEtape(c) {
    etat.cle = c.cle;
    etat.touche = false;
    etat.choix = c.choix || null;
    var boutons = etat.mode === 'tuto'
      ? [['Arrêter le guide', 'btn-secondaire', arreterTuto]]
      : [['Compris', 'btn-principal', fermer]];
    montrerBulle(c.texte, boutons);
  }

  // Cible de la flèche : la zone de choix tant que le joueur n'y a pas touché, ensuite le bouton.
  function cibleActuelle(c) {
    var el = c.choix && !etat.touche ? c.choix : c.cible;
    if (!el || el.hidden || !el.getClientRects().length) return null;
    return el;
  }

  // Place la flèche sur la cible et la bulle là où elle ne cache ni la cible ni la flèche.
  function placer() {
    if (bulle.hidden) return;
    var c = etat.mode === 'tuto' || etat.mode === 'aide' ? contexte() : null;
    var cible = c && c.cle === etat.cle ? cibleActuelle(c) : null;
    var vw = window.innerWidth, vh = window.innerHeight;
    // Zones à ne pas cacher, avec leur poids : flèche et boutons d'action jamais, la cible le moins possible,
    // puis le reste de l'écran de jeu (la bulle prend la place qui cache le moins).
    var zones = [];
    if (cible) {
      var r = cible.getBoundingClientRect();
      var fh = 64, fw = 48;
      var x = Math.min(Math.max(r.left + r.width / 2, fw / 2 + 4), vw - fw / 2 - 4);
      // Pointe juste au-dessus de la cible ; si elle est trop haut, la flèche se met dessous, pointe vers le haut.
      var haut = r.top - fh - 2 >= 4;
      var y = haut ? r.top - fh - 2 : Math.min(r.bottom + 2, vh - fh);
      fleche.style.left = (x - fw / 2) + 'px';
      fleche.style.top = y + 'px';
      fleche.classList.toggle('vers-haut', !haut);
      fleche.hidden = false;
      zones.push({ r: { left: x - fw / 2, right: x + fw / 2, top: y, bottom: y + fh }, poids: 1000 });
      zones.push({ r: r, poids: 20 });
    } else {
      fleche.hidden = true;
    }
    // Raccourcis de l'accueil (v6.36) : jamais cachés par la bulle. La barre des étoiles (en haut) compte moins que l'arche :
    // la bulle de présentation (premier démarrage, 0 étoile) peut passer dessus sur les petits écrans.
    document.querySelectorAll('.accueil-haut .pastille').forEach(function (el) {
      if (el.getClientRects().length) zones.push({ r: el.getBoundingClientRect(), poids: 20 });
    });
    // « Tout sélectionner » (v6.27) reste toujours visible : sur petit écran, c'est le moyen sûr de choisir sans que la bulle gêne.
    var actions = '.accueil-actions .btn, .raccourci, .etape:not([hidden]) .etape-actions .btn, .etape:not([hidden]) .btn-tout, #tour-actions .btn, #carte-saisie, .barre .btn-retour, .version-badge';
    document.querySelectorAll(actions).forEach(function (el) {
      if (el.getClientRects().length) zones.push({ r: el.getBoundingClientRect(), poids: 1000 });
    });
    // La carte piochée (la question à lire) compte plus que le reste de l'écran.
    [['.etape:not([hidden]) .etape-corps', 1], ['.table .plateau', 1], ['.carte-piochee:not([hidden])', 30], ['#tour', 2]].forEach(function (z) {
      document.querySelectorAll(z[0]).forEach(function (el) {
        if (el.getClientRects().length) zones.push({ r: el.getBoundingClientRect(), poids: z[1] });
      });
    });
    placerBulle(zones, vw, vh);
  }

  // Surface commune de deux rectangles (0 s'ils ne se touchent pas).
  function commun(a, b) {
    var l = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
    var h = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
    return l * h;
  }

  function placerBulle(zones, vw, vh) {
    var largeur = Math.min(360, vw - 16);
    bulle.style.width = largeur + 'px';
    var h = bulle.offsetHeight;
    var accueil = ecranVisible() === 'ecran-accueil';
    var candidats = [];
    if (accueil) {
      // Accueil (v6.10, demande de l'utilisateur) : la bulle ne cache ni la tête de Ludo ni l'arche ;
      // elle se place le plus haut possible, dans le ciel. On essaie des places de haut en bas
      // (à gauche, au centre, à droite) et on garde celle qui cache le moins.
      var perso = document.querySelector('.calque.perso').getBoundingClientRect();
      var arche = document.querySelector('.calque.arche').getBoundingClientRect();
      var accroche = document.querySelector('.accroche').getBoundingClientRect();
      // Tête de Ludo sur l'illustration (img/perso.webp) : de 20 % à 72 % de la largeur, 27 % du haut.
      var tete = { left: perso.left + perso.width * 0.2, right: perso.left + perso.width * 0.72,
        top: perso.top, bottom: perso.top + perso.height * 0.27 };
      zones.push({ r: tete, poids: 300 }, { r: arche, poids: 200 }, { r: accroche, poids: 100 });
      // Petits écrans : si le ciel manque, une bulle plus étroite peut se poser ailleurs (dans l'herbe, à côté de Ludo).
      [largeur, Math.min(250, largeur)].forEach(function (l, n) {
        if (n && l === largeur) return;
        bulle.style.width = l + 'px';
        var hb = bulle.offsetHeight;
        for (var y = 8; y <= vh - hb - 8; y += 16) {
          [8, (vw - l) / 2, vw - l - 8].forEach(function (x) { candidats.push({ left: x, top: y, largeur: l, h: hb, queue: null }); });
        }
      });
      bulle.style.width = largeur + 'px';
        } else {
      // Ailleurs : au-dessus du petit Ludo du pied de page de préférence, sinon ailleurs sur l'écran.
      var b = bouton.getBoundingClientRect();
      var bas = b.top - h - 14, milieu = (vh - h) / 2;
      candidats.push({ left: 8, top: bas, queue: 'bas-gauche' });
      [[vw - largeur - 8, bas], [vw - largeur - 8, 8], [8, 56], [vw - largeur - 8, 56], [(vw - largeur) / 2, 56],
        [8, milieu], [vw - largeur - 8, milieu], [(vw - largeur) / 2, milieu], [(vw - largeur) / 2, bas]]
        .forEach(function (c) { candidats.push({ left: c[0], top: c[1], queue: null }); });
    }
    var choix = null, meilleur = Infinity;
    candidats.forEach(function (k) {
      var l = k.largeur || largeur, hk = k.h || h;
      k.left = Math.min(Math.max(k.left, 8), vw - l - 8);
      k.top = Math.min(Math.max(k.top, 8), vh - hk - 8);
      var boite = { left: k.left, right: k.left + l, top: k.top, bottom: k.top + hk };
      var cout = 0;
      zones.forEach(function (z) { cout += commun(boite, z.r) * z.poids; });
      if (cout < meilleur - 1) { meilleur = cout; choix = k; } // à égalité, l'ordre de préférence l'emporte
    });
    bulle.style.width = (choix.largeur || largeur) + 'px';
    bulle.style.left = choix.left + 'px';
    bulle.style.top = choix.top + 'px';
    bulle.dataset.queue = choix.queue || '';
  }

  // ---------- Modes ----------
  function presenter() {
    etat.mode = 'intro';
    etat.cle = null;
    fleche.hidden = true;
    montrerBulle('Salut, je suis Ludo, ton guide ! Je te montre comment jouer ? Tu pourras m’appeler à tout moment en me touchant.', [
      ['Oui, guide-moi', 'btn-principal', function () { ecrire('localStorage', CLE_VU, '1'); lancerTuto(); }],
      ['Non merci', 'btn-secondaire', function () { ecrire('localStorage', CLE_VU, '1'); fermer(); }]
    ]);
  }

  function lancerTuto() {
    ecrire('localStorage', CLE_VU, '1');
    ecrire('sessionStorage', CLE_TUTO, '1');
    etat.mode = 'tuto';
    etat.cle = null;
    suivre();
  }

  function arreterTuto() {
    ecrire('sessionStorage', CLE_TUTO, null);
    fermer();
  }

  // Le didacticiel s'arrête après le premier tour complet (dé lancé, joueur suivant ou fin de partie).
  function premierTourFini() {
    var p = partie();
    return p && p.regles && ecranVisible() === 'ecran-plateau' && p.regles.historique.length >= 1 &&
      (p.regles.etape === 'piocher' || p.regles.etape === 'fin');
  }

  function finTuto() {
    ecrire('sessionStorage', CLE_TUTO, null);
    etat.mode = 'fin';
    etat.cle = null;
    fleche.hidden = true;
    montrerBulle('Bravo, tu sais jouer ! Continuez jusqu’au volcan. Si tu as besoin d’aide, touche-moi, en bas à gauche.', [
      ['Compris', 'btn-principal', fermer]
    ]);
  }

  // Suit l'état du jeu : nouvelle bulle quand l'étape change (didacticiel), fermeture de l'aide une fois l'action faite.
  function suivre() {
    if (etat.mode === 'tuto') {
      if (premierTourFini()) { finTuto(); return; }
      var c = contexte();
      if (c && c.cle !== etat.cle) montrerEtape(c);
      else placer();
    } else if (etat.mode === 'aide') {
      var a = contexte();
      if (!a || a.cle !== etat.cle) fermer(); else placer();
    } else if (etat.mode === 'intro' && ecranVisible() !== 'ecran-accueil') {
      ecrire('localStorage', CLE_VU, '1'); // le joueur est parti sans répondre : c'est « non merci »
      fermer();
    } else if (!bulle.hidden) {
      placer();
    }
  }

  // Toucher Ludo : aide de l'étape en cours (ou rappel de l'étape pendant le didacticiel).
  function aider() {
    if (etat.mode === 'tuto') { var t = contexte(); if (t) montrerEtape(t); return; }
    if (etat.mode === 'aide' || etat.mode === 'fin') { fermer(); return; }
    var c = contexte();
    if (!c) return;
    etat.mode = 'aide';
    montrerEtape(c);
  }

  bouton.addEventListener('click', aider);
  // Accueil : le grand Ludo se touche aussi (le bouton « Didacticiel » reste la voie au clavier).
  var grand = document.querySelector('.calque.perso');
  grand.classList.add('ludo-touchable');
  grand.addEventListener('click', aider);
  $('btn-didacticiel').addEventListener('click', lancerTuto);

  // Un choix touché dans la zone montrée par la flèche : la flèche passe sur « Valider ».
  // Après chaque toucher ou choix, Ludo se met à jour tout de suite (sans attendre la relecture régulière).
  document.addEventListener('click', function (e) {
    if (etat.choix && etat.choix.contains(e.target)) etat.touche = true;
    setTimeout(suivre, 0);
  }, true);
  document.addEventListener('change', function () { setTimeout(suivre, 0); }, true);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !bulle.hidden && etat.mode !== 'intro') {
      if (etat.mode === 'tuto') arreterTuto(); else fermer();
    }
  });
  window.addEventListener('resize', placer);

  // L'état du jeu change au fil des touchers et des animations : on le relit régulièrement (léger).
  setInterval(suivre, 250);

  // Démarrage : didacticiel en cours (page rechargée), ou présentation au tout premier lancement.
  if (lire('sessionStorage', CLE_TUTO)) { etat.mode = 'tuto'; suivre(); }
  else if (!lire('localStorage', CLE_VU) && ecranVisible() === 'ecran-accueil') {
    // Laisse l'accueil se dessiner avant que Ludo ne parle.
    if (document.readyState === 'complete') presenter();
    else window.addEventListener('load', function () { if (etat.mode === null && ecranVisible() === 'ecran-accueil') presenter(); });
  }

  window.Ludo = { contexte: contexte, lancer: lancerTuto, aider: aider, fermer: fermer, etat: etat };
})();

// Mode « Mini-jeux » (v10.41, demande du 24/11/2026).
// Un mode à part, qui ne fonctionne pas comme les autres : pas de plateau, pas de pion, pas de matière, pas de niveau ni de
// progression. Le joueur choisit son mini-jeu dans la liste, puis son profil (« Qui joue ? », seulement pour attribuer les
// étoiles), joue, et gagne 10 étoiles à chaque partie terminée, gagnée ou perdue.
// Mini-jeux : « La fabrique à mots » (ex-Baby jeux › Lettres, contenu et gestes dans js/baby.js et js/baby-carte.js) et
// « Les sons » (v10.43, ex-matière Phonèmes de l'aventure : un des 6 jeux de js/phonemes.js tiré au hasard, sur tous les sons ;
// les gestes sont ceux de js/grammaire-carte.js, empruntés avec GrammaireCarte.viser), puis « Course aux étoiles » (js/mj-etoiles.js)
// et « Aventure des multiplications » (js/mj-aventure.js), repris de florito32/minijeux (v10.47), puis « Quiz » Histoire / Géographie
// (js/mj-quiz.js, v10.51 : choix de la matière, de la sous-matière et du niveau 1 à 10 ; scores dans Supabase), puis « Chasse aux lettres »
// (js/mj-reperes.js, v10.54 : repérage visuel des lettres qui se ressemblent, une minute, record par profil).
// Pour en ajouter un : une ligne dans JEUX, et soit sa fonction de départ dans DEPARTS (elle rend { carte, titre… }), soit un champ
// « module » : un script qui expose window.X.monter(hote, { fini(gagne, ligneHtml) }) et rend { detruire() }.
(function () {
  'use strict';

  var B = window.Baby, BC = window.BabyCarte, R = window.Recompenses, PH = window.Phonemes, GC = window.GrammaireCarte;
  var $ = function (id) { return document.getElementById(id); };
  var ETOILES = 10; // par partie terminée, gagnée ou perdue
  var JEUX = [
    { id: 'fabrique', nom: 'La fabrique à mots', icone: '🏭', aide: 'Fabrique des mots avec des lettres et des sons, puis écoute-les.' },
    { id: 'sons', nom: 'Les sons', icone: '👂', aide: 'Complète, trie, relie : trouve les sons des mots (phonèmes).' },
    { id: 'etoiles', nom: 'Course aux étoiles', icone: '⭐', module: 'MJEtoiles', aide: 'Choisis la bonne réponse parmi trois, gagne des étoiles et bats ton record.' },
    { id: 'aventure', nom: 'Aventure des multiplications', icone: '🏃', module: 'MJAventure', aide: 'Cours, saute et casse les caisses qui donnent le bon résultat.' },
    { id: 'quiz', nom: 'Quiz', icone: '❓', module: 'MJQuiz', aide: 'Histoire et Géographie : 10 ou 15 questions, 15 secondes pour répondre, un niveau de 1 à 10 à choisir.' },
    { id: 'reperes', nom: 'Chasse aux lettres', icone: '🔎', module: 'MJReperes', aide: 'Trouve le plus de fois possible la lettre demandée en une minute : b ou d, m ou n…' }
  ];
  var etat = null; // partie en cours : { jeu, profil, carte, fini }

  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function ico(id, cl) { return '<svg class="ico ' + (cl || '') + '" aria-hidden="true"><use href="#' + id + '"/></svg>'; }
  function jeuDe(id) { return JEUX.filter(function (j) { return j.id === id; })[0] || null; }
  function nomJoueur(id) {
    var J = window.Joueurs, j = J && R && J.trouver(R.compte.etat, id);
    return j ? j.nom : '';
  }

  // ---------- La liste ----------
  function liste() {
    var h = '<section class="carte-page minijeux"><p class="minijeux-intro">Choisis un mini-jeu. À chaque partie terminée, tu gagnes ' +
      ETOILES + ' ' + ico('i-etoile', 'ico-gain') + ' étoiles, sans rien changer à ton niveau.</p><div class="minijeux-liste" role="group" aria-label="Mini-jeux">';
    JEUX.forEach(function (j) {
      h += '<button type="button" class="minijeu-carte" data-jeu="' + j.id + '"><span class="minijeu-ico" aria-hidden="true">' + j.icone + '</span>' +
        '<span class="minijeu-texte"><b>' + esc(j.nom) + '</b><small>' + esc(j.aide) + '</small></span>' +
        '<span class="minijeu-gain" aria-hidden="true">+' + ETOILES + ' ' + ico('i-etoile') + '</span></button>';
    });
    $('minijeux-corps').innerHTML = h + '</div></section>';
  }

  // ---------- Une partie ----------
  var DEPARTS = {
    fabrique: function () { return B.generer('fabrique', B.defaut(), Math.random); },
    // Un jeu de sons au hasard, sur tous les sons (aucun niveau). Une carte qui ne sort pas est remplacée par un autre jeu.
    sons: function () {
      var jeux = PH.JEUX.map(function (x) { return x.id; }).sort(function () { return Math.random() - 0.5; }), c = null;
      for (var k = 0; k < jeux.length && !c; k++) c = PH.generer(jeux[k], PH.TOUS_SONS, Math.random, []);
      c.type = 'grammaire';
      c.consigne = c.consigne || PH.jeu(c.jeu).nom;
      return c;
    }
  };
  var cible = null; // cible précédente du moteur de js/grammaire-carte.js (à rendre en quittant « Les sons »)
  function visee(boite) {
    var r = GC.viser(boite, {
      carte: function () { return etat && etat.carte; },
      actif: function () { return !!etat && !etat.fini; },
      fini: function (reponse) { corrigerSons(reponse); },
      sauver: function () { /* un mini-jeu ne se reprend pas */ }
    });
    if (!cible) cible = r; // seule la toute première cible (celle du plateau) est à rendre
  }
  function rendre() { if (cible) { GC.viser(cible.boite, cible.rappels); cible = null; } }
  // « Les sons » : la réponse est donnée, on montre la correction puis le résultat (10 étoiles).
  function corrigerSons(reponse) {
    var c = etat.carte;
    c.reponseDonnee = reponse;
    c.juste = PH.juste(c, reponse);
    GC.afficher(c);
    terminer(c.juste, null, PH.solution(c), true);
  }
  // Démonte le mini-jeu à module en cours (boucle d'animation, clavier, minuteurs).
  function demonter() { if (etat && etat.inst) { etat.inst.detruire(); etat.inst = null; } }
  function lancer(idJeu, idProfil) {
    var j = jeuDe(idJeu);
    if (!j || (!DEPARTS[idJeu] && !(j.module && window[j.module]))) return;
    rendre(); demonter();
    etat = { jeu: j, profil: idProfil || null, carte: DEPARTS[idJeu] ? DEPARTS[idJeu]() : null, inst: null, fini: false };
    $('titre-minijeu').textContent = j.nom;
    window.Aventura.afficher('ecran-minijeu');
    if (j.module) { // jeu à lui seul (étoiles, aventure) : il se dessine lui-même dans l'écran et dit quand il est fini
      $('minijeu-corps').innerHTML = '<section class="carte-page minijeu"><p class="minijeu-qui">' + (etat.profil && nomJoueur(etat.profil) ? esc(nomJoueur(etat.profil)) + ' joue' : '') +
        '</p><div class="minijeu-jeu" id="minijeu-jeu"></div></section>';
      var moi = etat;
      etat.inst = window[j.module].monter($('minijeu-jeu'), { profil: etat.profil, fini: function (gagne, ligne) { if (etat === moi) terminer(gagne, null, null, false, ligne); } });
      return;
    }
    dessiner();
    // La consigne est lue une fois toute seule (les petits ne lisent pas encore), comme dans les baby jeux.
    var c = etat.carte;
    if (window.Voix && window.Voix.disponible() && c.oral) setTimeout(function () { if (etat && etat.carte === c && !etat.fini) window.Voix.lire(c.oral); }, 300);
  }

  function dessiner() {
    if (!etat) return;
    var c = etat.carte;
    if (c.module === 'phonemes') {
      $('minijeu-corps').innerHTML = '<section class="carte-page minijeu" aria-live="polite">' +
        '<p class="minijeu-qui">' + (etat.profil && nomJoueur(etat.profil) ? esc(nomJoueur(etat.profil)) + ' joue' : '') + '</p>' +
        '<p class="minijeu-consigne">' + esc(c.consigne) + '</p><div class="carte-gram" id="minijeu-gram"></div><div id="minijeu-fin"></div></section>';
      visee($('minijeu-gram'));
      GC.afficher(c);
      return;
    }
    $('minijeu-corps').innerHTML = '<section class="carte-page minijeu" aria-live="polite">' +
      '<p class="minijeu-qui">' + (etat.profil && nomJoueur(etat.profil) ? esc(nomJoueur(etat.profil)) + ' joue' : '') + '</p>' +
      '<p class="minijeu-consigne">' + esc(c.consigne) + '</p>' +
      '<div class="minijeu-jeu" id="minijeu-jeu">' + BC.html(c, false, { boutons: function () { return ''; }, relier: function () { return ''; } }) + '</div></section>';
  }

  // Outils donnés aux gestes de js/baby-carte.js (comme dans js/grammaire-carte.js).
  var outils = {
    afficher: function () { dessiner(); },
    repondre: function (reponse, texte) { terminer(true, texte); },
    sauver: function () { /* rien à garder : un mini-jeu ne se reprend pas après un rechargement */ },
    focus: function (sel) { var x = $('minijeu-corps').querySelector(sel); if (x) x.focus({ preventScroll: true }); },
    attendre: function (fn) { setTimeout(fn, 450); }
  };

  // Fin de partie : 10 étoiles pour le profil choisi, une seule fois, gagnée ou perdue. Aucun niveau, aucune progression
  // (rien n'est noté dans les matières du joueur).
  function terminer(gagne, texte, solution, dansCarte, ligne) {
    if (!etat || etat.fini) return;
    etat.fini = true;
    demonter();
    var gain = null;
    try {
      var s = etat.profil && R && R.compte.pourJoueur(etat.profil);
      if (s) { s.visite(); gain = s.gagner(ETOILES, 'minijeu', etat.jeu.nom); }
    } catch (e) { gain = null; }
    var nom = nomJoueur(etat.profil);
    var h = '<section class="carte-page minijeu minijeu-fin" role="status">' +
      '<p class="minijeu-bravo">' + (gagne ? 'Bravo' + (nom ? ' ' + esc(nom) : '') + ' !' : 'Dommage, mais tu as bien joué !') + '</p>' +
      (texte ? '<p class="minijeu-resultat">Ton mot : <strong>' + esc(texte) + '</strong></p>' : '') +
      (solution ? '<p class="minijeu-resultat">' + esc(solution) + '</p>' : '') +
      (ligne ? '<p class="minijeu-resultat">' + ligne + '</p>' : '') + // résultat d'un jeu à module (HTML fabriqué par le jeu, sans saisie du joueur)
      '<p class="fin-gain">' + ico('i-etoile', 'ico-gain') + '<strong>+' + ETOILES + ' étoiles</strong></p>' +
      (gain && gain.apres > gain.avant ? '<p class="fin-niveau">Niveau ' + gain.apres + ' atteint !</p>' : '') +
      (gain && gain.coffres && gain.coffres.length ? '<p class="petit">Un coffre t’attend dans « Mon compte ».</p>' : '') +
      '<div class="minijeu-actions"><button type="button" class="btn btn-principal" id="minijeu-rejouer">Rejouer</button>' +
      '<button type="button" class="btn btn-secondaire" id="minijeu-liste">Autres mini-jeux</button>' +
      '<button type="button" class="btn btn-secondaire" id="minijeu-accueil">Retour à l\'accueil</button></div></section>';
    if (dansCarte) $('minijeu-fin').innerHTML = h; else $('minijeu-corps').innerHTML = h; // « Les sons » : la carte corrigée reste visible
    var b = $('minijeu-rejouer'); if (b) b.focus({ preventScroll: true });
    if (window.Voix && window.Voix.taire) window.Voix.taire();
  }

  // ---------- Branchements ----------
  $('btn-minijeux').addEventListener('click', function () { window.Aventura.afficher('ecran-minijeux'); });
  $('minijeux-corps').addEventListener('click', function (e) {
    var b = e.target.closest('.minijeu-carte');
    if (!b) return;
    // « Qui joue ? » : un seul profil, pour recevoir les étoiles.
    window.Aventura.demanderJoueurs(1, function (sl) { lancer(b.dataset.jeu, sl && sl[0]); });
  });
  $('minijeu-corps').addEventListener('click', function (e) {
    if (!etat) return;
    if (e.target.closest('#minijeu-rejouer')) { lancer(etat.jeu.id, etat.profil); return; }
    if (e.target.closest('#minijeu-liste')) { rendre(); window.Aventura.afficher('ecran-minijeux'); return; }
    if (e.target.closest('#minijeu-accueil')) { rendre(); demonter(); etat = null; window.Aventura.afficher('ecran-accueil'); return; }
    if (etat.fini || !etat.carte) return;
    if (etat.carte.module === 'phonemes') GC.toucher(e); else BC.toucher(etat.carte, e, outils);
  });
  $('minijeu-retour').addEventListener('click', function () {
    demonter(); etat = null; rendre();
    if (window.Voix && window.Voix.taire) window.Voix.taire();
    window.Aventura.afficher('ecran-minijeux');
  });
  // Le moteur des cartes de grammaire revient au plateau dès qu'on quitte l'écran d'un mini-jeu.
  document.addEventListener('aventura-ecran', function (e) { if (e.detail !== 'ecran-minijeu') { rendre(); demonter(); } if (e.detail === 'ecran-minijeux') liste(); });
  if (!$('ecran-minijeux').hidden) liste();

  window.Minijeux = { JEUX: JEUX, ETOILES: ETOILES, carte: function () { return etat && etat.carte; } }; // carte() : pour les tests
})();

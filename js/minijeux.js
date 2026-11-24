// Mode « Mini-jeux » (v10.41, demande du 24/11/2026).
// Un mode à part, qui ne fonctionne pas comme les autres : pas de plateau, pas de pion, pas de matière, pas de niveau ni de
// progression. Le joueur choisit son mini-jeu dans la liste, puis son profil (« Qui joue ? », seulement pour attribuer les
// étoiles), joue, et gagne 10 étoiles à chaque partie terminée, gagnée ou perdue.
// Pour l'instant un seul mini-jeu, « La fabrique à mots » (ex-Baby jeux › Lettres, contenu et gestes dans js/baby.js et
// js/baby-carte.js). Pour en ajouter un : une ligne dans JEUX, et sa fonction de départ dans DEPARTS (elle rend { carte, titre… }).
(function () {
  'use strict';

  var B = window.Baby, BC = window.BabyCarte, R = window.Recompenses;
  var $ = function (id) { return document.getElementById(id); };
  var ETOILES = 10; // par partie terminée, gagnée ou perdue
  var JEUX = [
    { id: 'fabrique', nom: 'La fabrique à mots', icone: '🏭', aide: 'Fabrique des mots avec des lettres et des sons, puis écoute-les.' }
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
    fabrique: function () { return B.generer('fabrique', B.defaut(), Math.random); }
  };
  function lancer(idJeu, idProfil) {
    var j = jeuDe(idJeu);
    if (!j || !DEPARTS[idJeu]) return;
    etat = { jeu: j, profil: idProfil || null, carte: DEPARTS[idJeu](), fini: false };
    $('titre-minijeu').textContent = j.nom;
    window.Aventura.afficher('ecran-minijeu');
    dessiner();
    // La consigne est lue une fois toute seule (les petits ne lisent pas encore), comme dans les baby jeux.
    var c = etat.carte;
    if (window.Voix && window.Voix.disponible() && c.oral) setTimeout(function () { if (etat && etat.carte === c && !etat.fini) window.Voix.lire(c.oral); }, 300);
  }

  function dessiner() {
    if (!etat) return;
    var c = etat.carte;
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
  function terminer(gagne, texte) {
    if (!etat || etat.fini) return;
    etat.fini = true;
    var gain = null;
    try {
      var s = etat.profil && R && R.compte.pourJoueur(etat.profil);
      if (s) { s.visite(); gain = s.gagner(ETOILES, 'minijeu', etat.jeu.nom); }
    } catch (e) { gain = null; }
    var nom = nomJoueur(etat.profil);
    var h = '<section class="carte-page minijeu minijeu-fin" role="status">' +
      '<p class="minijeu-bravo">' + (gagne ? 'Bravo' + (nom ? ' ' + esc(nom) : '') + ' !' : 'Dommage, mais tu as bien joué !') + '</p>' +
      (texte ? '<p class="minijeu-resultat">Ton mot : <strong>' + esc(texte) + '</strong></p>' : '') +
      '<p class="fin-gain">' + ico('i-etoile', 'ico-gain') + '<strong>+' + ETOILES + ' étoiles</strong></p>' +
      (gain && gain.apres > gain.avant ? '<p class="fin-niveau">Niveau ' + gain.apres + ' atteint !</p>' : '') +
      (gain && gain.coffres && gain.coffres.length ? '<p class="petit">Un coffre t’attend dans « Mon compte ».</p>' : '') +
      '<div class="minijeu-actions"><button type="button" class="btn btn-principal" id="minijeu-rejouer">Rejouer</button>' +
      '<button type="button" class="btn btn-secondaire" id="minijeu-liste">Autres mini-jeux</button></div></section>';
    $('minijeu-corps').innerHTML = h;
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
    if (e.target.closest('#minijeu-liste')) { window.Aventura.afficher('ecran-minijeux'); return; }
    if (!etat.fini) BC.toucher(etat.carte, e, outils);
  });
  $('minijeu-retour').addEventListener('click', function () {
    etat = null;
    if (window.Voix && window.Voix.taire) window.Voix.taire();
    window.Aventura.afficher('ecran-minijeux');
  });
  document.addEventListener('aventura-ecran', function (e) { if (e.detail === 'ecran-minijeux') liste(); });
  if (!$('ecran-minijeux').hidden) liste();

  window.Minijeux = { JEUX: JEUX, ETOILES: ETOILES };
})();

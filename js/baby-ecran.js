// Écran « Baby jeux » (v9.1, demande de l'utilisateur du 16/11/2026, backlog lignes 355 à 362 ;
// v9.2, demande du 16/11/2026 à 12 h 11, lignes 368 à 372).
// Deux pages, chacune tient sur un seul écran, sans défiler (v9.2) :
//  1. Lettres OU Chiffres (l'un ou l'autre, jamais les deux) ; avec Lettres : l'écriture (MAJUSCULES, minuscules,
//     les deux) et les lettres A à Z ; avec Chiffres : les chiffres 1 à 10. Bouton « Choisir les jeux ».
//  2. La liste des petits jeux de la catégorie choisie, puis « Lancer la partie ».
// Réglages gardés pour la fois suivante. « Lancer la partie » : comme la partie rapide solo — aventure facile et
// aventurier tirés au hasard, 1 joueur ; chaque carte piochée est un baby jeu (js/baby.js, js/plateau.js).
// « Modifier les choix » pendant une partie de Baby jeux (v9.2) revient ici : le bouton devient « Reprendre la partie »
// (les nouveaux réglages valent pour les cartes suivantes) et « ← Partie » ramène au plateau sans rien changer.
(function () {
  'use strict';

  var B = window.Baby;
  var $ = function (id) { return document.getElementById(id); };
  var CLE = 'ludoaventura-baby-choix';
  var choix = B.defaut();
  var page2 = false; // false : catégorie, écriture, lettres / chiffres ; true : liste des jeux
  try { var lu = JSON.parse(localStorage.getItem(CLE) || 'null'); if (lu) choix = brut(lu); } catch (e) { /* stockage indisponible */ }
  if (choix.categories.length > 1) choix.categories = [choix.categories[0]];
  function garder() { try { localStorage.setItem(CLE, JSON.stringify(choix)); } catch (e) { /* */ } }
  // Comme B.reglagesValides, mais les listes vides restent vides (l'écran demande d'en cocher au moins une)
  // et une seule catégorie (v9.2 : Lettres ou Chiffres, pas les deux ; Lettres si un ancien réglage avait les deux).
  function brut(x) {
    var v = B.reglagesValides(x);
    ['lettres', 'chiffres', 'jeux'].forEach(function (k) { if (Array.isArray(x[k]) && !x[k].length) v[k] = []; });
    v.categories = [v.categories[0]];
    return v;
  }
  function cat() { return choix.categories[0]; }

  // Partie de Baby jeux en cours dont on modifie les choix (menu « Modifier les choix »).
  function enModif() {
    var p = window.Aventura && window.Aventura.partie;
    return !!(p && p.modif && p.regles && p.rapide && p.rapide.baby);
  }

  function aCoche(liste, v) { return liste.indexOf(v) >= 0; }
  function caseHtml(type, nom, valeur, coche, texte, cl) {
    return '<label class="pack' + (cl ? ' ' + cl : '') + '"><input type="' + type + '" name="' + nom + '" value="' + valeur + '"' + (coche ? ' checked' : '') + '><span>' + texte + '</span></label>';
  }
  // Titre d'un groupe avec son bouton « Tout » / « Aucun » (même présentation que la partie rapide).
  function titre(id, texte, tout, cible) {
    return '<div class="titre-choix"><span class="legende" id="' + id + '">' + texte + '</span>' +
      '<button type="button" class="btn-tout" data-tout="' + cible + '">' + (tout ? 'Aucun' : 'Tout') + '</button></div>';
  }
  // Une lettre comme elle sera écrite dans les jeux : « A », « a » ou « A a ».
  function lettreVue(l) { return choix.ecriture === 'min' ? l.toLowerCase() : choix.ecriture === 'deux' ? l + ' ' + l.toLowerCase() : l; }

  function page() {
    var modif = enModif();
    // Bouton de retour de la barre : « Accueil », ou « Partie » pendant une modification.
    $('ecran-baby').querySelector('.btn-retour').innerHTML = '<span aria-hidden="true">←</span> ' + (modif ? 'Partie' : 'Accueil');
    var h = '<section class="carte-page baby-reglages ' + (page2 ? 'baby-p2' : 'baby-p1') + '">';
    if (!page2) {
      h += '<fieldset class="defi-choix"><legend>Je veux jouer avec</legend><div class="packs baby-cats">';
      B.CATEGORIES.forEach(function (c) { h += caseHtml('radio', 'baby-cat', c.id, cat() === c.id, '<i class="baby-ico" aria-hidden="true">' + c.icone + '</i> ' + c.nom); });
      h += '</div></fieldset>';
      if (cat() === 'lettres') {
        h += '<fieldset class="defi-choix"><legend>Écriture</legend><div class="packs baby-ecritures">';
        B.ECRITURES.forEach(function (e) { h += caseHtml('radio', 'baby-ecriture', e.id, choix.ecriture === e.id, e.nom); });
        h += '</div></fieldset>';
        h += '<fieldset class="defi-choix baby-bloc-grille" aria-labelledby="baby-t-lettres">' + titre('baby-t-lettres', 'Lettres', choix.lettres.length === B.ALPHABET.length, 'lettres') +
          '<div class="packs baby-grille lettres">';
        B.ALPHABET.forEach(function (l) { h += caseHtml('checkbox', 'baby-lettre', l, aCoche(choix.lettres, l), lettreVue(l), 'baby-case-choix'); });
        h += '</div></fieldset>';
      } else {
        h += '<fieldset class="defi-choix baby-bloc-grille" aria-labelledby="baby-t-chiffres">' + titre('baby-t-chiffres', 'Chiffres', choix.chiffres.length === B.CHIFFRES.length, 'chiffres') +
          '<div class="packs baby-grille chiffres">';
        B.CHIFFRES.forEach(function (n) { h += caseHtml('checkbox', 'baby-chiffre', n, aCoche(choix.chiffres, n), String(n), 'baby-case-choix'); });
        h += '</div></fieldset>';
      }
      h += '<p class="reglage-alerte" id="baby-alerte" role="status" aria-live="polite"></p>';
      h += '<div class="baby-actions"><button type="button" class="btn btn-principal" id="btn-baby-suivant">Choisir les jeux <span aria-hidden="true">→</span></button></div>';
    } else {
      var c = B.CATEGORIES.filter(function (x) { return x.id === cat(); })[0];
      var jeux = B.JEUX.filter(function (j) { return j.cat === c.id; });
      var tous = jeux.every(function (j) { return aCoche(choix.jeux, j.id); });
      h += '<fieldset class="defi-choix baby-bloc-grille" aria-labelledby="baby-t-jeux">' + titre('baby-t-jeux', 'Jeux de ' + c.nom.toLowerCase(), tous, 'jeux') +
        '<div class="packs baby-jeux">';
      jeux.forEach(function (j) { h += caseHtml('checkbox', 'baby-jeu', j.id, aCoche(choix.jeux, j.id), '<i class="baby-ico" aria-hidden="true">' + j.icone + '</i> ' + j.nom); });
      h += '</div></fieldset>';
      h += '<p class="reglage-alerte" id="baby-alerte" role="status" aria-live="polite"></p>';
      h += '<div class="baby-actions"><button type="button" class="btn btn-secondaire" id="btn-baby-retour"><span aria-hidden="true">←</span> ' + c.nom + '</button>' +
        '<button type="button" class="btn btn-principal" id="btn-lancer-baby">' + (modif ? 'Reprendre la partie' : 'Lancer la partie') + '</button></div>';
    }
    $('baby-corps').innerHTML = h + '</section>';
  }

  function lireCases(nom) {
    return Array.prototype.map.call($('baby-corps').querySelectorAll('input[name="' + nom + '"]:checked'), function (i) { return i.value; });
  }
  function idsDuCat() { return B.JEUX.filter(function (j) { return j.cat === cat(); }).map(function (j) { return j.id; }); }
  // Ce qui manque pour passer à la page des jeux, puis pour lancer.
  function manquePage1() {
    if (cat() === 'lettres' && !choix.lettres.length) return 'Choisis au moins une lettre.';
    if (cat() === 'chiffres' && !choix.chiffres.length) return 'Choisis au moins un chiffre.';
    return '';
  }
  function manquePage2() {
    return idsDuCat().some(function (id) { return aCoche(choix.jeux, id); }) ? '' : 'Choisis au moins un jeu.';
  }

  $('baby-corps').addEventListener('change', function (e) {
    var n = e.target.name, v = e.target.value;
    if (n === 'baby-cat') choix.categories = [v];
    if (n === 'baby-lettre') choix.lettres = lireCases('baby-lettre');
    if (n === 'baby-chiffre') choix.chiffres = lireCases('baby-chiffre').map(Number);
    if (n === 'baby-ecriture') choix.ecriture = v;
    if (n === 'baby-jeu') {
      // Les jeux de l'autre catégorie (cachés) restent comme ils étaient.
      var visibles = idsDuCat();
      choix.jeux = choix.jeux.filter(function (id) { return visibles.indexOf(id) < 0; }).concat(lireCases('baby-jeu'));
    }
    garder();
    page();
    var el = $('baby-corps').querySelector('input[name="' + n + '"][value="' + v + '"]');
    if (el) el.focus({ preventScroll: true });
  });
  $('baby-corps').addEventListener('click', function (e) {
    var t = e.target.closest('[data-tout]');
    if (t) {
      var quoi = t.dataset.tout;
      if (quoi === 'lettres') choix.lettres = choix.lettres.length === B.ALPHABET.length ? [] : B.ALPHABET.slice();
      else if (quoi === 'chiffres') choix.chiffres = choix.chiffres.length === B.CHIFFRES.length ? [] : B.CHIFFRES.slice();
      else {
        var ids = idsDuCat(), tous = ids.every(function (id) { return aCoche(choix.jeux, id); });
        choix.jeux = choix.jeux.filter(function (id) { return ids.indexOf(id) < 0; }).concat(tous ? [] : ids);
      }
      garder(); page();
      var b = $('baby-corps').querySelector('[data-tout="' + quoi + '"]'); if (b) b.focus();
      return;
    }
    if (e.target.closest('#btn-baby-suivant')) {
      var m1 = manquePage1();
      if (m1) { $('baby-alerte').textContent = m1; return; }
      page2 = true; page();
      $('baby-corps').querySelector('input[name="baby-jeu"]').focus({ preventScroll: true });
      return;
    }
    if (e.target.closest('#btn-baby-retour')) { page2 = false; page(); $('btn-baby-suivant').focus({ preventScroll: true }); return; }
    if (e.target.closest('#btn-lancer-baby')) {
      var m2 = manquePage2();
      if (m2) { $('baby-alerte').textContent = m2; return; }
      var reg = B.reglagesValides(choix);
      if (enModif()) { window.Aventura.reprendreRapide({ matieres: ['maths'], niveau: 'facile', baby: reg }); return; }
      var d = window.Rapide.generer({ matieres: ['maths'], niveau: 'facile' }); // aventure facile, aventurier au hasard, 1 joueur
      d.baby = reg;
      window.Aventura.lancerRapide(d);
    }
  });
  // « ← Partie » pendant une modification : retour au plateau, rien ne change (passe avant le retour à l'accueil).
  // Écouteur posé sur l'écran, en phase de capture : il passe avant celui du bouton (js/recompenses.js).
  $('ecran-baby').addEventListener('click', function (e) {
    if (!enModif() || !e.target.closest('.btn-retour')) return;
    e.stopPropagation();
    window.Aventura.annulerModif();
  }, true);
  $('btn-baby').addEventListener('click', function () { window.Aventura.afficher('ecran-baby'); });
  // En modification : les réglages de la partie en cours ; sinon ceux gardés de la dernière fois.
  function ouvrir() {
    if (enModif()) choix = brut(window.Aventura.partie.rapide.baby);
    page2 = false;
    page();
  }
  document.addEventListener('aventura-ecran', function (e) {
    if (e.detail !== 'ecran-baby') return;
    // Reprise après un rechargement : la partie est rendue avant que window.Aventura n'existe, on attend un instant.
    if (!window.Aventura) setTimeout(ouvrir, 0); else ouvrir();
  });
  // Partie reprise sur cet écran avant que ce fichier ne soit chargé (rechargement pendant « Modifier les choix »).
  if (!$('ecran-baby').hidden) ouvrir();
})();

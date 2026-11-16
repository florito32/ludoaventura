// Écran « Baby jeux » (v8.11, demande de l'utilisateur du 16/11/2026, backlog lignes 355 à 362).
// Réglages, gardés pour la fois suivante : catégories (Lettres, Chiffres), lettres travaillées (A à Z) et écriture
// (MAJUSCULES, minuscules, les deux), chiffres travaillés (1 à 10), jeux cochés.
// « Lancer la partie » : comme la partie rapide solo (choix de l'utilisateur) — aventure facile et aventurier
// tirés au hasard, 1 joueur ; chaque carte piochée est un baby jeu (js/baby.js, js/plateau.js).
(function () {
  'use strict';

  var B = window.Baby;
  var $ = function (id) { return document.getElementById(id); };
  var CLE = 'ludoaventura-baby-choix';
  var choix = B.defaut();
  try { var lu = JSON.parse(localStorage.getItem(CLE) || 'null'); if (lu) choix = brut(lu); } catch (e) { /* stockage indisponible */ }
  function garder() { try { localStorage.setItem(CLE, JSON.stringify(choix)); } catch (e) { /* */ } }
  // Comme B.reglagesValides, mais les listes vides restent vides (l'écran demande d'en cocher au moins une).
  function brut(x) {
    var v = B.reglagesValides(x);
    ['categories', 'lettres', 'chiffres', 'jeux'].forEach(function (k) { if (Array.isArray(x[k]) && !x[k].length) v[k] = []; });
    return v;
  }

  function aCoche(liste, v) { return liste.indexOf(v) >= 0; }
  function caseHtml(nom, valeur, coche, texte, cl) {
    return '<label class="pack' + (cl ? ' ' + cl : '') + '"><input type="checkbox" name="' + nom + '" value="' + valeur + '"' + (coche ? ' checked' : '') + '><span>' + texte + '</span></label>';
  }
  // Titre d'un groupe avec son bouton « Tout » / « Aucun » (même présentation que la partie rapide).
  function titre(id, texte, tout, cible) {
    return '<div class="titre-choix"><span class="legende" id="' + id + '">' + texte + '</span>' +
      '<button type="button" class="btn-tout" data-tout="' + cible + '">' + (tout ? 'Aucun' : 'Tout') + '</button></div>';
  }

  function page() {
    var h = '<section class="carte-page baby-reglages">';
    h += '<fieldset class="defi-choix"><legend>Catégories</legend><div class="packs">';
    B.CATEGORIES.forEach(function (c) { h += caseHtml('baby-cat', c.id, aCoche(choix.categories, c.id), '<span aria-hidden="true">' + c.icone + '</span> ' + c.nom); });
    h += '</div></fieldset>';
    if (aCoche(choix.categories, 'lettres')) {
      h += '<fieldset class="defi-choix" aria-labelledby="baby-t-lettres">' + titre('baby-t-lettres', 'Lettres', choix.lettres.length === B.ALPHABET.length, 'lettres') +
        '<div class="packs baby-grille">';
      B.ALPHABET.forEach(function (l) { h += caseHtml('baby-lettre', l, aCoche(choix.lettres, l), l + '<span class="baby-min" aria-hidden="true">' + l.toLowerCase() + '</span>', 'baby-case-choix'); });
      h += '</div></fieldset>';
      h += '<fieldset class="defi-choix"><legend>Écriture</legend><div class="packs">';
      B.ECRITURES.forEach(function (e) {
        h += '<label class="pack"><input type="radio" name="baby-ecriture" value="' + e.id + '"' + (choix.ecriture === e.id ? ' checked' : '') + '><span>' + e.nom + '</span></label>';
      });
      h += '</div></fieldset>';
    }
    if (aCoche(choix.categories, 'chiffres')) {
      h += '<fieldset class="defi-choix" aria-labelledby="baby-t-chiffres">' + titre('baby-t-chiffres', 'Chiffres', choix.chiffres.length === B.CHIFFRES.length, 'chiffres') +
        '<div class="packs baby-grille">';
      B.CHIFFRES.forEach(function (n) { h += caseHtml('baby-chiffre', n, aCoche(choix.chiffres, n), String(n), 'baby-case-choix'); });
      h += '</div></fieldset>';
    }
    B.CATEGORIES.forEach(function (c) {
      if (!aCoche(choix.categories, c.id)) return;
      var jeux = B.JEUX.filter(function (j) { return j.cat === c.id; });
      var tous = jeux.every(function (j) { return aCoche(choix.jeux, j.id); });
      h += '<fieldset class="defi-choix" aria-labelledby="baby-t-jeux-' + c.id + '">' + titre('baby-t-jeux-' + c.id, 'Jeux de ' + c.nom.toLowerCase(), tous, 'jeux-' + c.id) +
        '<div class="packs baby-jeux">';
      jeux.forEach(function (j) { h += caseHtml('baby-jeu', j.id, aCoche(choix.jeux, j.id), '<span aria-hidden="true">' + j.icone + '</span> ' + j.nom); });
      h += '</div></fieldset>';
    });
    h += '<p class="reglage-alerte" id="baby-alerte" role="status" aria-live="polite"></p>';
    h += '<button type="button" class="btn btn-principal" id="btn-lancer-baby">Lancer la partie</button></section>';
    $('baby-corps').innerHTML = h;
  }

  function lireCases(nom) {
    return Array.prototype.map.call($('baby-corps').querySelectorAll('input[name="' + nom + '"]:checked'), function (i) { return i.value; });
  }
  // Ce qui manque pour lancer : au moins une catégorie, des lettres / chiffres, et un jeu dans chaque catégorie cochée.
  function manque() {
    if (!choix.categories.length) return 'Choisis Lettres, Chiffres ou les deux.';
    if (aCoche(choix.categories, 'lettres') && !choix.lettres.length) return 'Choisis au moins une lettre.';
    if (aCoche(choix.categories, 'chiffres') && !choix.chiffres.length) return 'Choisis au moins un chiffre.';
    var sans = choix.categories.filter(function (c) { return !choix.jeux.some(function (id) { return B.jeu(id).cat === c; }); });
    if (sans.length) return 'Choisis au moins un jeu de ' + (sans[0] === 'lettres' ? 'lettres' : 'chiffres') + '.';
    return '';
  }

  $('baby-corps').addEventListener('change', function (e) {
    var n = e.target.name, v = e.target.value;
    if (n === 'baby-cat') choix.categories = lireCases('baby-cat');
    if (n === 'baby-lettre') choix.lettres = lireCases('baby-lettre');
    if (n === 'baby-chiffre') choix.chiffres = lireCases('baby-chiffre').map(Number);
    if (n === 'baby-ecriture') choix.ecriture = v;
    if (n === 'baby-jeu') {
      // Les jeux d'une catégorie décochée (donc cachés) restent comme ils étaient.
      var visibles = Array.prototype.map.call($('baby-corps').querySelectorAll('input[name="baby-jeu"]'), function (i) { return i.value; });
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
        var cat = quoi.replace('jeux-', ''), ids = B.JEUX.filter(function (j) { return j.cat === cat; }).map(function (j) { return j.id; });
        var tous = ids.every(function (id) { return aCoche(choix.jeux, id); });
        choix.jeux = choix.jeux.filter(function (id) { return ids.indexOf(id) < 0; }).concat(tous ? [] : ids);
      }
      garder(); page();
      var b = $('baby-corps').querySelector('[data-tout="' + quoi + '"]'); if (b) b.focus();
      return;
    }
    if (e.target.closest('#btn-lancer-baby')) {
      var m = manque();
      if (m) { $('baby-alerte').textContent = m; return; }
      var d = window.Rapide.generer({ matieres: ['maths'], niveau: 'facile' }); // aventure facile, aventurier au hasard, 1 joueur
      d.baby = B.reglagesValides(choix);
      window.Aventura.lancerRapide(d);
    }
  });
  $('btn-baby').addEventListener('click', function () { window.Aventura.afficher('ecran-baby'); });
  document.addEventListener('aventura-ecran', function (e) { if (e.detail === 'ecran-baby') page(); });
})();

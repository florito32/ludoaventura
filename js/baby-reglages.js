// Réglages des matières « Lettres » et « Chiffres » dans « Personnaliser » (v10.41, demande du 24/11/2026).
// Ces deux matières n'ont ni niveau ni progression : le joueur règle seulement ce qui est travaillé.
//  - Lettres : l'écriture (MAJUSCULES, minuscules, les deux), les lettres A à Z, les jeux ;
//  - Chiffres : les chiffres 1 à 10, les jeux.
// Le panneau est dessiné une fois par joueur et par matière, puis seulement remis à jour (le focus reste où il est).
// La logique (réglages valides, ce qui manque) est dans js/baby.js ; les cartes sont tirées par js/plateau.js.
(function () {
  'use strict';

  var B = window.Baby;
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function coche(liste, v) { return liste.indexOf(v) >= 0; }
  function caseHtml(type, nom, valeur, texte, cl, etiquette) {
    return '<label class="pack' + (cl ? ' ' + cl : '') + '"><input type="' + type + '" name="' + nom + '" value="' + valeur + '"' +
      (etiquette ? ' aria-label="' + esc(etiquette) + '"' : '') + '><span>' + texte + '</span></label>';
  }
  function titre(id, texte, quoi) {
    return '<div class="titre-choix"><span class="legende" id="' + id + '">' + texte + '</span>' +
      '<button type="button" class="btn-tout" data-tout="' + quoi + '"></button></div>';
  }
  // Une lettre comme elle sera écrite dans les jeux : « A », « a » ou « A a ».
  function lettreVue(l, ecriture) { return ecriture === 'min' ? l.toLowerCase() : ecriture === 'deux' ? l + ' ' + l.toLowerCase() : l; }

  // Construit le panneau pour la matière cat (1 fois par couple joueur / matière).
  function construire(zone, cat) {
    var h = '<div class="baby-reglages baby-perso" data-cat="' + cat + '">';
    if (cat === 'lettres') {
      h += '<fieldset class="defi-choix"><legend>Écriture</legend><div class="packs baby-ecritures">';
      B.ECRITURES.forEach(function (e) { h += caseHtml('radio', 'baby-ecriture', e.id, e.nom); });
      h += '</div></fieldset>';
      h += '<fieldset class="defi-choix baby-bloc-grille" aria-labelledby="baby-t-lettres">' + titre('baby-t-lettres', 'Lettres', 'lettres') + '<div class="packs baby-grille lettres">';
      B.ALPHABET.forEach(function (l) { h += caseHtml('checkbox', 'baby-lettre', l, '', 'baby-case-choix', 'Lettre ' + l); });
      h += '</div></fieldset>';
    } else {
      h += '<fieldset class="defi-choix baby-bloc-grille" aria-labelledby="baby-t-chiffres">' + titre('baby-t-chiffres', 'Chiffres', 'chiffres') + '<div class="packs baby-grille chiffres">';
      B.CHIFFRES.forEach(function (n) { h += caseHtml('checkbox', 'baby-chiffre', n, String(n), 'baby-case-choix', 'Chiffre ' + n); });
      h += '</div></fieldset>';
    }
    h += '<fieldset class="defi-choix baby-bloc-grille" aria-labelledby="baby-t-jeux">' + titre('baby-t-jeux', 'Jeux', 'jeux') + '<div class="packs baby-jeux">';
    B.JEUX.filter(function (j) { return j.cat === cat; }).forEach(function (j) {
      h += caseHtml('checkbox', 'baby-jeu', j.id, '<i class="baby-ico" aria-hidden="true">' + j.icone + '</i> ' + esc(j.nom));
    });
    h += '</div></fieldset></div>';
    zone.innerHTML = h;
  }

  function libelleTout(b, plein, quoi) {
    b.innerHTML = plein ? '<span class="long">Tout désélectionner</span><span class="court">Aucun</span>' : '<span class="long">Tout sélectionner</span><span class="court">Tout</span>';
    b.setAttribute('aria-label', (plein ? 'Tout désélectionner : ' : 'Tout sélectionner : ') + quoi);
  }

  // Remet les cases d'aplomb d'après les réglages reg (objet de js/baby.js → reglagesMatiere).
  function majCases(zone, reg, cat) {
    var jeuxCat = B.idsDe(cat);
    zone.querySelectorAll('input[name="baby-ecriture"]').forEach(function (i) { i.checked = i.value === reg.ecriture; });
    zone.querySelectorAll('input[name="baby-lettre"]').forEach(function (i) {
      i.checked = coche(reg.lettres, i.value);
      var s = i.nextElementSibling; if (s) s.textContent = lettreVue(i.value, reg.ecriture);
    });
    zone.querySelectorAll('input[name="baby-chiffre"]').forEach(function (i) { i.checked = coche(reg.chiffres, Number(i.value)); });
    zone.querySelectorAll('input[name="baby-jeu"]').forEach(function (i) { i.checked = coche(reg.jeux, i.value); });
    var bl = zone.querySelector('[data-tout="lettres"]'); if (bl) libelleTout(bl, reg.lettres.length === B.ALPHABET.length, 'toutes les lettres');
    var bc = zone.querySelector('[data-tout="chiffres"]'); if (bc) libelleTout(bc, reg.chiffres.length === B.CHIFFRES.length, 'tous les chiffres');
    libelleTout(zone.querySelector('[data-tout="jeux"]'), jeuxCat.every(function (id) { return coche(reg.jeux, id); }), 'tous les jeux');
  }

  // Dessine (ou remet à jour) le panneau de la matière cat dans zone ; sur change : surChangement().
  // cle identifie le couple joueur / matière : un autre couple reconstruit le panneau.
  function rendre(zone, reg, cat, cle, surChangement) {
    if (zone.dataset.cle !== cle) { construire(zone, cat); zone.dataset.cle = cle; }
    majCases(zone, reg, cat);
    zone._reg = reg; zone._cat = cat; zone._sur = surChangement;
    if (zone._branche) return;
    zone._branche = true;
    zone.addEventListener('change', function (e) {
      var r = zone._reg, n = e.target.name, v = e.target.value, c = zone._cat;
      if (!r) return;
      var lis = function (nom) { return Array.prototype.map.call(zone.querySelectorAll('input[name="' + nom + '"]:checked'), function (i) { return i.value; }); };
      if (n === 'baby-ecriture') r.ecriture = v;
      else if (n === 'baby-lettre') r.lettres = lis('baby-lettre');
      else if (n === 'baby-chiffre') r.chiffres = lis('baby-chiffre').map(Number);
      else if (n === 'baby-jeu') r.jeux = r.jeux.filter(function (id) { return B.jeu(id).cat !== c; }).concat(lis('baby-jeu'));
      else return;
      majCases(zone, r, c);
      if (zone._sur) zone._sur();
    });
    zone.addEventListener('click', function (e) {
      var t = e.target.closest('[data-tout]'), r = zone._reg, c = zone._cat;
      if (!t || !r) return;
      var q = t.dataset.tout;
      if (q === 'lettres') r.lettres = r.lettres.length === B.ALPHABET.length ? [] : B.ALPHABET.slice();
      else if (q === 'chiffres') r.chiffres = r.chiffres.length === B.CHIFFRES.length ? [] : B.CHIFFRES.slice();
      else {
        var ids = B.idsDe(c), tous = ids.every(function (id) { return coche(r.jeux, id); });
        r.jeux = r.jeux.filter(function (id) { return ids.indexOf(id) < 0; }).concat(tous ? [] : ids);
      }
      majCases(zone, r, c);
      if (zone._sur) zone._sur();
    });
  }

  window.BabyReglages = { rendre: rendre };
})();

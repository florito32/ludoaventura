// Défi du jour (v10.36, demande de l'utilisateur du 24/11/2026, backlog lignes 475 à 477).
// Le bouton de l'accueil (sous « Commencer l'aventure ») ouvre cette fenêtre : le joueur choisit seulement son ou ses profils
// (1 = défi solo, 2 à 4 = défi en équipe) puis lance. js/defis.js tire l'aventure ; chaque carte tire sa matière et son niveau
// pour le joueur qui la joue (js/plateau.js). Visuel retenu : « A · liste de joueurs » de la page de test (cases à cocher).
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var J = window.Joueurs, AV = window.Aventuriers, D = window.Defis;
  var CODES = ['#e3262a', '#e0a800', '#1c3473', '#2f9e5b'], MAX = 4; // couleurs des pions : rouge, jaune, bleu, vert
  var sel = [];

  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function compte() { return window.Recompenses && window.Recompenses.compte; }
  // Ce que ce profil a déjà fait aujourd'hui avec ce type de défi (solo ou équipe).
  function etatDuJour(j, type) {
    var c = compte(), v = c && c.pourJoueur(j.id);
    if (!v) return '';
    var g = v.defiDuJour(type);
    if (g !== undefined) return '✔ Déjà réussi aujourd’hui : étoiles normales';
    if (v.defiQuitte(type)) return 'Quitté aujourd’hui : rien à gagner';
    return '';
  }
  function rendre() {
    var liste = J.duCompte(), type = sel.length > 1 ? 'equipe' : 'solo';
    $('dj-etat').textContent = !sel.length ? 'Choisis qui joue' : sel.length === 1 ? 'Défi solo' : 'Défi en équipe · ' + sel.length + ' joueurs';
    $('dj-liste').innerHTML = liste.map(function (j) {
      var k = sel.indexOf(j.id), on = k >= 0, p = (AV && (AV.trouver(j.perso) || AV.LISTE[0])), jour = etatDuJour(j, type);
      return '<button type="button" class="dj-ligne" data-j="' + esc(j.id) + '" aria-pressed="' + on + '"' + (!on && sel.length >= MAX ? ' disabled' : '') +
        ' style="--c:' + CODES[on ? k : 0] + '">' +
        '<img class="dj-avatar" src="' + p.image + '" alt="" width="46" height="50">' +
        '<span class="dj-qui"><span class="dj-nom">' + esc(j.nom) + '</span>' + // v10.45 : plus de niveaux dans la liste
        
        (jour ? '<span class="dj-jour">' + jour + '</span>' : '') + '</span>' +
        '<span class="dj-coche" aria-hidden="true">' + (on ? '✓' : '') + '</span></button>';
    }).join('');
    $('dj-ok').disabled = !sel.length;
  }

  function ouvrir() {
    var dlg = $('fenetre-defi'), ids = J.duCompte().map(function (j) { return j.id; });
    // On propose d'abord les joueurs de la dernière partie, sinon le premier joueur du compte.
    var derniers = (window.Aventura && window.Aventura.partie.profils || []).filter(function (id) { return ids.indexOf(id) >= 0; });
    sel = derniers.length ? derniers.slice(0, MAX) : ids.slice(0, 1);
    rendre();
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
  }

  $('dj-liste').addEventListener('click', function (e) {
    var b = e.target.closest('[data-j]');
    if (!b) return;
    var id = b.dataset.j, k = sel.indexOf(id);
    if (k >= 0) sel.splice(k, 1); else if (sel.length < MAX) sel.push(id);
    rendre();
    var el = $('dj-liste').querySelector('[data-j="' + id + '"]');
    if (el) el.focus({ preventScroll: true });
  });
  $('dj-ok').addEventListener('click', function () {
    if (!sel.length) return;
    var ids = sel.slice(), c = compte(), scores = ids.map(function (id) {
      var l = J.duCompte().filter(function (j) { return j.id === id; })[0];
      return l ? J.scoreGlobal(l) : 0;
    });
    $('fenetre-defi').close();
    window.Aventura.lancerDefi(D.genererJour(c.aujourdhui(), scores), ids);
  });
  $('dj-annuler').addEventListener('click', function () { $('fenetre-defi').close(); });

  window.DefiJour = { ouvrir: ouvrir };
})();

// Numéro de version du site + historique des changements.
// À chaque mise en ligne : incrémenter VERSION ici et ajouter une entrée en tête de js/version-historique.js.
// Le badge s'insère dans tout élément portant l'attribut [data-version].
(function () {
  'use strict';

  var VERSION = '10.14';

  // L'historique (ce qui a changé à chaque version) est dans js/version-historique.js, chargé au premier clic.

  // Construit la fenêtre d'historique (élément <dialog> natif, accessible au clavier).
  function buildDialog() {
    var dialog = document.createElement('dialog');
    dialog.className = 'version-dialog';
    dialog.setAttribute('aria-labelledby', 'version-title');

    var html = '<h2 id="version-title">Historique des versions</h2><ol class="version-list">';
    (window.SITE_HISTORY || []).forEach(function (item) {
      html += '<li><h3>v' + item.v + ' <time datetime="' + item.date + '">' +
        new Date(item.date + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) +
        '</time></h3><ul>';
      item.changes.forEach(function (c) { html += '<li>' + c + '</li>'; });
      html += '</ul></li>';
    });
    html += '</ol><form method="dialog"><button class="version-close">Fermer</button></form>';
    dialog.innerHTML = html;

    // Clic sur le fond (hors contenu) : fermeture.
    dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
    document.body.appendChild(dialog);
    return dialog;
  }

  // v9.5 (17/11/2026) : le numéro de version et l'historique ne sont montrés qu'au compte de l'auteur.
  // Simple masquage d'affichage (pas une protection : le fichier reste public), lu dans la session
  // enregistrée par js/compte.js.
  var ADMIN = 'fborel64@gmail.com';
  function estAdmin() {
    try {
      var s = JSON.parse(localStorage.getItem('ludoaventura-session') || 'null');
      return !!(s && s.user && String(s.user.email || '').toLowerCase() === ADMIN);
    } catch (e) { return false; }
  }

  var dialog = null;
  function rafraichir() {
    var slots = document.querySelectorAll('[data-version]');
    var admin = estAdmin();
    slots.forEach(function (slot) {
      slot.hidden = !admin;
      if (!admin || slot.querySelector('.version-badge')) return;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'version-badge';
      // Texte visible « v1.x » + précision réservée aux lecteurs d'écran.
      btn.innerHTML = 'v' + VERSION + '<span class="visually-hidden"> — historique des versions</span>';
      btn.setAttribute('aria-haspopup', 'dialog');
      btn.addEventListener('click', ouvrir);
      slot.appendChild(btn);
    });
  }
  // Premier clic : charge l'historique, puis ouvre la fenêtre.
  var chargement = null;
  function charger() {
    if (window.SITE_HISTORY) return Promise.resolve();
    if (!chargement) chargement = new Promise(function (ok) {
      var s = document.createElement('script');
      s.src = 'js/version-historique.js?v=' + VERSION;
      s.onload = s.onerror = function () { ok(); };
      document.head.appendChild(s);
    });
    return chargement;
  }
  function ouvrir() {
    charger().then(function () {
      if (!dialog) dialog = buildDialog();
      if (!dialog.open) dialog.showModal();
    });
  }
  function init() { rafraichir(); }

  // Appelé par js/compte.js à la connexion et à la déconnexion.
  window.SiteVersion = { rafraichir: rafraichir };
  window.SITE_VERSION = VERSION;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

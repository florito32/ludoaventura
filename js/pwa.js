// Installation PWA + mise à jour automatique.
// Vérifie la présence d'une nouvelle version au lancement ; si la vérification échoue
// (hors ligne…), la retente à la première interaction (clic, toucher, défilement, clavier).
(function () {
  'use strict';

  // Retour sur la page avec « précédent » : le navigateur peut la restaurer telle qu'on l'a quittée
  // (cache de navigation) ; la partie continue donc là où elle en était. Sinon, js/plateau.js
  // la reprend depuis le stockage de session (la partie ne repart de zéro que si l'onglet est fermé).

  // ---------- Bouton « Installer l'application » (v6.24) ----------
  // Visible seulement sur téléphone et tablette (écran tactile comme pointeur principal : « pointer: coarse »)
  // et seulement dans un navigateur : caché quand le jeu tourne déjà comme application installée
  // (« display-mode: standalone », ou navigator.standalone sur iPhone).
  // Chrome, Edge, Samsung Internet (Android) : l'évènement beforeinstallprompt permet d'ouvrir la fenêtre
  // d'installation du navigateur. Safari et Firefox ne l'ont pas : le bouton explique alors comment faire.
  (function () {
    var btn = document.getElementById('btn-installer');
    var boite = document.getElementById('installer');
    if (!btn || !boite) return;
    var invite = null;
    function installee() {
      return window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: fullscreen)').matches || navigator.standalone === true;
    }
    function tactile() { return window.matchMedia('(pointer: coarse)').matches; }
    function apple() {
      return /iPhone|iPad|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); // iPad qui se présente comme un Mac
    }
    btn.hidden = installee() || !tactile();
    window.addEventListener('beforeinstallprompt', function (e) {
      e.preventDefault(); // pas de bandeau automatique : c'est notre bouton qui l'ouvre
      invite = e;
    });
    window.addEventListener('appinstalled', function () { btn.hidden = true; invite = null; });
    btn.addEventListener('click', function () {
      if (invite) {
        var ev = invite;
        invite = null; // l'invite ne sert qu'une fois
        ev.prompt();
        if (ev.userChoice) ev.userChoice.then(function (c) { if (c && c.outcome === 'accepted') btn.hidden = true; }).catch(function () {});
        return;
      }
      document.getElementById('installer-texte').textContent = apple()
        ? 'Touche le bouton Partager (le carré avec une flèche vers le haut), puis « Sur l’écran d’accueil ». L’icône d’Aventura apparaît à côté de tes applications.'
        : 'Ouvre le menu du navigateur (les trois points ⋮), puis « Installer l’application » ou « Ajouter à l’écran d’accueil ». L’icône d’Aventura apparaît à côté de tes applications.';
      boite.showModal();
    });
    document.getElementById('btn-installer-ok').addEventListener('click', function () { boite.close(); });
  })();

  if (!('serviceWorker' in navigator)) return;
  // sw.js est à la racine du site, à côté du dossier js/ : on le localise depuis ce script
  // pour que l'enregistrement fonctionne depuis n'importe quelle page (accueil, aventures).
  var swUrl = new URL('../sw.js', document.currentScript.src).href;

  window.addEventListener('load', function () {
    navigator.serviceWorker.register(swUrl).then(function (reg) {
      reg.update().catch(function () {
        var events = ['click', 'touchstart', 'scroll', 'keydown'];
        function retry() {
          events.forEach(function (e) { window.removeEventListener(e, retry); });
          reg.update().catch(function () {});
        }
        events.forEach(function (e) { window.addEventListener(e, retry, { once: true, passive: true }); });
      });
    }).catch(function () {});
  });
})();

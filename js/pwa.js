// Installation PWA + mise à jour automatique.
// Vérifie la présence d'une nouvelle version au lancement ; si la vérification échoue
// (hors ligne…), la retente à la première interaction (clic, toucher, défilement, clavier).
(function () {
  'use strict';
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', function () {
    navigator.serviceWorker.register('sw.js').then(function (reg) {
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

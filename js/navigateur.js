// Jeu dans le navigateur uniquement (v6.48, demande du 12/11/2026).
// Aventura n'est plus une application installable ni jouable hors ligne : on l'ouvre toujours
// dans le navigateur (ordinateur, tablette, iPhone, Android). Ce script retire, chez ceux qui l'avaient,
// l'ancien service worker (copie hors ligne) et son cache, pour qu'ils reçoivent toujours la version en ligne.
(function () {
  'use strict';

  // Stockage persistant (v6.26, gardé) : demande au navigateur de ne pas effacer la progression
  // (étoiles, niveaux, coffres) quand l'appareil manque de place (web.dev/articles/persistent-storage).
  if (navigator.storage && navigator.storage.persist) {
    navigator.storage.persisted().then(function (p) { return p || navigator.storage.persist(); }).catch(function () {});
  }

  // Désinscrit tout service worker encore présent (avant la v6.48, sw.js gardait une copie du jeu).
  if ('serviceWorker' in navigator && navigator.serviceWorker.getRegistrations) {
    navigator.serviceWorker.getRegistrations().then(function (regs) {
      regs.forEach(function (r) { r.unregister(); });
    }).catch(function () {});
  }
  // Vide l'ancienne copie hors ligne (caches « ludoaventura-vX.Y »).
  if (window.caches && caches.keys) {
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k.indexOf('ludoaventura-') === 0; })
        .map(function (k) { return caches.delete(k); }));
    }).catch(function () {});
  }
})();

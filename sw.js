// Service worker de nettoyage (v6.48) — Aventura ne fonctionne plus hors ligne.
// Ce fichier reste à la même adresse : les appareils qui avaient l'ancien service worker
// le reçoivent à leur prochaine visite. Il vide la copie hors ligne, se désinscrit,
// puis recharge les pages ouvertes, qui viennent alors directement du site en ligne.
// Aucune page ne l'enregistre plus (js/navigateur.js désinscrit tout service worker).
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.matchAll({ type: 'window' }))
      .then((pages) => pages.forEach((p) => p.navigate(p.url).catch(() => {})))
  );
});
// Pas d'écouteur « fetch » : toutes les requêtes vont directement au réseau.

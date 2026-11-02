// Service worker Ludoaventura.
// Stratégie « réseau d'abord » : en ligne, on sert toujours la dernière version publiée
// (mise à jour automatique, sans bouton) ; hors ligne, on sert la copie en cache.
const CACHE = 'ludoaventura-v3.7'; // à incrémenter avec js/version.js
const PRECACHE = ['./', 'index.html', 'css/site.css', 'js/des.js', 'js/aventures.js', 'js/aventuriers.js', 'js/cartes.js', 'js/questions.js', 'js/voix.js', 'js/constructions.js', 'js/regles.js', 'js/plateau.js', 'js/version.js', 'js/pwa.js', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/favicon.png', 'img/fond.webp', 'img/arche.webp', 'img/perso.webp', 'img/herbe.webp', 'img/plateau-jour.webp', 'img/plateau-soir.webp', 'img/aventures/viking.svg', 'img/aventures/chevalier.svg', 'img/aventures/prehistoire.svg', 'img/aventures/mayas.svg', 'img/aventures/savane.svg', 'img/aventures/egypte.svg', 'img/aventures/chine.svg', 'img/aventures/far-west.svg', 'img/aventures/druides.svg', 'img/aventures/incas.svg', 'img/aventuriers/lea.svg', 'img/aventuriers/tom.svg', 'img/aventuriers/nour.svg', 'img/aventuriers/malo.svg', 'img/aventuriers/ines.svg', 'img/aventuriers/jo.svg', 'img/aventuriers/kenji.svg', 'img/aventuriers/zoe.svg', 'img/aventuriers/sam.svg', 'img/aventuriers/awa.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)));
  self.skipWaiting(); // le nouveau service worker prend la main sans attendre
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(
    fetch(req, { cache: 'no-cache' })
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req).then((hit) => hit || caches.match('./')))
  );
});

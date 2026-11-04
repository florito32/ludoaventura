// Service worker Ludoaventura.
// Stratégie « réseau d'abord » : en ligne, on sert toujours la dernière version publiée
// (mise à jour automatique, sans bouton) ; hors ligne, on sert la copie en cache.
const CACHE = 'ludoaventura-v6.15'; // à incrémenter avec js/version.js
const PRECACHE = ['./', 'index.html', 'css/site.css', 'js/des.js', 'js/aventures.js', 'js/aventuriers.js', 'js/cartes.js', 'js/questions.js', 'js/calcul.js', 'js/conjugaison.js', 'js/voix.js', 'js/constructions.js', 'js/regles.js', 'js/figurines.js', 'js/plateau.js', 'js/ludo.js', 'js/version.js', 'js/pwa.js', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/favicon.png', 'img/fond.webp', 'img/arche.webp', 'img/perso.webp', 'img/ludo.webp', 'img/herbe.webp', 'img/plateau-jour.webp', 'img/plateau-soir.webp', 'img/aventures/viking.webp', 'img/aventures/chevalier.webp', 'img/aventures/prehistoire.webp', 'img/aventures/mayas.webp', 'img/aventures/savane.webp', 'img/aventures/egypte.webp', 'img/aventures/chine.webp', 'img/aventures/far-west.webp', 'img/aventures/druides.webp', 'img/aventures/incas.webp', 'img/aventuriers/lea.svg', 'img/aventuriers/tom.svg', 'img/aventuriers/nour.svg', 'img/aventuriers/malo.svg', 'img/aventuriers/ines.svg', 'img/aventuriers/jo.svg', 'img/aventuriers/kenji.svg', 'img/aventuriers/zoe.svg', 'img/aventuriers/sam.svg', 'img/aventuriers/awa.svg'];

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

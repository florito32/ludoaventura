// Service worker Ludoaventura.
// Stratégie « réseau d'abord » : en ligne, on sert toujours la dernière version publiée
// (mise à jour automatique, sans bouton) ; hors ligne, on sert la copie en cache.
const CACHE = 'ludoaventura-v6.37'; // à incrémenter avec js/version.js
const PRECACHE = ['./', 'index.html', 'css/site.css', 'js/des.js', 'js/aventures.js', 'js/aventuriers.js', 'js/cartes.js', 'js/questions.js', 'js/calcul.js', 'js/conjugaison.js', 'js/phrases.js', 'js/voix.js', 'js/parole.js', 'js/constructions.js', 'js/regles.js', 'js/etoiles.js', 'js/defis.js', 'js/recompenses.js', 'js/figurines.js', 'js/plateau.js', 'js/ludo.js', 'js/version.js', 'js/pwa.js', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/favicon.png', 'img/fond.webp', 'img/arche.webp', 'img/perso.webp', 'img/ludo.webp', 'img/herbe.webp', 'img/plateau-jour.webp', 'img/plateau-soir.webp', 'img/aventures/viking.webp', 'img/aventures/chevalier.webp', 'img/aventures/prehistoire.webp', 'img/aventures/mayas.webp', 'img/aventures/savane.webp', 'img/aventures/egypte.webp', 'img/aventures/chine.webp', 'img/aventures/far-west.webp', 'img/aventures/druides.webp', 'img/aventures/incas.webp', 'img/aventuriers/lea.webp', 'img/aventuriers/lea-pied.webp', 'img/aventuriers/tom.webp', 'img/aventuriers/tom-pied.webp', 'img/aventuriers/nour.webp', 'img/aventuriers/nour-pied.webp', 'img/aventuriers/malo.webp', 'img/aventuriers/malo-pied.webp', 'img/aventuriers/ines.webp', 'img/aventuriers/ines-pied.webp', 'img/aventuriers/jo.webp', 'img/aventuriers/jo-pied.webp', 'img/aventuriers/kenji.webp', 'img/aventuriers/kenji-pied.webp', 'img/aventuriers/zoe.webp', 'img/aventuriers/zoe-pied.webp', 'img/aventuriers/sam.webp', 'img/aventuriers/sam-pied.webp', 'img/aventuriers/awa.webp', 'img/aventuriers/awa-pied.webp'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)));
  self.skipWaiting(); // le nouveau service worker prend la main sans attendre
});

// Réparation du cache (v6.26) : si un fichier du jeu manque dans le cache (copie effacée ou jamais
// enregistrée), on le retélécharge dès que le réseau est là. Sinon, hors ligne, l'image manquante
// (ex. le plateau du soir) ne s'affichait pas et il fallait se reconnecter pour la voir.
var derniereReparation = 0; // var : remis à zéro par les tests
function reparerCache() {
  if (Date.now() - derniereReparation < 60000) return Promise.resolve(); // au plus une fois par minute
  derniereReparation = Date.now();
  return caches.open(CACHE).then((c) => Promise.all(PRECACHE.map((url) =>
    c.match(url).then((hit) => hit || c.add(url).catch(() => {})) // hors ligne : on réessaiera plus tard
  )));
}

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(reparerCache)
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  // À chaque ouverture de page, vérifier en arrière-plan que tout le jeu est bien en cache.
  if (req.mode === 'navigate') event.waitUntil(reparerCache());
  event.respondWith(
    fetch(req, { cache: 'no-cache' })
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          // waitUntil : le service worker n'est pas arrêté avant la fin de l'enregistrement.
          event.waitUntil(caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {}));
        }
        return res;
      })
      .catch(() => caches.match(req, { ignoreVary: true }).then((hit) => {
        if (hit) return hit;
        // Seule une page peut être remplacée par l'accueil ; une image reçoit une vraie erreur
        // (avant v6.26, elle recevait la page HTML, ce qui donnait une image cassée).
        if (req.mode === 'navigate') return caches.match('./');
        return Response.error();
      }))
  );
});

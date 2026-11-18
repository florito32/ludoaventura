// Envol des points (v10.15, demande du 18/11/2026, backlog ligne 429).
// À la fin d'un tour, chaque point gagné prend la forme de l'aventure (flamme, pierre, tronc…) : les formes se posent
// en tas, grosses, au centre du plateau, puis partent l'une après l'autre vers l'image de la construction, à côté du
// comptage des points. En 1 seconde, chacune rétrécit jusqu'à sa taille définitive dans l'image, et le comptage monte
// à chaque arrivée. Réglages choisis par l'utilisateur sur la page de test A/B (proposition A, 18/11/2026, 11 h 21) :
//   formes au centre 12 % du plateau, arrivée 22 % de l'image, pause 0,2 s, écart 0,13 s, vol 1 s, courbe légère,
//   rotation 1 tour, départ doux puis accélération, éclat à l'arrivée.
// Module sans état : la page (js/plateau.js) l'appelle et reçoit les arrivées ; utilisable aussi dans les tests.
(function (racine) {
  'use strict';

  var REGLAGES = { taille: 0.12, fin: 0.22, pause: 200, ecart: 130, duree: 1000, courbe: 0.08, rotation: 1, pop: 80, popDuree: 260 };

  // Forme de chaque aventure (dessins dans le sprite d'index.html). Flamme et pierre : demande de l'utilisateur ;
  // les 8 autres : propositions validées sur la page de test (« formes à refaire : aucune »).
  var FORMES = {
    prehistoire: 'f-flamme', mayas: 'f-pierre-maya', viking: 'f-tronc', chevalier: 'f-epee', savane: 'f-gazelle',
    egypte: 'f-bloc-egypte', chine: 'f-brique', 'far-west': 'f-rail', druides: 'f-menhir', incas: 'f-pierre-inca'
  };
  function symbole(id) { return FORMES[id] || 'f-pierre-maya'; }

  // Départ doux, arrivée rapide.
  function rythme(t) { return Math.pow(t, 2.2); }

  // Positions des n formes en tas autour du centre (spirale de tournesol), réduites pour tenir dans le plateau.
  function tas(n, taille, largeur, hauteur) {
    var pos = [], i, a, r;
    for (i = 0; i < n; i++) { a = i * 2.39996; r = taille * 0.34 * Math.sqrt(i); pos.push({ x: r * Math.cos(a), y: r * Math.sin(a) }); }
    var x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    pos.forEach(function (p) { x0 = Math.min(x0, p.x - taille / 2); x1 = Math.max(x1, p.x + taille / 2); y0 = Math.min(y0, p.y - taille / 2); y1 = Math.max(y1, p.y + taille / 2); });
    var f = Math.min(1, largeur * 0.9 / (x1 - x0), hauteur * 0.8 / (y1 - y0));
    pos.forEach(function (p) { p.x *= f; p.y *= f; });
    return { taille: taille * f, pos: pos };
  }

  // Lance l'envol de o.n formes dans o.couche (calque du plateau) vers o.cible (image de la construction).
  //   o.symbole : identifiant du dessin ; o.auArrivee(k) : appelée à chaque arrivée (k = nombre déjà arrivées) ;
  //   o.auFin() : appelée une fois tout arrivé. Renvoie { finir, annuler } :
  //   finir() compte tout de suite ce qui reste (changement d'écran), annuler() arrête sans rien compter.
  function lancer(o) {
    var N = Math.max(0, Math.floor(o.n)), R = REGLAGES;
    var etat = { actif: true, arrivees: 0, anims: [], els: [], minuteurs: [] };
    function nettoyer() {
      etat.minuteurs.forEach(clearTimeout); etat.minuteurs = [];
      etat.anims.forEach(function (a) { try { a.cancel(); } catch (e) { /* déjà finie */ } }); etat.anims = [];
      etat.els.forEach(function (x) { if (x.parentNode) x.parentNode.removeChild(x); }); etat.els = [];
    }
    function fin() { if (!etat.actif) return; etat.actif = false; nettoyer(); if (o.auFin) o.auFin(); }
    var poignee = {
      finir: function () { if (!etat.actif) return; while (etat.arrivees < N) { etat.arrivees++; if (o.auArrivee) o.auArrivee(etat.arrivees); } fin(); },
      annuler: function () { etat.actif = false; nettoyer(); }
    };
    var cl = o.couche.getBoundingClientRect(), cb = o.cible.getBoundingClientRect();
    if (!N || !cl.width || !cb.width || !o.couche.animate) { poignee.finir(); return poignee; }

    var largeur = cl.width, hauteur = cl.height, cx = largeur / 2, cy = hauteur / 2;
    var tx = cb.left + cb.width / 2 - cl.left, ty = cb.top + cb.height / 2 - cl.top;
    var fin_ = R.fin * cb.width, dis = tas(N, R.taille * largeur, largeur, hauteur), taille = dis.taille;
    var finEchelle = fin_ / taille, arc = R.courbe * largeur;
    var debutVol = R.pop * (N - 1) + R.popDuree + R.pause;
    var NS = 'http://www.w3.org/2000/svg';

    function arrive(x) {
      etat.arrivees++;
      if (o.auArrivee) o.auArrivee(etat.arrivees);
      // La forme se fond dans l'image, avec un éclat doré.
      var a = x.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, fill: 'forwards' });
      a.onfinish = function () { if (x.parentNode) x.parentNode.removeChild(x); };
      etat.anims.push(a);
      var e = document.createElement('div');
      e.className = 'envol-eclat';
      e.style.cssText = 'left:' + (tx - fin_ * 0.6) + 'px;top:' + (ty - fin_ * 0.6) + 'px;width:' + fin_ * 1.2 + 'px;height:' + fin_ * 1.2 + 'px';
      o.couche.appendChild(e); etat.els.push(e);
      var b = e.animate([{ transform: 'scale(.3)', opacity: 0.95 }, { transform: 'scale(1.7)', opacity: 0 }], { duration: 420, easing: 'ease-out', fill: 'forwards' });
      b.onfinish = function () { if (e.parentNode) e.parentNode.removeChild(e); };
      etat.anims.push(b);
      if (etat.arrivees >= N) etat.minuteurs.push(setTimeout(fin, 450));
    }

    for (var i = 0; i < N; i++) (function (i) {
      var rang = N - 1 - i; // en tas, la forme du dessus part la première
      var sx = cx + dis.pos[i].x, sy = cy + dis.pos[i].y;
      var x = document.createElementNS(NS, 'svg');
      x.setAttribute('class', 'envol-forme'); x.setAttribute('aria-hidden', 'true'); x.setAttribute('viewBox', '0 0 48 48');
      x.innerHTML = '<use href="#' + o.symbole + '"/>';
      x.style.cssText = 'left:' + (sx - taille / 2) + 'px;top:' + (sy - taille / 2) + 'px;width:' + taille + 'px;height:' + taille + 'px;z-index:' + i;
      o.couche.appendChild(x); etat.els.push(x);
      // 1. la forme se pose au centre, avec un petit rebond
      etat.anims.push(x.animate([{ transform: 'scale(0)', opacity: 0 }, { transform: 'scale(1.18)', opacity: 1, offset: 0.7 }, { transform: 'scale(1)', opacity: 1 }],
        { duration: R.popDuree, delay: i * R.pop, easing: 'ease-out', fill: 'both' }));
      // 2. elle vole vers l'image en rétrécissant (arc léger, un tour sur elle-même), sans sortir du plateau
      var v0x = sx - tx, v0y = sy - ty, len = Math.hypot(v0x, v0y) || 1, nx = -v0y / len, ny = v0x / len, kf = [], n = 32, j;
      for (j = 0; j <= n; j++) {
        var u = j / n, e = rythme(u), px = v0x * (1 - e), py = v0y * (1 - e), h = arc * Math.sin(Math.PI * e);
        px += nx * h; py += ny * h;
        var demi = taille * (1 + (finEchelle - 1) * e) / 2;
        px = Math.max(demi - tx, Math.min(largeur - demi - tx, px)); py = Math.max(demi - ty, Math.min(hauteur - demi - ty, py));
        kf.push({ transform: 'translate(' + (tx + px - sx).toFixed(1) + 'px,' + (ty + py - sy).toFixed(1) + 'px) rotate(' + (R.rotation * 360 * e).toFixed(1) + 'deg) scale(' + (1 + (finEchelle - 1) * e).toFixed(4) + ')', offset: u });
      }
      var vol = x.animate(kf, { duration: R.duree, delay: debutVol + rang * R.ecart, easing: 'linear', fill: 'forwards' });
      vol.onfinish = function () { if (etat.actif) arrive(x); };
      etat.anims.push(vol);
    })(i);
    return poignee;
  }

  var api = { REGLAGES: REGLAGES, FORMES: FORMES, symbole: symbole, lancer: lancer };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else racine.Envol = api;
})(this);

// Sons et vibrations du jeu (v10.61, demande du 26/11/2026, backlog lignes 565 à 572).
//  - dé : son + vibration de 0,1 s au lancer ; réussite / raté : pendant l'animation du pion après la réponse ;
//    étoile : un son toutes les 0,1 s (avec une petite vibration) pendant l'envol des étoiles gagnées.
//  - Réglages dans Paramètres › Sons : volume des sons de l'animation, volume de la voix, vibration (désactivée, légère,
//    normale, forte). Gardés sur l'appareil (localStorage).
//  - Tout s'arrête quand le joueur quitte l'écran en cours, ferme la page ou la met en arrière-plan.
// Les sons passent par l'API Web Audio : les petits sons rapprochés (étoiles) se superposent sans retard.
// Vibration : navigator.vibrate (Android) ; Safari sur iPhone ne la propose pas, le jeu reste silencieux côté vibration.
(function (racine) {
  'use strict';

  var CLE = 'ludoaventura-sons';
  var FICHIERS = { de: 'sons/de.mp3', reussite: 'sons/reussite.mp3', rate: 'sons/rate.mp3', etoile: 'sons/etoile.mp3' };
  // Vibration : multiplicateur de la durée (« normale » = la durée demandée, 0,1 s pour le dé).
  var NIVEAUX = { aucune: 0, legere: 0.5, normale: 1, forte: 2 };
  var DEFAUT = { anim: 1, voix: 1, vib: 'normale' };

  var prefs = lire();
  var ctx = null, gain = null, tampons = {}, chargement = {}, actifs = [];
  var historique = []; // derniers sons / vibrations demandés (utile aux tests)

  function lire() {
    var p = {};
    try { p = JSON.parse(racine.localStorage.getItem(CLE) || '{}') || {}; } catch (e) { p = {}; }
    return {
      anim: nombre(p.anim, DEFAUT.anim),
      voix: nombre(p.voix, DEFAUT.voix),
      vib: NIVEAUX.hasOwnProperty(p.vib) ? p.vib : DEFAUT.vib
    };
  }
  function nombre(v, defaut) { v = Number(v); return isFinite(v) && v >= 0 && v <= 1 ? v : defaut; }
  function garder() { try { racine.localStorage.setItem(CLE, JSON.stringify(prefs)); } catch (e) { /* stockage bloqué : sans importance */ } }

  // ---------- Réglages ----------
  function reglages() { return { anim: prefs.anim, voix: prefs.voix, vib: prefs.vib }; }
  function regler(nom, valeur) {
    if (nom === 'anim' || nom === 'voix') prefs[nom] = nombre(valeur, prefs[nom]);
    else if (nom === 'vib' && NIVEAUX.hasOwnProperty(valeur)) prefs.vib = valeur;
    else return;
    if (nom === 'anim' && gain) gain.gain.value = prefs.anim;
    if (nom === 'vib' && valeur === 'aucune') coupeVibration();
    garder();
  }
  function volumeVoix() { return prefs.voix; }

  // ---------- Sons ----------
  // Le contexte audio ne démarre qu'après un geste du joueur (règle des navigateurs) : on le réveille au premier toucher.
  function contexte() {
    if (ctx) return ctx;
    var C = racine.AudioContext || racine.webkitAudioContext;
    if (!C) return null;
    try { ctx = new C(); gain = ctx.createGain(); gain.gain.value = prefs.anim; gain.connect(ctx.destination); } catch (e) { ctx = null; }
    return ctx;
  }
  function reveiller() {
    var c = contexte();
    if (c && c.state === 'suspended' && c.resume) { try { c.resume(); } catch (e) { /* tant pis */ } }
    Object.keys(FICHIERS).forEach(charger);
  }
  function charger(nom) {
    var c = contexte();
    if (!c || tampons[nom] || chargement[nom] || !racine.fetch) return;
    chargement[nom] = true;
    racine.fetch(FICHIERS[nom]).then(function (r) { return r.arrayBuffer(); }).then(function (octets) {
      return new Promise(function (ok, ko) { c.decodeAudioData(octets, ok, ko); });
    }).then(function (t) { tampons[nom] = t; }).catch(function () { chargement[nom] = false; });
  }

  // Joue un son (de, reussite, rate, etoile) au volume réglé ; sans effet si le volume est à 0 ou si le son n'est pas prêt.
  function jouer(nom) {
    historique.push({ son: nom, t: Date.now() }); if (historique.length > 200) historique.shift();
    if (!prefs.anim) return;
    var c = contexte();
    if (!c || !FICHIERS[nom]) return;
    if (!tampons[nom]) { charger(nom); return; }
    if (c.state === 'suspended' && c.resume) { try { c.resume(); } catch (e) { /* tant pis */ } }
    try {
      var s = c.createBufferSource();
      s.buffer = tampons[nom]; s.connect(gain);
      s.onended = function () { var i = actifs.indexOf(s); if (i >= 0) actifs.splice(i, 1); };
      actifs.push(s); s.start(0);
    } catch (e) { /* son impossible : sans importance */ }
  }

  // ---------- Vibration ----------
  function coupeVibration() { try { if (racine.navigator && racine.navigator.vibrate) racine.navigator.vibrate(0); } catch (e) { /* rien */ } }
  // Vibre ms millisecondes (multipliées par le niveau choisi) ; « aucune » ne vibre pas.
  function vibrer(ms) {
    var k = NIVEAUX[prefs.vib];
    historique.push({ vibration: ms, t: Date.now() }); if (historique.length > 200) historique.shift();
    if (!k || !racine.navigator || !racine.navigator.vibrate) return;
    try { racine.navigator.vibrate(Math.max(1, Math.round(ms * k))); } catch (e) { /* appareil sans vibreur */ }
  }

  // ---------- Arrêt ----------
  // Coupe les sons en cours, les vibrations et la voix.
  function arreter() {
    actifs.slice().forEach(function (s) { try { s.stop(0); } catch (e) { /* déjà fini */ } });
    actifs = [];
    coupeVibration();
    if (racine.Voix && racine.Voix.taire) racine.Voix.taire();
  }

  // Le joueur change d'écran, ferme la page ou la met en arrière-plan : tout s'arrête.
  var ecranVu = 'ecran-accueil'; // le jeu s'ouvre sur l'accueil (pas toujours d'événement au chargement)
  document.addEventListener('aventura-ecran', function (e) { if (e.detail !== ecranVu) arreter(); ecranVu = e.detail; });
  racine.addEventListener('pagehide', arreter);
  document.addEventListener('visibilitychange', function () { if (document.hidden) arreter(); });
  ['pointerdown', 'keydown', 'touchstart'].forEach(function (t) { document.addEventListener(t, reveiller, { once: true, passive: true }); });

  racine.Sons = { jouer: jouer, vibrer: vibrer, arreter: arreter, reglages: reglages, regler: regler, volumeVoix: volumeVoix,
    NIVEAUX: NIVEAUX, historique: historique };
})(this);

// Partie rapide (v6.43, demande de l'utilisateur du 10/11/2026, backlog lignes 202 à 205).
// On choisit seulement le nombre de joueurs et les matières (Maths, Français ou les deux) ;
// le jeu tire au hasard l'aventure et les aventuriers, puis lance la partie.
// À chaque carte, une question au hasard dans les matières choisies, tout mélangé :
//  - Maths : un niveau au hasard (Facile à Expert), tous les signes, tous les nombres du niveau ;
//  - Français : orthographe ou conjugaison (une chance sur deux, choix de l'utilisateur) ;
//      orthographe : tous les thèmes, tous les niveaux de mots, toutes les questions ;
//      conjugaison : un niveau de verbes au hasard, tous les temps de tous les modes, les 3 groupes.
// Partie logique (sans interface) utilisable dans les tests Node ; l'écran est construit plus bas, dans la page seulement.
(function (racine) {
  'use strict';

  var noeud = typeof module !== 'undefined' && module.exports;
  var A = noeud ? require('./aventures.js') : racine.Aventures;
  var P = noeud ? require('./aventuriers.js') : racine.Aventuriers;
  var K = noeud ? require('./calcul.js') : racine.Calcul;
  var V = noeud ? require('./conjugaison.js') : racine.Conjugaison;

  var MATIERES = [{ id: 'maths', nom: 'Maths' }, { id: 'francais', nom: 'Français' }];

  function tirer(t, r) { return t[Math.floor(r() * t.length)]; }
  function melanger(t, r) {
    t = t.slice();
    for (var i = t.length - 1; i > 0; i--) { var k = Math.floor(r() * (i + 1)), x = t[i]; t[i] = t[k]; t[k] = x; }
    return t;
  }

  // Réglages de calcul « tout coché » pour un niveau.
  function mathsTout(niveau) {
    var m = { niveau: niveau, signes: K.SIGNES.map(function (s) { return s.id; }), nbSignes: K.choixSignes(niveau),
      nombres: [], dizaines: [], centaines: [], milliers: [] };
    K.groupes(niveau).forEach(function (g) { m[g.id] = g.valeurs.slice(); });
    return m;
  }
  // Réglages de conjugaison « tout coché » pour un niveau de verbes.
  function conjTout(niveau) {
    var modes = V.MODES.map(function (m) { return m.id; });
    return { niveau: niveau, modes: modes, temps: V.TEMPS.map(function (t) { return t.id; }), groupes: [1, 2, 3] };
  }

  // La partie : choix = { joueurs: 1 à 4, matieres: ['maths', 'francais'] } → aventure et aventuriers tirés au hasard.
  function generer(choix, r) {
    r = r || Math.random;
    var nb = Math.min(4, Math.max(1, Number(choix.joueurs) || 1));
    var matieres = (choix.matieres || []).filter(function (m) { return m === 'maths' || m === 'francais'; });
    if (!matieres.length) matieres = ['maths', 'francais'];
    return {
      joueurs: nb,
      matieres: matieres,
      aventure: tirer(A.LISTE, r).id,
      aventuriers: melanger(P.LISTE.map(function (p) { return p.id; }), r).slice(0, nb)
    };
  }

  // Ce que demande la prochaine carte : { matiere: 'maths' | 'orthographe' | 'conjugaison', maths?, conj? }.
  function carte(matieres, r) {
    r = r || Math.random;
    var m = tirer(matieres && matieres.length ? matieres : ['maths', 'francais'], r);
    if (m === 'francais') m = r() < 0.5 ? 'orthographe' : 'conjugaison';
    if (m === 'maths') return { matiere: 'maths', maths: mathsTout(tirer(K.NIVEAUX, r).id) };
    if (m === 'conjugaison') return { matiere: 'conjugaison', conj: conjTout(tirer(V.NIVEAUX, r).id) };
    return { matiere: 'orthographe' };
  }

  var api = { MATIERES: MATIERES, generer: generer, carte: carte, mathsTout: mathsTout, conjTout: conjTout };
  if (noeud) { module.exports = api; return; }
  racine.Rapide = api;

  // ---------- Écran « Partie rapide » ----------
  var $ = function (id) { return document.getElementById(id); };
  var CLE = 'ludoaventura-rapide-choix';
  var choix = { joueurs: 1, matieres: ['maths', 'francais'] };
  try { var lu = JSON.parse(localStorage.getItem(CLE) || 'null'); if (lu) { if (lu.joueurs) choix.joueurs = lu.joueurs; if (lu.matieres) choix.matieres = lu.matieres; } } catch (e) { /* */ }
  function garder() { try { localStorage.setItem(CLE, JSON.stringify(choix)); } catch (e) { /* */ } }

  function page() {
    var h = '<section class="carte-page"><fieldset class="defi-choix"><legend>Joueurs</legend><div class="packs">';
    [1, 2, 3, 4].forEach(function (n) {
      h += '<label class="pack"><input type="radio" name="rapide-joueurs" value="' + n + '"' + (choix.joueurs === n ? ' checked' : '') + '><span>' + n + '</span></label>';
    });
    h += '</div></fieldset>';
    var tout = choix.matieres.length === MATIERES.length;
    h += '<fieldset class="defi-choix rapide-matieres"><legend>Matières</legend><div class="packs">';
    MATIERES.forEach(function (m) {
      h += '<label class="pack"><input type="checkbox" name="rapide-matiere" value="' + m.id + '"' + (choix.matieres.indexOf(m.id) >= 0 ? ' checked' : '') + '><span>' + m.nom + '</span></label>';
    });
    h += '</div><button type="button" class="btn-tout" id="btn-rapide-tout">' + (tout ? 'Aucune' : 'Toutes les matières') + '</button></fieldset>';
    h += '<p class="petit">L’aventure, les aventuriers et les questions sont tirés au hasard : tous les niveaux, tous les thèmes, tous les temps.</p>';
    h += '<p class="reglage-alerte" id="rapide-alerte" role="status" aria-live="polite"></p>';
    h += '<button type="button" class="btn btn-principal" id="btn-lancer-rapide">Lancer la partie</button></section>';
    $('rapide-corps').innerHTML = h;
  }

  $('rapide-corps').addEventListener('change', function (e) {
    if (e.target.name === 'rapide-joueurs') choix.joueurs = Number(e.target.value);
    if (e.target.name === 'rapide-matiere') {
      choix.matieres = MATIERES.map(function (m) { return m.id; }).filter(function (id) {
        var c = $('rapide-corps').querySelector('input[name="rapide-matiere"][value="' + id + '"]');
        return c && c.checked;
      });
    }
    garder();
    var n = e.target.name, v = e.target.value;
    page();
    var el = $('rapide-corps').querySelector('input[name="' + n + '"][value="' + v + '"]');
    if (el) el.focus({ preventScroll: true });
  });
  $('rapide-corps').addEventListener('click', function (e) {
    if (e.target.closest('#btn-rapide-tout')) {
      choix.matieres = choix.matieres.length === MATIERES.length ? [] : MATIERES.map(function (m) { return m.id; });
      garder(); page();
      $('btn-rapide-tout').focus();
      return;
    }
    if (e.target.closest('#btn-lancer-rapide')) {
      if (!choix.matieres.length) { $('rapide-alerte').textContent = 'Choisis au moins une matière.'; return; }
      window.Aventura.lancerRapide(generer(choix));
    }
  });
  $('btn-rapide').addEventListener('click', function () { window.Aventura.afficher('ecran-rapide'); });
  document.addEventListener('aventura-ecran', function (e) { if (e.detail === 'ecran-rapide') page(); });
})(this);

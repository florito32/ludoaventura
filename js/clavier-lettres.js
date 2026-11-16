// Clavier à lettres (v9.3, demande du 16/11/2026, BACKLOG lignes 364 à 367, 373 et 374) : toute réponse écrite en lettres
// (orthographe, conjugaison, question ouverte de géographie ou d'histoire) se donne en touchant des lettres
// proposées par le jeu : plus jamais le clavier du téléphone ni de l'ordinateur.
// Choix de l'utilisateur (page de propositions A / B) : touches comme le pavé numérique, MAJUSCULES,
// 6 lettres par ligne, au moins 18 lettres (celles de la réponse + au moins 5 pièges), dans l'ordre alphabétique ;
// une case par lettre (la longueur est montrée) ; l'espace, le tiret et l'apostrophe ont chacun leur case ;
// touche « é è ê » (change l'accent de la dernière lettre), touches - et ’ ; ⌫, « Tout effacer », espace, Valider.
// Ce fichier ne contient que des fonctions sans effet de bord (testées aussi sous Node) et le dessin des cases.
(function (racine) {
  'use strict';

  var MIN = 18, PIEGES = 5;
  var SEPARATEURS = ' -’';
  // Lettres pièges : d'abord les plus courantes en français (les rares, W et K, ne servent jamais de piège).
  var POOL = 'easinrtoludcmpgbvhfqyxjz';
  // « é è ê » : variantes de chaque lettre, dans l'ordre où la touche les fait défiler.
  var VARIANTES = { e: 'eéèêë', a: 'aàâä', i: 'iîï', o: 'oôö', u: 'uùûü', c: 'cç', y: 'yÿ' };

  function sansAccent(ch) { return ch.normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  // Lettres étrangères (ș, ă, š…) → sans leur signe : seuls les accents du français ont leur touche « é è ê ».
  function francais(t) {
    return t.replace(/[^\x00-\x7f]/g, function (ch) { return /[àâäéèêëîïôöùûüÿç’]/.test(ch) ? ch : sansAccent(ch); });
  }

  // Réponse modèle → texte tapable : minuscules, œ → oe, apostrophe courbe, sans ponctuation inutile.
  function tapable(t) {
    return francais(String(t).toLowerCase().replace(/œ/g, 'oe').replace(/æ/g, 'ae').replace(/['`´]/g, '\u2019'))
      .replace(/[^a-z0-9à-ÿ \-\u2019]/g, ' ').replace(/\s+/g, ' ').replace(/\s*([-\u2019])\s*/g, '$1').trim();
  }

  // Petit générateur pseudo-aléatoire : la même réponse propose toujours les mêmes lettres (même après rechargement).
  function graine(t) { var h = 2166136261; for (var i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function hasard(g) {
    return function () { g = g + 0x6D2B79F5 | 0; var t = Math.imul(g ^ g >>> 15, 1 | g); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }

  // Lettres proposées pour une réponse : ses lettres (sans accent) et ses chiffres, + des pièges,
  // au moins 18 en tout et au moins 5 pièges, triées (chiffres d'abord, puis A à Z).
  function lettres(reponse) {
    var t = sansAccent(tapable(reponse)), vues = [];
    t.split('').forEach(function (ch) { if (/[a-z0-9]/.test(ch) && vues.indexOf(ch) < 0) vues.push(ch); });
    var n = Math.max(MIN, vues.length + PIEGES), alea = hasard(graine(t));
    var pool = POOL.split('').filter(function (c) { return vues.indexOf(c) < 0; });
    while (vues.length < n && pool.length) vues.push(pool.splice(Math.floor(Math.pow(alea(), 1.6) * pool.length), 1)[0]);
    return vues.sort();
  }

  // Ce que le joueur peut écrire : minuscules, lettres et chiffres, espace, tiret, apostrophe ; au plus `max` signes.
  function nettoyer(v, max) {
    v = francais(String(v || '').toLowerCase().replace(/œ/g, 'oe').replace(/æ/g, 'ae').replace(/['`´]/g, '\u2019'))
      .replace(/[^a-z0-9à-ÿ \-\u2019]/g, '');
    return max ? v.slice(0, max) : v;
  }
  // Une touche appliquée à la réponse en cours.
  function toucher(v, t, max) {
    v = v || '';
    if (t === 'retour') return v.slice(0, -1);
    if (t === 'tout') return '';
    if (t === 'accent') {
      var d = v.slice(-1), var_ = VARIANTES[sansAccent(d)];
      if (!var_) return v;
      return v.slice(0, -1) + var_.charAt((var_.indexOf(d) + 1) % var_.length);
    }
    if (t === 'espace') t = ' ';
    if (max && v.length >= max) return v;
    return v + t;
  }

  // Cases de la réponse : une par signe de la réponse modèle (lettre, espace, tiret, apostrophe).
  // Les cases sont groupées par mot (un groupe se termine après un séparateur) pour passer à la ligne proprement.
  function dessinerCases(el, modele, valeur, actif) {
    var h = '', i = 0;
    var groupes = modele.match(/[^ \-’]*[ \-’]?/g).filter(Boolean);
    groupes.forEach(function (g) {
      h += '<span class="cases-mot">';
      g.split('').forEach(function (m) {
        var v = valeur.charAt(i), sep = SEPARATEURS.indexOf(m) >= 0;
        var cl = 'case-l' + (sep ? ' case-sep' : '') + (v ? ' pleine' : '') + (actif && i === valeur.length ? ' active' : '');
        h += '<span class="' + cl + '">' + (v === ' ' ? '<span class="espace-tape">␣</span>' : v ? esc(v) : '') + '</span>';
        i++;
      });
      h += '</span>';
    });
    el.innerHTML = h;
  }
  // Réponse sans cases (le / la / un / une : la longueur donnerait la réponse) : une simple ligne.
  function dessinerLigne(el, valeur, actif) {
    el.innerHTML = '<span class="ligne-reponse' + (valeur ? '' : ' vide') + '">' + esc(valeur).replace(/ /g, ' ') +
      (actif ? '<span class="curseur-lettres"></span>' : '') + '</span>';
  }
  function esc(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  var api = { MIN: MIN, PIEGES: PIEGES, VARIANTES: VARIANTES, tapable: tapable, lettres: lettres, nettoyer: nettoyer,
    toucher: toucher, dessinerCases: dessinerCases, dessinerLigne: dessinerLigne, sansAccent: sansAccent };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else racine.ClavierLettres = api;
})(this);

// Les types de questions posées sur une carte (demande de l'utilisateur du 02/11/2026).
// Chaque joueur coche à la préparation les types qu'il veut ; chaque carte en tire un au hasard
// parmi ceux qui ont du sens pour ce mot (ex. pas de « lettres muettes » pour un mot qui n'en a pas).
// Voyelles : a, e, i, o, u, y (6 voyelles de l'alphabet français) ; les autres lettres sont des consonnes.
// Données des mots (syllabes, lettres muettes) : js/cartes.js → INFOS.
(function (racine) {
  'use strict';

  var VOYELLES = 'AEIOUYÀÂÄÉÈÊËÎÏÔÖÙÛÜŸŒ';
  function lettres(mot) { return mot.split('').filter(function (c) { return /\p{L}/u.test(c); }); }
  function estVoyelle(c) { return VOYELLES.indexOf(c.toUpperCase()) >= 0; }
  function pluriel(n, mot) { return n + ' ' + mot + (n > 1 ? 's' : ''); }

  var TYPES = [
    // v6.28 : « Épeler à l'oral » : le joueur dit les lettres, la reconnaissance vocale les écrit (js/parole.js).
    { id: 'epeler', nom: 'Épeler à l\u2019oral', consigne: 'Épelle le mot à voix haute :', oral: true,
      reponse: function (mot) { return lettres(mot).join(' - '); } },
    { id: 'nombre', nom: 'Nombre de lettres', consigne: 'Combien de lettres y a-t-il dans le mot :',
      possible: function (mot, info) { return info.lettres != null; }, saisie: 'nombre',
      attendu: function (mot, info) { return info.lettres; },
      reponse: function (mot, info) { return pluriel(info.lettres, 'lettre'); } },
    // Syllabes : le joueur écrit le NOMBRE de syllabes (choix de l'utilisateur, 04/11/2026) ;
    // la correction montre aussi le découpage.
    { id: 'syllabes', nom: 'Nombre de syllabes', court: 'Syllabes', // bouton de la préparation : « Syllabes » tient sur téléphone carré
      consigne: 'Combien de syllabes y a-t-il dans le mot :', saisie: 'nombre',
      attendu: function (mot, info) { return morceaux(info).length; },
      reponse: function (mot, info) {
        var m = morceaux(info);
        return pluriel(m.length, 'syllabe') + ' (' + m.join(' · ') + ')';
      } },
    { id: 'consonnes', nom: 'Consonnes', consigne: 'Quelles sont les consonnes du mot :',
      possible: function (mot) { return lettres(mot).some(function (c) { return !estVoyelle(c); }); }, saisie: 'lettres',
      attendu: function (mot) { return lettres(mot).filter(function (c) { return !estVoyelle(c); }); },
      reponse: function (mot) { return lettres(mot).filter(function (c) { return !estVoyelle(c); }).join(', '); } },
    { id: 'voyelles', nom: 'Voyelles', consigne: 'Quelles sont les voyelles du mot :',
      possible: function (mot) { return lettres(mot).some(estVoyelle); }, saisie: 'lettres',
      attendu: function (mot) { return lettres(mot).filter(estVoyelle); },
      reponse: function (mot) { return lettres(mot).filter(estVoyelle).join(', '); } },
    // « Première lettre » n'est plus proposée (demande du 03/11/2026).
    { id: 'muettes', nom: 'Lettres muettes', consigne: 'Quelles sont les lettres muettes du mot :',
      possible: function (mot, info) { return !!(info.muettes && info.muettes.length); }, saisie: 'lettres',
      attendu: function (mot, info) { return info.muettes.map(function (i) { return mot[i]; }); },
      reponse: function (mot, info) {
        return info.muettes.map(function (i) { return mot[i]; }).join(', ');
      } },
    // v6.31 : « Réécrire le mot » au clavier (demande du 09/11/2026). Le mot est caché : la voix le dicte,
    // avec une phrase d'exemple (js/phrases.js) ; « Voir le mot » donnerait la réponse (sansVoirMot).
    { id: 'ecrire', nom: 'Réécrire le mot', consigne: 'Écris le mot que tu entends :', saisie: 'mot', dictee: true, sansVoirMot: true,
      attendu: function (mot) { return mot; },
      reponse: function (mot) { return mot; } },
    // ---------- v6.17 : questions acceptées par l'utilisateur le 04/11/2026 ----------
    // Certaines questions ont des réglages tirés pour chaque carte (preparer → c.params) :
    // la lettre cachée, l'ordre des lettres mélangées, la lettre à compter.
    // « montrer » : texte affiché à la place du mot caché (le joueur doit le voir pour répondre).
    // Lettre manquante : une lettre sans accent remplacée par « _ » (une seule réponse possible).
    { id: 'manquante', nom: 'Lettre manquante', consigne: 'Quelle lettre manque dans le mot :', saisie: 'lettres',
      possible: function (mot) { return positionsSimples(mot).length > 0 && lettres(mot).length >= 3; },
      preparer: function (mot) { var p = positionsSimples(mot); return { pos: p[Math.floor(Math.random() * p.length)] }; },
      montrer: function (mot, info, p) { return mot.slice(0, p.pos) + '_' + mot.slice(p.pos + 1); },
      attendu: function (mot, info, p) { return [mot[p.pos]]; },
      reponse: function (mot, info, p) { return mot[p.pos] + ' (' + mot + ')'; } },
    // Mot mélangé : les lettres en désordre ; le joueur écrit le mot (mots d'un seul morceau, 4 lettres ou plus).
    // La voix ne lit que la consigne : dire le mot donnerait la réponse.
    { id: 'melange', nom: 'Mot mélangé', consigne: 'Remets les lettres dans l\u2019ordre :', saisie: 'mot', voixSansMot: true,
      possible: function (mot) { return /^\p{L}+$/u.test(mot) && lettres(mot).length >= 4 && new Set(mot.split('')).size > 1; },
      preparer: function (mot) {
        var l = mot.split(''), m, essai = 0;
        do { m = melanger(l.slice()).join(''); } while (m === mot && ++essai < 20);
        return { melange: m.split('').join(' ') };
      },
      montrer: function (mot, info, p) { return p.melange; },
      attendu: function (mot) { return mot; },
      reponse: function (mot) { return mot; } },
    // Nombre de voyelles / de consonnes : deux questions séparées, comme « Nombre de lettres ».
    { id: 'nb-voyelles', nom: 'Nombre de voyelles', consigne: 'Combien de voyelles y a-t-il dans le mot :', saisie: 'nombre',
      possible: function (mot) { return lettres(mot).some(estVoyelle) && !/Œ/.test(mot); },
      attendu: function (mot) { return lettres(mot).filter(estVoyelle).length; },
      reponse: function (mot) { var l = lettres(mot).filter(estVoyelle); return pluriel(l.length, 'voyelle') + ' (' + l.join(', ') + ')'; } },
    { id: 'nb-consonnes', nom: 'Nombre de consonnes', consigne: 'Combien de consonnes y a-t-il dans le mot :', saisie: 'nombre',
      possible: function (mot) { return lettres(mot).some(function (c) { return !estVoyelle(c); }) && !/Œ/.test(mot); },
      attendu: function (mot) { return lettres(mot).filter(function (c) { return !estVoyelle(c); }).length; },
      reponse: function (mot) {
        var l = lettres(mot).filter(function (c) { return !estVoyelle(c); });
        return pluriel(l.length, 'consonne') + ' (' + l.join(', ') + ')';
      } },
    // Combien de fois une lettre : de préférence une lettre présente plusieurs fois (3 fois sur 4).
    { id: 'combien-lettre', nom: 'Combien de fois cette lettre\u00a0?', court: 'Combien de fois\u00a0?', saisie: 'nombre', // espace insécable : le « ? » ne passe pas seul à la ligne
      possible: function (mot) { return lettres(mot).length >= 3 && !/Œ/.test(mot); },
      preparer: function (mot) {
        var n = {};
        lettres(mot).forEach(function (c) { var k = normaliser(c); n[k] = (n[k] || 0) + 1; });
        var cles = Object.keys(n), doubles = cles.filter(function (k) { return n[k] > 1; });
        var liste = doubles.length && Math.random() < 0.75 ? doubles : cles;
        return { lettre: liste[Math.floor(Math.random() * liste.length)] };
      },
      consigneDe: function (mot, info, p) { return 'Combien de fois vois-tu la lettre ' + p.lettre + ' dans le mot :'; },
      attendu: function (mot, info, p) { return lettres(mot).filter(function (c) { return normaliser(c) === p.lettre; }).length; },
      reponse: function (mot, info, p) {
        var n = lettres(mot).filter(function (c) { return normaliser(c) === p.lettre; }).length;
        return n + ' fois';
      } },
    // ---------- v6.18 : genre et pluriel des noms (données : js/cartes.js → INFOS) ----------
    // Le ou la ? Devant une voyelle ou un h muet on dit « l' » : la question devient « Un ou une ? ».
    { id: 'genre', nom: 'Le ou la\u00a0?', saisie: 'article',
      possible: function (mot, info) { return !!(info && info.genre); },
      consigneDe: function (mot, info) { return info && info.elision ? 'Un ou une ? Écris le mot qui va devant :' : 'Le ou la ? Écris le mot qui va devant :'; },
      montrer: function (mot) { return mot; },
      attendu: function (mot, info) { return info.elision ? (info.genre === 'f' ? 'une' : 'un') : (info.genre === 'f' ? 'la' : 'le'); },
      reponse: function (mot, info) { return this.attendu(mot, info).toUpperCase() + ' ' + mot; } },
    // Au pluriel : « UN CHEVAL → DES … » ; le joueur écrit le mot au pluriel (« des » peut être écrit ou non).
    { id: 'pluriel', nom: 'Au pluriel', consigne: 'Écris ce mot au pluriel :', saisie: 'mot',
      possible: function (mot, info) { return !!(info && info.pluriel); },
      montrer: function (mot, info) { return (info.genre === 'f' ? 'UNE ' : 'UN ') + mot + ' → DES …'; },
      attendu: function (mot, info) { return info.pluriel; },
      reponse: function (mot, info) { return 'DES ' + info.pluriel; } }
  ];

  // Positions des lettres sans accent (A à Z) : seules celles-là peuvent être cachées.
  function positionsSimples(mot) {
    var p = [];
    for (var i = 0; i < mot.length; i++) if (/[A-Z]/.test(mot[i])) p.push(i);
    return p;
  }
  function melanger(t) {
    for (var i = t.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), x = t[i]; t[i] = t[j]; t[j] = x; }
    return t;
  }
  // Consigne de la carte (certaines dépendent de ses réglages, ex. la lettre à compter).
  function consigne(type, mot, info, p) { return type.consigneDe ? type.consigneDe(mot, info, p || {}) : type.consigne; }

  function morceaux(info) { return info.syllabes.split(/[\s-]+/).filter(function (m) { return /\p{L}/u.test(m); }); }

  // ---------- Correction des réponses écrites (v6.14, demande du 04/11/2026) ----------
  // Lettres comparées sans accents ni majuscules : « é » = « E » ; « œ » = « OE ».
  function normaliser(c) {
    return c.toUpperCase().replace(/Œ/g, 'OE').replace(/Æ/g, 'AE').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
  // Lettres écrites par le joueur : séparées par des espaces, des virgules ou par rien (« a e i », « a,e,i », « aei »).
  // Le petit mot « et » entre deux lettres est ignoré (« a, i et o »).
  function lettresEcrites(texte) {
    var t = texte.trim();
    if (/[\s,;\-]/.test(t)) t = t.replace(/(^|[\s,;])et(?=$|[\s,;])/gi, ' ');
    return normaliser(t).replace(/[^A-Z]/g, '').split('');
  }
  var NOMBRES = ['zero', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix',
    'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf', 'vingt'];
  // Nombre écrit : en chiffres (« 5 », « 5 lettres ») ou en lettres jusqu'à vingt (« cinq »). NaN sinon.
  function nombreEcrit(texte) {
    var ch = texte.match(/\d+/);
    if (ch) return Number(ch[0]);
    var t = normaliser(texte).toLowerCase().replace(/^\s+|\s+$/g, '').split(/\s+(?:lettres?|syllabes?)$/)[0];
    var k = NOMBRES.indexOf(t.replace(/\s+/g, '-'));
    return k >= 0 ? k : NaN;
  }
  // Vrai si l'écrit du joueur est lisible pour ce type de question (sinon on lui demande de corriger).
  function lisible(type, texte) {
    if (type.saisie === 'article') return /^(le|la|un|une)$/i.test(texte.trim().split(/[\s'’]+/)[0]);
    return type.saisie === 'nombre' ? !isNaN(nombreEcrit(texte)) : lettresEcrites(texte).length > 0;
  }
  // Mot écrit : comparé sans accents ni majuscules, espaces et tirets ignorés (« avion » = AVION).
  function motEcrit(t) { return normaliser(t).replace(/[^A-Z]/g, ''); }
  // Juste : le bon nombre ; ou exactement les bonnes lettres, dans n'importe quel ordre,
  // une lettre répétée pouvant être écrite une fois ou plusieurs fois (« voyelles de PAPA » : « a » ou « a a »).
  function juste(type, texte, mot, info, p) {
    var att = type.attendu(mot, info, p || {});
    if (type.saisie === 'nombre') return nombreEcrit(texte) === att;
    if (type.saisie === 'mot') return motEcrit(texte.replace(/^\s*(des|les)\s+/i, '')) === motEcrit(att);
    // Le ou la : le premier mot écrit (« la », « la maison », « La ») ; la majuscule ne compte pas.
    // « une » pour « la maison » est accepté (même genre) ; devant une voyelle, seuls « un » et « une » vont.
    if (type.saisie === 'article') {
      var ecrit = texte.trim().split(/[\s'’]+/)[0].toLowerCase();
      var genre = { le: 'm', un: 'm', la: 'f', une: 'f' }[ecrit];
      if (info.elision && (ecrit === 'le' || ecrit === 'la')) return false;
      return genre === info.genre;
    }
    var ensemble = function (l) { var o = {}; l.forEach(function (c) { normaliser(c).split('').forEach(function (x) { o[x] = 1; }); }); return Object.keys(o).sort().join(''); };
    return ensemble(lettresEcrites(texte)) === ensemble(att);
  }

  function trouver(id) { for (var i = 0; i < TYPES.length; i++) if (TYPES[i].id === id) return TYPES[i]; return null; }

  // Types possibles pour ce mot parmi ceux choisis par le joueur.
  function possibles(mot, info, choisis) {
    return TYPES.filter(function (t) { return choisis.indexOf(t.id) >= 0 && (!t.possible || t.possible(mot, info)); });
  }

  // Familles de questions à l'écran de préparation (v6.33, choix de l'utilisateur du 09/11/2026, test A/B) :
  // regroupées selon la réponse attendue, 3 par ligne (Voyelles à côté de Consonnes,
  // Nombre de voyelles à côté de Nombre de consonnes).
  var FAMILLES = [
    { id: 'ecrire-mot', nom: 'Écrire un mot', icone: '\u270f\ufe0f', types: ['epeler', 'ecrire', 'melange', 'manquante', 'genre', 'pluriel'] },
    { id: 'trouver', nom: 'Trouver des lettres', icone: '\ud83d\udd0d', types: ['voyelles', 'consonnes', 'muettes'] },
    { id: 'compter', nom: 'Compter', icone: '\ud83d\udd22', types: ['nb-voyelles', 'nb-consonnes', 'nombre', 'syllabes', 'combien-lettre'] }
  ];

  var api = { TYPES: TYPES, FAMILLES: FAMILLES, trouver: trouver, juste: juste, consigne: consigne, lisible: lisible, lettresEcrites: lettresEcrites, nombreEcrit: nombreEcrit, possibles: possibles, lettres: lettres, estVoyelle: estVoyelle };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else racine.Questions = api;
})(this);

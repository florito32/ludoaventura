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
    { id: 'epeler', nom: 'Épeler', consigne: 'Épelle le mot :',
      reponse: function (mot) { return lettres(mot).join(' - '); } },
    { id: 'nombre', nom: 'Nombre de lettres', consigne: 'Combien de lettres y a-t-il dans le mot :',
      possible: function (mot, info) { return info.lettres != null; }, saisie: 'nombre',
      attendu: function (mot, info) { return info.lettres; },
      reponse: function (mot, info) { return pluriel(info.lettres, 'lettre'); } },
    // Syllabes : le joueur écrit le NOMBRE de syllabes (choix de l'utilisateur, 04/11/2026) ;
    // la correction montre aussi le découpage.
    { id: 'syllabes', nom: 'Nombre de syllabes', consigne: 'Combien de syllabes y a-t-il dans le mot :', saisie: 'nombre',
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
    { id: 'ecrire', nom: 'Réécrire le mot', consigne: 'Écris le mot :',
      reponse: function (mot) { return mot; } }
  ];

  function morceaux(info) { return info.syllabes.split(/[\s-]+/).filter(function (m) { return /\p{L}/u.test(m); }); }

  // ---------- Correction des réponses écrites (v7.0, demande du 04/11/2026) ----------
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
    return type.saisie === 'nombre' ? !isNaN(nombreEcrit(texte)) : lettresEcrites(texte).length > 0;
  }
  // Juste : le bon nombre ; ou exactement les bonnes lettres, dans n'importe quel ordre,
  // une lettre répétée pouvant être écrite une fois ou plusieurs fois (« voyelles de PAPA » : « a » ou « a a »).
  function juste(type, texte, mot, info) {
    var att = type.attendu(mot, info);
    if (type.saisie === 'nombre') return nombreEcrit(texte) === att;
    var ensemble = function (l) { var o = {}; l.forEach(function (c) { normaliser(c).split('').forEach(function (x) { o[x] = 1; }); }); return Object.keys(o).sort().join(''); };
    return ensemble(lettresEcrites(texte)) === ensemble(att);
  }

  function trouver(id) { for (var i = 0; i < TYPES.length; i++) if (TYPES[i].id === id) return TYPES[i]; return null; }

  // Types possibles pour ce mot parmi ceux choisis par le joueur.
  function possibles(mot, info, choisis) {
    return TYPES.filter(function (t) { return choisis.indexOf(t.id) >= 0 && (!t.possible || t.possible(mot, info)); });
  }

  var api = { TYPES: TYPES, trouver: trouver, juste: juste, lisible: lisible, lettresEcrites: lettresEcrites, nombreEcrit: nombreEcrit, possibles: possibles, lettres: lettres, estVoyelle: estVoyelle };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else racine.Questions = api;
})(this);

// Les 8 types de questions posées sur une carte (demande de l'utilisateur du 02/11/2026).
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
      possible: function (mot, info) { return info.lettres != null; },
      reponse: function (mot, info) { return pluriel(info.lettres, 'lettre'); } },
    { id: 'syllabes', nom: 'Syllabes', consigne: 'Découpe en syllabes le mot :',
      reponse: function (mot, info) {
        var morceaux = info.syllabes.split(/[\s-]+/).filter(Boolean);
        return morceaux.join(' · ') + ' (' + pluriel(morceaux.length, 'syllabe') + ')';
      } },
    { id: 'consonnes', nom: 'Consonnes', consigne: 'Quelles sont les consonnes du mot :',
      possible: function (mot) { return lettres(mot).some(function (c) { return !estVoyelle(c); }); },
      reponse: function (mot) { return lettres(mot).filter(function (c) { return !estVoyelle(c); }).join(', '); } },
    { id: 'voyelles', nom: 'Voyelles', consigne: 'Quelles sont les voyelles du mot :',
      possible: function (mot) { return lettres(mot).some(estVoyelle); },
      reponse: function (mot) { return lettres(mot).filter(estVoyelle).join(', '); } },
    // « Première lettre » n'est plus proposée (demande du 03/11/2026).
    { id: 'muettes', nom: 'Lettres muettes', consigne: 'Quelles sont les lettres muettes du mot :',
      possible: function (mot, info) { return !!(info.muettes && info.muettes.length); },
      reponse: function (mot, info) {
        return info.muettes.map(function (i) { return mot[i]; }).join(', ');
      } },
    { id: 'ecrire', nom: 'Réécrire le mot', consigne: 'Écris le mot :',
      reponse: function (mot) { return mot; } }
  ];

  function trouver(id) { for (var i = 0; i < TYPES.length; i++) if (TYPES[i].id === id) return TYPES[i]; return null; }

  // Types possibles pour ce mot parmi ceux choisis par le joueur.
  function possibles(mot, info, choisis) {
    return TYPES.filter(function (t) { return choisis.indexOf(t.id) >= 0 && (!t.possible || t.possible(mot, info)); });
  }

  var api = { TYPES: TYPES, trouver: trouver, possibles: possibles, lettres: lettres, estVoyelle: estVoyelle };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else racine.Questions = api;
})(this);

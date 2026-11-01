// Générateur de questions de calcul pour Ludoaventura.
// Aucune dépendance à la page : utilisable dans le navigateur (window.Questions)
// et dans les tests Node (module.exports).
//
// Chaque niveau (âge) a 5 lieux ; la difficulté monte d'un lieu à l'autre.
// generer(niveau, lieu, rng) renvoie { texte, reponse, choix: [4 nombres] }.
(function (racine) {
  'use strict';

  // Entier aléatoire entre min et max inclus.
  function ent(rng, min, max) { return min + Math.floor(rng() * (max - min + 1)); }
  function pick(rng, liste) { return liste[Math.floor(rng() * liste.length)]; }

  // ----- Types de questions -----
  function addition(rng, maxSomme, minA) {
    var a = ent(rng, minA || 0, maxSomme - 1);
    var b = ent(rng, 1, maxSomme - a);
    return { texte: a + ' + ' + b, reponse: a + b };
  }
  function soustraction(rng, max) {
    var a = ent(rng, 2, max);
    var b = ent(rng, 1, a - 1);
    return { texte: a + ' − ' + b, reponse: a - b };
  }
  function multiplication(rng, tables, maxFacteur) {
    var t = pick(rng, tables);
    var n = ent(rng, 2, maxFacteur || 10);
    return rng() < 0.5 ? { texte: t + ' × ' + n, reponse: t * n } : { texte: n + ' × ' + t, reponse: t * n };
  }
  function division(rng, tables) {
    var t = pick(rng, tables);
    var q = ent(rng, 2, 10);
    return { texte: (t * q) + ' ÷ ' + t, reponse: q };
  }
  function parDixCent(rng) {
    var a = ent(rng, 2, 99);
    var m = pick(rng, [10, 100]);
    return { texte: a + ' × ' + m, reponse: a * m };
  }
  function deuxChiffresParUn(rng) {
    var a = ent(rng, 12, 49);
    var b = ent(rng, 3, 9);
    return { texte: a + ' × ' + b, reponse: a * b };
  }
  function pourcentage(rng) {
    var p = pick(rng, [10, 20, 25, 50, 75]);
    var base = { 10: 10, 20: 5, 25: 4, 50: 2, 75: 4 }[p]; // base garantit un résultat entier
    var n = base * ent(rng, 2, 30);
    return { texte: p + ' % de ' + n, reponse: n * p / 100 };
  }
  function priorites(rng) {
    var a = ent(rng, 2, 20), b = ent(rng, 2, 9), c = ent(rng, 2, 9);
    return rng() < 0.5
      ? { texte: a + ' + ' + b + ' × ' + c, reponse: a + b * c }
      : { texte: b + ' × ' + c + ' − ' + Math.min(a, b * c - 1), reponse: b * c - Math.min(a, b * c - 1) };
  }
  function deuxParDeux(rng) {
    var a = ent(rng, 11, 25), b = ent(rng, 11, 19);
    return { texte: a + ' × ' + b, reponse: a * b };
  }

  // ----- Niveaux : nom, âge conseillé, et un type de question par lieu -----
  var NIVEAUX = {
    moussaillon: {
      nom: 'Moussaillon', age: 'dès 5 ans', resume: 'additions et soustractions jusqu’à 10',
      lieux: [
        function (r) { return addition(r, 6); },
        function (r) { return addition(r, 10); },
        function (r) { return soustraction(r, 6); },
        function (r) { return soustraction(r, 10); },
        function (r) { return r() < 0.5 ? addition(r, 10) : soustraction(r, 10); }
      ]
    },
    matelot: {
      nom: 'Matelot', age: 'dès 7 ans', resume: 'additions et soustractions jusqu’à 100',
      lieux: [
        function (r) { return addition(r, 20); },
        function (r) { return soustraction(r, 20); },
        function (r) { return addition(r, 100, 10); },
        function (r) { return soustraction(r, 100); },
        function (r) { return multiplication(r, [2, 5, 10]); }
      ]
    },
    navigateur: {
      nom: 'Navigateur', age: 'dès 9 ans', resume: 'tables de multiplication et divisions',
      lieux: [
        function (r) { return multiplication(r, [2, 3, 4, 5]); },
        function (r) { return multiplication(r, [6, 7, 8, 9]); },
        function (r) { return division(r, [2, 3, 4, 5, 6, 7, 8, 9]); },
        function (r) { return parDixCent(r); },
        function (r) { return deuxChiffresParUn(r); }
      ]
    },
    capitaine: {
      nom: 'Capitaine', age: 'ados et adultes', resume: 'calcul mental relevé',
      lieux: [
        function (r) { return deuxChiffresParUn(r); },
        function (r) { return pourcentage(r); },
        function (r) { return priorites(r); },
        function (r) { return deuxParDeux(r); },
        function (r) { return pick(r, [pourcentage, priorites, deuxParDeux])(r); }
      ]
    }
  };

  // Trois mauvaises réponses proches et plausibles, toutes différentes, jamais négatives.
  function leurres(rng, reponse) {
    var ecarts = [1, -1, 2, -2, 10, -10, 3, -3, 5, -5];
    if (reponse >= 50) ecarts.push(reponse > 100 ? 20 : 15, -15, 100, -100);
    var choix = [];
    var essais = 0;
    while (choix.length < 3 && essais < 200) {
      essais++;
      var v = reponse + pick(rng, ecarts);
      if (v >= 0 && v !== reponse && choix.indexOf(v) === -1) choix.push(v);
    }
    // Filet de sécurité (ne devrait jamais servir).
    for (var k = 1; choix.length < 3; k++) if (choix.indexOf(reponse + k) === -1) choix.push(reponse + k);
    return choix;
  }

  function melanger(rng, t) {
    for (var i = t.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var x = t[i]; t[i] = t[j]; t[j] = x;
    }
    return t;
  }

  function generer(niveau, lieu, rng) {
    rng = rng || Math.random;
    var q = NIVEAUX[niveau].lieux[lieu](rng);
    q.choix = melanger(rng, leurres(rng, q.reponse).concat(q.reponse));
    return q;
  }

  // Série de n questions sans doublon (dans la mesure du possible).
  function serie(niveau, lieu, n, rng) {
    rng = rng || Math.random;
    var vues = {}, liste = [], essais = 0;
    while (liste.length < n && essais < 100) {
      essais++;
      var q = generer(niveau, lieu, rng);
      if (vues[q.texte] && essais < 50) continue;
      vues[q.texte] = true;
      liste.push(q);
    }
    return liste;
  }

  var api = { NIVEAUX: NIVEAUX, generer: generer, serie: serie };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else racine.Questions = api;
})(this);

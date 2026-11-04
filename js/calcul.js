// Cartes de calcul (Mathématiques), demande de l'utilisateur du 03/11/2026.
// Le joueur choisit à la préparation (v6.14, demande du 04/11/2026) :
//  - le niveau, qui fixe les nombres possibles et le nombre de signes maximum :
//    Facile = tables de 1 à 10, 1 signe ; Moyen = 1 à 99, jusqu'à 2 signes ;
//    Difficile = 1 à 999, jusqu'à 3 signes ; Expert = aussi « 1000+ » (1000 à 9999), jusqu'à 4 signes ;
//  - le nombre de signes par calcul (plusieurs choix possibles, ex. 2 et 3 : au hasard pour chaque carte) ;
//  - les signes (additionner, soustraire, multiplier, diviser), au moins un ;
//  - les nombres : unités 1 à 10, dizaines (30 = 30 à 39), centaines (300 = 300 à 399), milliers (1000+).
// Chaque calcul prend un nombre de chaque groupe choisi (unités, dizaines…) : avec 7, 8 et 50, on a 7 × 54
//  ou 8 × 56, jamais 7 × 8. S'il y a moins de nombres que de groupes, les nombres viennent de groupes différents.
// Au niveau Facile, les nombres choisis sont des TABLES (demande du 03/11/2026) : table de 2 →
//  2 × 1 … 2 × 10, 2 + 1 … 2 + 10, (2 + k) − 2, (2 × k) ÷ 2, selon les signes choisis (résultat entier).
// Ordre de calcul : priorités habituelles, × et ÷ avant + et − (choix de l'utilisateur).
// Le résultat est un nombre entier, ou un nombre à une décimale s'il y a une division ;
// il n'est jamais négatif, et chaque étape du calcul garde au plus une décimale.
// Calculs exacts en fractions (pas d'erreurs d'arrondi des nombres à virgule).
// Module sans interface : utilisable dans la page (window.Calcul) et dans les tests Node.
(function (racine) {
  'use strict';

  var SIGNES = [
    { id: 'plus', nom: 'Additionner', symbole: '+', oral: 'plus' },
    { id: 'moins', nom: 'Soustraire', symbole: '−', oral: 'moins' },
    { id: 'fois', nom: 'Multiplier', symbole: '×', oral: 'multiplié par' },
    { id: 'divise', nom: 'Diviser', symbole: '÷', oral: 'divisé par' }
  ];
  var NOMBRES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  // Groupes de nombres (v6.12 puis v6.14) : choisir 30 = les nombres de 30 à 39 ; 300 = 300 à 399 ;
  // « 1000+ » = 1000 à 9999 (hypothèse : 4 chiffres au plus). « des » = premier niveau qui propose le groupe.
  var DIZAINES = [10, 20, 30, 40, 50, 60, 70, 80, 90];
  var CENTAINES = [100, 200, 300, 400, 500, 600, 700, 800, 900];
  var MILLIERS = [1000];
  var GROUPES = [
    { id: 'nombres', nom: 'Unités', valeurs: NOMBRES, des: 0, tranche: function (n) { return [n, n]; } },
    { id: 'dizaines', nom: 'Dizaines', valeurs: DIZAINES, des: 1, tranche: function (n) { return [n, n + 9]; } },
    { id: 'centaines', nom: 'Centaines', valeurs: CENTAINES, des: 2, tranche: function (n) { return [n, n + 99]; } },
    { id: 'milliers', nom: 'Milliers', valeurs: MILLIERS, des: 3, tranche: function () { return [1000, 9999]; } }
  ];
  var NIVEAUX = [
    { id: 'facile', nom: 'Facile', signes: 1 },
    { id: 'moyen', nom: 'Moyen', signes: 2 },
    { id: 'difficile', nom: 'Difficile', signes: 3 },
    { id: 'expert', nom: 'Expert', signes: 4 }
  ];

  function signe(id) { for (var i = 0; i < SIGNES.length; i++) if (SIGNES[i].id === id) return SIGNES[i]; return null; }
  function niveau(id) { for (var i = 0; i < NIVEAUX.length; i++) if (NIVEAUX[i].id === id) return NIVEAUX[i]; return NIVEAUX[0]; }
  function rang(id) { return NIVEAUX.indexOf(niveau(id)); }
  // Groupes de nombres proposés à ce niveau (Facile : unités ; Moyen : + dizaines ; Difficile : + centaines ; Expert : + 1000+).
  function groupes(niveauId) { var r = rang(niveauId); return GROUPES.filter(function (g) { return g.des <= r; }); }
  // Nombres de signes proposés : de 1 au maximum du niveau.
  function choixSignes(niveauId) { var t = []; for (var i = 1; i <= niveau(niveauId).signes; i++) t.push(i); return t; }

  // ---------- Fractions ----------
  function pgcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a || 1; }
  function frac(n, d) { if (d < 0) { n = -n; d = -d; } var g = pgcd(n, d); return { n: n / g, d: d / g }; }
  function operer(a, op, b) {
    if (op === 'plus') return frac(a.n * b.d + b.n * a.d, a.d * b.d);
    if (op === 'moins') return frac(a.n * b.d - b.n * a.d, a.d * b.d);
    if (op === 'fois') return frac(a.n * b.n, a.d * b.d);
    return frac(a.n * b.d, a.d * b.n); // divise
  }
  // Au plus une décimale : le dénominateur (fraction réduite) divise 10.
  // Au-delà d'un million de millions, on refuse aussi (calcul exact impossible en JavaScript, et hors de portée).
  function uneDecimale(f) { return 10 % f.d === 0 && Math.abs(f.n) < 1e12; }

  // Évalue la formule avec les priorités habituelles. Renvoie null si une étape a plus d'une décimale
  // ou si un résultat intermédiaire est négatif (calcul trop difficile ou hors programme pour un enfant).
  function evaluer(nombres, ops) {
    // 1) Les produits et quotients, de gauche à droite.
    var termes = [frac(nombres[0], 1)], liens = [];
    for (var i = 0; i < ops.length; i++) {
      var b = frac(nombres[i + 1], 1);
      if (ops[i] === 'fois' || ops[i] === 'divise') {
        var v = operer(termes[termes.length - 1], ops[i], b);
        if (!uneDecimale(v)) return null;
        termes[termes.length - 1] = v;
      } else { liens.push(ops[i]); termes.push(b); }
    }
    // 2) Les sommes et différences, de gauche à droite.
    var total = termes[0];
    for (var k = 0; k < liens.length; k++) {
      total = operer(total, liens[k], termes[k + 1]);
      if (total.n < 0 || !uneDecimale(total)) return null;
    }
    return total;
  }

  function versNombre(f) { return f.n / f.d; }
  // Écriture française : virgule décimale (3,5).
  function ecrire(x) { return String(Math.round(x * 10) / 10).replace('.', ','); }

  // Groupes choisis par le joueur et proposés à son niveau, avec leurs boutons cochés.
  function groupesChoisis(reglages) {
    return groupes(reglages.niveau).map(function (g) {
      return { id: g.id, tranches: (reglages[g.id] || []).filter(function (v) { return g.valeurs.indexOf(v) >= 0; }).map(g.tranche) };
    }).filter(function (g) { return g.tranches.length; });
  }
  // Nombre de boutons de nombres choisis (dans les groupes proposés au niveau).
  function compter(reglages) {
    return groupesChoisis(reglages).reduce(function (t, g) { return t + g.tranches.length; }, 0);
  }
  // Nombres de signes choisis et permis au niveau (par défaut : le maximum du niveau).
  function nbSignes(reglages) {
    var max = niveau(reglages.niveau).signes;
    var t = (reglages.nbSignes || []).filter(function (n) { return n >= 1 && n <= max; });
    return t.length ? t : [max];
  }

  // Tire une formule au hasard. reglages = { niveau, nbSignes: [...], signes: [...], nombres, dizaines, centaines, milliers }.
  // Chaque nombre : un groupe (unités, dizaines…), puis un de ses boutons (même chance pour chacun), puis un nombre
  // au hasard dans sa tranche. Chaque groupe choisi apparaît au moins une fois dans le calcul (v6.14).
  function generer(reglages, hasard) {
    hasard = hasard || Math.random;
    var signes = reglages.signes && reglages.signes.length ? reglages.signes : ['plus'];
    var gr = groupesChoisis(reglages);
    if (!gr.length) gr = [{ id: 'nombres', tranches: NOMBRES.map(function (n) { return [n, n]; }) }];
    function tirer(t) { return t[Math.floor(hasard() * t.length)]; }
    function dans(g) { var x = tirer(g.tranches); return x[0] + Math.floor(hasard() * (x[1] - x[0] + 1)); }
    function melanger(t) { for (var i = t.length - 1; i > 0; i--) { var j = Math.floor(hasard() * (i + 1)), x = t[i]; t[i] = t[j]; t[j] = x; } return t; }
    if (niveau(reglages.niveau).id === 'facile') return table(dans(gr[0]), tirer(signes), tirer(NOMBRES));
    // Les groupes des n + 1 nombres : un de chaque groupe choisi, complétés au hasard ;
    // s'il y a moins de nombres que de groupes, des groupes tous différents.
    function places(n, regle) {
      if (!regle) { var l = []; for (var i = 0; i <= n; i++) l.push(tirer(gr)); return l; }
      var t = melanger(gr.slice());
      if (n + 1 <= t.length) return t.slice(0, n + 1);
      while (t.length < n + 1) t.push(tirer(gr));
      return melanger(t);
    }
    function essayer(choix, regle) {
      for (var essai = 0; essai < 4000; essai++) {
        var n = tirer(choix), nb = places(n, regle).map(dans), ops = [];
        for (var k = 0; k < n; k++) ops.push(tirer(signes));
        var res = evaluer(nb, ops);
        if (res) return carte(nb, ops, versNombre(res));
      }
      return null;
    }
    // Si rien n'est possible (ex. seulement « ÷ » avec de grands nombres), on essaie avec moins de signes,
    // puis sans la règle « un nombre de chaque groupe ».
    var choix = nbSignes(reglages);
    var c = essayer(choix, true);
    for (var m = Math.min.apply(null, choix) - 1; !c && m >= 1; m--) c = essayer([m], true);
    if (!c) c = essayer([1], false);
    if (c) return c;
    var a = gr[0].tranches[0][0];
    return carte([a, a], ['plus'], a + a);
  }

  // Une question de la table de n (k de 1 à 10), selon le signe.
  function table(n, op, k) {
    if (op === 'plus') return carte([n, k], ['plus'], n + k, n);
    if (op === 'moins') return carte([n + k, n], ['moins'], k, n);
    if (op === 'fois') return carte([n, k], ['fois'], n * k, n);
    return carte([n * k, n], ['divise'], k, n);
  }

  function carte(nb, ops, resultat, tableDe) {
    var texte = String(nb[0]), oral = String(nb[0]);
    for (var i = 0; i < ops.length; i++) {
      texte += ' ' + signe(ops[i]).symbole + ' ' + nb[i + 1];
      oral += ' ' + signe(ops[i]).oral + ' ' + nb[i + 1];
    }
    return { nombres: nb, operations: ops, table: tableDe || null, formule: texte, oral: 'Combien font ' + oral + ' ?', resultat: resultat, resultatTexte: ecrire(resultat) };
  }

  // Lit la réponse tapée : « 3,5 », « 3.5 », « 12 », espaces tolérés. NaN si ce n'est pas un nombre.
  function lire(texte) {
    var t = String(texte || '').replace(/\s+/g, '').replace(',', '.');
    if (!/^-?\d+(\.\d+)?$/.test(t)) return NaN;
    return Number(t);
  }

  function juste(texte, resultat) {
    var x = lire(texte);
    return !isNaN(x) && Math.abs(x - resultat) < 1e-9;
  }

  var api = { SIGNES: SIGNES, NOMBRES: NOMBRES, DIZAINES: DIZAINES, CENTAINES: CENTAINES, MILLIERS: MILLIERS, GROUPES: GROUPES, NIVEAUX: NIVEAUX,
    groupes: groupes, choixSignes: choixSignes, groupesChoisis: groupesChoisis, compter: compter, nbSignes: nbSignes, signe: signe, niveau: niveau,
    evaluer: function (nb, ops) { var r = evaluer(nb, ops); return r ? versNombre(r) : null; },
    generer: generer, table: table, lire: lire, juste: juste, ecrire: ecrire };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else racine.Calcul = api;
})(this);

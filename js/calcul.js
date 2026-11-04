// Cartes de calcul (Mathématiques), demande de l'utilisateur du 03/11/2026.
// Le joueur choisit à la préparation :
//  - les signes (additionner, soustraire, multiplier, diviser), au moins un ;
//  - les nombres de 1 à 10, les dizaines (30 = 30 à 39) et les centaines (300 = 300 à 399) ;
//    au moins un au niveau Facile, au moins 4 aux autres niveaux (v7.0) ;
//  - le niveau : Facile = 1 signe, Moyen = 2, Difficile = 3, Expert = 4 (choix de l'utilisateur).
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
  // Dizaines et centaines (v7.0, demande du 04/11/2026) : choisir 30 = les nombres de 30 à 39 ;
  // choisir 300 = les nombres de 300 à 399.
  var DIZAINES = [10, 20, 30, 40, 50, 60, 70, 80, 90];
  var CENTAINES = [100, 200, 300, 400, 500, 600, 700, 800, 900];
  // Aux niveaux Moyen, Difficile et Expert, il faut au moins 4 choix de nombres (unités, dizaines
  // et centaines comptées ensemble, choix de l'utilisateur du 04/11/2026).
  var MINIMUM_NOMBRES = 4;
  var NIVEAUX = [
    { id: 'facile', nom: 'Facile', signes: 1 },
    { id: 'moyen', nom: 'Moyen', signes: 2 },
    { id: 'difficile', nom: 'Difficile', signes: 3 },
    { id: 'expert', nom: 'Expert', signes: 4 }
  ];

  function signe(id) { for (var i = 0; i < SIGNES.length; i++) if (SIGNES[i].id === id) return SIGNES[i]; return null; }
  function niveau(id) { for (var i = 0; i < NIVEAUX.length; i++) if (NIVEAUX[i].id === id) return NIVEAUX[i]; return NIVEAUX[0]; }

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
  function uneDecimale(f) { return 10 % f.d === 0; }

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

  // Les « tranches » choisies : une unité seule (5 → 5), une dizaine (30 → 30 à 39), une centaine (300 → 300 à 399).
  function tranches(reglages) {
    var t = [];
    (reglages.nombres || []).forEach(function (n) { t.push([n, n]); });
    (reglages.dizaines || []).forEach(function (d) { t.push([d, d + 9]); });
    (reglages.centaines || []).forEach(function (c) { t.push([c, c + 99]); });
    return t.length ? t : NOMBRES.map(function (n) { return [n, n]; });
  }
  // Nombre de choix de nombres (unités + dizaines + centaines).
  function compter(reglages) {
    return (reglages.nombres || []).length + (reglages.dizaines || []).length + (reglages.centaines || []).length;
  }
  // Ce niveau demande-t-il au moins 4 choix de nombres ?
  function minimum(niveauId) { return niveau(niveauId).id === 'facile' ? 1 : MINIMUM_NOMBRES; }

  // Tire une formule au hasard. reglages = { signes: [...], nombres: [...], dizaines: [...], centaines: [...], niveau: 'facile' }.
  // Chaque nombre : on tire d'abord un des choix (chaque bouton a la même chance), puis un nombre de sa tranche
  // (sinon les centaines, 100 nombres chacune, prendraient presque toute la place).
  // Si aucune formule possible n'est trouvée avec autant de signes (ex. seulement « ÷ » et le nombre 3
  // au niveau Expert), on retire un signe.
  function generer(reglages, hasard) {
    hasard = hasard || Math.random;
    var signes = reglages.signes && reglages.signes.length ? reglages.signes : ['plus'];
    var tr = tranches(reglages);
    function tirer(t) { return t[Math.floor(hasard() * t.length)]; }
    function nombre() { var x = tirer(tr); return x[0] + Math.floor(hasard() * (x[1] - x[0] + 1)); }
    if (niveau(reglages.niveau).id === 'facile') return table(nombre(), tirer(signes), tirer(NOMBRES));
    for (var n = niveau(reglages.niveau).signes; n >= 1; n--) {
      for (var essai = 0; essai < 3000; essai++) {
        var nb = [], ops = [];
        for (var i = 0; i <= n; i++) nb.push(nombre());
        for (var k = 0; k < n; k++) ops.push(tirer(signes));
        var res = evaluer(nb, ops);
        if (res) return carte(nb, ops, versNombre(res));
      }
    }
    // Filet de sécurité (ne devrait pas servir) : a + a.
    var a = tr[0][0];
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

  var api = { SIGNES: SIGNES, NOMBRES: NOMBRES, DIZAINES: DIZAINES, CENTAINES: CENTAINES, NIVEAUX: NIVEAUX,
    MINIMUM_NOMBRES: MINIMUM_NOMBRES, tranches: tranches, compter: compter, minimum: minimum, signe: signe, niveau: niveau,
    evaluer: function (nb, ops) { var r = evaluer(nb, ops); return r ? versNombre(r) : null; },
    generer: generer, table: table, lire: lire, juste: juste, ecrire: ecrire };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else racine.Calcul = api;
})(this);

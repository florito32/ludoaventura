// Cartes de calcul (Mathématiques), demande de l'utilisateur du 03/11/2026.
// Le joueur choisit à la préparation :
//  - les signes (additionner, soustraire, multiplier, diviser), au moins un ;
//  - les nombres de 1 à 10 utilisés dans les calculs, au moins un ;
//  - le niveau : Facile = 1 signe, Moyen = 2, Difficile = 3, Expert = 4 (choix de l'utilisateur).
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

  // Tire une formule au hasard. reglages = { signes: [...], nombres: [...], niveau: 'facile' }.
  // Si aucune formule possible n'est trouvée avec autant de signes (ex. seulement « ÷ » et le nombre 3
  // au niveau Expert), on retire un signe.
  function generer(reglages, hasard) {
    hasard = hasard || Math.random;
    var signes = reglages.signes && reglages.signes.length ? reglages.signes : ['plus'];
    var nombres = reglages.nombres && reglages.nombres.length ? reglages.nombres : NOMBRES;
    function tirer(t) { return t[Math.floor(hasard() * t.length)]; }
    for (var n = niveau(reglages.niveau).signes; n >= 1; n--) {
      for (var essai = 0; essai < 3000; essai++) {
        var nb = [], ops = [];
        for (var i = 0; i <= n; i++) nb.push(tirer(nombres));
        for (var k = 0; k < n; k++) ops.push(tirer(signes));
        var res = evaluer(nb, ops);
        if (res) return carte(nb, ops, versNombre(res));
      }
    }
    // Filet de sécurité (ne devrait pas servir) : a + a.
    var a = nombres[0];
    return carte([a, a], ['plus'], a + a);
  }

  function carte(nb, ops, resultat) {
    var texte = String(nb[0]), oral = String(nb[0]);
    for (var i = 0; i < ops.length; i++) {
      texte += ' ' + signe(ops[i]).symbole + ' ' + nb[i + 1];
      oral += ' ' + signe(ops[i]).oral + ' ' + nb[i + 1];
    }
    return { nombres: nb, operations: ops, formule: texte, oral: 'Combien font ' + oral + ' ?', resultat: resultat, resultatTexte: ecrire(resultat) };
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

  var api = { SIGNES: SIGNES, NOMBRES: NOMBRES, NIVEAUX: NIVEAUX, signe: signe, niveau: niveau,
    evaluer: function (nb, ops) { var r = evaluer(nb, ops); return r ? versNombre(r) : null; },
    generer: generer, lire: lire, juste: juste, ecrire: ecrire };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else racine.Calcul = api;
})(this);
